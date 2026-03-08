'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '@/components/AppShell';
import FluidMap, { FluidMapRef } from '@/components/FluidMap';
import IssueDetailPanel from '@/components/IssueDetailPanel';
import ScanButton from '@/components/ScanButton';
import { NotificationQueue, useNotificationQueue } from '@/components/NotificationQueue';
import { useLiveIssues } from '@/hooks/useLiveIssues';
import { useLivingCity } from '@/hooks/useLivingCity';
import { NEIGHBORHOODS } from '@/lib/constants';
import type { MockIssue } from '@/lib/mockIssues';

/* ── SVG Icons ── */
const icons = {
  location: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  ),
  chevron: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  map: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  list: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  pin: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--accent-primary)]">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  ),
};

/* ── Severity styling ── */
const severityStyles: Record<string, string> = {
  critical: 'bg-red-700/[0.08] text-red-700 border-red-700/20',
  high: 'bg-orange-700/[0.08] text-orange-700 border-orange-700/20',
  medium: 'bg-amber-700/[0.08] text-amber-700 border-amber-700/20',
  low: 'bg-green-700/[0.08] text-green-700 border-green-700/20',
};

/* ── Time ago helper ── */
function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const created = new Date(dateStr);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}

export default function FeedPage() {
  const { user } = useUser();
  const [neighborhood, setNeighborhood] = useState('downtown-waterloo');
  const [userLocation, setUserLocation] = useState<[number, number]>([-79.9192, 43.2557]);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [focusedIssue, setFocusedIssue] = useState<MockIssue | null>(null);
  const [viewMode, setViewMode] = useState<'feed' | 'map'>('feed');
  const mapRef = useRef<FluidMapRef>(null);

  // Live issues with simulation
  const { issues, setIssues, newIssueId, showToast, toastMessage, dismissToast } = useLiveIssues({});

  // Social notification queue
  const { notifications, addNotification, dismissNotification } = useNotificationQueue();

  // Living City simulation - events every 3 minutes
  const { duplicatePopup, pulseIssueId } = useLivingCity({
    issues,
    onNewComment: (issueId, comment) => {
      setIssues(prev => prev.map(issue => {
        if (issue.id === issueId) {
          return { ...issue, comments: [...issue.comments, comment] };
        }
        return issue;
      }));
      setFocusedIssue(prev => {
        if (prev?.id === issueId) {
          return { ...prev, comments: [...prev.comments, comment] };
        }
        return prev;
      });
      mapRef.current?.triggerPulse(issueId);

      const issue = issues.find(i => i.id === issueId);
      addNotification({
        type: 'reply',
        issueId,
        username: comment.author,
        message: `replied on "${issue?.title || 'an issue'}": "${comment.text.slice(0, 50)}${comment.text.length > 50 ? '...' : ''}"`,
      });
    },
    onDuplicateReport: (issueId) => {
      mapRef.current?.triggerPulse(issueId);
      const issue = issues.find(i => i.id === issueId);
      addNotification({
        type: 'new_report',
        issueId,
        username: 'Citizen',
        message: `also reported "${issue?.title || 'this issue'}"`,
      });
    },
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.longitude, pos.coords.latitude]),
        () => { /* use default */ }
      );
    }
  }, []);

  // Load health data
  useEffect(() => {
    async function loadData() {
      try {
        const healthRes = await fetch(`/api/health?neighborhood=${neighborhood}`);
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setHealthScore(healthData.overall);
        }
      } catch { /* ignore */ }
    }
    loadData();
  }, [neighborhood]);

  // Handle marker click - opens detail panel
  const handleIssueSelect = useCallback((issue: MockIssue) => {
    setFocusedIssue(issue);
    mapRef.current?.flyTo([issue.longitude, issue.latitude]);
  }, []);

  // Close detail panel
  const handleCloseDetail = useCallback(() => {
    setFocusedIssue(null);
    mapRef.current?.resetView();
  }, []);

  // Handle reply - adds comment and triggers map pulse
  const handleReply = useCallback((issueId: string, parentCommentId?: string, text?: string) => {
    if (text && text.trim()) {
      const newComment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        author: user?.name || 'Anonymous',
        text: text.trim(),
        timestamp: new Date().toISOString(),
        parentId: parentCommentId,
      };
      setIssues(prev => prev.map(issue => {
        if (issue.id === issueId) {
          return { ...issue, comments: [...issue.comments, newComment] };
        }
        return issue;
      }));
      setFocusedIssue(prev => {
        if (prev?.id === issueId) {
          return { ...prev, comments: [...prev.comments, newComment] };
        }
        return prev;
      });
    }
    mapRef.current?.triggerPulse(issueId);
  }, [user, setIssues]);

  // Toggle view mode
  const toggleView = useCallback(() => {
    if (viewMode === 'feed') {
      setViewMode('map');
    } else {
      setViewMode('feed');
      setFocusedIssue(null);
      mapRef.current?.resetView();
    }
  }, [viewMode]);

  // Handle notification click - fly to issue and open panel
  const handleNotificationClick = useCallback((issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      setFocusedIssue(issue);
      setViewMode('map');
      setTimeout(() => {
        mapRef.current?.flyTo([issue.longitude, issue.latitude]);
      }, 300);
    }
  }, [issues]);

  const currentNeighborhood = NEIGHBORHOODS.find(n => n.slug === neighborhood);
  const isPanelOpen = focusedIssue !== null;

  return (
    <AppShell>
      <div className="relative min-h-screen">
        {/* Map Layer - always rendered, shown when map mode active */}
        <FluidMap
          ref={mapRef}
          issues={issues}
          onIssueSelect={handleIssueSelect}
          focusedIssueId={focusedIssue?.id}
          newIssueId={newIssueId}
          pulseIssueId={pulseIssueId}
          duplicatePopup={duplicatePopup}
          isVisible={true}
          isBlurred={isPanelOpen}
          viewMode={viewMode === 'feed' ? 'feed' : 'map'}
        />

        {/* Feed Content - content-first layout */}
        <AnimatePresence>
          {viewMode === 'feed' && (
            <motion.div
              key="feed-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 min-h-screen pointer-events-none"
            >
              <div className="max-w-md px-6 py-6 ml-0 lg:ml-6 pointer-events-auto h-screen flex flex-col">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-6 shrink-0">
                  {/* Neighborhood Selector */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-md" style={{ background: 'rgba(245,240,225,0.92)', border: '1px solid rgba(107,15,26,0.1)' }}>
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
                    <span className="text-[var(--text-muted)]">{icons.chevron}</span>
                  </div>

                  {/* View Map Toggle */}
                  <button
                    onClick={toggleView}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white transition-shadow hover:shadow-md"
                  >
                    {icons.map}
                    <span>View Map</span>
                  </button>
                </div>

                {/* Section Header */}
                <div className="mb-4 px-4 py-3 rounded-xl shrink-0" style={{ background: 'rgba(107,15,26,0.07)', border: '1px solid rgba(107,15,26,0.12)' }}>
                  <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>
                    Live Issues
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">
                    {issues.length} active in {currentNeighborhood?.name || 'your area'}
                  </p>
                </div>

                {/* Issue Card List - Scrollable */}
                <div className="flex-1 overflow-y-auto min-h-0 pb-6" style={{ scrollbarWidth: 'thin' }}>
                {issues.length === 0 ? (
                  <div className="bg-[var(--bg-base)] border border-black/[0.06] rounded-xl p-12 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(107,15,26,0.06)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)] mb-1">All clear</p>
                    <p className="text-[var(--text-muted)] text-xs">No issues reported in this area yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {issues.map((issue, index) => (
                      <motion.button
                        key={issue.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        onClick={() => {
                          setFocusedIssue(issue);
                          setViewMode('map');
                          setTimeout(() => {
                            mapRef.current?.flyTo([issue.longitude, issue.latitude]);
                          }, 500);
                        }}
                        className={`w-full text-left rounded-xl p-4 transition-all hover:shadow-md cursor-pointer backdrop-blur-md ${
                          issue.id === newIssueId
                            ? 'shadow-sm'
                            : 'shadow-sm'
                        }`}
                        style={{
                          background: 'rgba(245,240,225,0.92)',
                          border: '1px solid rgba(107,15,26,0.1)',
                          borderLeft: `3px solid ${severityStyles[issue.severity]?.includes('red') ? 'var(--severity-critical)' : severityStyles[issue.severity]?.includes('orange') ? 'var(--severity-high)' : severityStyles[issue.severity]?.includes('amber') ? 'var(--severity-medium)' : 'var(--severity-low)'}`,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Severity Chip */}
                          <span
                            className={`mt-0.5 shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${
                              severityStyles[issue.severity] || severityStyles.low
                            }`}
                          >
                            {issue.severity}
                          </span>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
                              {issue.category
                                ? issue.category.charAt(0).toUpperCase() + issue.category.slice(1)
                                : issue.title || 'Issue reported'}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                              {issue.title || issue.description}
                            </p>

                            {/* Meta row */}
                            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                              <span className="flex items-center gap-1">
                                {icons.pin}
                                {issue.neighborhood.replace(/-/g, ' ')}
                              </span>
                              <span>{formatTimeAgo(issue.createdAt)}</span>
                              {issue.upvotes > 0 && (
                                <span>{issue.upvotes} upvotes</span>
                              )}
                              {issue.comments.length > 0 && (
                                <span>{issue.comments.length} comments</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Mode - Return to Feed button */}
        <AnimatePresence>
          {viewMode === 'map' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-20 right-6 z-30"
            >
              <button
                onClick={toggleView}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--bg-base)] border border-black/[0.06] shadow-md text-sm font-medium text-[var(--text-primary)] hover:shadow-lg transition-shadow"
              >
                {icons.list}
                <span>Back to Feed</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Issue Detail Panel */}
        <IssueDetailPanel
          issue={focusedIssue}
          onClose={handleCloseDetail}
          onReply={handleReply}
        />

        {/* Toast - New Issues */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -50, x: '-50%' }}
              className="fixed top-20 left-1/2 z-[80] px-4 py-2.5 rounded-lg bg-[var(--accent-primary)] text-white shadow-md cursor-pointer"
              onClick={dismissToast}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-medium">{toastMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Pulse Notifications */}
        <NotificationQueue
          notifications={notifications}
          onDismiss={dismissNotification}
          onNotificationClick={handleNotificationClick}
        />

        {/* Scan Button */}
        <ScanButton position={viewMode === 'feed' ? 'top-right' : 'bottom-center'} />
      </div>
    </AppShell>
  );
}
