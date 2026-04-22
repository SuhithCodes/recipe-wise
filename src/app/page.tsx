
'use client';

import { Suspense, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import RecipeCard from '@/components/recipes/recipe-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import CuisineFilterSelect from '@/components/recipes/cuisine-filter-select';
import CategoryFilterSelect from '@/components/recipes/category-filter-select';
import DietFilterSelect from '@/components/recipes/diet-filter-select';
import SortSelect from '@/components/recipes/sort-select';
import RecipeRecommendationsSection from '@/components/ai/recipe-recommendations-section';
import { useRecipes } from '@/hooks/use-recipes';
import { useRecipesPaginated } from '@/hooks/use-recipes-paginated';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import Pagination from '@/components/ui/pagination';

function PageContent() {
  const [activeCuisineFilter, setActiveCuisineFilter] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [activeDietFilter, setActiveDietFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'avgReviews' | 'timeAsc' | 'timeDesc' | 'rating' | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    recipes: paginatedRecipes, 
    loading, 
    currentPage, 
    hasMore, 
    loadNextPage, 
    loadPreviousPage,
    goToPage,
    totalPages,
    totalRecipes
  } = useRecipesPaginated({ 
    cuisine: activeCuisineFilter,
    category: activeCategoryFilter,
    diet: activeDietFilter,
    sort: sortKey,
    searchTerm: searchTerm,
    pageSize: 8
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const showSearch = searchParams.get('showSearch') === '1';
  const { isLoggedIn } = useAuth();


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is already happening live as the user types.
    // This could be used to navigate to a dedicated search results page if desired.
    console.log('Search term:', searchTerm);
  };


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero removed per request - using only the compact toolbar below */}

      {showSearch && (
        // Compact toolbar: search + filters in one responsive row
        <section className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <Input
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9"
                />
                <Button type="submit" className="h-9" aria-label="Search">
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </form>
            </div>
            <CuisineFilterSelect
              value={activeCuisineFilter}
              onChange={setActiveCuisineFilter}
              className="sm:w-56"
              label="Cuisine"
            />
            <CategoryFilterSelect
              value={activeCategoryFilter}
              onChange={setActiveCategoryFilter}
              className="sm:w-56"
              label="Category"
            />
            <DietFilterSelect
              value={activeDietFilter}
              onChange={setActiveDietFilter}
              className="sm:w-56"
              label="Diet"
            />
            <SortSelect
              value={sortKey}
              onChange={setSortKey}
              className="sm:w-56"
              label="Sort"
            />
          </div>
        </section>
      )}

      <section className="mb-12">
        <h2 className="font-headline text-3xl font-bold mb-6">
          {searchTerm || activeCuisineFilter || activeCategoryFilter || activeDietFilter ? 'Search Results' : 'Top Rated Recipes'}
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
          </div>
        ) : paginatedRecipes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                hasMore={hasMore}
                totalPages={totalPages}
                totalRecipes={totalRecipes}
                onPreviousPage={loadPreviousPage}
                onNextPage={loadNextPage}
                onGoToPage={goToPage}
                loading={loading}
              />
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">No recipes found. Try adjusting your search or filters.</p>
        )}
      </section>

      {isLoggedIn && <RecipeRecommendationsSection />}

    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

export default function Home() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PageContent />
    </Suspense>
  );
}
