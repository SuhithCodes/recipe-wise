import type { Recipe, Ingredient, Instruction, Macro, Meal } from '@/types';

// This function transforms the raw data from the MealDB API (or a similar structure)
// into the Recipe format that our application uses.
export async function adaptMealToRecipe(meal: Meal): Promise<Recipe> {
  const ingredients: Ingredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredientName = meal[`strIngredient${i}` as keyof Meal] as string | null;
    const measure = meal[`strMeasure${i}` as keyof Meal] as string | null;
    if (ingredientName && ingredientName.trim() !== '') {
      ingredients.push({
        name: ingredientName,
        quantity: measure || '',
        unit: '', // The API doesn't provide a separate unit
      });
    }
  }

  const instructions: Instruction[] = (meal.strInstructions || '')
    .split('\r\n')
    .map((text, index) => ({
      step: index + 1,
      text: text.trim(),
    }))
    .filter(instruction => instruction.text.length > 0);
  
  // Create a seeded random number generator for consistent "random" values
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  const seed = parseInt(meal.idMeal, 10);

  const persisted = meal as any;

  // Prefer explicitly-stored fields on the Firestore document over seeded random fallbacks
  const servings = persisted.servings ?? Math.floor(seededRandom(seed + 7) * 4 + 2); // 2-6 servings
  const prepTime = persisted.prepTime ?? Math.floor(seededRandom(seed + 5) * 15 + 10); // 10-25 min
  const cookTime = persisted.cookTime ?? Math.floor(seededRandom(seed + 6) * 40 + 20); // 20-60 min
  
  const macros: Macro = persisted.macros ?? {
    protein: Math.floor(seededRandom(seed + 1) * 30 + 20), // 20-50g
    fats: Math.floor(seededRandom(seed + 2) * 20 + 10),    // 10-30g
    carbs: Math.floor(seededRandom(seed + 3) * 50 + 30),   // 30-80g
  };

  const rating = typeof persisted.rating === 'number'
    ? parseFloat(persisted.rating.toFixed(1))
    : 0;
  const reviewsCount = typeof persisted.reviewsCount === 'number' ? persisted.reviewsCount : 0;

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    description: persisted.description || `A delicious ${meal.strCategory} dish from ${meal.strArea} cuisine.`,
    image: meal.strMealThumb || '',
    cuisine: meal.strArea,
    mealType: meal.strCategory,
    dietary: persisted.dietary || (meal.strTags ? meal.strTags.split(',').filter(t => ['Vegan', 'Vegetarian', 'Keto', 'Gluten-Free'].includes(t)) : []),
    prepTime,
    cookTime,
    servings,
    ingredients,
    instructions,
    macros,
    rating,
    reviewsCount,
    reviews: persisted.reviews || [],
    tags: persisted.tags || (meal.strTags ? meal.strTags.split(',') : []),
    youtubeUrl: meal.strYoutube,
  };
}

export function adaptRecipeToMeal(recipe: Omit<Recipe, 'id' | 'rating' | 'reviewsCount' | 'reviews'>): Omit<Meal, 'idMeal'> {
  const meal: any = {
    strMeal: recipe.name,
    strCategory: recipe.mealType,
    strArea: recipe.cuisine,
    strInstructions: recipe.instructions.map(i => i.text).join('\r\n'),
    strMealThumb: recipe.image,
    strTags: recipe.tags ? recipe.tags.join(',') : '',
    strYoutube: recipe.youtubeUrl || '',
    
    // Explicitly store these so we don't need seeded randoms on retrieval
    description: recipe.description,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    macros: recipe.macros,
    dietary: recipe.dietary,
    tags: recipe.tags,
  };

  // Map up to 20 ingredients
  for (let i = 0; i < 20; i++) {
    const keyIng = `strIngredient${i + 1}`;
    const keyMeas = `strMeasure${i + 1}`;
    if (recipe.ingredients && i < recipe.ingredients.length) {
      const ing = recipe.ingredients[i];
      meal[keyIng] = ing.name;
      meal[keyMeas] = `${ing.quantity} ${ing.unit}`.trim();
    } else {
      meal[keyIng] = '';
      meal[keyMeas] = '';
    }
  }

  return meal as Omit<Meal, 'idMeal'>;
}
