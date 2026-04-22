'use client';

import { useEffect, useState } from 'react';
import { getAlternates } from '@/lib/firestore';

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  label?: string;
};

type Alternate = { 
  id: string;
  name: string;
  strAlternate: string;
};

export default function DietFilterSelect({ value, onChange, className, label = 'Diet' }: Props) {
  const [options, setOptions] = useState<Alternate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const alternates = await getAlternates();
        // Sort by name for consistent ordering
        const sorted = (alternates as Alternate[]).sort((a, b) => {
          const nameA = a.name || a.strAlternate || a.id;
          const nameB = b.name || b.strAlternate || b.id;
          return nameA.localeCompare(nameB);
        });
        if (mounted) setOptions(sorted);
      } catch (error) {
        console.error('Error fetching alternates:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={className}>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <select
        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={loading}
      >
        <option value="">All diets</option>
        {options.map((o) => {
          const displayName = o.name || o.strAlternate || o.id;
          return (
            <option key={o.id} value={o.strAlternate || o.name || o.id}>
              {displayName}
            </option>
          );
        })}
      </select>
    </div>
  );
}

