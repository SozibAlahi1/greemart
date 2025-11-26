import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  paymentMethod?: string;
  reference?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Type for lean documents (returned by .lean())
export type TransactionLean = Omit<ITransaction, keyof Document> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

const TransactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
    },
    reference: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
TransactionSchema.index({ type: 1, date: -1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ date: -1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);


