import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Module from '@/models/Module';
import { MODULE_REGISTRY, getAllModules } from '@/lib/modules/registry';
import { isCoreModule } from '@/lib/modules/registry';

/**
 * GET /api/admin/modules
 * Get all modules with their status
 */
export async function GET() {
  try {
    await connectDB();
    
    // Get all module definitions
    const moduleDefinitions = getAllModules();
    
    // Get all modules from database
    const dbModules = await Module.find({}).lean();
    const moduleMap = new Map(dbModules.map(m => [m.moduleId, m]));
    
    // Combine definitions with database status
    const modules = moduleDefinitions.map(def => {
      const dbModule = moduleMap.get(def.id);
      return {
        ...def,
        enabled: dbModule?.enabled || false,
        purchased: dbModule?.purchased || false,
        purchasedAt: dbModule?.purchasedAt,
        settings: dbModule?.settings || {},
        _id: dbModule?._id,
      };
    });
    
    return NextResponse.json({ modules });
  } catch (error: any) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/modules
 * Purchase/enable a module
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { moduleId, action } = body;
    
    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }
    
    const moduleDef = MODULE_REGISTRY[moduleId];
    if (!moduleDef) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }
    
    let module = await Module.findOne({ moduleId });
    
    if (action === 'purchase') {
      // Purchase the module (even if free)
      if (!module) {
        module = new Module({
          moduleId,
          name: moduleDef.name,
          description: moduleDef.description,
          version: moduleDef.version,
          purchased: true,
          purchasedAt: new Date(),
          enabled: false, // Don't auto-enable after purchase
        });
      } else {
        module.purchased = true;
        module.purchasedAt = new Date();
        module.name = moduleDef.name;
        module.description = moduleDef.description;
        module.version = moduleDef.version;
      }
      await module.save();
      
      return NextResponse.json({
        success: true,
        message: 'Module purchased successfully',
        module: module.toObject(),
      });
    }
    
    if (action === 'enable' || action === 'disable') {
      if (!module) {
        return NextResponse.json(
          { error: 'Module must be purchased first' },
          { status: 400 }
        );
      }
      
      // Core modules cannot be disabled
      if (action === 'disable' && isCoreModule(moduleId)) {
        return NextResponse.json(
          { error: 'Core modules cannot be disabled' },
          { status: 400 }
        );
      }
      
      module.enabled = action === 'enable';
      await module.save();
      
      return NextResponse.json({
        success: true,
        message: `Module ${action === 'enable' ? 'enabled' : 'disabled'} successfully`,
        module: module.toObject(),
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error managing module:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to manage module' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/modules/[moduleId]
 * Update module settings
 */
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { moduleId, settings } = body;
    
    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }
    
    const module = await Module.findOne({ moduleId });
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }
    
    if (settings) {
      module.settings = { ...module.settings, ...settings };
    }
    
    await module.save();
    
    return NextResponse.json({
      success: true,
      message: 'Module settings updated',
      module: module.toObject(),
    });
  } catch (error: any) {
    console.error('Error updating module:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update module' },
      { status: 500 }
    );
  }
}

