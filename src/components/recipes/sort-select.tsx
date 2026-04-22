'use client';

type Props = {
  value: SortKey | '';
  onChange: (value: SortKey | '') => void;
  className?: string;
  label?: string;
};

export type SortKey = 'avgReviews' | 'timeAsc' | 'timeDesc' | 'rating';

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'avgReviews', label: 'Avg customer reviews' },
  { value: 'timeAsc', label: 'Total time • Low to High' },
  { value: 'timeDesc', label: 'Total time • High to Low' },
  { value: 'rating', label: 'Ratings' },
];

export default function SortSelect({ value, onChange, className, label = 'Sort' }: Props) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <select
        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(e) => onChange((e.target.value as SortKey) || '')}
      >
        <option value="">Default</option>
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}


