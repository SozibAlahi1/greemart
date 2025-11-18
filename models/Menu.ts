import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem {
  label: string;
  url: string;
  type: 'link' | 'category' | 'page'; // link = custom URL, category = category page, page = static page
  target?: string; // e.g., '_blank' for new tab
  icon?: string; // Optional icon name
  order: number;
  parentId?: mongoose.Types.ObjectId | null; // For hierarchical menus
  children?: IMenuItem[];
}

export interface IMenu extends Document {
  name: string; // Menu name (e.g., 'Main Menu', 'Footer Menu')
  location: string; // Menu location (e.g., 'header', 'footer', 'mobile')
  items: IMenuItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['link', 'category', 'page'], default: 'link' },
    target: { type: String },
    icon: { type: String },
    order: { type: Number, required: true, default: 0 },
    parentId: { type: Schema.Types.ObjectId, ref: 'MenuItem', default: null },
  },
  { _id: true }
);

const MenuSchema = new Schema<IMenu>(
  {
    name: { type: String, required: true },
    location: { type: String, required: true, unique: true }, // Only one menu per location
    items: [MenuItemSchema],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export type MenuLean = Omit<IMenu, keyof Document> & {
  _id: string;
  items: (Omit<IMenuItem, 'parentId'> & {
    _id: string;
    parentId?: string | null;
  })[];
  createdAt: Date;
  updatedAt: Date;
};

export default mongoose.models.Menu || mongoose.model<IMenu>('Menu', MenuSchema);

