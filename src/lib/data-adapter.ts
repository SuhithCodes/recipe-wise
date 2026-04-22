
import type { Recipe, Ingredient, Instruction, Review, Macro, Meal } from '@/types';

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

  // Calculate serving size
  const servings = Math.floor(seededRandom(seed + 7) * 4 + 2); // 2-6 servings
  
  // Use mock macros for listing pages - real calculation only happens on individual recipe page
  const macros: Macro = {
    protein: Math.floor(seededRandom(seed + 1) * 30 + 20), // 20-50g
    fats: Math.floor(seededRandom(seed + 2) * 20 + 10),    // 10-30g
    carbs: Math.floor(seededRandom(seed + 3) * 50 + 30),   // 30-80g
  };

  // Prefer persisted aggregate rating if available on the doc; otherwise default to 0 (no ratings)
  const persisted = meal as any;
  const rating = typeof persisted?.rating === 'number'
    ? parseFloat(persisted.rating.toFixed(1))
    : 0;
  const reviewsCount = typeof persisted?.reviewsCount === 'number' ? persisted.reviewsCount : 0;

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    description: `A delicious ${meal.strCategory} dish from ${meal.strArea} cuisine.`,
    image: meal.strMealThumb,
    cuisine: meal.strArea,
    mealType: meal.strCategory,
    dietary: meal.strTags ? meal.strTags.split(',').filter(t => ['Vegan', 'Vegetarian', 'Keto', 'Gluten-Free'].includes(t)) : [],
    prepTime: Math.floor(seededRandom(seed + 5) * 15 + 10), // 10-25 min
    cookTime: Math.floor(seededRandom(seed + 6) * 40 + 20), // 20-60 min
    servings: servings,   // Use the servings calculated earlier
    ingredients,
    instructions,
    macros,
    rating,
    reviewsCount,
    reviews: [],
    tags: meal.strTags ? meal.strTags.split(',') : [],
    youtubeUrl: meal.strYoutube,
  };
}
