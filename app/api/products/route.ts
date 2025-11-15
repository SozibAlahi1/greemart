import { NextRequest, NextResponse } from 'next/server';
import { getProducts, searchProducts } from './store';

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    if (search) {
      const results = await searchProducts(search);
      return NextResponse.json(results);
    }

    const products = await getProducts(category);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: process.env.NODE_ENV === 'development' ? String(error) : undefined },
      { status: 500 }
    );
  }
}


