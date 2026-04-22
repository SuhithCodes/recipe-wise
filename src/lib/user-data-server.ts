'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export type UserProfileServer = {
  dietaryPreferences: string[];
  bio?: string;
  preferredCuisines: string[];
};

export async function getUserProfileServer(uid: string): Promise<UserProfileServer> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { dietaryPreferences: [], preferredCuisines: [] };
  const data = snap.data() as any;
  return {
    dietaryPreferences: Array.isArray(data.dietaryPreferences) ? data.dietaryPreferences : [],
    bio: typeof data.bio === 'string' ? data.bio : undefined,
    preferredCuisines: Array.isArray(data.preferredCuisines) ? data.preferredCuisines : [],
  };
}

export async function getUserFavoriteIdsServer(uid: string): Promise<Set<string>> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return new Set();
  const data = snap.data() as any;
  const ids: string[] = Array.isArray(data.favoriteRecipeIds) ? data.favoriteRecipeIds : [];
  return new Set(ids.filter(Boolean));
}


