import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem extends Document {
  sessionId: string;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  name: string;
  price: number;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    sessionId: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

CartItemSchema.index({ sessionId: 1 });
CartItemSchema.index({ productId: 1 });

export default mongoose.models.CartItem || mongoose.model<ICartItem>('CartItem', CartItemSchema);

