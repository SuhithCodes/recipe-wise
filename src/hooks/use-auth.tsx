'use client';

import { create } from 'zustand';
import { auth } from '@/lib/firebase';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    type User
} from 'firebase/auth';

type AuthState = {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  signIn: typeof signInWithEmailAndPassword;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  logOut: typeof signOut;
  initialize: () => () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
  signUp: async (email, password, fullName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });
    }
    return userCredential;
  },
  signInWithGoogle: () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },
  logOut: () => signOut(auth),
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, isLoggedIn: !!user, isLoading: false });
    });
    return unsubscribe;
  },
}));

// Initialize auth state listener when the app loads
useAuth.getState().initialize();
