import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface CartItem {
  productId: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

// GET /api/cart
export async function GET(request: NextRequest) {
  const sessionId = request.headers.get('x-session-id') || 'default';
  
  const cartItems = await prisma.cartItem.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' }
  });

  type CartItemType = typeof cartItems[0];

  const cart: CartItem[] = cartItems.map((item: CartItemType) => ({
    productId: item.productId,
    quantity: item.quantity,
    name: item.name,
    price: item.price,
    image: item.image
  }));

  return NextResponse.json(cart);
}

// POST /api/cart
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id') || 'default';
    const body = await request.json();
    const { productId, quantity, name, price, image } = body;

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        sessionId,
        productId
      }
    });

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + (quantity || 1)
        }
      });

      const cartItems = await prisma.cartItem.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' }
      });

      type CartItemType = typeof cartItems[0];

      return NextResponse.json(cartItems.map((item: CartItemType) => ({
        productId: item.productId,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        image: item.image
      })));
    } else {
      await prisma.cartItem.create({
        data: {
          sessionId,
          productId,
          quantity: quantity || 1,
          name,
          price,
          image
        }
      });

      const cartItems = await prisma.cartItem.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' }
      });

      type CartItemType = typeof cartItems[0];

      return NextResponse.json(cartItems.map((item: CartItemType) => ({
        productId: item.productId,
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
  const sessionId = request.headers.get('x-session-id') || 'default';
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get('productId');

  if (productId) {
    await prisma.cartItem.deleteMany({
      where: {
        sessionId,
        productId: parseInt(productId)
      }
    });
  } else {
    await prisma.cartItem.deleteMany({
      where: { sessionId }
    });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' }
  });

  type CartItemType = typeof cartItems[0];

  return NextResponse.json(cartItems.map((item: CartItemType) => ({
    productId: item.productId,
    quantity: item.quantity,
    name: item.name,
    price: item.price,
    image: item.image
  })));
}

// PATCH /api/cart
export async function PATCH(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id') || 'default';
    const body = await request.json();
    const { productId, quantity } = body;

    const item = await prisma.cartItem.findFirst({
      where: {
        sessionId,
        productId
      }
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: item.id }
      });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity }
      });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });

    type CartItemType = typeof cartItems[0];

    return NextResponse.json(cartItems.map((item: CartItemType) => ({
      productId: item.productId,
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
