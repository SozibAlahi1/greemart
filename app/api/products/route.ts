import { NextRequest, NextResponse } from 'next/server';
import { getProducts, searchProducts } from './store';

// GET /api/products
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;

  if (search) {
    const results = await searchProducts(search);
    return NextResponse.json(results);
  }

  const products = await getProducts(category);
  return NextResponse.json(products);
}


