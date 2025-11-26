import connectDB from '@/lib/mongodb';
import Settings, { SettingsLean } from '@/models/Settings';
import { DEFAULT_THEME_COLOR } from '@/lib/constants/theme';
import { sanitizeThemeColor } from '@/lib/themeColor';

export async function getThemeColorFromSettings() {
  try {
    await connectDB();
    const settings = await Settings.findOne().lean<SettingsLean>();
    return sanitizeThemeColor(settings?.themeColor || DEFAULT_THEME_COLOR);
  } catch (error) {
    console.error('Failed to load theme color, falling back to default:', error);
    return DEFAULT_THEME_COLOR;
  }
}




