
'use client';
import { useState, useEffect } from 'react';
import RecipeCard from "@/components/recipes/recipe-card";
import { getRecipes } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import type { Recipe } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { getSuggestedMealsForUser } from '@/app/actions';

export default function MealPlannerPage() {
    const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
    const [meals, setMeals] = useState<{title: string, recipe: Recipe | undefined}[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isLoggedIn } = useAuth();

    useEffect(() => {
        async function load() {
            const recipes = await getRecipes();
            setAllRecipes(recipes);
            if (isLoggedIn && user) {
                const plan = await getSuggestedMealsForUser(user.uid);
                setMeals([
                    { title: 'Breakfast', recipe: plan.breakfast },
                    { title: 'Lunch', recipe: plan.lunch },
                    { title: 'Dinner', recipe: plan.dinner },
                ]);
            } else {
                generateRandomMeals(recipes);
            }
            setLoading(false);
        }
        load();
    }, [isLoggedIn, user?.uid]);

    const generateRandomMeals = (recipesToUse: Recipe[]) => {
        if(recipesToUse.length === 0) return;

        const shuffle = (arr: Recipe[]) => [...arr].sort(() => 0.5 - Math.random());

        const breakfast = shuffle(recipesToUse.filter(r => r.mealType === 'Breakfast' || r.mealType === 'Starter'))[0];
        const lunch = shuffle(recipesToUse.filter(r => r.mealType === 'Side' || r.mealType === 'Beef' || r.mealType === 'Chicken'))[0];
        const dinner = shuffle(recipesToUse.filter(r => r.mealType === 'Seafood' || r.mealType === 'Pasta' || r.mealType === 'Pork'))[0] || shuffle(recipesToUse)[0];

        setMeals([
            { title: 'Breakfast', recipe: breakfast },
            { title: 'Lunch', recipe: lunch },
            { title: 'Dinner', recipe: dinner },
        ]);
    };
    const refreshSuggestions = async () => {
        if (isLoggedIn && user) {
            setLoading(true);
            const plan = await getSuggestedMealsForUser(user.uid);
            setMeals([
                { title: 'Breakfast', recipe: plan.breakfast },
                { title: 'Lunch', recipe: plan.lunch },
                { title: 'Dinner', recipe: plan.dinner },
            ]);
            setLoading(false);
        } else {
            generateRandomMeals(allRecipes);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                 <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-48" />
                </div>
                <Skeleton className="h-6 w-2/3 mb-8" />
                 <div className="space-y-12">
                    {[...Array(3)].map((_, idx) => (
                        <section key={idx}>
                            <Skeleton className="h-9 w-1/4 mb-4" />
                            <div className="max-w-2xl mx-auto space-y-4">
                               <Skeleton className="h-48 w-full" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </section>
                    ))}
                 </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-headline text-4xl font-bold">Your Daily Meal Plan</h1>
                <Button onClick={refreshSuggestions}>
                    <Shuffle className="mr-2 h-4 w-4" />
                    Suggest New Meals
                </Button>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
                Here are some AI-powered suggestions for your day. Enjoy your meals!
            </p>

            <div className="space-y-12">
                {meals.map((meal) => (
                    meal.recipe && (
                        <section key={meal.title}>
                            <h2 className="font-headline text-3xl font-semibold mb-4 border-b-2 border-primary pb-2">{meal.title}</h2>
                            <div className="max-w-2xl mx-auto">
                                <RecipeCard recipe={meal.recipe} />
                            </div>
                        </section>
                    )
                ))}
            </div>
        </div>
    );
}
