
'use server';

import { ingredientSubstitutions, IngredientSubstitutionsInput } from '@/ai/flows/ingredient-substitutions';
import { recommendRecipes, RecipeRecommendationsInput } from '@/ai/flows/recipe-recommendations';
import { getMacrosForRecipe, MacroCalculationInput } from '@/ai/flows/macro-calculation';
import { getRecipes } from '@/lib/firestore';
import { buildMealPlanForUser } from '@/lib/meal-planner';
import { addRecipeReview, getRecipeReviews, deleteRecipeReview, type RecipeReview } from '@/lib/reviews';

export async function getIngredientSubstitutions(input: IngredientSubstitutionsInput) {
    try {
        const result = await ingredientSubstitutions(input);
        return result.substitutions;
    } catch (error) {
        console.error("Error getting ingredient substitutions:", error);
        return ["Sorry, I couldn't find any substitutions at the moment."];
    }
}

export async function getRecipeRecommendations(input: RecipeRecommendationsInput) {
    try {
        const result = await recommendRecipes(input);
        // In a real app, you'd fetch these recipes from a DB. Here we'll filter our mock data.
        const allRecipes = await getRecipes();
        const recommended = allRecipes.filter(r => result.recommendedRecipes.includes(r.name));
        return recommended;
    } catch (error) {
        console.error("Error getting recipe recommendations:", error);
        // Return some popular recipes as a fallback
        return getRecipes({limit: 3});
    }
}

export async function calculateRecipeMacros(input: MacroCalculationInput) {
    try {
        const result = await getMacrosForRecipe(input);
        return result;
    } catch (error) {
        console.error("Error calculating recipe macros:", error);
        // Return fallback macros
        return {
            macros: {
                protein: 20,
                fats: 10,
                carbs: 30,
                calories: 280
            },
            confidence: 'low',
            notes: 'Error occurred, using fallback estimation'
        };
    }
}

// Function to clear macro cache for a specific recipe (force recalculation)
export async function clearMacroCache(recipeId: string) {
    try {
        const { saveMacrosToFirebase } = await import('@/lib/firestore');
        // Clear the cached macros by setting them to null
        await saveMacrosToFirebase(recipeId, {
            protein: null,
            fats: null,
            carbs: null,
            calories: null,
            fiber: null
        }, 'cleared', 'Cache cleared - will recalculate on next request');
        return { success: true };
    } catch (error) {
        console.error("Error clearing macro cache:", error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function getSuggestedMealsForUser(uid: string) {
    try {
        // Add a salt so consecutive calls can diversify results server-side
        const salt = Date.now();
        return await buildMealPlanForUser(uid, salt);
    } catch (error) {
        console.error('Error building meal plan:', error);
        // Fallback: return popular/random meals
        const all = await getRecipes({ limit: 12 });
        return {
            breakfast: all[0],
            lunch: all[1],
            dinner: all[2],
        };
    }
}

export async function fetchRecipeReviews(recipeId: string) {
    try {
        const raw = await getRecipeReviews(recipeId);
        // Normalize Firestore Timestamps to plain strings
        return raw.map((r: any) => ({
            ...r,
            createdAt: r?.createdAt?.toDate ? r.createdAt.toDate().toISOString() : (r?.createdAt || null),
        }));
    } catch (e) {
        console.error('Failed to fetch reviews', e);
        return [] as RecipeReview[];
    }
}

export async function submitRecipeReview(recipeId: string, review: Omit<RecipeReview, 'id' | 'createdAt'>) {
    try {
        await addRecipeReview(recipeId, review);
        return { success: true };
    } catch (e) {
        console.error('Failed to submit review', e);
        return { success: false };
    }
}

export async function removeRecipeReview(recipeId: string, reviewId: string, requesterUserId: string) {
    try {
        const res = await deleteRecipeReview(recipeId, reviewId, requesterUserId);
        return res;
    } catch (e) {
        console.error('Failed to delete review', e);
        return { success: false };
    }
}
