

'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Recipe } from '@/types';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useFavorites } from '@/hooks/use-favorites';
import { useRouter } from 'next/navigation';

type RecipeCardProps = {
  recipe: Recipe;
  className?: string;
};

export default function RecipeCard({ recipe, className }: RecipeCardProps) {
  const { isLoggedIn } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const router = useRouter();
  
  const isFavorite = favoriteIds.has(recipe.id);
  const image = getPlaceholderImage(recipe);

  const handleFavoriteClick = () => {
    if (!isLoggedIn) {
      router.push('/signin');
      return;
    }
    toggleFavorite(recipe.id, recipe.name);
  };

  return (
    <Card className={cn("flex flex-col overflow-hidden transition-all hover:shadow-lg", className)}>
      <CardHeader className="p-0 relative">
        <Link href={`/recipes/${recipe.id}`} className="block">
          {image && (
            <Image
              src={image.imageUrl}
              alt={recipe.name}
              width={600}
              height={400}
              className="w-full h-48 object-cover"
              data-ai-hint={image.imageHint}
            />
          )}
        </Link>
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={cn("h-4 w-4", isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground')} />
          <span className="sr-only">Favorite</span>
        </Button>
      </CardHeader>
      <div className="flex flex-col flex-1 p-4">
        <CardContent className="p-0 flex-1">
          <Badge variant="secondary" className="mb-2">{recipe.cuisine}</Badge>
          <Link href={`/recipes/${recipe.id}`}>
            <CardTitle className="font-headline text-xl leading-snug mb-2 hover:text-primary transition-colors">
              {recipe.name}
            </CardTitle>
          </Link>
          <CardDescription className="line-clamp-2 text-sm font-body">
            {recipe.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-0 pt-4 flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <div className="flex items-center gap-2">
            {recipe.reviewsCount && recipe.reviewsCount > 0 ? (
              <>
                <div className="flex items-center">
                  <span className="font-semibold text-foreground">{(recipe.rating || 0).toFixed(1)}</span>
                  <Star className="h-4 w-4 fill-primary text-primary ml-1" />
                </div>
                <span className="text-xs text-muted-foreground">({recipe.reviewsCount})</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">No ratings</span>
            )}
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
