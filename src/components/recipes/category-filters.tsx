'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCategories } from '@/lib/firestore';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryFiltersProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

interface Category {
  strCategory: string;
}

export default function CategoryFilters({ activeCategory, onCategoryChange }: CategoryFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await getCategories();
        // Sort categories alphabetically and cast to proper type
        const sortedCategories = (categoryData as Category[]).sort((a, b) => a.strCategory.localeCompare(b.strCategory));
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-18" />
        <Skeleton className="h-8 w-22" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-24" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        {/* All Categories Button */}
        <Button
          variant={activeCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="h-8"
        >
          All Categories
        </Button>
        
        {/* Individual Category Buttons */}
        {categories.map((category) => (
          <Button
            key={category.strCategory}
            variant={activeCategory === category.strCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category.strCategory)}
            className="h-8 capitalize"
          >
            {category.strCategory}
            {activeCategory === category.strCategory && (
              <Badge variant="secondary" className="ml-2 h-4 text-xs">
                Active
              </Badge>
            )}
          </Button>
        ))}
      </div>
      
      {activeCategory && (
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold capitalize">{activeCategory}</span> recipes
        </div>
      )}
    </div>
  );
}
