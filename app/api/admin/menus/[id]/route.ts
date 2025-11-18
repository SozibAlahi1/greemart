import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Menu from '@/models/Menu';
import mongoose from 'mongoose';

// GET /api/admin/menus/[id] - Get a single menu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid menu ID' },
        { status: 400 }
      );
    }

    const menu = await Menu.findById(id);
    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

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
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/menus/[id] - Update a menu
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid menu ID' },
        { status: 400 }
      );
    }

    const menu = await Menu.findById(id);
    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    // If location is being changed, check if new location is available
    if (body.location && body.location !== menu.location) {
      const existingMenu = await Menu.findOne({ location: body.location });
      if (existingMenu) {
        return NextResponse.json(
          { error: 'A menu with this location already exists' },
          { status: 400 }
        );
      }
    }

    // Update menu fields
    if (body.name !== undefined) menu.name = body.name;
    if (body.location !== undefined) menu.location = body.location;
    if (body.isActive !== undefined) menu.isActive = body.isActive;

    // Update items if provided
    if (body.items !== undefined) {
      menu.items = body.items.map((item: any) => ({
        _id: item._id ? new mongoose.Types.ObjectId(item._id) : new mongoose.Types.ObjectId(),
        label: item.label,
        url: item.url,
        type: item.type || 'link',
        target: item.target,
        icon: item.icon,
        order: item.order !== undefined ? item.order : 0,
        parentId: item.parentId ? new mongoose.Types.ObjectId(item.parentId) : null,
      }));
    }

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
    });
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/menus/[id] - Delete a menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid menu ID' },
        { status: 400 }
      );
    }

    const menu = await Menu.findByIdAndDelete(id);
    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    );
  }
}

