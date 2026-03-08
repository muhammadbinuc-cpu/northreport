'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SeverityChip from './SeverityChip';

export interface FeedItem {
  id: string;
  source: 'voice' | 'report';
  type: 'story' | 'post' | 'report';
  userId: string;
  displayName: string;
  neighborhood: string;
  caption: string;
  aiSummary: string | null;
  severity: string | null;
  locationApprox: { cellId: string; label: string } | null;
  mediaUrl: string | null;
  upvotes: number;
  commentCount: number;
  repostCount: number;
  feedScore: number;
  isTrending: boolean;
  linkedReportId: string | null;
  linkedVoiceId: string | null;
  status: string | null;
  createdAt: string;
  expiresAt: string | null;
}

interface FeedCardProps {
  item: FeedItem;
  onExplain?: (item: FeedItem) => void;
  onSelect?: (item: FeedItem) => void;
  isLeader?: boolean;
  onConvert?: (id: string) => void;
  onFile311?: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

/* ── Type icon SVGs ── */
const typeIcons = {
  story: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  report: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  post: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

/* ── Location icon ── */
const locationIcon = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
  </svg>
);

export default function FeedCard({ item, onExplain, onSelect, isLeader, onConvert, onFile311 }: FeedCardProps) {
  const [localUpvotes, setLocalUpvotes] = useState(item.upvotes);
  const [voted, setVoted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (voted) return;
    setVoted(true);
    setLocalUpvotes((v) => v + 1);
    try {
      const endpoint =
        item.source === 'report'
          ? `/api/reports/${item.id}/vote`
          : `/api/voices/${item.id}/vote`;
      const res = await fetch(endpoint, { method: 'POST' });
      if (!res.ok) {
        setVoted(false);
        setLocalUpvotes((v) => v - 1);
      }
    } catch {
      setVoted(false);
      setLocalUpvotes((v) => v - 1);
    }
  };

  const loadComments = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.source !== 'voice') return;
    setShowComments(!showComments);
    if (!showComments) {
      const res = await fetch(`/api/voices/${item.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    }
  };

  const addComment = async () => {
    if (!commentText.trim() || item.source !== 'voice') return;
    const res = await fetch(`/api/voices/${item.id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: commentText }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => [data, ...prev]);
      setCommentText('');
    }
  };

  const typeIcon = typeIcons[item.type] || typeIcons.post;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect?.(item)}
      className="bg-[var(--bg-base)] border border-black/[0.06] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
            {item.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium truncate text-[var(--text-primary)]">
                {item.displayName}
              </span>
              <span className="text-[var(--text-faint)]">&middot;</span>
              <span className="text-xs text-[var(--text-muted)]">{timeAgo(item.createdAt)}</span>
            </div>
            {item.locationApprox && (
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-0.5">
                <span className="text-[var(--accent-primary)]">{locationIcon}</span>
                {item.locationApprox.label}
              </span>
            )}
          </div>
        </div>
        <span className="text-[var(--text-muted)]">{typeIcon}</span>
      </div>

      <hr className="my-3 border-black/[0.06]" />

      {/* Media */}
      {item.mediaUrl && item.mediaUrl.startsWith('data:image') && (
        <div className="rounded-lg overflow-hidden mb-3 border border-black/[0.06]">
          <img src={item.mediaUrl} alt="" className="w-full max-h-48 object-cover" />
        </div>
      )}

      {/* Caption */}
      <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed mb-2">{item.caption}</p>

      {/* AI Summary */}
      {item.aiSummary && (
        <div className="flex items-start gap-2 p-3 rounded-lg mb-3 bg-[var(--accent-primary)]/[0.04] border border-[var(--accent-primary)]/10">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5 text-[var(--accent-primary)]">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
            {item.aiSummary}
          </p>
        </div>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <SeverityChip severity={item.severity} />
        {item.isTrending && (
          <span className="status-chip status-chip--warning">
            Trending
          </span>
        )}
        {item.status && item.source === 'report' && (
          <span className="chip-location">{item.status}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-black/[0.06]">
        <button
          onClick={handleVote}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: voted ? 'var(--accent-primary)' : 'var(--text-muted)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={voted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {localUpvotes}
        </button>

        {item.source === 'voice' && (
          <button
            onClick={loadComments}
            className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {item.commentCount}
          </button>
        )}

        {item.source === 'voice' && (
          <button className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            {item.repostCount}
          </button>
        )}

        {onExplain && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExplain(item);
            }}
            className="ml-auto text-xs font-medium text-[var(--accent-primary)] hover:underline"
          >
            Ask NorthReport
          </button>
        )}
      </div>

      {/* Leader actions */}
      {isLeader && (
        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-black/[0.06]">
          {item.source === 'report' && !item.linkedVoiceId && (
            <button
              onClick={(e) => { e.stopPropagation(); onFile311?.(item.id); }}
              className="status-chip status-chip--critical text-[10px]"
            >
              File to 311
            </button>
          )}
          {item.source === 'voice' && !item.linkedReportId && (
            <button
              onClick={(e) => { e.stopPropagation(); onConvert?.(item.id); }}
              className="status-chip status-chip--caution text-[10px]"
            >
              Convert to Report
            </button>
          )}
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <div
          className="space-y-2 pt-3 mt-3 border-t border-black/[0.06]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComment()}
              placeholder="Add a comment..."
              className="input-paper flex-1 text-sm py-2"
              maxLength={300}
            />
            <button onClick={addComment} className="btn-primary px-4 py-2 text-sm">
              Post
            </button>
          </div>
          {comments.map((c) => (
            <div key={c.id} className="text-sm space-y-0.5">
              <span className="font-medium text-xs text-[var(--text-primary)]">
                {c.displayName || 'User'}
              </span>
              <p className="text-[var(--text-secondary)]">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
