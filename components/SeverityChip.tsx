'use client';

import { SEVERITY_BG } from '@/lib/constants';

export default function SeverityChip({ severity }: { severity: string | null }) {
  if (!severity) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
        SEVERITY_BG[severity] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      }`}
    >
      {severity.toUpperCase()}
    </span>
  );
}
