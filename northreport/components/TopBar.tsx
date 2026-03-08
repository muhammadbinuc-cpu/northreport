'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { NEIGHBORHOODS } from '@/lib/constants';

// SVG Icons
const icons = {
    location: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
        </svg>
    ),
    search: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
        </svg>
    ),
    chevron: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
        </svg>
    ),
};

interface TopBarProps {
    title?: string;
    neighborhood?: string;
    onNeighborhoodChange?: (neighborhood: string) => void;
    showSearch?: boolean;
    liveCount?: number;
}

export default function TopBar({
    title,
    neighborhood,
    onNeighborhoodChange,
    showSearch = true,
    liveCount,
}: TopBarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header
            className="flex items-center gap-4 px-6 py-3 backdrop-blur-xl"
            style={{
                marginLeft: 'var(--nav-width)',
                height: 'var(--topbar-height)',
                background: 'var(--bg-glass)',
                borderBottom: '1px solid var(--border-glass)',
            }}
        >
            {/* Title */}
            <h1
                className="text-lg font-semibold"
                style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--text-primary)',
                }}
            >
                {title || 'Live City'}
                {!title && (
                    <span style={{ color: 'var(--accent-primary)' }}> Map</span>
                )}
            </h1>

            {/* Neighborhood Selector */}
            {neighborhood && onNeighborhoodChange && (
                <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                    style={{
                        background: 'var(--bg-hover)',
                        border: '1px solid var(--border-glass)',
                    }}
                >
                    <span style={{ color: 'var(--accent-primary)' }}>{icons.location}</span>
                    <select
                        value={neighborhood}
                        onChange={(e) => onNeighborhoodChange(e.target.value)}
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
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            {showSearch && (
                <div
                    className="flex items-center gap-2 px-4 py-2 rounded-lg w-72"
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-glass)',
                    }}
                >
                    <span style={{ color: 'var(--text-muted)' }}>{icons.search}</span>
                    <input
                        type="text"
                        placeholder="Search locations, incidents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm placeholder:text-[var(--text-faint)]"
                        style={{
                            fontFamily: 'var(--font-utility)',
                            color: 'var(--text-primary)',
                        }}
                    />
                </div>
            )}

            {/* Live Count Pill */}
            {typeof liveCount === 'number' && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#22C55E',
                    }}
                >
                    <span
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: '#22C55E' }}
                    />
                    {liveCount} live
                </motion.div>
            )}
        </header>
    );
}
