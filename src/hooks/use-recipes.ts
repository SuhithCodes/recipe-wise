
'use client';

import { useState, useEffect } from 'react';
import { getRecipes } from '@/lib/firestore';
import type { Recipe } from '@/types';

type UseRecipesArgs = {
  cuisine?: string | null;
  category?: string | null;
  diet?: string | null;
  searchTerm?: string;
};

export function useRecipes({ cuisine, category, diet, searchTerm }: UseRecipesArgs) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      const fetchedRecipes = await getRecipes({ cuisine, category, diet, searchTerm });
      setRecipes(fetchedRecipes);
      setLoading(false);
    };

    fetchRecipes();
  }, [cuisine, category, diet, searchTerm]);

  return { recipes, loading };
}
