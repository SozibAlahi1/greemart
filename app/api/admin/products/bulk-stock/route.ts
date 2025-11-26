import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// PATCH /api/admin/products/bulk-stock
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected an array of updates.' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      updates.map(async (update: { id: string; stockQuantity: number; inStock: boolean }) => {
        const product = await Product.findByIdAndUpdate(
          update.id,
          {
            stockQuantity: update.stockQuantity,
            inStock: update.inStock,
          },
          { new: true }
        );

        return product ? { id: update.id, success: true } : { id: update.id, success: false };
      })
    );

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.length - successCount;

    return NextResponse.json({
      message: `Updated ${successCount} products${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      results,
    });
  } catch (error) {
    console.error('Error updating bulk stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}





