import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  // Site Information
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  siteFavicon?: string;
  
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
  
  // SEO Settings
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  
  // Maintenance Mode
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  
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
    
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String },
    
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

