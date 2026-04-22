'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type UserProfileData = {
  dietaryPreferences?: string[];
  bio?: string;
  preferredCuisines?: string[];
};

const userDocRef = (uid: string) => doc(db, 'users', uid);

export async function getUserProfile(uid: string): Promise<UserProfileData> {
  const snap = await getDoc(userDocRef(uid));
  if (!snap.exists()) return {};
  const data = snap.data() as any;
  return {
    dietaryPreferences: Array.isArray(data.dietaryPreferences) ? data.dietaryPreferences : [],
    bio: typeof data.bio === 'string' ? data.bio : undefined,
    preferredCuisines: Array.isArray(data.preferredCuisines) ? data.preferredCuisines : [],
  };
}

export async function updateUserProfile(uid: string, updates: UserProfileData): Promise<void> {
  await setDoc(userDocRef(uid), updates, { merge: true });
}


