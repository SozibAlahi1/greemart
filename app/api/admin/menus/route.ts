import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Menu, { MenuLean } from '@/models/Menu';

// GET /api/admin/menus - Get all menus
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const menus = await Menu.find({}).sort({ location: 1 }).lean<MenuLean[]>();
    
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

// POST /api/admin/menus - Create a new menu
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, location, items = [], isActive = true } = body;

    if (!name || !location) {
      return NextResponse.json(
        { error: 'Name and location are required' },
        { status: 400 }
      );
    }

    // Check if a menu with this location already exists
    const existingMenu = await Menu.findOne({ location });
    if (existingMenu) {
      return NextResponse.json(
        { error: 'A menu with this location already exists' },
        { status: 400 }
      );
    }

    const menu = new Menu({
      name,
      location,
      items: items.map((item: any, index: number) => ({
        ...item,
        order: item.order !== undefined ? item.order : index,
        parentId: item.parentId || null,
      })),
      isActive,
    });

    await menu.save();

    const menuObj = menu.toObject();
    return NextResponse.json({
      _id: menuObj._id.toString(),
      name: menuObj.name,
      location: menuObj.location,
      items: menuObj.items.map((item: any) => ({
        _id: item._id.toString(),
        label: item.label,
        url: item.url,
        type: item.type,
        target: item.target,
        icon: item.icon,
        order: item.order,
        parentId: item.parentId ? item.parentId.toString() : null,
      })),
      isActive: menuObj.isActive,
      createdAt: menuObj.createdAt,
      updatedAt: menuObj.updatedAt,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu:', error);
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    );
  }
}

