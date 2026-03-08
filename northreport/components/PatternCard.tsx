'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SeverityChip from './SeverityChip';

interface Pattern {
  _id?: string;
  type: string;
  description: string;
  severity: string;
  w0Count: number;
  w1Count: number;
  recommendation?: string;
  detectedAt?: string | Date;
  locations?: Array<{ label: string; count: number }>;
  mergedCount?: number;
}

// Icons
const TypeIcon = ({ type }: { type: string }) => {
  if (type === 'cluster') {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
};

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

function getChangePercent(w0: number, w1: number): number {
  if (w1 > 0) return Math.round(((w0 - w1) / w1) * 100);
  return w0 > 0 ? 100 : 0;
}

// Sanitize description to remove misleading "multiple" language when count is 1
function sanitizeDescription(desc: string, w0Count: number): string {
  if (w0Count <= 1) {
    return desc
      .replace(/Multiple reports and voices/gi, 'Report')
      .replace(/Multiple reports/gi, 'Report')
      .replace(/multiple residents/gi, 'a resident')
      .replace(/reported by multiple/gi, 'reported by a');
  }
  return desc;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCATIONS LIST - Shows all affected locations when expanded
// ═══════════════════════════════════════════════════════════════════════════════
function LocationsList({
  locations,
  onLocationClick
}: {
  locations: Array<{ label: string; count: number }>;
  onLocationClick?: (label: string) => void;
}) {
  if (!locations || locations.length === 0) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="pt-3 mt-3 border-t border-white/5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
          Affected Locations ({locations.length}) — Click to view on map
        </p>
        <div className="space-y-1.5">
          {locations.map((loc, i) => (
            <button
              key={`${loc.label}-${i}`}
              onClick={() => onLocationClick?.(loc.label)}
              className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-[var(--accent-primary)]/30 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  <LocationIcon />
                </span>
                <span className="text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--accent-primary)] transition-colors">
                  {loc.label}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                  {loc.count} report{loc.count !== 1 ? 's' : ''}
                </span>
                <svg className="w-3 h-3 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMARY PATTERN CARD - Hero treatment for most severe pattern
// ═══════════════════════════════════════════════════════════════════════════════
export function PrimaryPatternCard({ pattern }: { pattern: Pattern }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const changePercent = getChangePercent(pattern.w0Count, pattern.w1Count);
  const isUp = changePercent > 0;
  const isCritical = pattern.severity === 'critical';
  const hasLocations = pattern.locations && pattern.locations.length > 0;

  const handleLocationClick = (label: string) => {
    router.push(`/map?location=${encodeURIComponent(label)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-l-4 p-0 overflow-hidden ${isCritical
        ? 'border-l-[var(--severity-critical)] bg-[var(--severity-critical)]/[0.03]'
        : 'border-l-[var(--severity-high)] bg-[var(--severity-high)]/[0.03]'
        }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className={isCritical ? 'text-[var(--severity-critical)]' : 'text-[var(--severity-high)]'}>
            <TypeIcon type={pattern.type} />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {pattern.type}
          </span>
          {pattern.mergedCount && pattern.mergedCount > 1 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-[var(--text-secondary)]">
              {pattern.mergedCount} merged
            </span>
          )}
        </div>
        <SeverityChip severity={pattern.severity} />
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
          {sanitizeDescription(pattern.description, pattern.w0Count)}
        </h3>

        {/* Stats row */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-[var(--text-secondary)]">This week </span>
              <span className="font-bold text-[var(--text-primary)]">{pattern.w0Count}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div>
              <span className="text-[var(--text-secondary)]">Last week </span>
              <span className="font-medium text-[var(--text-primary)]">{pattern.w1Count}</span>
            </div>
          </div>
          {changePercent !== 0 && (
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-bold ${isUp
                ? 'bg-[var(--severity-critical)]/15 text-[#ff6b6b]'
                : 'bg-[var(--severity-low)]/15 text-[#33eebb]'
                }`}
            >
              {isUp ? '↑' : '↓'} {Math.abs(changePercent)}%
            </span>
          )}
        </div>

        {/* Locations toggle */}
        {hasLocations && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-[var(--accent-primary)] hover:underline"
          >
            <span>View {pattern.locations!.length} location{pattern.locations!.length !== 1 ? 's' : ''}</span>
            <ChevronIcon expanded={expanded} />
          </button>
        )}

        {/* Locations list (expandable) */}
        <AnimatePresence>
          {expanded && hasLocations && (
            <LocationsList
              locations={pattern.locations!}
              onLocationClick={handleLocationClick}
            />
          )}
        </AnimatePresence>

        {/* Recommendation */}
        {pattern.recommendation && (
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20">
            <span className="text-[var(--accent-primary)] text-sm mt-0.5">→</span>
            <p className="text-sm text-[var(--accent-primary)] leading-relaxed">
              {pattern.recommendation}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPACT PATTERN CARD - For the secondary grid (with expandable locations)
// ═══════════════════════════════════════════════════════════════════════════════
export function CompactPatternCard({ pattern }: { pattern: Pattern }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const changePercent = getChangePercent(pattern.w0Count, pattern.w1Count);
  const isUp = changePercent > 0;
  const hasLocations = pattern.locations && pattern.locations.length > 0;

  const handleLocationClick = (label: string) => {
    router.push(`/map?location=${encodeURIComponent(label)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      className="glass-card p-4 space-y-3 hover:border-white/20 transition-colors"
    >
      {/* Top row: Type + Severity */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <TypeIcon type={pattern.type} />
          <span className="text-[11px] font-semibold uppercase tracking-wider">{pattern.type}</span>
          {pattern.mergedCount && pattern.mergedCount > 1 && (
            <span className="px-1 py-0.5 rounded text-[9px] font-medium bg-white/5">
              {pattern.mergedCount}
            </span>
          )}
        </div>
        <SeverityChip severity={pattern.severity} />
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
        {sanitizeDescription(pattern.description, pattern.w0Count)}
      </p>

      {/* Stats row - horizontal */}
      <div className="flex items-center gap-4 text-xs">
        <span className="text-[var(--text-secondary)]">
          This week: <span className="text-[var(--text-primary)] font-semibold">{pattern.w0Count}</span>
        </span>
        <span className="text-[var(--text-secondary)]">
          Last week: <span className="text-[var(--text-primary)] font-medium">{pattern.w1Count}</span>
        </span>
        {changePercent !== 0 && (
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isUp
              ? 'bg-[var(--severity-critical)]/15 text-[#ff6b6b]'
              : 'bg-[var(--severity-low)]/15 text-[#33eebb]'
              }`}
          >
            {isUp ? '↑' : '↓'}{Math.abs(changePercent)}%
          </span>
        )}
      </div>

      {/* Locations toggle */}
      {hasLocations && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] text-[var(--accent-primary)] hover:underline"
        >
          <span>{pattern.locations!.length} location{pattern.locations!.length !== 1 ? 's' : ''}</span>
          <ChevronIcon expanded={expanded} />
        </button>
      )}

      {/* Locations list (expandable) */}
      <AnimatePresence>
        {expanded && hasLocations && (
          <LocationsList
            locations={pattern.locations!}
            onLocationClick={handleLocationClick}
          />
        )}
      </AnimatePresence>

      {/* Recommendation - compact */}
      {pattern.recommendation && !expanded && (
        <div className="pt-2 border-t border-white/5">
          <p className="text-xs text-[var(--accent-primary)] leading-relaxed line-clamp-2">
            → {pattern.recommendation}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT - Standard PatternCard (backwards compatible)
// ═══════════════════════════════════════════════════════════════════════════════
export default function PatternCard({ pattern }: { pattern: Pattern }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const changePercent = getChangePercent(pattern.w0Count, pattern.w1Count);
  const isUp = changePercent > 0;
  const hasLocations = pattern.locations && pattern.locations.length > 0;

  const handleLocationClick = (label: string) => {
    router.push(`/map?location=${encodeURIComponent(label)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-elevated)' }}
      transition={{ duration: 0.2 }}
      className="glass-card p-4 space-y-3"
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <TypeIcon type={pattern.type} />
          <span className="text-xs font-semibold uppercase tracking-wider">{pattern.type}</span>
        </div>
        <SeverityChip severity={pattern.severity} />
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-primary)] leading-relaxed">{sanitizeDescription(pattern.description, pattern.w0Count)}</p>

      {/* Stats */}
      <div className="flex items-center gap-6 text-xs">
        <span className="text-[var(--text-secondary)]">
          This week: <span className="text-[var(--text-primary)] font-semibold">{pattern.w0Count}</span>
        </span>
        <span className="text-[var(--text-secondary)]">
          Last week: <span className="text-[var(--text-primary)] font-semibold">{pattern.w1Count}</span>
        </span>
        {changePercent !== 0 && (
          <span
            className={`px-2 py-0.5 rounded font-medium ${isUp
              ? 'bg-[var(--severity-critical)]/15 text-[#ff6b6b]'
              : 'bg-[var(--severity-low)]/15 text-[#33eebb]'
              }`}
          >
            {isUp ? '↑' : '↓'} {Math.abs(changePercent)}%
          </span>
        )}
      </div>

      {/* Locations toggle */}
      {hasLocations && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-[var(--accent-primary)] hover:underline"
        >
          <span>View {pattern.locations!.length} location{pattern.locations!.length !== 1 ? 's' : ''}</span>
          <ChevronIcon expanded={expanded} />
        </button>
      )}

      {/* Locations list (expandable) */}
      <AnimatePresence>
        {expanded && hasLocations && (
          <LocationsList
            locations={pattern.locations!}
            onLocationClick={handleLocationClick}
          />
        )}
      </AnimatePresence>

      {/* Recommendation */}
      {pattern.recommendation && (
        <div className="p-3 rounded-lg bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20">
          <p className="text-xs text-[var(--accent-primary)]">→ {pattern.recommendation}</p>
        </div>
      )}
    </motion.div>
  );
}
