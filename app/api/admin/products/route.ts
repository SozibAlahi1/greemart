import { NextRequest, NextResponse } from 'next/server';
import { addProduct } from '@/app/api/products/store';

// POST /api/admin/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, fullDescription, price, image, category, inStock, rating } = body;

    // Validation
    if (!name || !description || !price || !image || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newProduct = await addProduct({
      name,
      description,
      fullDescription,
      price: parseFloat(price),
      image,
      category,
      inStock: inStock !== undefined ? inStock : true,
      rating: rating ? parseFloat(rating) : 4.0,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}


