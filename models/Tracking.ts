import mongoose, { Schema, Document } from 'mongoose';

export interface ITracking extends Document {
  // Event identification
  eventType: 'page_view' | 'click' | 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'search' | 'custom';
  eventName: string; // e.g., 'homepage_view', 'product_click', 'checkout_complete'
  
  // User/Session information
  sessionId?: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  
  // Page/Route information
  page?: string; // e.g., '/', '/products', '/checkout'
  referrer?: string;
  
  // Event-specific data
  metadata?: Record<string, any>; // Flexible JSON object for event-specific data
  
  // Product/Order information (if applicable)
  productId?: string;
  productName?: string;
  orderId?: string;
  orderTotal?: number;
  
  // Search information (if applicable)
  searchQuery?: string;
  searchResults?: number;
  
  // Device/Browser information
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  
  // Location information (if available)
  country?: string;
  city?: string;
  
  // Timestamp
  timestamp: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const TrackingSchema = new Schema<ITracking>(
  {
    eventType: {
      type: String,
      required: true,
      enum: ['page_view', 'click', 'purchase', 'add_to_cart', 'remove_from_cart', 'search', 'custom'],
    },
    eventName: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    userAgent: String,
    ipAddress: String,
    page: {
      type: String,
      index: true,
    },
    referrer: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    productId: {
      type: String,
      index: true,
    },
    productName: String,
    orderId: {
      type: String,
      index: true,
    },
    orderTotal: Number,
    searchQuery: String,
    searchResults: Number,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
    },
    browser: String,
    os: String,
    country: String,
    city: String,
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
TrackingSchema.index({ eventType: 1, timestamp: -1 });
TrackingSchema.index({ page: 1, timestamp: -1 });
TrackingSchema.index({ sessionId: 1, timestamp: -1 });
TrackingSchema.index({ createdAt: -1 });

export type TrackingLean = Omit<ITracking, keyof Document> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

export default mongoose.models.Tracking || mongoose.model<ITracking>('Tracking', TrackingSchema);

