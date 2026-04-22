// recipe-recommendations.ts
'use server';
/**
 * @fileOverview Recommends recipes based on user preferences.
 *
 * - recommendRecipes - A function that recommends recipes based on user data.
 * - RecipeRecommendationsInput - The input type for the recommendRecipes function.
 * - RecipeRecommendationsOutput - The return type for the recommendRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecipeRecommendationsInputSchema = z.object({
  savedFavorites: z.array(z.string()).describe('List of user saved favorite recipes.'),
  searchHistory: z.array(z.string()).describe('User recipe search history.'),
  ingredientList: z.array(z.string()).describe('List of ingredients the user has.'),
});
export type RecipeRecommendationsInput = z.infer<typeof RecipeRecommendationsInputSchema>;

const RecipeRecommendationsOutputSchema = z.object({
  recommendedRecipes: z.array(z.string()).describe('List of recommended recipes.'),
});
export type RecipeRecommendationsOutput = z.infer<typeof RecipeRecommendationsOutputSchema>;

export async function recommendRecipes(input: RecipeRecommendationsInput): Promise<RecipeRecommendationsOutput> {
  return recommendRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recipeRecommendationsPrompt',
  input: {schema: RecipeRecommendationsInputSchema},
  output: {schema: RecipeRecommendationsOutputSchema},
  prompt: `You are a recipe recommendation expert. Based on the user's saved favorite recipes, search history, and ingredient list, recommend recipes that the user might enjoy.

Saved Favorite Recipes: {{#if savedFavorites}}{{#each savedFavorites}}- {{{this}}}\n{{/each}}{{else}}None{{/if}}

Search History: {{#if searchHistory}}{{#each searchHistory}}- {{{this}}}\n{{/each}}{{else}}None{{/if}}

Ingredient List: {{#if ingredientList}}{{#each ingredientList}}- {{{this}}}\n{{/each}}{{else}}None{{/if}}

Recommend 3 recipes.`,
});

const recommendRecipesFlow = ai.defineFlow(
  {
    name: 'recommendRecipesFlow',
    inputSchema: RecipeRecommendationsInputSchema,
    outputSchema: RecipeRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
