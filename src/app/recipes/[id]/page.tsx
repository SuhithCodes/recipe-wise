
'use client';

import { Suspense, useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getRecipeById } from '@/lib/firestore';
import type { Recipe } from '@/types';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Users, Heart, Star, Soup, ChefHat, LogIn, RefreshCw, Trash } from 'lucide-react';
import { IngredientSubstitutionDialog } from '@/components/ai/ingredient-substitution-dialog';
import AddToShoppingListButton from '@/components/shopping/add-to-shopping-list-button';
import { IngredientHoverCard } from '@/components/recipes/ingredient-hover-card';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useFavorites } from '@/hooks/use-favorites';
import { useRecipeMacros } from '@/hooks/use-recipe-macros';
import { cn } from '@/lib/utils';
import { fetchRecipeReviews, submitRecipeReview, removeRecipeReview } from '@/app/actions';

function RecipeDetail() {
  const params = useParams();
  const router = useRouter();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const recipeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [myRating, setMyRating] = useState<number>(0);
  const [myComment, setMyComment] = useState<string>('');
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : (recipe?.rating || 0);
  
  // Use the new macro calculation hook
  const { 
    macros: calculatedMacros, 
    loading: macrosLoading, 
    error: macrosError,
    confidence,
    notes,
    isCached,
    recalculate 
  } = useRecipeMacros(recipe);
  
  useEffect(() => {
    if (!recipeId) return;
    setLoading(true);
    getRecipeById(recipeId).then(async recipeData => {
      if (!recipeData) {
        notFound();
      } else {
        setRecipe(recipeData);
        const revs = await fetchRecipeReviews(recipeId);
        setReviews(revs);
      }
      setLoading(false);
    });
  }, [recipeId]);

  const handleFavoriteClick = () => {
    if (!isLoggedIn) {
      router.push('/signin');
      return;
    }
    if (recipe) {
      toggleFavorite(recipe.id, recipe.name);
    }
  };

  if (loading) {
    return <RecipePageSkeleton />;
  }

  if (!recipe) {
    notFound();
  }

  const isFavorite = favoriteIds.has(recipe.id);
  const image = getPlaceholderImage(recipe);

  const infoBadges = [
    { icon: Clock, label: 'Total Time', value: `${recipe.prepTime + recipe.cookTime} min` },
    { icon: Users, label: 'Servings', value: recipe.servings },
    { icon: Soup, label: 'Cuisine', value: recipe.cuisine },
    { icon: ChefHat, label: 'Meal', value: recipe.mealType },
  ];

  const handleReviewSubmit = async () => {
    if (!isLoggedIn || !recipeId) {
      router.push('/signin');
      return;
    }
    const { user } = useAuth.getState();
    if (!user) {
      router.push('/signin');
      return;
    }
    const r = await submitRecipeReview(String(recipeId), {
      userId: user.uid,
      userName: user.displayName || user.email || 'User',
      userAvatar: user.photoURL || undefined,
      rating: Math.max(1, Math.min(5, myRating || 0)),
      comment: myComment || '',
    });
    if (r.success) {
      const revs = await fetchRecipeReviews(String(recipeId));
      setReviews(revs);
      setMyRating(0);
      setMyComment('');
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-2">{recipe.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? 'fill-current' : ''}`} />
                ))}
              </span>
              {reviews.length > 0 ? (
                <>
                  <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({reviews.length})</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No ratings</span>
              )}
            </div>
            <p className="text-lg text-muted-foreground font-body">{recipe.description}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full h-12 w-12 shrink-0"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn("h-6 w-6", isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground')} />
            <span className="sr-only">Favorite</span>
          </Button>
        </div>
        <div className="mt-4 flex gap-2">
            {recipe.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
            {image && <Image src={image.imageUrl} alt={recipe.name} fill className="object-cover" data-ai-hint={image.imageHint} priority />}
             {recipe.youtubeUrl && (
                <Button asChild className="absolute bottom-4 right-4">
                    <Link href={recipe.youtubeUrl} target="_blank">Watch Video</Link>
                </Button>
             )}
          </div>

          <Card className="mb-8">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
                <ol className="list-decimal list-inside space-y-4 font-body text-base">
                    {recipe.instructions.map((instruction) => (
                        <li key={instruction.step} className="pl-2">
                            {instruction.text}
                        </li>
                    ))}
                </ol>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardContent className="p-4 grid grid-cols-2 gap-4">
              {infoBadges.map(badge => (
                <div key={badge.label} className="flex items-center gap-2">
                  <badge.icon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{badge.label}</p>
                    <p className="text-sm font-semibold">{badge.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3 font-body">
                    {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex justify-between items-center">
                            <span>
                                <span className="font-semibold">{ing.quantity} {ing.unit}</span>{' '}
                                <IngredientHoverCard ingredientName={ing.name}>
                                    <span className="hover:text-primary hover:underline transition-colors cursor-pointer">
                                        {ing.name}
                                    </span>
                                </IngredientHoverCard>
                            </span>
                            <IngredientSubstitutionDialog recipeName={recipe.name} ingredientName={ing.name} />
                        </li>
                    ))}
                </ul>
                <Separator className="my-4" />
                <AddToShoppingListButton recipe={recipe} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Macros</CardTitle>
                <p className="text-sm text-muted-foreground">per serving</p>
            </CardHeader>
            <CardContent>
              {macrosLoading ? (
                <div className="flex justify-around text-center">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-around text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {calculatedMacros?.protein || recipe.macros.protein}g
                    </p>
                    <p className="text-sm text-muted-foreground">Protein</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-500">
                      {calculatedMacros?.carbs || recipe.macros.carbs}g
                    </p>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">
                      {calculatedMacros?.fats || recipe.macros.fats}g
                    </p>
                    <p className="text-sm text-muted-foreground">Fats</p>
                  </div>
                  {(calculatedMacros?.calories || recipe.macros.calories) && (
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {calculatedMacros?.calories || recipe.macros.calories}
                      </p>
                      <p className="text-sm text-muted-foreground">Calories</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
       <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            Reviews ({reviews.length})
            <span className="flex items-center ml-4 text-xl text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? 'fill-current' : ''}`} />
                ))}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-4">
              <Avatar>
                <AvatarImage src={review.userAvatar} />
                <AvatarFallback>{String(review.userName || 'U').charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{review.userName}</p>
                  <div className="flex text-amber-500">
                     {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  {useAuth.getState().user?.uid === review.userId && (
                    <Button size="sm" variant="ghost" className="h-7 px-2" aria-label="Delete review" onClick={async () => {
                      const me = useAuth.getState().user;
                      if (!me || !recipeId) return;
                      const res = await removeRecipeReview(String(recipeId), String(review.id), me.uid);
                      if (res.success) {
                        const revs = await fetchRecipeReviews(String(recipeId));
                        setReviews(revs);
                      }
                    }}>
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            </div>
          ))}
          <Separator />
           <div>
              <p className="font-semibold mb-2">Leave a review</p>
              <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} aria-label={`Rate ${i+1}`} onClick={() => setMyRating(i+1)}>
                    <Star className={`w-6 h-6 ${i < myRating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
              <Textarea value={myComment} onChange={e=>setMyComment(e.target.value)} placeholder="Share your thoughts..." className="mb-2" disabled={!isLoggedIn} />
              <Button onClick={handleReviewSubmit} disabled={!isLoggedIn || myRating === 0}>
                {isLoggedIn ? (
                  'Submit Review'
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in to Review
                  </>
                )}
              </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RecipePageSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="w-full h-96 mb-8 rounded-lg" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardContent className="p-4 grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
            <CardContent className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
            </CardContent>
          </Card>
           <Card>
            <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
            <CardContent className="flex justify-around">
               <Skeleton className="h-12 w-16" />
               <Skeleton className="h-12 w-16" />
               <Skeleton className="h-12 w-16" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function RecipePage() {
  return (
    <Suspense fallback={<RecipePageSkeleton />}>
      <RecipeDetail />
    </Suspense>
  )
}
