import { config } from 'dotenv';
config();

import '@/ai/flows/ingredient-substitutions.ts';
import '@/ai/flows/recipe-recommendations.ts';
import '@/ai/flows/macro-calculation.ts';
import '@/ai/flows/add-recipe.ts';