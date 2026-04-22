'use client';

import type { Meal, Recipe } from '@/types';

type MealFeatures = {
  category: string | null;
  area: string | null;
  tags: Set<string>;
  ingredients: Set<string>;
};

function extractMealFeatures(meal: Meal): MealFeatures {
  const tags = (meal.strTags || '')
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const key = `strIngredient${i}` as keyof Meal;
    const val = (meal[key] as string | null) || '';
    const norm = val.trim().toLowerCase();
    if (norm) ingredients.push(norm);
  }

  return {
    category: meal.strCategory || null,
    area: meal.strArea || null,
    tags: new Set(tags),
    ingredients: new Set(ingredients),
  };
}

// -------------------------
// TF-IDF utilities
// -------------------------

function computeIdf(tokensPerDoc: Array<Set<string>>): Map<string, number> {
  const docCount = tokensPerDoc.length;
  const df: Map<string, number> = new Map();
  for (const tokens of tokensPerDoc) {
    for (const t of tokens) {
      df.set(t, (df.get(t) || 0) + 1);
    }
  }
  const idf: Map<string, number> = new Map();
  for (const [t, count] of df.entries()) {
    // Smoothed IDF: log((N + 1) / (df + 1)) + 1
    const value = Math.log((docCount + 1) / (count + 1)) + 1;
    idf.set(t, value);
  }
  return idf;
}

function buildIdfForMeals(candidates: Meal[]): { tagsIdf: Map<string, number>; ingredientsIdf: Map<string, number> } {
  const tagDocs: Array<Set<string>> = [];
  const ingDocs: Array<Set<string>> = [];
  for (const m of candidates) {
    const f = extractMealFeatures(m);
    tagDocs.push(f.tags);
    ingDocs.push(f.ingredients);
  }
  return {
    tagsIdf: computeIdf(tagDocs),
    ingredientsIdf: computeIdf(ingDocs),
  };
}

export type SimilarityWeights = {
  category: number;
  area: number;
  tag: number;
  ingredient: number;
};

const DEFAULT_WEIGHTS: SimilarityWeights = {
  category: 3,
  area: 1,
  tag: 2,
  ingredient: 1,
};

export function computeSimilarity(a: Meal, b: Meal, weights: SimilarityWeights = DEFAULT_WEIGHTS): number {
  const fa = extractMealFeatures(a);
  const fb = extractMealFeatures(b);

  let score = 0;
  if (fa.category && fb.category && fa.category === fb.category) score += weights.category;
  if (fa.area && fb.area && fa.area === fb.area) score += weights.area;

  // tag overlap
  for (const t of fa.tags) {
    if (fb.tags.has(t)) score += weights.tag;
  }

  // ingredient overlap
  for (const ing of fa.ingredients) {
    if (fb.ingredients.has(ing)) score += weights.ingredient;
  }

  return score;
}

export function recommendByFavorites(
  favorites: Meal[],
  candidates: Meal[],
  topN: number = 10,
  weights: SimilarityWeights = DEFAULT_WEIGHTS
): { meal: Meal; score: number }[] {
  const favoriteIds = new Set(favorites.map(f => f.idMeal));
  const scores: Map<string, number> = new Map();

  // Precompute IDF to downweight popular tags/ingredients
  const { tagsIdf, ingredientsIdf } = buildIdfForMeals(candidates);

  function similarityWithTfidf(a: Meal, b: Meal): number {
    const fa = extractMealFeatures(a);
    const fb = extractMealFeatures(b);

    let score = 0;
    if (fa.category && fb.category && fa.category === fb.category) score += weights.category;
    if (fa.area && fb.area && fa.area === fb.area) score += weights.area;

    for (const t of fa.tags) {
      if (fb.tags.has(t)) score += weights.tag * (tagsIdf.get(t) || 1);
    }
    for (const ing of fa.ingredients) {
      if (fb.ingredients.has(ing)) score += weights.ingredient * (ingredientsIdf.get(ing) || 1);
    }
    return score;
  }

  for (const fav of favorites) {
    for (const cand of candidates) {
      if (favoriteIds.has(cand.idMeal)) continue;
      const s = similarityWithTfidf(fav, cand);
      if (s <= 0) continue;
      scores.set(cand.idMeal, (scores.get(cand.idMeal) || 0) + s);
    }
  }

  const ranked = candidates
    .filter(c => !favoriteIds.has(c.idMeal))
    .map(c => ({ meal: c, score: scores.get(c.idMeal) || 0 }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return ranked;
}


