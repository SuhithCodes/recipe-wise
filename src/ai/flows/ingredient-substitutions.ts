'use server';

/**
 * @fileOverview Ingredient substitution suggestion flow.
 *
 * - ingredientSubstitutions - A function that suggests ingredient substitutions.
 * - IngredientSubstitutionsInput - The input type for the ingredientSubstitutions function.
 * - IngredientSubstitutionsOutput - The return type for the ingredientSubstitutions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IngredientSubstitutionsInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  missingIngredient: z.string().describe('The ingredient that needs to be substituted.'),
});
export type IngredientSubstitutionsInput = z.infer<typeof IngredientSubstitutionsInputSchema>;

const IngredientSubstitutionsOutputSchema = z.object({
  substitutions: z.array(z.string()).describe('A list of suggested ingredient substitutions.'),
});
export type IngredientSubstitutionsOutput = z.infer<typeof IngredientSubstitutionsOutputSchema>;

export async function ingredientSubstitutions(
  input: IngredientSubstitutionsInput
): Promise<IngredientSubstitutionsOutput> {
  return ingredientSubstitutionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ingredientSubstitutionsPrompt',
  input: {schema: IngredientSubstitutionsInputSchema},
  output: {schema: IngredientSubstitutionsOutputSchema},
  prompt: `You are a helpful assistant that suggests ingredient substitutions for recipes.

  Suggest ingredient substitutions for the following recipe and missing ingredient.

  Recipe Name: {{{recipeName}}}
  Missing Ingredient: {{{missingIngredient}}}

  Substitutions:`,
});

const ingredientSubstitutionsFlow = ai.defineFlow(
  {
    name: 'ingredientSubstitutionsFlow',
    inputSchema: IngredientSubstitutionsInputSchema,
    outputSchema: IngredientSubstitutionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
