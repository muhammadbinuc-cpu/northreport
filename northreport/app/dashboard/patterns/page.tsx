'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import AppShell from '@/components/AppShell';
import TopBar from '@/components/TopBar';
import { PrimaryPatternCard, CompactPatternCard } from '@/components/PatternCard';
import { mergePatterns } from '@/lib/mergePatterns';

type PageStatus = 'IDLE' | 'LOADING' | 'DETECTING' | 'EMPTY' | 'READY' | 'ERROR';

export default function PatternsPage() {
  const [neighborhood, setNeighborhood] = useState('downtown-hamilton');
  const [patterns, setPatterns] = useState<any[]>([]);
  const [status, setStatus] = useState<PageStatus>('LOADING');
  const [hasRun, setHasRun] = useState(false);
  const [metadata, setMetadata] = useState<{
    analyzedCount?: number;
    windowDays?: number;
    lastRun?: string;
    message?: string;
  }>({});
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing patterns on mount and neighborhood change
  useEffect(() => {
    async function load() {
      setStatus('LOADING');
      setErrorMessage('');
      try {
        const res = await fetch(`/api/patterns?neighborhood=${neighborhood}`);
        if (res.ok) {
          const data = await res.json();
          const fetchedPatterns = data.patterns || [];
          setPatterns(fetchedPatterns);
          setStatus(fetchedPatterns.length > 0 ? 'READY' : 'EMPTY');
        } else {
          setStatus('EMPTY');
        }
      } catch {
        setStatus('ERROR');
        setErrorMessage('Failed to load patterns. Please try again.');
      }
    }
    load();
  }, [neighborhood]);

  const detectPatterns = async () => {
    setStatus('DETECTING');
    setErrorMessage('');
    try {
      const res = await fetch('/api/patterns/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ neighborhood }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'OK') {
        setMetadata({
          analyzedCount: data.analyzedCount,
          windowDays: data.windowDays,
          lastRun: data.lastRun,
          message: data.message,
        });
        setHasRun(true);

        if (data.patterns && data.patterns.length > 0) {
          setPatterns((prev) => [...data.patterns, ...prev.filter(p => !data.patterns.some((np: any) => np._id === p._id))]);
          setStatus('READY');
        } else {
          setStatus('EMPTY');
        }
      } else {
        setStatus('ERROR');
        setErrorMessage(data.message || data.error || 'Detection failed. Please try again.');
      }
    } catch (err) {
      console.error('[PatternsPage] Detection error:', err);
      setStatus('ERROR');
      setErrorMessage('Network error. Please check your connection.');
    }
  };

  // Dedupe patterns (guardrail in case backend returns duplicates)
  const uniquePatterns = useMemo(() => mergePatterns(patterns), [patterns]);

  // Primary = first (most severe), rest = secondary
  const primaryPattern = uniquePatterns[0];
  const secondaryPatterns = uniquePatterns.slice(1);

  // Button label based on status
  const getButtonLabel = () => {
    if (status === 'DETECTING') return 'Scanning…';
    if (hasRun) return 'Re-scan';
    return 'Detect Patterns';
  };

  return (
    <AppShell>
      <div className="flex flex-col h-screen">
        <TopBar
          title="Pattern Alerts"
          neighborhood={neighborhood}
          onNeighborhoodChange={setNeighborhood}
          showSearch={false}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-5 space-y-5">

            {/* ═══════════════════════════════════════════════════════════════════
                HEADER BAR - Title, Subtitle, Action Button
            ═══════════════════════════════════════════════════════════════════ */}
            <header className="flex items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Pattern Alerts</h1>
              </div>
              <button
                onClick={detectPatterns}
                disabled={status === 'DETECTING'}
                className="btn-primary text-sm disabled:opacity-50 flex items-center gap-2 shrink-0 px-4 py-2"
              >
                {status === 'DETECTING' && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {getButtonLabel()}
              </button>
            </header>

            {/* ═══════════════════════════════════════════════════════════════════
                METADATA PILLS - Analyzed, Window, Last Run
            ═══════════════════════════════════════════════════════════════════ */}
            {(metadata.lastRun || metadata.analyzedCount) && (
              <div className="flex flex-wrap items-center gap-2">
                {metadata.analyzedCount !== undefined && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-white/[0.04] border border-white/10">
                    <span className="text-[var(--text-secondary)]">Analyzed</span>
                    <span className="text-[var(--text-primary)] font-semibold">{metadata.analyzedCount}</span>
                  </span>
                )}
                {metadata.windowDays && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-white/[0.04] border border-white/10">
                    <span className="text-[var(--text-secondary)]">Window</span>
                    <span className="text-[var(--text-primary)] font-semibold">{metadata.windowDays}d</span>
                  </span>
                )}
                {metadata.lastRun && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-white/[0.04] border border-white/10">
                    <span className="text-[var(--text-secondary)]">Last run</span>
                    <span className="text-[var(--text-primary)] font-semibold">{new Date(metadata.lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                LOADING STATE
            ═══════════════════════════════════════════════════════════════════ */}
            {status === 'LOADING' && (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                DETECTING STATE
            ═══════════════════════════════════════════════════════════════════ */}
            {status === 'DETECTING' && (
              <div className="glass-card p-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                  <div className="text-center">
                    <p className="text-[var(--accent-primary)] font-medium">Scanning reports…</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Analyzing incident data for patterns</p>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                ERROR STATE
            ═══════════════════════════════════════════════════════════════════ */}
            {status === 'ERROR' && (
              <div className="glass-card p-5 border border-red-500/20 bg-red-500/5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-red-400 font-medium text-sm">{errorMessage || 'Something went wrong'}</p>
                    <button onClick={detectPatterns} className="mt-1.5 text-xs text-red-400 hover:text-red-300 underline">
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                EMPTY STATE - System Normal
            ═══════════════════════════════════════════════════════════════════ */}
            {status === 'EMPTY' && (
              <div className="glass-card p-5 border border-green-500/20 bg-green-500/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)] text-sm">All Clear</span>
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        Normal
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      No abnormal patterns in the last {metadata.windowDays || 7} days
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                READY STATE - Patterns Display
            ═══════════════════════════════════════════════════════════════════ */}
            {status === 'READY' && patterns.length > 0 && (
              <div className="space-y-5">

                {/* SECTION HEADER: Count */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Detected Patterns ({patterns.length})
                  </h2>
                </div>

                {/* PRIMARY PATTERN - Most Severe */}
                {primaryPattern && (
                  <section>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--severity-critical)] mb-2">
                      Requires Attention
                    </h3>
                    <PrimaryPatternCard pattern={primaryPattern} />
                  </section>
                )}

                {/* SECONDARY PATTERNS - Grid Layout */}
                {secondaryPatterns.length > 0 && (
                  <section>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                      Other Patterns
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {secondaryPatterns.map((p, i) => (
                        <motion.div
                          key={p._id || i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <CompactPatternCard pattern={p} />
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

              </div>
            )}

          </div>
        </main>
      </div>
    </AppShell>
  );
}
