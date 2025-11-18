import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Menu, { MenuLean } from '@/models/Menu';

// GET /api/menus - Get active menus by location
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    const query: any = { isActive: true };
    if (location) {
      query.location = location;
    }

    const menus = await Menu.find(query).sort({ location: 1 }).lean<MenuLean[]>();
    
    return NextResponse.json(menus.map((menu) => ({
      _id: menu._id.toString(),
      name: menu.name,
      location: menu.location,
      items: menu.items.map((item: any) => ({
        _id: (item._id && typeof item._id === 'object' ? item._id.toString() : item._id) || '',
        label: item.label,
        url: item.url,
        type: item.type,
        target: item.target,
        icon: item.icon,
        order: item.order,
        parentId: item.parentId ? (typeof item.parentId === 'object' ? item.parentId.toString() : item.parentId) : null,
      })),
      isActive: menu.isActive,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
    })));
  } catch (error) {
    console.error('Error fetching menus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    );
  }
}

