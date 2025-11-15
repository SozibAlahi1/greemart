import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CartItem from '@/models/CartItem';

export interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

// GET /api/cart
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const sessionId = request.headers.get('x-session-id') || 'default';
    
    const cartItems = await CartItem.find({ sessionId }).sort({ createdAt: 1 }).lean();

    const cart: CartItem[] = cartItems.map((item) => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      image: item.image
    }));

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart', details: process.env.NODE_ENV === 'development' ? String(error) : undefined },
      { status: 500 }
    );
  }
}

// POST /api/cart
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const sessionId = request.headers.get('x-session-id') || 'default';
    const body = await request.json();
    const { productId, quantity, name, price, image } = body;

    const existingItem = await CartItem.findOne({
      sessionId,
      productId
    });

    if (existingItem) {
      existingItem.quantity += (quantity || 1);
      await existingItem.save();

      const cartItems = await CartItem.find({ sessionId }).sort({ createdAt: 1 }).lean();

      return NextResponse.json(cartItems.map((item) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        image: item.image
      })));
    } else {
      await CartItem.create({
        sessionId,
        productId,
        quantity: quantity || 1,
        name,
        price,
        image
      });

      const cartItems = await CartItem.find({ sessionId }).sort({ createdAt: 1 }).lean();

      return NextResponse.json(cartItems.map((item) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        image: item.image
      })));
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// DELETE /api/cart
export async function DELETE(request: NextRequest) {
  await connectDB();
  const sessionId = request.headers.get('x-session-id') || 'default';
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get('productId');

  if (productId) {
    await CartItem.deleteMany({
      sessionId,
      productId
    });
  } else {
    await CartItem.deleteMany({ sessionId });
  }

  const cartItems = await CartItem.find({ sessionId }).sort({ createdAt: 1 }).lean();

  return NextResponse.json(cartItems.map((item) => ({
    productId: item.productId.toString(),
    quantity: item.quantity,
    name: item.name,
    price: item.price,
    image: item.image
  })));
}

// PATCH /api/cart
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const sessionId = request.headers.get('x-session-id') || 'default';
    const body = await request.json();
    const { productId, quantity } = body;

    const item = await CartItem.findOne({
      sessionId,
      productId
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      await CartItem.findByIdAndDelete(item._id);
    } else {
      item.quantity = quantity;
      await item.save();
    }

    const cartItems = await CartItem.find({ sessionId }).sort({ createdAt: 1 }).lean();

    return NextResponse.json(cartItems.map((item) => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      image: item.image
    })));
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
