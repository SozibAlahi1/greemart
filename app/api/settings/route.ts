import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings, { SettingsLean } from '@/models/Settings';
import { DEFAULT_THEME_COLOR } from '@/lib/constants/theme';

// GET /api/settings - Public endpoint for frontend
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get settings (only one document should exist)
    let settings = await Settings.findOne().lean<SettingsLean>();
    
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await Settings.create({ _singleton: true });
      settings = defaultSettings.toObject();
    }
    
    // Remove internal fields
    const { _singleton, __v, ...publicSettings } = settings as any;
    
    return NextResponse.json(publicSettings);
  } catch (error: any) {
    console.error('Error fetching public settings:', error);
    // Return default values if database fails
    return NextResponse.json({
      siteName: 'Grocery Store',
      siteDescription: 'Your trusted online grocery store',
      currency: 'BDT',
      currencySymbol: '৳',
      taxRate: 5,
      deliveryFee: 50,
      freeDeliveryThreshold: 500,
      deliveryTime: '2-3 days',
      bannerEnabled: false,
      maintenanceMode: false,
      themeColor: DEFAULT_THEME_COLOR,
    });
  }
}

