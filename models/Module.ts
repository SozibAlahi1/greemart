import mongoose, { Schema, Document } from 'mongoose';

export interface IModule extends Document {
  moduleId: string; // Unique identifier (e.g., 'fraud-check', 'steadfast-courier')
  name: string; // Display name
  description: string; // Module description
  version: string; // Module version
  enabled: boolean; // Whether the module is enabled
  purchased: boolean; // Whether the module has been "purchased" (even if free)
  purchasedAt?: Date; // When the module was purchased
  licenseKey?: string; // Optional license key
  settings?: Record<string, any>; // Module-specific settings
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    moduleId: { 
      type: String, 
      required: true, 
      unique: true,
      index: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    version: { type: String, required: true, default: '1.0.0' },
    enabled: { type: Boolean, default: false },
    purchased: { type: Boolean, default: false },
    purchasedAt: { type: Date },
    licenseKey: { type: String },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ModuleSchema.index({ moduleId: 1, enabled: 1 });

export type ModuleLean = Omit<IModule, keyof Document> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

export default mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema);

