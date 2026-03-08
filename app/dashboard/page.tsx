'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import AppShell from '@/components/AppShell';
import HealthGauge from '@/components/HealthGauge';
import ReviewDraftDrawer from '@/components/ReviewDraftDrawer';
import { NEIGHBORHOODS } from '@/lib/constants';

/* ── SVG Icons ── */
const icons = {
  patterns: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  digest: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  filing: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  ),
  alert: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  chevronRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  ),
  draft: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  camera: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  location: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  ),
  chevronDown: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
};

/* ── Helpers ── */
function parseTimestamp(val: any): Date | null {
  if (!val) return null;
  // Firestore Timestamp serialized as { _seconds, _nanoseconds } or { seconds, nanoseconds }
  if (typeof val === 'object' && (val._seconds != null || val.seconds != null)) {
    const secs = val._seconds ?? val.seconds;
    return new Date(secs * 1000);
  }
  // Already a Date
  if (val instanceof Date) return val;
  // String or number
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function formatTimeAgo(val: any): string {
  const date = parseTimestamp(val);
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function getStatusLabel(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'Stable', color: 'text-green-700' };
  if (score >= 50) return { label: 'Declining', color: 'text-amber-700' };
  return { label: 'Degrading', color: 'text-red-700' };
}

function formatNeighborhood(slug: string): string {
  return slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

function sanitizeTitle(title: string, reportCount: number): string {
  if (reportCount <= 1) {
    return title
      .replace(/Multiple reports and voices/gi, 'Report')
      .replace(/Multiple reports/gi, 'Report')
      .replace(/multiple residents/gi, 'a resident')
      .replace(/reported by multiple/gi, 'reported by a');
  }
  return title;
}

/* ── Severity Chip Styles ── */
const severityChipClass: Record<string, string> = {
  critical: 'bg-red-700/[0.08] text-red-700 border-red-700/20',
  high: 'bg-orange-700/[0.08] text-orange-700 border-orange-700/20',
  medium: 'bg-amber-700/[0.08] text-amber-700 border-amber-700/20',
  low: 'bg-green-700/[0.08] text-green-700 border-green-700/20',
};

export default function DashboardPage() {
  const { user } = useUser();
  const [neighborhood, setNeighborhood] = useState('downtown-waterloo');
  const [health, setHealth] = useState<any>(null);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [healthRes, patternsRes, reportsRes] = await Promise.all([
          fetch(`/api/health?neighborhood=${neighborhood}`),
          fetch(`/api/patterns?neighborhood=${neighborhood}`),
          fetch(`/api/reports?neighborhood=${neighborhood}&limit=50`),
        ]);

        if (healthRes.ok) setHealth(await healthRes.json());
        if (patternsRes.ok) {
          const data = await patternsRes.json();
          setPatterns(data.patterns || []);
        }
        if (reportsRes.ok) {
          const data = await reportsRes.json();
          const draftReports = (data.reports || [])
            .filter((r: any) => r.status === 'draft')
            .sort((a: any, b: any) => {
              const dateA = parseTimestamp(a.createdAt)?.getTime() || 0;
              const dateB = parseTimestamp(b.createdAt)?.getTime() || 0;
              return dateB - dateA;
            });
          setDrafts(draftReports);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [neighborhood]);

  const detectPatterns = async () => {
    setDetecting(true);
    try {
      const res = await fetch('/api/patterns/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ neighborhood }),
      });
      if (res.ok) {
        const data = await res.json();
        setPatterns(data.patterns || []);
      }
    } catch {
      // ignore
    } finally {
      setDetecting(false);
    }
  };

  const handleFileComplete = () => {
    if (selectedDraft) {
      setDrafts(prev => prev.filter(d => (d._id || d.id) !== (selectedDraft._id || selectedDraft.id)));
    }
    setSelectedDraft(null);
  };

  const hasUnusualActivity = patterns.length > 0 || (health?.reportCount7d > 10);
  const neighborhoodLabel = formatNeighborhood(neighborhood);
  const topIssues = patterns;

  return (
    <AppShell>
        <div className="min-h-screen flex flex-col">
        {/* Page Header */}
        <div className="shrink-0 max-w-[800px] w-full mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
            Command Center
          </h1>
          {/* Neighborhood Selector */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-black/[0.06]">
            <span className="text-[var(--accent-primary)]">{icons.location}</span>
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-sm font-medium text-[var(--text-primary)]"
            >
              {NEIGHBORHOODS.map((n) => (
                <option key={n.slug} value={n.slug}>
                  {n.name}
                </option>
              ))}
            </select>
            <span className="text-[var(--text-muted)]">{icons.chevronDown}</span>
          </div>
        </div>

        <main className="flex-1 flex flex-col max-w-[800px] w-full mx-auto px-6 py-4 gap-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ── Fixed top sections ── */}
              <div className="shrink-0 space-y-5">
                {/* ── SECTION 0: Active 311 Drafts ── */}
                <section className="bg-[var(--bg-base)] border border-black/[0.06] rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--accent-primary)]">{icons.draft}</span>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        Active 311 Drafts
                      </h3>
                      {drafts.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-bold">
                          {drafts.length}
                        </span>
                      )}
                    </div>
                    <Link
                      href="/report"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
                    >
                      + New
                    </Link>
                  </div>

                  {drafts.length > 0 ? (
                    <div className="space-y-2">
                      {drafts.map((draft) => {
                        const timeAgo = formatTimeAgo(draft.createdAt);

                        return (
                          <button
                            key={draft._id || draft.id}
                            onClick={() => setSelectedDraft(draft)}
                            className="w-full text-left p-4 rounded-lg bg-[var(--bg-base)] border border-black/[0.06] hover:border-[var(--accent-primary)]/30 hover:shadow-sm hover:bg-[var(--bg-hover)] transition-all cursor-pointer group"
                          >
                            <div className="flex items-start gap-3">
                              {draft.imageUrl && (
                                <img src={draft.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                                    severityChipClass[draft.severity] || severityChipClass.medium
                                  }`}>
                                    {draft.severity || 'medium'}
                                  </span>
                                  <span className="text-xs text-[var(--text-secondary)] capitalize">
                                    {draft.category}{draft.subcategory && ` / ${draft.subcategory}`}
                                  </span>
                                  {timeAgo && (
                                    <span className="ml-auto text-[10px] text-[var(--text-muted)]">{timeAgo}</span>
                                  )}
                                </div>
                                <p className="text-sm text-[var(--text-primary)] truncate">
                                  {draft.description?.substring(0, 100) || 'No description'}
                                  {draft.description?.length > 100 && '...'}
                                </p>
                                {draft.locationApprox?.label && (
                                  <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
                                    <span className="text-[var(--accent-primary)]">{icons.location}</span>
                                    {draft.locationApprox.label}
                                  </p>
                                )}
                              </div>
                              <span className="text-[var(--accent-primary)] text-xs font-semibold flex items-center gap-1 shrink-0 group-hover:underline">
                                Review {icons.chevronRight}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 border-2 border-dashed border-black/[0.06] rounded-xl text-center">
                      <div className="flex justify-center mb-2 text-[var(--text-muted)]">
                        {icons.camera}
                      </div>
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-1">No active drafts</p>
                      <p className="text-xs text-[var(--text-secondary)] mb-4">Scan an issue to create a 311 report draft</p>
                      <Link
                        href="/report"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        + New Report
                      </Link>
                    </div>
                  )}
                </section>

                {/* ── SECTION 1: Status Headline ── */}
                <section className="bg-[var(--bg-base)] border border-black/[0.06] rounded-xl shadow-sm p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={hasUnusualActivity ? 'text-amber-700' : 'text-green-700'}>
                      {hasUnusualActivity ? icons.alert : icons.check}
                    </span>
                    <h2 className="text-base font-semibold text-[var(--text-primary)]">
                      {hasUnusualActivity
                        ? `${neighborhoodLabel} is experiencing unusual activity today.`
                        : `Neighborhood conditions are stable. No abnormal patterns detected.`
                      }
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {hasUnusualActivity
                      ? (() => {
                        const patternReportCount = patterns.reduce((sum, p) => sum + (p.reportCount || p.count || p.w0Count || 0), 0);
                        const reportCount = Math.max(health?.reportCount7d || 0, patternReportCount);
                        return reportCount > 0
                          ? `Detected ${patterns.length} emerging pattern${patterns.length !== 1 ? 's' : ''} from ${reportCount} citizen reports this week.`
                          : `Detected ${patterns.length} emerging pattern${patterns.length !== 1 ? 's' : ''} requiring attention.`;
                      })()
                      : `Continuously monitoring ${neighborhoodLabel} for risk patterns.`
                    }
                  </p>
                </section>

                {/* ── SECTION 2: Health Gauges ── */}
                {health && (
                  <section className="bg-[var(--bg-base)] border border-black/[0.06] rounded-xl shadow-sm p-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-6">
                      Neighborhood Health
                    </h3>
                    <div className="flex justify-around">
                      <div className="text-center">
                        <HealthGauge label="Overall" value={health.overall} color="var(--accent-primary)" />
                        <p className={`text-xs font-medium mt-2 ${getStatusLabel(health.overall).color}`}>
                          {getStatusLabel(health.overall).label}
                        </p>
                      </div>
                      <div className="text-center">
                        <HealthGauge label="Infrastructure" value={health.infrastructure} color="var(--severity-high)" />
                        <p className={`text-xs font-medium mt-2 ${getStatusLabel(health.infrastructure).color}`}>
                          {getStatusLabel(health.infrastructure).label}
                        </p>
                      </div>
                      <div className="text-center">
                        <HealthGauge label="Safety" value={health.safety} color="var(--severity-low)" />
                        <p className={`text-xs font-medium mt-2 ${getStatusLabel(health.safety).color}`}>
                          {getStatusLabel(health.safety).label}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-around mt-6 text-xs text-[var(--text-muted)]">
                      <span>{health.reportCount7d} citizen reports (7d)</span>
                      <span>{health.voiceCount7d} reports analyzed (7d)</span>
                      <span className="capitalize">Trend: {health.trendDirection}</span>
                    </div>
                  </section>
                )}

                {/* ── Workflow Tools (compact row) ── */}
                <div className="grid grid-cols-3 gap-3">
                  <Link
                    href="/dashboard/patterns"
                    className="p-3 rounded-lg bg-[var(--bg-base)] border border-black/[0.06] hover:border-[var(--accent-primary)]/30 hover:shadow-sm transition-all text-center group"
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg mb-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                      {icons.patterns}
                    </span>
                    <p className="text-xs font-medium text-[var(--text-primary)]">Patterns</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {patterns.length > 0 ? `${patterns.length} emerging this week` : 'Detect recurring issues'}
                    </p>
                  </Link>
                  <Link
                    href="/dashboard/digest"
                    className="p-3 rounded-lg bg-[var(--bg-base)] border border-black/[0.06] hover:border-[var(--accent-primary)]/30 hover:shadow-sm transition-all text-center group"
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg mb-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                      {icons.digest}
                    </span>
                    <p className="text-xs font-medium text-[var(--text-primary)]">Digest</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Weekly neighborhood summary</p>
                  </Link>
                  <Link
                    href="/dashboard/auto-file"
                    className="p-3 rounded-lg bg-[var(--bg-base)] border border-black/[0.06] hover:border-[var(--accent-primary)]/30 hover:shadow-sm transition-all text-center group"
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg mb-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                      {icons.filing}
                    </span>
                    <p className="text-xs font-medium text-[var(--text-primary)]">311 Filing</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {drafts.length > 0 ? `${drafts.length} drafts pending review` : 'File reports to the city'}
                    </p>
                  </Link>
                </div>
              </div>

              {/* ── SECTION 3: Priority Issues (scrollable) ── */}
              <section className="flex flex-col bg-[var(--bg-base)] border border-black/[0.06] rounded-xl shadow-sm p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      Live Issues
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1 ml-4">Patterns requiring leader action</p>
                </div>

                {topIssues.length > 0 ? (
                  <div className="space-y-2">
                    {topIssues.map((issue, i) => {
                      const reportCount = issue.reportCount || issue.count || 1;
                      return (
                        <Link
                          key={issue._id || i}
                          href={`/dashboard/issue/${issue._id || encodeURIComponent(issue.category || 'general')}`}
                          className="group flex items-start justify-between gap-3 p-4 rounded-lg bg-[var(--bg-base)] border border-black/[0.06] hover:border-[var(--accent-primary)]/30 hover:shadow-sm transition-all"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-primary)] transition-colors">
                              {sanitizeTitle(issue.description || issue.type || 'Issue detected', reportCount)}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              Based on {reportCount} citizen report{reportCount !== 1 ? 's' : ''} &middot; {issue.category || 'General'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border"
                              style={issue.severity === 'critical'
                                ? { background: 'rgba(185,28,28,0.08)', color: '#b91c1c', borderColor: 'rgba(185,28,28,0.2)' }
                                : { background: 'rgba(107,15,26,0.08)', color: '#6b0f1a', borderColor: 'rgba(107,15,26,0.2)' }
                              }
                            >
                              {issue.severity === 'critical' ? 'Urgent' :
                                issue.severity === 'high' ? 'Rising' : 'Emerging'}
                            </span>
                            <span className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors">
                              {icons.chevronRight}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-lg bg-green-700/[0.04] border border-green-700/10 text-center">
                    <p className="text-sm text-[var(--text-secondary)]">
                      No priority issues detected. Continuously monitoring citizen reports.
                    </p>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {/* Review Draft Drawer */}
      <AnimatePresence>
        {selectedDraft && (
          <ReviewDraftDrawer
            draft={selectedDraft}
            onClose={() => setSelectedDraft(null)}
            onFileComplete={handleFileComplete}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
