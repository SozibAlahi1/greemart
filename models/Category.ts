import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// Type for lean documents (returned by .lean())
export type CategoryLean = Omit<ICategory, keyof Document> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

// Indexes are automatically created by unique: true, so we don't need explicit indexes

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

