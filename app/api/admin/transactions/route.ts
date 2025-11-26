import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction, { TransactionLean } from '@/models/Transaction';
import { isModuleEnabled } from '@/lib/modules/check';

/**
 * GET /api/admin/transactions
 * Get all transactions with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Check if module is enabled
    const moduleEnabled = await isModuleEnabled('income-expense');
    if (!moduleEnabled) {
      return NextResponse.json(
        { error: 'Income Expense module is not enabled' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'income' or 'expense'
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Number(searchParams.get('limit')) || 100;
    const skip = Number(searchParams.get('skip')) || 0;

    const query: any = {};

    if (type && (type === 'income' || type === 'expense')) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean<TransactionLean[]>();

    // Get summary statistics
    const summary = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const incomeTotal = summary.find((s) => s._id === 'income')?.total || 0;
    const expenseTotal = summary.find((s) => s._id === 'expense')?.total || 0;
    const incomeCount = summary.find((s) => s._id === 'income')?.count || 0;
    const expenseCount = summary.find((s) => s._id === 'expense')?.count || 0;

    return NextResponse.json({
      transactions: transactions as unknown as TransactionLean[],
      summary: {
        totalIncome: incomeTotal,
        totalExpense: expenseTotal,
        netAmount: incomeTotal - expenseTotal,
        incomeCount,
        expenseCount,
        totalCount: incomeCount + expenseCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch transactions',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/transactions
 * Create a new transaction
 */
export async function POST(request: NextRequest) {
  try {
    // Check if module is enabled
    const moduleEnabled = await isModuleEnabled('income-expense');
    if (!moduleEnabled) {
      return NextResponse.json(
        { error: 'Income Expense module is not enabled' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { type, category, amount, description, date, paymentMethod, reference, tags } = body;

    if (!type || !['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "income" or "expense"' },
        { status: 400 }
      );
    }

    if (!category || !amount || !description) {
      return NextResponse.json(
        { error: 'Category, amount, and description are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const transaction = new Transaction({
      type,
      category,
      amount: Number(amount),
      description,
      date: date ? new Date(date) : new Date(),
      paymentMethod,
      reference,
      tags: tags || [],
    });

    await transaction.save();

    return NextResponse.json(
      {
        message: 'Transaction created successfully',
        transaction: transaction.toObject(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      {
        error: 'Failed to create transaction',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}


