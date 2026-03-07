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
  onVote?: (id: string, source: string) => void;
  isLeader?: boolean;
  onConvert?: (id: string) => void;
  onFile311?: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function FeedCard({ item, onExplain, onVote, isLeader, onConvert, onFile311 }: FeedCardProps) {
  const [localUpvotes, setLocalUpvotes] = useState(item.upvotes);
  const [voted, setVoted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');

  const handleVote = async () => {
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
    onVote?.(item.id, item.source);
  };

  const loadComments = async () => {
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

  const pulseClass =
    item.severity === 'critical'
      ? 'pulse-critical'
      : item.severity === 'high'
      ? 'pulse-high'
      : '';

  const typeIcon =
    item.type === 'story' ? '📖' : item.type === 'report' ? '📋' : '💬';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4 space-y-3 ${pulseClass}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 text-sm">
        <div className="w-8 h-8 rounded-full bg-[#6366f1]/30 flex items-center justify-center text-xs font-bold">
          {item.displayName.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium">{item.displayName}</span>
        <span className="text-[#888]">·</span>
        <span className="text-[#888]">{timeAgo(item.createdAt)}</span>
        {item.locationApprox && (
          <>
            <span className="text-[#888]">·</span>
            <span className="text-[#888] text-xs">{item.locationApprox.label}</span>
          </>
        )}
      </div>

      {/* Media */}
      {item.mediaUrl && item.mediaUrl.startsWith('data:image') && (
        <div className="rounded-xl overflow-hidden">
          <img src={item.mediaUrl} alt="" className="w-full max-h-64 object-cover" />
        </div>
      )}

      {/* Caption */}
      <p className="text-[#f0f0f0] text-sm leading-relaxed">{item.caption}</p>

      {/* AI Summary */}
      {item.aiSummary && (
        <p className="text-xs text-[#888] italic">
          AI: {item.aiSummary}
        </p>
      )}

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs">{typeIcon}</span>
        <SeverityChip severity={item.severity} />
        {item.isTrending && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
            🔥 Trending
          </span>
        )}
        {item.status && item.source === 'report' && (
          <span className="text-xs text-[#888] bg-white/5 px-2 py-0.5 rounded-full">
            {item.status}
          </span>
        )}
        {item.expiresAt && (
          <span className="text-xs text-[#888]">
            Expires {timeAgo(item.expiresAt).replace(' ago', '')}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={handleVote}
          className={`flex items-center gap-1 text-sm transition-colors ${
            voted ? 'text-[#6366f1]' : 'text-[#888] hover:text-[#f0f0f0]'
          }`}
        >
          <span>▲</span> {localUpvotes}
        </button>

        {item.source === 'voice' && (
          <button
            onClick={loadComments}
            className="flex items-center gap-1 text-sm text-[#888] hover:text-[#f0f0f0] transition-colors"
          >
            💬 {item.commentCount}
          </button>
        )}

        {item.source === 'voice' && (
          <button className="flex items-center gap-1 text-sm text-[#888] hover:text-[#f0f0f0] transition-colors">
            🔄 {item.repostCount}
          </button>
        )}

        {onExplain && (
          <button
            onClick={() => onExplain(item)}
            className="ml-auto px-3 py-1 bg-[#6366f1]/20 hover:bg-[#6366f1]/30 rounded-lg text-xs text-[#6366f1] transition-colors"
          >
            Ask SafePulse
          </button>
        )}
      </div>

      {/* Leader actions */}
      {isLeader && (
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          {item.source === 'report' && !item.linkedVoiceId && (
            <button
              onClick={() => onFile311?.(item.id)}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs text-red-400 transition-colors"
            >
              File to 311
            </button>
          )}
          {item.source === 'voice' && !item.linkedReportId && (
            <button
              onClick={() => onConvert?.(item.id)}
              className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-xs text-yellow-400 transition-colors"
            >
              Convert to Report
            </button>
          )}
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComment()}
              placeholder="Add a comment..."
              className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#6366f1]"
              maxLength={300}
            />
            <button
              onClick={addComment}
              className="px-3 py-2 bg-[#6366f1] rounded-lg text-sm"
            >
              Post
            </button>
          </div>
          {comments.map((c) => (
            <div key={c.id} className="text-sm space-y-0.5">
              <span className="font-medium text-xs">{c.displayName || 'User'}</span>
              <p className="text-[#ccc]">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
