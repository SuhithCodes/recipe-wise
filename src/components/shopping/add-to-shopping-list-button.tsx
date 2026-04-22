'use client';

import { useRouter } from 'next/navigation';
import { useShoppingList } from '@/hooks/use-shopping-list';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogIn } from 'lucide-react';
import type { Recipe } from '@/types';

type AddToShoppingListButtonProps = {
  recipe: Recipe;
};

export default function AddToShoppingListButton({ recipe }: AddToShoppingListButtonProps) {
  const { addRecipe } = useShoppingList();
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (isLoggedIn) {
      addRecipe(recipe);
    } else {
      router.push('/signin');
    }
  };

  return (
    <Button className="w-full" onClick={handleClick}>
      {isLoggedIn ? (
        <>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add to Shopping List
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Sign in to Add to List
        </>
      )}
    </Button>
  );
}
