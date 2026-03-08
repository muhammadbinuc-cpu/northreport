'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MockIssue, MockComment } from '@/lib/mockIssues';

interface IssueDetailPanelProps {
    issue: MockIssue | null;
    onClose: () => void;
    onReply: (issueId: string, parentCommentId?: string, text?: string) => void;
    onUpvoteIssue?: (issueId: string) => void;
    onUpvoteComment?: (issueId: string, commentId: string) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
    critical: '#ff3b3b',
    high: '#ff8c00',
    medium: '#ffd700',
    low: '#00d4aa',
};

export default function IssueDetailPanel({ issue, onClose, onReply, onUpvoteIssue, onUpvoteComment }: IssueDetailPanelProps) {
    const [replyText, setReplyText] = useState('');
    const [issueUpvoted, setIssueUpvoted] = useState(false);
    const [upvotedComments, setUpvotedComments] = useState<Set<string>>(new Set());
    const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
    const [nestedReplyText, setNestedReplyText] = useState('');
    
    // Educate feature state
    const [educateLoading, setEducateLoading] = useState(false);
    const [educateContent, setEducateContent] = useState<{
        topic: string;
        explanation: string;
        why_it_matters: string;
        what_you_can_do: string;
        related_topics: string[];
    } | null>(null);

    const handleEducate = useCallback(async () => {
        if (!issue || educateLoading) return;
        setEducateLoading(true);
        setEducateContent(null);
        
        try {
            const res = await fetch('/api/educate-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: issue.title,
                    description: issue.description,
                }),
            });
            
            if (res.ok) {
                const data = await res.json();
                setEducateContent(data);
            }
        } catch (err) {
            console.error('Educate failed:', err);
        } finally {
            setEducateLoading(false);
        }
    }, [issue, educateLoading]);

    const handleSubmitReply = useCallback(() => {
        if (!replyText.trim() || !issue) return;
        onReply(issue.id, undefined, replyText);
        setReplyText('');
    }, [replyText, issue, onReply]);

    const handleSubmitNestedReply = useCallback((parentId: string) => {
        if (!nestedReplyText.trim() || !issue) return;
        onReply(issue.id, parentId, nestedReplyText);
        setNestedReplyText('');
        setReplyingToCommentId(null);
    }, [nestedReplyText, issue, onReply]);

    const handleUpvoteIssue = useCallback(() => {
        if (!issue) return;
        setIssueUpvoted(v => !v); // Optimistic UI
        onUpvoteIssue?.(issue.id);
    }, [issue, onUpvoteIssue]);

    const handleUpvoteComment = useCallback((commentId: string) => {
        if (!issue) return;
        setUpvotedComments(prev => {
            const next = new Set(prev);
            if (next.has(commentId)) {
                next.delete(commentId);
            } else {
                next.add(commentId);
            }
            return next;
        }); // Optimistic UI
        onUpvoteComment?.(issue.id, commentId);
    }, [issue, onUpvoteComment]);

    if (!issue) return null;

    const color = SEVERITY_COLORS[issue.severity] || SEVERITY_COLORS.medium;

    // Group comments: top-level and nested replies
    const topLevelComments = issue.comments.filter(c => !(c as any).parentId);
    const getReplies = (parentId: string) => issue.comments.filter(c => (c as any).parentId === parentId);

    return (
        <AnimatePresence>
            <motion.div
                key={issue.id}
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-[400px] z-[100] flex flex-col"
                style={{
                    background: 'var(--bg-elevated)',
                    borderLeft: '1px solid var(--border-subtle)',
                    boxShadow: '-10px 0 40px rgba(0,0,0,0.4)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                        Issue Details
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors" style={{ color: 'var(--text-muted)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Image */}
                    <div className="w-full aspect-video rounded-xl overflow-hidden">
                        <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80'; }} />
                    </div>

                    {/* Title & Severity */}
                    <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">{issue.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                                style={{ background: `${color}25`, color }}>{issue.severity}</span>
                            <span className="text-sm text-[var(--text-muted)]">{issue.neighborhood.replace('-', ' ')}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[var(--text-secondary)]">{issue.description}</p>

                    {/* Issue Actions */}
                    <div className="flex items-center gap-3">
                        {/* Upvote Button */}
                        <motion.button
                            onClick={handleUpvoteIssue}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                            style={{
                                background: issueUpvoted ? '#F472B6' : 'var(--bg-glass)',
                                color: issueUpvoted ? 'white' : 'var(--text-primary)',
                                border: '1px solid var(--border-glass)',
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill={issueUpvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className="text-sm font-medium">{issue.upvotes + (issueUpvoted ? 1 : 0)}</span>
                        </motion.button>
                        <motion.button 
                            onClick={handleEducate}
                            disabled={educateLoading}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                            style={{ 
                                background: educateContent ? 'var(--accent-primary)' : 'var(--bg-glass)', 
                                border: '1px solid var(--border-glass)', 
                                color: educateContent ? 'var(--bg-base)' : 'var(--text-primary)',
                                opacity: educateLoading ? 0.7 : 1,
                            }}>
                            {educateLoading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                                        <path d="M12 2a10 10 0 0 1 10 10" />
                                    </svg>
                                    Learning...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                    {educateContent ? 'Refresh' : 'Educate'}
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Educational Content */}
                    <AnimatePresence>
                        {educateContent && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="rounded-xl overflow-hidden"
                                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}
                            >
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                        </svg>
                                        <h4 className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>
                                            Learn: {educateContent.topic}
                                        </h4>
                                    </div>
                                    
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        {educateContent.explanation}
                                    </p>
                                    
                                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">
                                            Why It Matters
                                        </p>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            {educateContent.why_it_matters}
                                        </p>
                                    </div>
                                    
                                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">
                                            What You Can Do
                                        </p>
                                        <p className="text-sm" style={{ color: 'var(--accent-primary)' }}>
                                            {educateContent.what_you_can_do}
                                        </p>
                                    </div>
                                    
                                    {educateContent.related_topics.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {educateContent.related_topics.map((topic, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-full text-xs"
                                                    style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Comments Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </svg>
                            Comments ({issue.comments.length})
                        </h4>

                        {topLevelComments.map((comment) => (
                            <div key={comment.id}>
                                <CommentCard
                                    comment={comment}
                                    isUpvoted={upvotedComments.has(comment.id)}
                                    onUpvote={() => handleUpvoteComment(comment.id)}
                                    onReply={() => setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)}
                                    isReplying={replyingToCommentId === comment.id}
                                />

                                {/* Inline Reply Input */}
                                <AnimatePresence>
                                    {replyingToCommentId === comment.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="ml-8 mt-2 overflow-hidden"
                                        >
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={nestedReplyText}
                                                    onChange={(e) => setNestedReplyText(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitNestedReply(comment.id)}
                                                    placeholder={`Reply to ${comment.author}...`}
                                                    autoFocus
                                                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                                                    style={{ background: 'var(--bg-glass)', border: '1px solid var(--accent-primary)', color: 'var(--text-primary)' }}
                                                />
                                                <button
                                                    onClick={() => handleSubmitNestedReply(comment.id)}
                                                    disabled={!nestedReplyText.trim()}
                                                    className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                                                    style={{ background: 'var(--accent-primary)', color: 'var(--bg-base)' }}
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Nested Replies */}
                                {getReplies(comment.id).map((reply) => (
                                    <div key={reply.id} className="ml-8 mt-2">
                                        <CommentCard
                                            comment={reply}
                                            isUpvoted={upvotedComments.has(reply.id)}
                                            onUpvote={() => handleUpvoteComment(reply.id)}
                                            onReply={() => { }}
                                            isNested
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* New Comment Input */}
                <div className="p-4 border-t border-[var(--border-subtle)]">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()}
                            placeholder="Add a comment..."
                            className="flex-1 px-4 py-2 rounded-xl text-sm outline-none"
                            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                        />
                        <button
                            onClick={handleSubmitReply}
                            disabled={!replyText.trim()}
                            className="px-4 py-2 rounded-xl font-medium disabled:opacity-50 transition-all"
                            style={{ background: 'var(--accent-primary)', color: 'var(--bg-base)' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

function CommentCard({
    comment,
    isUpvoted,
    onUpvote,
    onReply,
    isReplying = false,
    isNested = false,
}: {
    comment: MockComment;
    isUpvoted: boolean;
    onUpvote: () => void;
    onReply: () => void;
    isReplying?: boolean;
    isNested?: boolean;
}) {
    return (
        <div className={`p-3 rounded-xl ${isNested ? 'border-l-2 border-[var(--accent-primary)]' : ''}`} style={{ background: 'var(--bg-glass)' }}>
            <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-xs font-semibold text-[var(--accent-primary)]">
                    {comment.author[0]}
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{comment.author}</span>
                <span className="text-xs text-[var(--text-muted)]">
                    {new Date(comment.timestamp).toLocaleDateString()}
                </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-2">{comment.text}</p>
            <div className="flex items-center gap-3">
                {/* Heart/Upvote button */}
                <motion.button
                    onClick={onUpvote}
                    whileTap={{ scale: 0.8 }}
                    className="flex items-center gap-1 text-xs transition-colors"
                    style={{ color: isUpvoted ? '#F472B6' : 'var(--text-muted)' }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isUpvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span>{isUpvoted ? 1 : 0}</span>
                </motion.button>

                {/* Reply button - only for top-level */}
                {!isNested && (
                    <button
                        onClick={onReply}
                        className="text-xs hover:underline transition-colors"
                        style={{ color: isReplying ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                    >
                        {isReplying ? 'Cancel' : 'Reply'}
                    </button>
                )}
            </div>
        </div>
    );
}
