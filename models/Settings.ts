import mongoose, { Schema, Document } from 'mongoose';
import { DEFAULT_THEME_COLOR } from '@/lib/constants/theme';

export interface ISettings extends Document {
  // Site Information
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  siteFavicon?: string;
  themeColor?: string;
  
  // Contact Information
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  
  // Social Media
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  
  // Delivery Settings
  freeDeliveryThreshold: number;
  deliveryFee: number;
  deliveryTime: string; // e.g., "2-3 days"
  
  // Payment Settings
  currency: string;
  currencySymbol: string;
  taxRate: number; // as percentage (e.g., 5 for 5%)
  
  // Banner Settings
  bannerText?: string;
  bannerEnabled: boolean;
  
  // Homepage Slider Settings
  homepageSlider?: Array<{
    id: string;
    image: string;
    title?: string;
    subtitle?: string;
    link?: string;
    buttonText?: string;
  }>;
  
  // Footer Settings
  footerCopyright?: string;
  
  // SEO Settings
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  
  // Maintenance Mode
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  
  // Steadfast Courier Settings
  steadfastApiKey?: string;
  steadfastSecretKey?: string;
  
  // Fraud Check Settings
  fraudCheckApiKey?: string;
  
  // WhatsApp Marketing Settings
  whatsappApiKey?: string;
  whatsappApiUrl?: string;
  whatsappPhoneNumberId?: string;
  
  // Internal field for singleton pattern
  _singleton?: boolean;
  
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    siteName: { type: String, required: true, default: 'Grocery Store' },
    siteDescription: { type: String, required: true, default: 'Your trusted online grocery store' },
    siteLogo: { type: String },
    siteFavicon: { type: String },
    themeColor: { type: String, default: DEFAULT_THEME_COLOR },
    
    contactEmail: { type: String, required: true, default: 'contact@example.com' },
    contactPhone: { type: String, required: true, default: '+1234567890' },
    contactAddress: { type: String, required: true, default: '123 Main St, City, Country' },
    
    facebookUrl: { type: String },
    twitterUrl: { type: String },
    instagramUrl: { type: String },
    youtubeUrl: { type: String },
    
    freeDeliveryThreshold: { type: Number, required: true, default: 500 },
    deliveryFee: { type: Number, required: true, default: 50 },
    deliveryTime: { type: String, required: true, default: '2-3 days' },
    
    currency: { type: String, required: true, default: 'BDT' },
    currencySymbol: { type: String, required: true, default: '৳' },
    taxRate: { type: Number, required: true, default: 5 },
    
    bannerText: { type: String },
    bannerEnabled: { type: Boolean, default: false },
    
    // Homepage Slider Settings
    homepageSlider: [{
      id: { type: String, required: true },
      image: { type: String, required: true },
      title: { type: String },
      subtitle: { type: String },
      link: { type: String },
      buttonText: { type: String },
    }],
    
    // Footer Settings
    footerCopyright: { type: String },
    
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String },
    
    // Steadfast Courier Settings
    steadfastApiKey: { type: String },
    steadfastSecretKey: { type: String },
    
    // Fraud Check Settings
    fraudCheckApiKey: { type: String },
    
    // WhatsApp Marketing Settings
    whatsappApiKey: { type: String },
    whatsappApiUrl: { type: String },
    whatsappPhoneNumberId: { type: String },
    
    // Singleton field to ensure only one settings document exists
    _singleton: { type: Boolean, default: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export type SettingsLean = Omit<ISettings, keyof Document> & {
  _id: string;
  updatedAt: Date;
};

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

