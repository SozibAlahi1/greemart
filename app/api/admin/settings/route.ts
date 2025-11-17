import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings, { SettingsLean } from '@/models/Settings';

// GET /api/admin/settings
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    console.log('Fetching settings from database...');
    
    // Get or create settings (only one document should exist)
    let settings = await Settings.findOne().lean<SettingsLean>();
    
    if (!settings) {
      console.log('No settings found, creating default settings...');
      // Create default settings if none exist
      const defaultSettings = await Settings.create({ _singleton: true });
      settings = defaultSettings.toObject() as SettingsLean;
      console.log('Default settings created:', settings._id);
    } else {
      console.log('Settings found:', settings._id);
    }
    
    // TypeScript guard: ensure settings is not null
    if (!settings) {
      throw new Error('Failed to create or retrieve settings');
    }
    
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch settings',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    console.log('Updating settings with data:', Object.keys(body));
    
    // Find existing settings or create new one
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log('No settings found, creating new settings document...');
      settings = await Settings.create({ ...body, _singleton: true });
      console.log('New settings created:', settings._id);
    } else {
      console.log('Updating existing settings:', settings._id);
      // Update only provided fields
      Object.keys(body).forEach((key) => {
        // Skip _id and other internal fields
        if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt' && body[key] !== undefined) {
          (settings as any)[key] = body[key];
        }
      });
      await settings.save();
      console.log('Settings saved successfully');
    }
    
    const updatedSettings = settings.toObject();
    // Remove internal fields from response
    delete (updatedSettings as any).__v;
    delete (updatedSettings as any)._singleton;
    
    return NextResponse.json(updatedSettings);
  } catch (error: any) {
    console.error('Error updating settings:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to update settings',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

