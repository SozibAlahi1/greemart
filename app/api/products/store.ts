// Product data store using SQLite database
import { prisma } from '@/lib/prisma';

export interface Product {
  id: number;
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
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { name: true }
  });
  return ['All', ...categories.map(c => c.name)];
}

// For backward compatibility, export a function that returns categories
export const categories = getCategories;

export async function getProducts(category?: string): Promise<Product[]> {
  const where = category && category !== 'All' 
    ? { category } 
    : {};
  
  const products = await prisma.product.findMany({
    where,
    orderBy: { id: 'asc' }
  });
  
  return products.map(p => ({
    id: p.id,
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

export async function getProduct(id: number): Promise<Product | undefined> {
  const product = await prisma.product.findUnique({
    where: { id }
  });
  
  if (!product) return undefined;
  
  return {
    id: product.id,
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
  const lowerQuery = query.toLowerCase();
  // SQLite doesn't support case-insensitive mode, so we'll filter in memory
  const allProducts = await prisma.product.findMany({
    orderBy: { id: 'asc' }
  });
  
  const products = allProducts.filter(product =>
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery)
  );
  
  return products.map(p => ({
    id: p.id,
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
  const newProduct = await prisma.product.create({
    data: {
      name: product.name,
      description: product.description,
      fullDescription: product.fullDescription,
      price: product.price,
      image: product.image,
      category: product.category,
      inStock: product.inStock,
      rating: product.rating
    }
  });
  
  return {
    id: newProduct.id,
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

export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: updates.name,
      description: updates.description,
      fullDescription: updates.fullDescription,
      price: updates.price,
      image: updates.image,
      category: updates.category,
      inStock: updates.inStock,
      rating: updates.rating
    }
  });
  
  return {
    id: updated.id,
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

export async function deleteProduct(id: number): Promise<boolean> {
  try {
    await prisma.product.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    return false;
  }
}
