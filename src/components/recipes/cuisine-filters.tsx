'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getAreas } from '@/lib/firestore';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CuisineFiltersProps {
  activeCuisine: string | null;
  onCuisineChange: (cuisine: string | null) => void;
}

interface Area {
  strArea: string;
}

export default function CuisineFilters({ activeCuisine, onCuisineChange }: CuisineFiltersProps) {
  const [cuisines, setCuisines] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const areas = await getAreas();
        // Sort cuisines alphabetically
        const sortedAreas = (areas as Area[]).sort((a, b) => a.strArea.localeCompare(b.strArea));
        setCuisines(sortedAreas);
      } catch (error) {
        console.error('Error fetching cuisines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCuisines();
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
      <h3 className="font-semibold text-lg">Filter by Cuisine</h3>
      <div className="flex flex-wrap gap-2">
        {/* All Cuisines Button */}
        <Button
          variant={activeCuisine === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCuisineChange(null)}
          className="h-8"
        >
          All Cuisines
        </Button>
        
        {/* Individual Cuisine Buttons */}
        {cuisines.map((area) => (
          <Button
            key={area.strArea}
            variant={activeCuisine === area.strArea ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCuisineChange(area.strArea)}
            className="h-8"
          >
            {area.strArea}
            {activeCuisine === area.strArea && (
              <Badge variant="secondary" className="ml-2 h-4 text-xs">
                Active
              </Badge>
            )}
          </Button>
        ))}
      </div>
      
      {activeCuisine && (
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold">{activeCuisine}</span> recipes
        </div>
      )}
    </div>
  );
}
