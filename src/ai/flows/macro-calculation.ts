import { z } from 'zod';
import { genkit } from 'genkit';
import { ai } from '../genkit';

export const MacroCalculationInputSchema = z.object({
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    unit: z.string().optional()
  })),
  servings: z.number(),
  recipeName: z.string().optional()
});

export const MacroCalculationOutputSchema = z.object({
  macros: z.object({
    protein: z.number(),
    fats: z.number(),
    carbs: z.number(),
    calories: z.number().optional(),
    fiber: z.number().optional()
  }),
  confidence: z.string().optional(),
  notes: z.string().optional()
});

export type MacroCalculationInput = z.infer<typeof MacroCalculationInputSchema>;
export type MacroCalculationOutput = z.infer<typeof MacroCalculationOutputSchema>;

export const calculateMacros = ai.defineFlow(
  {
    name: 'calculateMacros',
    inputSchema: MacroCalculationInputSchema,
    outputSchema: MacroCalculationOutputSchema,
  },
  async (input: MacroCalculationInput): Promise<MacroCalculationOutput> => {
    const ingredientsList = input.ingredients
      .map(ing => `${ing.quantity} ${ing.unit || ''} ${ing.name}`.trim())
      .join('\n');

    const prompt = `You are a nutritionist expert. Calculate the macronutrients (protein, fats, carbs) per serving for this recipe.

Recipe: ${input.recipeName || 'Unknown Recipe'}
Total Servings: ${input.servings}

Ingredients:
${ingredientsList}

Please analyze these ingredients and provide:
1. Total protein in grams per serving
2. Total fats in grams per serving  
3. Total carbohydrates in grams per serving
4. Total calories per serving
5. Total fiber in grams per serving

Consider:
- Standard nutritional values for common ingredients
- Cooking methods don't significantly change macro counts
- Account for the total servings when calculating per-serving values
- Be as accurate as possible based on typical ingredient nutritional profiles

Provide your confidence level (high/medium/low) and any important notes about assumptions made.

Return the response in this exact JSON format:
{
  "macros": {
    "protein": <number>,
    "fats": <number>, 
    "carbs": <number>,
    "calories": <number>,
    "fiber": <number>
  },
  "confidence": "<high/medium/low>",
  "notes": "<any important notes or assumptions>"
}`;

    const result = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: prompt,
      config: {
        temperature: 0.1, // Low temperature for more consistent nutritional calculations
      },
    });

    try {
      // Try to parse the response as JSON
      const cleanResponse = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      
      // Validate and sanitize the response
      return {
        macros: {
          protein: Math.round(parsed.macros?.protein || 0),
          fats: Math.round(parsed.macros?.fats || 0),
          carbs: Math.round(parsed.macros?.carbs || 0),
          calories: parsed.macros?.calories ? Math.round(parsed.macros.calories) : undefined,
          fiber: parsed.macros?.fiber ? Math.round(parsed.macros.fiber) : undefined,
        },
        confidence: parsed.confidence || 'medium',
        notes: parsed.notes || 'Calculated using AI nutritional analysis'
      };
    } catch (error) {
      console.error('Failed to parse macro calculation response:', error);
      console.error('Raw response:', result.text);
      
      // Fallback to basic estimation if parsing fails
      const totalIngredients = input.ingredients.length;
      return {
        macros: {
          protein: Math.round(15 + totalIngredients * 3),
          fats: Math.round(8 + totalIngredients * 2),
          carbs: Math.round(25 + totalIngredients * 4),
          calories: Math.round((15 + totalIngredients * 3) * 4 + (8 + totalIngredients * 2) * 9 + (25 + totalIngredients * 4) * 4),
        },
        confidence: 'low',
        notes: 'Fallback estimation used due to parsing error'
      };
    }
  }
);

// Helper function to use outside of Genkit flows
export async function getMacrosForRecipe(input: MacroCalculationInput): Promise<MacroCalculationOutput> {
  try {
    return await calculateMacros(input);
  } catch (error) {
    console.error('Error calculating macros:', error);
    
    // Fallback calculation
    const baseProtein = 20;
    const baseFats = 10;
    const baseCarbs = 30;
    
    return {
      macros: {
        protein: baseProtein,
        fats: baseFats,
        carbs: baseCarbs,
        calories: baseProtein * 4 + baseFats * 9 + baseCarbs * 4,
      },
      confidence: 'low',
      notes: 'Error occurred, using fallback estimation'
    };
  }
}
