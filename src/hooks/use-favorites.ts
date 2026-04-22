
'use client';

import { create } from 'zustand';
import { toast } from './use-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  getUserFavoriteIds, 
  addFavoriteRecipeId, 
  removeFavoriteRecipeId 
} from '@/lib/user-favorites';

type FavoritesState = {
  favoriteIds: Set<string>;
  isLoading: boolean;
  toggleFavorite: (recipeId: string, recipeName: string) => void;
  loadFavoritesForUser: (uid: string | null) => Promise<void>;
};

export const useFavorites = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set(),
  isLoading: true,
  toggleFavorite: async (recipeId, recipeName) => {
    const previous = new Set(get().favoriteIds);
    set((state) => {
      const newFavoriteIds = new Set(state.favoriteIds);
      if (newFavoriteIds.has(recipeId)) {
        newFavoriteIds.delete(recipeId);
        toast({
          title: "Removed from Favorites",
          description: `${recipeName} has been removed from your favorites.`,
        });
      } else {
        newFavoriteIds.add(recipeId);
        toast({
          title: "Added to Favorites",
          description: `${recipeName} has been added to your favorites.`,
        });
      }
      return { favoriteIds: newFavoriteIds };
    });

    // Persist optimistically
    try {
      const user = auth.currentUser;
      if (!user) return; // UI already guards, but be safe
      const isNowFavorite = get().favoriteIds.has(recipeId);
      if (isNowFavorite) {
        await addFavoriteRecipeId(user.uid, recipeId);
      } else {
        await removeFavoriteRecipeId(user.uid, recipeId);
      }
    } catch (error) {
      // Rollback on failure
      set({ favoriteIds: previous });
      toast({
        title: 'Failed to update favorites',
        description: 'Please try again.',
      });
      console.error('Failed to persist favorite toggle', error);
    }
  },
  loadFavoritesForUser: async (uid: string | null) => {
    if (!uid) {
      set({ favoriteIds: new Set(), isLoading: false });
      return;
    }
    try {
      set({ isLoading: true });
      const ids = await getUserFavoriteIds(uid);
      set({ favoriteIds: ids, isLoading: false });
    } catch (error) {
      console.error('Failed to load user favorites', error);
      set({ favoriteIds: new Set(), isLoading: false });
    }
  },
}));

// Keep favorites in sync with auth state
onAuthStateChanged(auth, (user) => {
  useFavorites.getState().loadFavoritesForUser(user ? user.uid : null);
});
