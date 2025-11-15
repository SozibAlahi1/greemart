// Reviews data store using MongoDB
import connectDB from '@/lib/mongodb';
import Review, { ReviewLean } from '@/models/Review';

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export async function getReviews(productId: string): Promise<Review[]> {
  await connectDB();
  const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).lean<ReviewLean[]>();

  return reviews.map((review: ReviewLean) => ({
    id: review._id.toString(),
    productId: review.productId.toString(),
    userName: review.userName,
    rating: review.rating,
    comment: review.comment,
    date: review.date,
    verified: review.verified
  }));
}

export async function addReview(productId: string, userName: string, rating: number, comment: string): Promise<Review> {
  await connectDB();
  const newReview = await Review.create({
    productId,
    userName,
    rating,
    comment,
    date: new Date().toISOString().split('T')[0],
    verified: false
  });

  return {
    id: newReview._id.toString(),
    productId: newReview.productId.toString(),
    userName: newReview.userName,
    rating: newReview.rating,
    comment: newReview.comment,
    date: newReview.date,
    verified: newReview.verified
  };
}

export async function getAverageRating(productId: string): Promise<number> {
  await connectDB();
  const reviews = await Review.find({ productId }).select('rating').lean<Pick<ReviewLean, 'rating'>[]>();

  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc: number, review: Pick<ReviewLean, 'rating'>) => acc + review.rating, 0);
  return sum / reviews.length;
}
