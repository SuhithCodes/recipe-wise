
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getIngredientSubstitutions } from '@/app/actions';
import { Sparkles, LogIn } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

type IngredientSubstitutionDialogProps = {
  recipeName: string;
  ingredientName: string;
};

export function IngredientSubstitutionDialog({
  recipeName,
  ingredientName,
}: IngredientSubstitutionDialogProps) {
  const [substitutions, setSubstitutions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const handleFetchSubstitutions = async () => {
    if (!isLoggedIn) {
        router.push('/signin');
        return;
    }
    if (substitutions.length > 0) return; // Don't re-fetch
    setIsLoading(true);
    try {
      const result = await getIngredientSubstitutions({ recipeName, missingIngredient: ingredientName });
      setSubstitutions(result);
    } catch (error) {
      setSubstitutions(['Could not fetch suggestions. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerClick = () => {
    if (!isLoggedIn) {
        router.push('/signin');
        return;
    }
    setIsOpen(true);
    handleFetchSubstitutions();
  }

  if (!isLoggedIn) {
    return (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs text-accent hover:text-accent-foreground hover:bg-accent/80"
          onClick={() => router.push('/signin')}
        >
          <LogIn className="mr-1 h-3 w-3" />
          Substitutions
        </Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs text-accent hover:text-accent-foreground hover:bg-accent/80"
          onClick={handleFetchSubstitutions}
        >
          <Sparkles className="mr-1 h-3 w-3" />
          Substitutions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Substitutions for <span className="text-primary">{ingredientName}</span></DialogTitle>
          <p className="text-sm text-muted-foreground font-body">in {recipeName}</p>
        </DialogHeader>
        <div className="py-4 font-body">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-2 text-card-foreground">
              {substitutions.map((sub, index) => (
                <li key={index}>{sub}</li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
