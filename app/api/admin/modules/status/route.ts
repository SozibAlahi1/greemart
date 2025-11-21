import { NextRequest, NextResponse } from 'next/server';
import { getEnabledModules } from '@/lib/modules/check';

/**
 * GET /api/admin/modules/status
 * Get status of all modules (for client-side checks)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleIds = searchParams.get('modules')?.split(',') || [];
    
    if (moduleIds.length === 0) {
      // Return all enabled modules
      const enabled = await getEnabledModules();
      return NextResponse.json({ enabled });
    }
    
    // Check specific modules
    const enabled = await getEnabledModules();
    const status: Record<string, boolean> = {};
    moduleIds.forEach(id => {
      status[id] = enabled.includes(id);
    });
    
    return NextResponse.json({ status });
  } catch (error: any) {
    console.error('Error getting module status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get module status' },
      { status: 500 }
    );
  }
}

