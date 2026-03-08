'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '@/components/AppShell';
import FluidMap, { FluidMapRef } from '@/components/FluidMap';
import IssueDetailPanel from '@/components/IssueDetailPanel';
import ScanButton from '@/components/ScanButton';
import NewsTicker from '@/components/NewsTicker';
import { NotificationQueue, useNotificationQueue } from '@/components/NotificationQueue';
import { useLiveIssues } from '@/hooks/useLiveIssues';
import { useLivingCity } from '@/hooks/useLivingCity';
import { NEIGHBORHOODS } from '@/lib/constants';
import type { MockIssue } from '@/lib/mockIssues';

// SVG Icons
const icons = {
  location: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  ),
  pulse: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  map: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  arrowLeft: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
};

export default function FeedPage() {
  const { user } = useUser();
  const [neighborhood, setNeighborhood] = useState('downtown-hamilton');
  const [userLocation, setUserLocation] = useState<[number, number]>([-79.9192, 43.2557]);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [focusedIssue, setFocusedIssue] = useState<MockIssue | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'map'>('dashboard');
  const mapRef = useRef<FluidMapRef>(null);

  // Live issues with simulation
  const { issues, setIssues, newIssueId, showToast, toastMessage, dismissToast } = useLiveIssues({});

  // Social notification queue
  const { notifications, addNotification, dismissNotification } = useNotificationQueue();

  // Living City simulation - events every 3 minutes
  const { duplicatePopup, pulseIssueId } = useLivingCity({
    issues,
    onNewComment: (issueId, comment) => {
      // Update issue comments
      setIssues(prev => prev.map(issue => {
        if (issue.id === issueId) {
          return { ...issue, comments: [...issue.comments, comment] };
        }
        return issue;
      }));
      // Update focused issue if it's the one being commented on
      setFocusedIssue(prev => {
        if (prev?.id === issueId) {
          return { ...prev, comments: [...prev.comments, comment] };
        }
        return prev;
      });
      mapRef.current?.triggerPulse(issueId);

      // Add social notification
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
      // Add new comment to the issue
      const newComment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        author: user?.name || 'Anonymous',
        text: text.trim(),
        timestamp: new Date().toISOString(),
        parentId: parentCommentId, // For threading support
      };
      setIssues(prev => prev.map(issue => {
        if (issue.id === issueId) {
          return { ...issue, comments: [...issue.comments, newComment] };
        }
        return issue;
      }));
      // Update focusedIssue to reflect new comment immediately
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
    if (viewMode === 'dashboard') {
      setViewMode('map');
    } else {
      setViewMode('dashboard');
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
      <div className="relative min-h-screen overflow-hidden">
        {/* Snap Map Layer - Always rendered, 45° pitch, photo markers */}
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
          viewMode={viewMode === 'dashboard' ? 'feed' : 'map'}
        />

        {/* Dashboard Content - Fades out when map view is active */}
        <AnimatePresence>
          {viewMode === 'dashboard' && (
            <motion.div
              key="dashboard-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative z-10 min-h-screen flex flex-col"
              style={{ marginLeft: 'var(--nav-width)' }}
            >
              {/* Hero Section */}
              <section className="flex-1 flex flex-col justify-center px-8 pt-16 pb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="max-w-2xl"
                >
                  {/* Neighborhood Selector */}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-xl cursor-pointer"
                    style={{
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-glass)',
                    }}
                  >
                    <span style={{ color: 'var(--accent-primary)' }}>{icons.location}</span>
                    <select
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="bg-transparent outline-none cursor-pointer text-sm font-medium"
                      style={{
                        fontFamily: 'var(--font-utility)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {NEIGHBORHOODS.map((n) => (
                        <option key={n.slug} value={n.slug} style={{ background: 'var(--bg-elevated)' }}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                    <span style={{ color: 'var(--text-muted)' }}>{icons.chevron}</span>
                  </div>

                  {/* Title */}
                  <h1
                    className="text-5xl font-bold mb-4"
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Your <span style={{ color: 'var(--accent-primary)' }}>Area</span>
                  </h1>

                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-4 mb-8">

                    {/* Issue Count */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl"
                      style={{
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-glass)',
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: 'var(--accent-muted)',
                          color: 'var(--accent-primary)',
                        }}
                      >
                        {icons.pulse}
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Active Issues</p>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {issues.length} in {currentNeighborhood?.name || 'your area'}
                        </p>
                      </div>
                    </motion.div>

                    {/* VIEW MAP BUTTON */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleView}
                      className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, #22D3EE 0%, #A855F7 100%)',
                        color: 'white',
                        boxShadow: '0 0 30px rgba(34, 211, 238, 0.4)',
                      }}
                    >
                      {icons.map}
                      <span>View Map</span>
                    </motion.button>
                  </div>

                  {/* Subtitle */}
                  <p className="text-lg text-[var(--text-secondary)] max-w-md">
                    Stay informed about what's happening in your neighborhood.
                    Report issues, track progress, make a difference.
                  </p>
                </motion.div>
              </section>

              {/* Live Issue Stream - with gradient fade and action zone padding */}
              <section className="relative pb-[180px]">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="px-8"
                >
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                      Live Issue Stream
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">
                      Real-time reports from your community
                    </p>
                  </div>

                  {/* Issue cards - Horizontal Auto-Scroll Marquee */}
                  <div className="relative overflow-hidden pb-4">
                    {issues.length === 0 ? (
                      <div 
                        className="flex items-center justify-center py-12 px-8 rounded-xl"
                        style={{
                          background: 'var(--bg-glass)',
                          border: '1px solid var(--border-glass)',
                        }}
                      >
                        <p className="text-[var(--text-muted)]">No issues reported yet</p>
                      </div>
                    ) : (
                      /* Marquee Container */
                      <motion.div
                        className="flex gap-4"
                        animate={{ x: "-50%" }}
                        transition={{
                          ease: "linear",
                          duration: Math.max(20, issues.length * 5), // Adjust speed based on content
                          repeat: Infinity,
                        }}
                        style={{ width: "max-content" }}
                        whileHover={{ animationPlayState: "paused" }} // Note: Framer Motion uses styles for pause, but standard CSS 'animation-play-state' might not work with 'animate'. Using raw CSS for marquee often better for pause.
                        // Actually, for simple pause, we can use binding. But user asked for "if it runs out, just restart. like a circle".
                        // Let's stick to simple restart loop.
                      >
                        {/* Duplicate issues for seamless loop */}
                        {[...issues, ...issues].map((issue, index) => {
                          // Calculate relative time
                          const now = new Date();
                          const created = new Date(issue.createdAt);
                          const diffMs = now.getTime() - created.getTime();
                          const diffMins = Math.floor(diffMs / 60000);
                          const timeAgo = diffMins < 60 
                            ? `${diffMins}m ago` 
                            : diffMins < 1440 
                              ? `${Math.floor(diffMins / 60)}h ago` 
                              : `${Math.floor(diffMins / 1440)}d ago`;
                          
                          // Unique key for duplicated items
                          const key = `${issue.id}-${index}`;

                          return (
                            <motion.div
                              key={key}
                              whileHover={{ scale: 1.02, y: -2 }}
                              onClick={() => {
                                setFocusedIssue(issue);
                                setViewMode('map');
                                setTimeout(() => {
                                  mapRef.current?.flyTo([issue.longitude, issue.latitude]);
                                }, 500);
                              }}
                              className="flex-shrink-0 w-[280px] p-4 rounded-xl backdrop-blur-xl cursor-pointer"
                              style={{
                                background: 'var(--bg-glass)',
                                border: issue.id === newIssueId ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                                boxShadow: issue.id === newIssueId ? '0 0 20px rgba(34, 211, 238, 0.3)' : undefined,
                              }}
                            >
                              {/* Header: Timestamp + Severity */}
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-[var(--text-muted)]">{timeAgo}</span>
                                <span
                                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                                  style={{
                                    background: issue.severity === 'critical' ? 'rgba(255,59,59,0.2)' :
                                      issue.severity === 'high' ? 'rgba(255,140,0,0.2)' :
                                        issue.severity === 'medium' ? 'rgba(255,200,0,0.2)' :
                                          'rgba(34,211,238,0.2)',
                                    color: issue.severity === 'critical' ? '#ff3b3b' :
                                      issue.severity === 'high' ? '#ff8c00' :
                                        issue.severity === 'medium' ? '#ffc800' :
                                          '#22D3EE',
                                  }}
                                >
                                  {issue.severity}
                                </span>
                              </div>

                              {/* Description */}
                              <p className="text-sm text-[var(--text-primary)] leading-relaxed line-clamp-3 mb-3">
                                {issue.description || issue.title}
                              </p>

                              {/* Location */}
                              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--accent-primary)]">
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                                </svg>
                                <span>{issue.neighborhood.replace(/-/g, ' ')}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Gradient Fade Mask - gracefully fades cards into action zone */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to bottom, transparent  0%, var(--bg-base) 100%)',
                  }}
                />
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Mode - Return to Dashboard button */}
        <AnimatePresence>
          {viewMode === 'map' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-30 flex gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleView}
                className="px-5 py-3 rounded-xl flex items-center gap-2 backdrop-blur-xl"
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-glass)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  color: 'var(--text-primary)',
                }}
              >
                {icons.arrowLeft}
                <span className="text-sm font-medium">Return to Dashboard</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Issue Detail Panel - Right side */}
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
              className="fixed top-6 left-1/2 z-[80] px-5 py-3 rounded-xl backdrop-blur-xl cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #22D3EE, #A855F7)',
                color: 'white',
                boxShadow: '0 0 30px rgba(34, 211, 238, 0.5)',
              }}
              onClick={dismissToast}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-semibold">{toastMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Pulse Notifications - Queue System */}
        <NotificationQueue
          notifications={notifications}
          onDismiss={dismissNotification}
          onNotificationClick={handleNotificationClick}
        />

        {/* City Pulse News Ticker */}
        <NewsTicker issues={issues} scanningCount={0} />

        {/* Hero Scan Button - animates between top-right (feed) and bottom-center (map) */}
        <ScanButton position={viewMode === 'dashboard' ? 'top-right' : 'bottom-center'} />
      </div>
    </AppShell>
  );
}
