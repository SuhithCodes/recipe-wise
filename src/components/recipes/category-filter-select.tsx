'use client';

import { useEffect, useState } from 'react';
import { getCategories } from '@/lib/firestore';

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  label?: string;
};

type Category = { strCategory: string };

export default function CategoryFilterSelect({ value, onChange, className, label = 'Category' }: Props) {
  const [options, setOptions] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const categories = await getCategories();
        const sorted = (categories as Category[]).sort((a, b) => a.strCategory.localeCompare(b.strCategory));
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
        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring capitalize"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={loading}
      >
        <option value="">All categories</option>
        {options.map((o) => (
          <option key={o.strCategory} value={o.strCategory} className="capitalize">{o.strCategory}</option>
        ))}
      </select>
    </div>
  );
}



