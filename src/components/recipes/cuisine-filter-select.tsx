'use client';

import { useEffect, useState } from 'react';
import { getAreas } from '@/lib/firestore';

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  label?: string;
};

type Area = { strArea: string };

export default function CuisineFilterSelect({ value, onChange, className, label = 'Cuisine' }: Props) {
  const [options, setOptions] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const areas = await getAreas();
        const sorted = (areas as Area[]).sort((a, b) => a.strArea.localeCompare(b.strArea));
        if (mounted) setOptions(sorted);
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
        <option value="">All cuisines</option>
        {options.map((o) => (
          <option key={o.strArea} value={o.strArea}>{o.strArea}</option>
        ))}
      </select>
    </div>
  );
}



