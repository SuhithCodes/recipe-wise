'use client';

import { create } from 'zustand';
import type { Recipe, Ingredient } from '@/types';
import { toast } from './use-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getShoppingList, addToShoppingList, removeFromShoppingList, clearShoppingList, ShoppingListItem } from '@/lib/shopping-list';

type ShoppingListState = {
  items: Map<string, ShoppingListItem>;
  isLoading: boolean;
  addRecipe: (recipe: Recipe) => Promise<void>;
  removeIngredient: (itemId: string, ingredientName: string) => Promise<void>;
  clearList: () => Promise<void>;
  loadListForUser: (uid: string | null) => Promise<void>;
};

export const useShoppingList = create<ShoppingListState>((set, get) => ({
  items: new Map(),
  isLoading: true,
  
  addRecipe: async (recipe) => {
    const user = auth.currentUser;
    if (!user) {
      toast({ title: "Please sign in", description: "You must be signed in to add to your shopping list." });
      return;
    }
    
    // Optimistic UI could go here, but since the server generates IDs, we just reload after
    try {
      await addToShoppingList(user.uid, recipe.id);
      await get().loadListForUser(user.uid);
      toast({
        title: "Added to Shopping List",
        description: `${recipe.name} ingredients have been added.`,
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed", description: "Failed to add to shopping list" });
    }
  },

  removeIngredient: async (itemId, ingredientName) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await removeFromShoppingList(user.uid, itemId);
      set((state) => {
        const newItems = new Map(state.items);
        newItems.delete(itemId);
        return { items: newItems };
      });
    } catch (error) {
      console.error(error);
    }
  },

  clearList: async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await clearShoppingList(user.uid);
      set({ items: new Map() });
    } catch (error) {
      console.error(error);
    }
  },

  loadListForUser: async (uid) => {
    if (!uid) {
      set({ items: new Map(), isLoading: false });
      return;
    }
    try {
      set({ isLoading: true });
      const list = await getShoppingList(uid);
      const itemsMap = new Map();
      list.forEach(item => itemsMap.set(item.id, item));
      set({ items: itemsMap, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ items: new Map(), isLoading: false });
    }
  }
}));

onAuthStateChanged(auth, (user) => {
  useShoppingList.getState().loadListForUser(user ? user.uid : null);
});
