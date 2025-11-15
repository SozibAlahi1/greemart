import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  fullDescription?: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

// Type for lean documents (returned by .lean())
export type ProductLean = Omit<IProduct, keyof Document> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    fullDescription: { type: String },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    rating: { type: Number, default: 4.0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

