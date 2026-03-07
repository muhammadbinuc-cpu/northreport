'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '@/components/AppShell';
import TopBar from '@/components/TopBar';
import HealthGauge from '@/components/HealthGauge';
import PatternCard from '@/components/PatternCard';
import ReviewDraftDrawer from '@/components/ReviewDraftDrawer';
import { NEIGHBORHOODS } from '@/lib/constants';

// SVG Icons
const icons = {
  patterns: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  digest: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  filing: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  ),
  alert: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

// Helper: Get status label from health score
function getStatusLabel(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'Stable', color: 'text-green-400' };
  if (score >= 50) return { label: 'Declining', color: 'text-yellow-400' };
  return { label: 'Degrading', color: 'text-red-400' };
}

// Helper: Format neighborhood name
function formatNeighborhood(slug: string): string {
  return slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

// Helper: Sanitize title to remove misleading "multiple" language when count is 1
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

export default function DashboardPage() {
  const { user } = useUser();
  const [neighborhood, setNeighborhood] = useState('downtown-hamilton');
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
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA; // Most recent first
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
    // Remove the filed draft from the list
    if (selectedDraft) {
      setDrafts(prev => prev.filter(d => (d._id || d.id) !== (selectedDraft._id || selectedDraft.id)));
    }
    setSelectedDraft(null);
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  // Determine if there's unusual activity
  const hasUnusualActivity = patterns.length > 0 || (health?.reportCount7d > 10);
  const neighborhoodLabel = formatNeighborhood(neighborhood);

  // Get top issues from patterns for "Needs Attention" section
  const topIssues = patterns.slice(0, 3);

  return (
    <AppShell>
      <div className="flex flex-col h-screen">
        <TopBar
          title="Command Center"
          neighborhood={neighborhood}
          onNeighborhoodChange={setNeighborhood}
          showSearch={false}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* ═══════════════════════════════════════════════════════════════════
                    SECTION 0: ACTIVE 311 DRAFTS - Always visible (with empty state)
                ═══════════════════════════════════════════════════════════════════ */}
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  className="glass-card p-6 border-l-4 border-l-amber-500 bg-amber-500/5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                      <span className="text-amber-400">📋</span> Active 311 Drafts
                      {drafts.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold animate-pulse">
                          {drafts.length}
                        </span>
                      )}
                    </h3>
                    <Link
                      href="/report"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors flex items-center gap-1"
                    >
                      + New
                    </Link>
                  </div>

                  {drafts.length > 0 ? (
                    <div className="space-y-3">
                      {drafts.map((draft) => {
                        const createdAt = draft.createdAt ? new Date(draft.createdAt) : null;
                        let timeAgo = '';
                        if (createdAt) {
                          const diff = Date.now() - createdAt.getTime();
                          const mins = Math.floor(diff / 60000);
                          const hours = Math.floor(diff / 3600000);
                          const days = Math.floor(diff / 86400000);
                          if (mins < 1) timeAgo = 'Just now';
                          else if (mins < 60) timeAgo = `${mins}m ago`;
                          else if (hours < 24) timeAgo = `${hours}h ago`;
                          else timeAgo = `${days}d ago`;
                        }

                        return (
                          <button
                            key={draft._id || draft.id}
                            onClick={() => setSelectedDraft(draft)}
                            className="w-full text-left p-4 rounded-xl bg-white/[0.03] border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/[0.06] transition-all cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              {draft.imageUrl && (
                                <img src={draft.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${draft.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                      draft.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                        draft.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                          'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    }`}>
                                    {draft.severity || 'medium'}
                                  </span>
                                  <span className="text-xs text-[var(--text-secondary)] capitalize">
                                    {draft.category}{draft.subcategory && ` • ${draft.subcategory}`}
                                  </span>
                                  {timeAgo && (
                                    <span className="ml-auto text-[10px] text-[var(--text-secondary)]">{timeAgo}</span>
                                  )}
                                </div>
                                <p className="text-sm text-[var(--text-primary)] truncate">
                                  {draft.description?.substring(0, 100) || 'No description'}
                                  {draft.description?.length > 100 && '...'}
                                </p>
                                {draft.locationApprox?.label && (
                                  <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                                    📍 {draft.locationApprox.label}
                                  </p>
                                )}
                              </div>
                              <span className="text-cyan-400 text-xs flex items-center gap-1">
                                Review {icons.arrow}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 border-2 border-dashed border-[var(--border-subtle)] rounded-xl text-center">
                      <div className="text-3xl mb-2">📸</div>
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-1">No active drafts</p>
                      <p className="text-xs text-[var(--text-secondary)] mb-4">Scan an issue to create a 311 report draft</p>
                      <Link
                        href="/report"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-colors"
                      >
                        + New Report
                      </Link>
                    </div>
                  )}
                </motion.div>

                {/* ═══════════════════════════════════════════════════════════════════
                    SECTION 1: STATUS HEADLINE - What's happening right now
                ═══════════════════════════════════════════════════════════════════ */}
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  className={`glass-card p-6 text-center border-l-4 ${hasUnusualActivity
                    ? 'border-l-amber-500 bg-amber-500/5'
                    : 'border-l-green-500 bg-green-500/5'
                    }`}
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className={hasUnusualActivity ? 'text-amber-400' : 'text-green-400'}>
                      {hasUnusualActivity ? icons.alert : icons.check}
                    </span>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
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
                </motion.div>

                {/* ═══════════════════════════════════════════════════════════════════
                    SECTION 2: HEALTH GAUGES with status labels
                ═══════════════════════════════════════════════════════════════════ */}
                {health && (
                  <motion.div
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6"
                  >
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-6">
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
                    <div className="flex justify-around mt-6 text-xs text-[var(--text-secondary)]">
                      <span>{health.reportCount7d} citizen reports (7d)</span>
                      <span>{health.voiceCount7d} reports analyzed (7d)</span>
                      <span className="capitalize">Trend: {health.trendDirection}</span>
                    </div>
                  </motion.div>
                )}

                {/* ═══════════════════════════════════════════════════════════════════
                    SECTION 3: PRIORITY ISSUES - Patterns needing action
                ═══════════════════════════════════════════════════════════════════ */}
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.2 }}
                  className="glass-card p-6"
                >
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> Priority Issues
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Patterns requiring leader action</p>
                  </div>

                  {topIssues.length > 0 ? (
                    <div className="space-y-3">
                      {topIssues.map((issue, i) => {
                        const reportCount = issue.reportCount || issue.count || 1;
                        return (
                          <Link
                            key={issue._id || i}
                            href={`/dashboard/issue/${issue._id || encodeURIComponent(issue.category || 'general')}`}
                            className="group block p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[var(--accent-primary)]/50 hover:bg-white/[0.05] transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="font-medium text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-primary)] transition-colors">
                                  {sanitizeTitle(issue.description || issue.type || 'Issue detected', reportCount)}
                                </p>
                                <p className="text-xs text-[var(--text-secondary)]">
                                  Based on {reportCount} citizen report{reportCount !== 1 ? 's' : ''} · {issue.category || 'General'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                  issue.severity === 'high' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-blue-500/20 text-blue-400'
                                  }`}>
                                  {issue.severity === 'critical' ? 'Urgent' :
                                    issue.severity === 'high' ? 'Rising' : 'Emerging'}
                                </span>
                                <svg className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/20 text-center">
                      <p className="text-[var(--text-secondary)]">
                        No priority issues detected. Continuously monitoring citizen reports.
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* ═══════════════════════════════════════════════════════════════════
                    SECTION 4: WORKFLOW ROW - Pattern → Digest → 311
                ═══════════════════════════════════════════════════════════════════ */}
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.3 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
                    Workflow Tools
                  </h3>
                  <div className="flex items-stretch gap-2">
                    {/* Pattern Detection */}
                    <Link
                      href="/dashboard/patterns"
                      className="flex-1 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-primary)]/5 transition-all group text-center"
                    >
                      <span
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-2 transition-colors"
                        style={{ background: 'var(--accent-muted)', color: 'var(--accent-primary)' }}
                      >
                        {icons.patterns}
                      </span>
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-1">Pattern Detection</p>
                      <p className="text-[10px] text-[var(--text-secondary)] leading-tight">
                        Detect systemic issues from report spikes
                      </p>
                    </Link>

                    {/* Arrow */}
                    <div className="flex items-center text-[var(--text-secondary)]/40">
                      {icons.arrow}
                    </div>

                    {/* Weekly Digest */}
                    <Link
                      href="/dashboard/digest"
                      className="flex-1 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-primary)]/5 transition-all group text-center"
                    >
                      <span
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-2 transition-colors"
                        style={{ background: 'var(--accent-muted)', color: 'var(--accent-primary)' }}
                      >
                        {icons.digest}
                      </span>
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-1">Weekly Digest</p>
                      <p className="text-[10px] text-[var(--text-secondary)] leading-tight">
                        Understand what is trending and why
                      </p>
                    </Link>

                    {/* Arrow */}
                    <div className="flex items-center text-[var(--text-secondary)]/40">
                      {icons.arrow}
                    </div>

                    {/* 311 Filing */}
                    <Link
                      href="/dashboard/auto-file"
                      className="flex-1 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-primary)]/5 transition-all group text-center"
                    >
                      <span
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-2 transition-colors"
                        style={{ background: 'var(--accent-muted)', color: 'var(--accent-primary)' }}
                      >
                        {icons.filing}
                      </span>
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-1">Assisted 311 Filing</p>
                      <p className="text-[10px] text-[var(--text-secondary)] leading-tight">
                        Take action in seconds
                      </p>
                    </Link>
                  </div>
                </motion.div>


              </>
            )}
          </div>
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
