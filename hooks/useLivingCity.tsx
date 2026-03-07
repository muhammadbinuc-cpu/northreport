'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MockIssue, MockComment, generateMockComment } from '@/lib/mockIssues';

interface LivingCityEvent {
    type: 'new_comment' | 'duplicate_report';
    issueId: string;
    data: { comment?: MockComment; message?: string };
}

interface UseLivingCityOptions {
    issues: MockIssue[];
    onNewComment?: (issueId: string, comment: MockComment) => void;
    onDuplicateReport?: (issueId: string, message: string) => void;
    enabled?: boolean;
}

export function useLivingCity({
    issues,
    onNewComment,
    onDuplicateReport,
    enabled = true,
}: UseLivingCityOptions) {
    const [lastEvent, setLastEvent] = useState<LivingCityEvent | null>(null);
    const [duplicatePopup, setDuplicatePopup] = useState<{ issueId: string; message: string } | null>(null);
    const [pulseIssueId, setPulseIssueId] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const generateEvent = useCallback((): LivingCityEvent | null => {
        if (issues.length === 0) return null;
        const issue = issues[Math.floor(Math.random() * issues.length)];

        if (Math.random() < 0.7) {
            return { type: 'new_comment', issueId: issue.id, data: { comment: generateMockComment() } };
        } else {
            return { type: 'duplicate_report', issueId: issue.id, data: { message: 'Multiple reports at this location!' } };
        }
    }, [issues]);

    const processEvent = useCallback((event: LivingCityEvent) => {
        setLastEvent(event);
        setPulseIssueId(event.issueId);
        setTimeout(() => setPulseIssueId(null), 3000);

        if (event.type === 'new_comment' && event.data.comment) {
            onNewComment?.(event.issueId, event.data.comment);
        } else if (event.type === 'duplicate_report' && event.data.message) {
            setDuplicatePopup({ issueId: event.issueId, message: event.data.message });
            setTimeout(() => setDuplicatePopup(null), 4000);
            onDuplicateReport?.(event.issueId, event.data.message);
        }
    }, [onNewComment, onDuplicateReport]);

    useEffect(() => {
        if (!enabled || issues.length === 0) return;

        const scheduleNext = () => {
            // Exactly 3 minutes
            intervalRef.current = setTimeout(() => {
                const event = generateEvent();
                if (event) processEvent(event);
                scheduleNext();
            }, 180000);
        };

        scheduleNext();
        return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
    }, [enabled, issues.length, generateEvent, processEvent]);

    return { lastEvent, duplicatePopup, pulseIssueId };
}

// Toast component
export function LivingCityToast({ event, onDismiss }: { event: LivingCityEvent | null; onDismiss: () => void }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (event?.type === 'new_comment') {
            setVisible(true);
            const timer = setTimeout(() => { setVisible(false); onDismiss(); }, 4000);
            return () => clearTimeout(timer);
        }
    }, [event, onDismiss]);

    if (!visible || !event || event.type !== 'new_comment') return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 z-50 px-5 py-3 rounded-xl backdrop-blur-xl cursor-pointer"
            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}
            onClick={() => setVisible(false)}
        >
            <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                <span className="text-sm text-[var(--text-primary)]">
                    <span className="font-semibold">{event.data.comment?.author}</span>
                    {' commented: "'}
                    <span className="text-[var(--text-secondary)]">{event.data.comment?.text}</span>
                    {'"'}
                </span>
            </div>
        </motion.div>
    );
}
