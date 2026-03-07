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
        <div className="fixed bottom-0 left-0 right-0 h-8 z-[50] overflow-hidden"
            style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.8), transparent)' }} />
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.8), transparent)' }} />
            <motion.div className="flex items-center h-full whitespace-nowrap"
                animate={{ x: [-totalWidth, 0] }}
                transition={{ x: { duration: messages.length * 8, repeat: Infinity, ease: 'linear' } }}>
                {displayMessages.map((msg, i) => <TickerItem key={`${msg}-${i}`} message={msg} />)}
            </motion.div>
        </div>
    );
}

function TickerItem({ message }: { message: string }) {
    const tagMatch = message.match(/^\[(\w+)\]/);
    const tag = tagMatch?.[1] || '';
    const content = message.replace(/^\[\w+\]\s*/, '');
    const colors: Record<string, { bg: string; text: string }> = {
        NEW: { bg: 'rgba(255, 59, 59, 0.3)', text: '#ff3b3b' },
        TRENDING: { bg: 'rgba(255, 140, 0, 0.3)', text: '#ff8c00' },
        SYSTEM: { bg: 'rgba(34, 211, 238, 0.3)', text: '#22D3EE' },
    };
    const c = colors[tag] || colors.SYSTEM;

    return (
        <div className="flex items-center gap-3 px-6 h-full" style={{ fontFamily: "'Roboto Mono', monospace" }}>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: c.bg, color: c.text }}>{tag}</span>
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{content}</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
        </div>
    );
}
