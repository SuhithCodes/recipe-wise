// This hook is a placeholder for a real implementation
// It does not use localStorage to avoid hydration issues in this example.
'use client';

import { create } from 'zustand';
import type { Recipe, Ingredient } from '@/types';
import { toast } from './use-toast';

type ShoppingListState = {
  items: Map<string, { ingredient: Ingredient; recipeName: string }>;
  addRecipe: (recipe: Recipe) => void;
  removeIngredient: (ingredientName: string) => void;
  clearList: () => void;
};

export const useShoppingList = create<ShoppingListState>((set) => ({
  items: new Map(),
  addRecipe: (recipe) => {
    set((state) => {
      const newItems = new Map(state.items);
      recipe.ingredients.forEach((ingredient) => {
        // Simple add, no quantity consolidation for this example
        newItems.set(ingredient.name, { ingredient, recipeName: recipe.name });
      });
      toast({
        title: "Added to Shopping List",
        description: `${recipe.name} ingredients have been added.`,
      });
      return { items: newItems };
    });
  },
  removeIngredient: (ingredientName) => {
    set((state) => {
      const newItems = new Map(state.items);
      newItems.delete(ingredientName);
      return { items: newItems };
    });
  },
  clearList: () => set({ items: new Map() }),
}));
