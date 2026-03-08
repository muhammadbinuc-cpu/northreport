export const SEVERITY_COLORS: Record<string, string> = {
  critical: '#B91C1C',
  high: '#C2410C',
  medium: '#92400E',
  low: '#166534',
};

export const SEVERITY_BG: Record<string, string> = {
  critical: 'bg-red-700/[0.08] text-red-700 border-red-700/20',
  high: 'bg-orange-700/[0.08] text-orange-700 border-orange-700/20',
  medium: 'bg-amber-700/[0.08] text-amber-700 border-amber-700/20',
  low: 'bg-green-700/[0.08] text-green-700 border-green-700/20',
};

export const CATEGORY_LABELS: Record<string, string> = {
  infrastructure: 'Infrastructure',
  environmental: 'Environmental',
  safety: 'Safety',
  accessibility: 'Accessibility',
};

export const NEIGHBORHOODS = [
  { slug: 'downtown-waterloo', name: 'Downtown Waterloo' },
  { slug: 'uptown-waterloo', name: 'Uptown Waterloo' },
  { slug: 'university-district', name: 'University District' },
  { slug: 'lakeshore', name: 'Lakeshore' },
  { slug: 'beechwood', name: 'Beechwood' },
];

export const WATERLOO_CENTER = { lat: 43.4643, lng: -80.5204 };
export const HAMILTON_CENTER = WATERLOO_CENTER; // Legacy alias

export const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};
