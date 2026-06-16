import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Recipe } from '@/types';
import { sanitizeRecipe } from '@/lib/sanitize';

const RecipeOutputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  cuisine: z.string(),
  mealType: z.string(),
  dietary: z.array(z.string()).optional(),
  prepTime: z.number().describe('Preparation time in minutes'),
  cookTime: z.number().describe('Cooking time in minutes'),
  servings: z.number(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
      unit: z.string().describe('e.g., cups, tbsp, grams, or empty if whole items'),
    })
  ),
  instructions: z.array(z.string()).describe('Step by step instructions'),
  macros: z.object({
    protein: z.number().describe('Protein in grams per serving'),
    fats: z.number().describe('Fats in grams per serving'),
    carbs: z.number().describe('Carbs in grams per serving'),
    calories: z.number().optional().describe('Total calories per serving'),
    fiber: z.number().optional().describe('Fiber in grams per serving'),
  }),
  tags: z.array(z.string()).optional(),
  youtubeUrl: z.string().optional(),
});

export const parseRecipeFlow = ai.defineFlow(
  {
    name: 'parseRecipe',
    inputSchema: z.object({ text: z.string() }),
    outputSchema: RecipeOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `Parse the following recipe text into a structured JSON format.\n\nText:\n${input.text}`,
      output: {
        schema: RecipeOutputSchema,
      },
    });

    if (!output) {
      throw new Error('Failed to generate output from Gemini');
    }

    return output;
  }
);

export async function parseRecipe(text: string): Promise<Omit<Recipe, 'id' | 'rating' | 'reviewsCount' | 'reviews'>> {
  const result = await parseRecipeFlow({ text });
  
  const rawRecipe: Partial<Recipe> = {
    ...result,
    image: '', // Can't parse image from raw text easily
    instructions: result.instructions.map((text, i) => ({ step: i + 1, text })),
  };

  return sanitizeRecipe(rawRecipe) as Omit<Recipe, 'id' | 'rating' | 'reviewsCount' | 'reviews'>;
}
