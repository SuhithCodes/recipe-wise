'use server';

import { getAllRecipes, getRecipesByIds } from '@/lib/firestore';
import { getUserProfileServer, getUserFavoriteIdsServer } from '@/lib/user-data-server';
import type { Recipe } from '@/types';

type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner';

type Signals = {
  preferredCuisines: Set<string>;
  favoriteCuisines: Set<string>;
  topTags: Set<string>;
};

function deriveSignalsFromFavorites(favoriteRecipes: Recipe[], preferredCuisines: string[]): Signals {
  const cuisineCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  for (const r of favoriteRecipes) {
    if (r.cuisine) cuisineCounts[r.cuisine] = (cuisineCounts[r.cuisine] || 0) + 1;
    for (const t of r.tags || []) tagCounts[t] = (tagCounts[t] || 0) + 1;
  }
  const favCuisines = Object.entries(cuisineCounts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k])=>k);
  const topTags = Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k])=>k);
  return {
    preferredCuisines: new Set(preferredCuisines || []),
    favoriteCuisines: new Set(favCuisines),
    topTags: new Set(topTags),
  };
}

function scoreRecipe(recipe: Recipe, signals: Signals, slot: MealSlot): number {
  let score = 0;
  // Base: prefer matching slot categories
  const mealType = (recipe.mealType || '').toLowerCase();
  const slotMatch = (
    (slot === 'Breakfast' && (mealType.includes('breakfast') || mealType.includes('starter'))) ||
    (slot === 'Lunch' && (mealType.includes('side') || mealType.includes('chicken') || mealType.includes('beef'))) ||
    (slot === 'Dinner' && (mealType.includes('seafood') || mealType.includes('pasta') || mealType.includes('pork') || mealType.includes('main')))
  );
  if (slotMatch) score += 3;

  // Cuisine signals
  if (recipe.cuisine && signals.preferredCuisines.has(recipe.cuisine)) score += 5;
  if (recipe.cuisine && signals.favoriteCuisines.has(recipe.cuisine)) score += 3;

  // Tag signals
  for (const t of recipe.tags || []) {
    if (signals.topTags.has(t)) score += 1.5;
  }

  // Light popularity tie-breaker
  if (recipe.rating) score += Math.min(2, Math.max(0, recipe.rating / 2));

  return score;
}

function pickTopBySlot(recipes: Recipe[], signals: Signals, slot: MealSlot, excludeIds: Set<string> = new Set()): Recipe | undefined {
  const ranked = recipes
    .filter(r => !excludeIds.has(r.id))
    .map(r => ({ r, s: scoreRecipe(r, signals, slot) }))
    .sort((a,b) => b.s - a.s);
  // Add diversity: choose randomly among top 6 candidates if available
  const topK = ranked.slice(0, Math.min(6, ranked.length));
  if (topK.length === 0) return undefined;
  const idx = Math.floor(Math.random() * topK.length);
  return topK[idx].r;
}

export async function buildMealPlanForUser(uid: string, _salt?: number): Promise<{ breakfast?: Recipe; lunch?: Recipe; dinner?: Recipe; }>{
  const profile = await getUserProfileServer(uid);
  const favoriteIds = await getUserFavoriteIdsServer(uid);
  const favoriteRecipes = await getRecipesByIds(Array.from(favoriteIds));
  const signals = deriveSignalsFromFavorites(favoriteRecipes, profile.preferredCuisines || []);

  const candidates = await getAllRecipes(400);
  const used = new Set<string>();
  const breakfast = pickTopBySlot(candidates, signals, 'Breakfast', used);
  if (breakfast) used.add(breakfast.id);
  const lunch = pickTopBySlot(candidates, signals, 'Lunch', used);
  if (lunch) used.add(lunch.id);
  const dinner = pickTopBySlot(candidates, signals, 'Dinner', used);

  return { breakfast, lunch, dinner };
}


