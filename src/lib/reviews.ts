'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';

export type RecipeReview = {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  createdAt?: any;
};

export async function getRecipeReviews(recipeId: string): Promise<RecipeReview[]> {
  const col = collection(db, 'recipes', recipeId, 'reviews');
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as RecipeReview[];
}

export async function addRecipeReview(
  recipeId: string,
  review: Omit<RecipeReview, 'id' | 'createdAt'>
): Promise<void> {
  const col = collection(db, 'recipes', recipeId, 'reviews');
  await addDoc(col, { ...review, createdAt: serverTimestamp() });

  // Update aggregate on recipe doc: rating (avg) and reviewsCount
  const recipeRef = doc(db, 'recipes', recipeId);
  const reviews = await getRecipeReviews(recipeId);
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / count : 0;
  await updateDoc(recipeRef, { rating: avg, reviewsCount: count });
}

export async function deleteRecipeReview(
  recipeId: string,
  reviewId: string,
  requesterUserId: string
): Promise<{ success: boolean; reason?: string }> {
  const reviewRef = doc(db, 'recipes', recipeId, 'reviews', reviewId);
  const snap = await getDoc(reviewRef);
  if (!snap.exists()) return { success: true };
  const data = snap.data() as any;
  if (data.userId !== requesterUserId) {
    return { success: false, reason: 'unauthorized' };
  }
  await deleteDoc(reviewRef);

  // Recompute aggregate
  const recipeRef = doc(db, 'recipes', recipeId);
  const reviews = await getRecipeReviews(recipeId);
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / count : 0;
  await updateDoc(recipeRef, { rating: avg, reviewsCount: count });
  return { success: true };
}


