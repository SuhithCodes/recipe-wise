'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Recipe } from '@/types';
import RecipeCard from '@/components/recipes/recipe-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useFavorites } from '@/hooks/use-favorites';
import { getAllRecipes } from '@/lib/firestore';
import { recommendByFavorites } from '@/lib/recommendations';
import type { Meal } from '@/types';

export default function RecipeRecommendationsSection() {
  const [recommendations, setRecommendations] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { favoriteIds } = useFavorites();

  useEffect(() => {
    async function fetchRecommendations() {
      setIsLoading(true);
      try {
        const all = await getAllRecipes(250);
        // We also need the raw Meal data; our adapter produces Recipe objects.
        // For similarity we approximate from Recipe by mapping back minimal Meal-like fields.
        const toMeal = (r: Recipe): Meal => ({
          idMeal: r.id,
          strMeal: r.name,
          strDrinkAlternate: null,
          strCategory: r.mealType,
          strArea: r.cuisine,
          strInstructions: '',
          strMealThumb: r.image,
          strTags: r.tags?.join(',') || null,
          strYoutube: r.youtubeUrl || '',
          strIngredient1: r.ingredients[0]?.name || null,
          strIngredient2: r.ingredients[1]?.name || null,
          strIngredient3: r.ingredients[2]?.name || null,
          strIngredient4: r.ingredients[3]?.name || null,
          strIngredient5: r.ingredients[4]?.name || null,
          strIngredient6: r.ingredients[5]?.name || null,
          strIngredient7: r.ingredients[6]?.name || null,
          strIngredient8: r.ingredients[7]?.name || null,
          strIngredient9: r.ingredients[8]?.name || null,
          strIngredient10: r.ingredients[9]?.name || null,
          strIngredient11: null,
          strIngredient12: null,
          strIngredient13: null,
          strIngredient14: null,
          strIngredient15: null,
          strIngredient16: null,
          strIngredient17: null,
          strIngredient18: null,
          strIngredient19: null,
          strIngredient20: null,
          strMeasure1: null,
          strMeasure2: null,
          strMeasure3: null,
          strMeasure4: null,
          strMeasure5: null,
          strMeasure6: null,
          strMeasure7: null,
          strMeasure8: null,
          strMeasure9: null,
          strMeasure10: null,
          strMeasure11: null,
          strMeasure12: null,
          strMeasure13: null,
          strMeasure14: null,
          strMeasure15: null,
          strMeasure16: null,
          strMeasure17: null,
          strMeasure18: null,
          strMeasure19: null,
          strMeasure20: null,
          strSource: null,
          strImageSource: null,
          strCreativeCommonsConfirmed: null,
          dateModified: null,
        });

        const allMeals: Meal[] = all.map(toMeal);
        const favIds = Array.from(favoriteIds);
        const favoritesMeals = allMeals.filter(m => favIds.includes(m.idMeal));
        const ranked = recommendByFavorites(favoritesMeals, allMeals, 9);

        const rankedIds = new Set(ranked.map(r => r.meal.idMeal));
        const recRecipes = all.filter(r => rankedIds.has(r.id));
        setRecommendations(recRecipes);
      } catch (e) {
        console.error('Failed to compute recommendations', e);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (favoriteIds.size > 0) {
      fetchRecommendations();
    } else {
      setRecommendations([]);
      setIsLoading(false);
    }
  }, [favoriteIds]);

  return (
    <section>
      <h2 className="font-headline text-3xl font-bold mb-6">Just for You</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
      ) : (
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {recommendations.map((recipe, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <RecipeCard recipe={recipe} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-12" />
          <CarouselNext className="mr-12" />
        </Carousel>
      )}
    </section>
  );
}
