// Product data store using MongoDB
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
}

// Get categories from database
export async function getCategories(): Promise<string[]> {
  await connectDB();
  const categories = await Category.find({}).sort({ name: 1 }).select('name').lean();
  return ['All', ...categories.map((c) => c.name)];
}

// For backward compatibility, export a function that returns categories
export const categories = getCategories;

export async function getProducts(category?: string): Promise<Product[]> {
  await connectDB();
  const where = category && category !== 'All' 
    ? { category } 
    : {};
  
  const products = await Product.find(where).sort({ createdAt: 1 }).lean();
  
  return products.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    description: p.description,
    fullDescription: p.fullDescription || undefined,
    price: p.price,
    image: p.image,
    category: p.category,
    inStock: p.inStock,
    rating: p.rating
  }));
}

export async function getProduct(id: string): Promise<Product | undefined> {
  await connectDB();
  const product = await Product.findById(id).lean();
  
  if (!product) return undefined;
  
  return {
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    fullDescription: product.fullDescription || undefined,
    price: product.price,
    image: product.image,
    category: product.category,
    inStock: product.inStock,
    rating: product.rating
  };
}

export async function searchProducts(query: string): Promise<Product[]> {
  await connectDB();
  const lowerQuery = query.toLowerCase();
  
  const products = await Product.find({
    $or: [
      { name: { $regex: lowerQuery, $options: 'i' } },
      { description: { $regex: lowerQuery, $options: 'i' } }
    ]
  }).sort({ createdAt: 1 }).lean();
  
  return products.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    description: p.description,
    fullDescription: p.fullDescription || undefined,
    price: p.price,
    image: p.image,
    category: p.category,
    inStock: p.inStock,
    rating: p.rating
  }));
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  await connectDB();
  const newProduct = await Product.create({
    name: product.name,
    description: product.description,
    fullDescription: product.fullDescription,
    price: product.price,
    image: product.image,
    category: product.category,
    inStock: product.inStock,
    rating: product.rating
  });
  
  return {
    id: newProduct._id.toString(),
    name: newProduct.name,
    description: newProduct.description,
    fullDescription: newProduct.fullDescription || undefined,
    price: newProduct.price,
    image: newProduct.image,
    category: newProduct.category,
    inStock: newProduct.inStock,
    rating: newProduct.rating
  };
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
  await connectDB();
  const updated = await Product.findByIdAndUpdate(
    id,
    {
      ...(updates.name && { name: updates.name }),
      ...(updates.description && { description: updates.description }),
      ...(updates.fullDescription !== undefined && { fullDescription: updates.fullDescription }),
      ...(updates.price !== undefined && { price: updates.price }),
      ...(updates.image && { image: updates.image }),
      ...(updates.category && { category: updates.category }),
      ...(updates.inStock !== undefined && { inStock: updates.inStock }),
      ...(updates.rating !== undefined && { rating: updates.rating })
    },
    { new: true }
  ).lean();
  
  if (!updated) return undefined;
  
  return {
    id: updated._id.toString(),
    name: updated.name,
    description: updated.description,
    fullDescription: updated.fullDescription || undefined,
    price: updated.price,
    image: updated.image,
    category: updated.category,
    inStock: updated.inStock,
    rating: updated.rating
  };
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await connectDB();
    await Product.findByIdAndDelete(id);
    return true;
  } catch (error) {
    return false;
  }
}
