import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { isModuleEnabled } from '@/lib/modules/check';

/**
 * GET /api/admin/transactions/[id]
 * Get a single transaction by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction.toObject());
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch transaction',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/transactions/[id]
 * Update a transaction
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const body = await request.json();
    const { type, category, amount, description, date, paymentMethod, reference, tags } = body;

    const updateData: any = {};

    if (type && ['income', 'expense'].includes(type)) {
      updateData.type = type;
    }

    if (category) updateData.category = category;
    if (amount !== undefined) {
      if (amount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be greater than 0' },
          { status: 400 }
        );
      }
      updateData.amount = Number(amount);
    }
    if (description) updateData.description = description;
    if (date) updateData.date = new Date(date);
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (reference !== undefined) updateData.reference = reference;
    if (tags !== undefined) updateData.tags = tags;

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Transaction updated successfully',
      transaction: transaction.toObject(),
    });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      {
        error: 'Failed to update transaction',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/transactions/[id]
 * Delete a transaction
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Transaction deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete transaction',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

