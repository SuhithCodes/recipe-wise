'use client';

import { useState, useEffect } from 'react';
import { getRecipesPaginated } from '@/lib/firestore';
import type { Recipe } from '@/types';

type UseRecipesPaginatedArgs = {
  cuisine?: string | null;
  category?: string | null;
  diet?: string | null;
  searchTerm?: string;
  sort?: 'avgReviews' | 'timeAsc' | 'timeDesc' | 'rating' | '';
  pageSize?: number;
};

export function useRecipesPaginated({ cuisine, category, diet, searchTerm, sort = '', pageSize = 8 }: UseRecipesPaginatedArgs) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRecipes = async (page: number = 1, reset: boolean = true) => {
    setLoading(true);
    try {
      // First try to get recipes sorted by rating
      const ratedResult = await getRecipesPaginated({ 
        cuisine,
        category,
        diet,
        searchTerm,
        sort: sort || undefined,
        limit: pageSize, 
        page,
        sortByRating: true 
      });
      
      // Check if we have recipes with meaningful ratings (> 0)
      const hasRatedRecipes = ratedResult.recipes.some(r => r.rating > 0);
      
      let result = ratedResult;
      
      // If no recipes have ratings, get random recipes instead
      if (!hasRatedRecipes && ratedResult.recipes.length > 0) {
        result = await getRecipesPaginated({ 
          cuisine,
          category,
          diet,
          searchTerm,
          sort: sort || undefined,
          limit: pageSize, 
          page,
          sortByRating: false 
        });
      }
      
      // Always replace recipes for discrete pagination (no accumulation)
      setRecipes(result.recipes);
      setHasMore(result.hasMore);
      setTotalRecipes(result.totalRecipes);
      setTotalPages(result.totalPages);
      
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchRecipes(1, true);
  }, [cuisine, category, diet, searchTerm, sort, pageSize]);

  const loadNextPage = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchRecipes(nextPage);
    }
  };

  const loadPreviousPage = () => {
    if (!loading && currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchRecipes(prevPage);
    }
  };

  const goToPage = (page: number) => {
    if (!loading && page >= 1) {
      setCurrentPage(page);
      fetchRecipes(page);
    }
  };

  return { 
    recipes, 
    loading, 
    currentPage, 
    hasMore, 
    loadNextPage, 
    loadPreviousPage, 
    goToPage,
    totalPages,
    totalRecipes
  };
}
