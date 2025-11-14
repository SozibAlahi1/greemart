// Reviews data store using SQLite database
import { prisma } from '@/lib/prisma';

export interface Review {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export async function getReviews(productId: number): Promise<Review[]> {
  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' }
  });

  type ReviewType = typeof reviews[0];

  return reviews.map((review: ReviewType) => ({
    id: review.id,
    productId: review.productId,
    userName: review.userName,
    rating: review.rating,
    comment: review.comment,
    date: review.date,
    verified: review.verified
  }));
}

export async function addReview(productId: number, userName: string, rating: number, comment: string): Promise<Review> {
  const newReview = await prisma.review.create({
    data: {
      productId,
      userName,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      verified: false
    }
  });

  return {
    id: newReview.id,
    productId: newReview.productId,
    userName: newReview.userName,
    rating: newReview.rating,
    comment: newReview.comment,
    date: newReview.date,
    verified: newReview.verified
  };
}

export async function getAverageRating(productId: number): Promise<number> {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true }
  });

  if (reviews.length === 0) return 0;
  
  type ReviewType = typeof reviews[0];
  const sum = reviews.reduce((acc, review: ReviewType) => acc + review.rating, 0);
  return sum / reviews.length;
}
