
'use client';

import { useEffect, useState } from 'react';
import RecipeCard from "@/components/recipes/recipe-card";
import { useFavorites } from "@/hooks/use-favorites";
import { getRecipesByIds } from '@/lib/firestore';
import { Heart } from "lucide-react";
import type { Recipe } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function FavoritesPage() {
    const { favoriteIds } = useFavorites();
    const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            const ids = Array.from(favoriteIds);
            const recipes = await getRecipesByIds(ids);
            setFavoriteRecipes(recipes);
            setLoading(false);
        };

        if (favoriteIds.size > 0) {
            fetchFavorites();
        } else {
            setFavoriteRecipes([]);
            setLoading(false);
        }
    }, [favoriteIds]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                 <Heart className="mr-3 h-8 w-8 text-primary fill-primary" />
                <h1 className="font-headline text-4xl font-bold">Your Favorite Recipes</h1>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : favoriteRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {favoriteRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">You haven't saved any favorite recipes yet.</p>
                    <p className="text-muted-foreground">Click the heart icon on any recipe to add it to your collection.</p>
                </div>
            )}
        </div>
    );
}
