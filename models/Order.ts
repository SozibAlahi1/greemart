import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

export interface IOrder extends Document {
  orderId: string;
  sessionId?: string;
  customerName: string;
  phone: string;
  address: string;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Type for lean documents (returned by .lean())
export type OrderLean = Omit<IOrder, keyof Document> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    sessionId: { type: String },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    orderDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// orderId already has unique: true, so index is automatic
OrderSchema.index({ status: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

