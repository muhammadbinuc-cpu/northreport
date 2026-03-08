'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MockIssue } from '@/lib/mockIssues';

interface NewsTickerProps {
    issues: MockIssue[];
    scanningCount?: number;
}

function generateMessages(issues: MockIssue[], scanningCount: number): string[] {
    const messages: string[] = [];
    issues.slice(0, 5).forEach(issue => {
        messages.push(`[NEW] ${issue.title} reported in ${issue.neighborhood.replace('-', ' ')}`);
    });
    const trending = [...issues].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);
    trending.forEach(issue => {
        if (issue.upvotes > 5) messages.push(`[TRENDING] ${issue.upvotes} people upvoted '${issue.title}'`);
    });
    if (scanningCount > 0) messages.push(`[SYSTEM] Gemini scanning ${scanningCount} reports...`);
    messages.push(`[SYSTEM] ${issues.length} active issues in your area`);
    return messages.sort(() => Math.random() - 0.5).slice(0, 10);
}

export default function NewsTicker({ issues, scanningCount = 0 }: NewsTickerProps) {
    const messages = useMemo(() => generateMessages(issues, scanningCount), [issues, scanningCount]);
    const displayMessages = [...messages, ...messages];
    const totalWidth = messages.length * 400;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 h-8 z-[50] overflow-hidden bg-[var(--bg-base)] border-t border-black/[0.06]"
        >
            <motion.div
                className="flex items-center h-full whitespace-nowrap"
                animate={{ x: [-totalWidth, 0] }}
                transition={{ x: { duration: messages.length * 8, repeat: Infinity, ease: 'linear' } }}
            >
                {displayMessages.map((msg, i) => <TickerItem key={`${msg}-${i}`} message={msg} />)}
            </motion.div>
        </div>
    );
}

function TickerItem({ message }: { message: string }) {
    const tagMatch = message.match(/^\[(\w+)\]/);
    const tag = tagMatch?.[1] || '';
    const content = message.replace(/^\[\w+\]\s*/, '');
    const tagStyles: Record<string, string> = {
        NEW: 'bg-red-700/[0.08] text-red-700',
        TRENDING: 'bg-orange-700/[0.08] text-orange-700',
        SYSTEM: 'bg-[var(--accent-primary)]/[0.08] text-[var(--accent-primary)]',
    };
    const tagClass = tagStyles[tag] || tagStyles.SYSTEM;

    return (
        <div className="flex items-center gap-3 px-6 h-full">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${tagClass}`}>
                {tag}
            </span>
            <span className="text-xs font-medium text-[var(--text-secondary)]">{content}</span>
            <span className="w-1 h-1 rounded-full bg-black/10" />
        </div>
    );
}
