'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const userDocRef = (uid: string) => doc(db, 'users', uid);

export async function getUserFavoriteIds(uid: string): Promise<Set<string>> {
  const ref = userDocRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return new Set();
  }
  const data = snap.data() as { favoriteRecipeIds?: string[] };
  return new Set((data.favoriteRecipeIds || []).filter(Boolean));
}

export async function addFavoriteRecipeId(uid: string, recipeId: string): Promise<void> {
  const ref = userDocRef(uid);
  await setDoc(ref, { favoriteRecipeIds: arrayUnion(recipeId) }, { merge: true });
}

export async function removeFavoriteRecipeId(uid: string, recipeId: string): Promise<void> {
  const ref = userDocRef(uid);
  await setDoc(ref, { favoriteRecipeIds: arrayRemove(recipeId) }, { merge: true });
}


