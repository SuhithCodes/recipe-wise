'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Leaf, Flame } from 'lucide-react';

const filters = [
  { name: 'Vegan', icon: Leaf },
  { name: 'Keto', icon: Flame },
  { name: 'Gluten-Free', icon: () => <span className="font-bold text-sm">GF</span> },
  { name: 'Vegetarian', icon: () => <Leaf className="text-green-500" /> },
];

type DietaryFiltersProps = {
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
};

export default function DietaryFilters({ activeFilter, onFilterChange }: DietaryFiltersProps) {

  return (
    <div className="flex justify-center gap-2 md:gap-4">
      {filters.map((filter) => (
        <Button
          key={filter.name}
          variant={activeFilter === filter.name ? 'default' : 'outline'}
          className={cn(
            'transition-all duration-300',
            activeFilter === filter.name && 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
          onClick={() => onFilterChange(activeFilter === filter.name ? null : filter.name)}
        >
          <filter.icon />
          {filter.name}
        </Button>
      ))}
    </div>
  );
}
