'use client';

import { useState } from 'react';
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
            className="flex items-center gap-4 px-6 py-4"
        >
            {/* Title */}
            <h1
                className="text-2xl font-semibold"
                style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                }}
            >
                {title || 'City Map'}
            </h1>

            {/* Neighborhood Selector */}
            {neighborhood && onNeighborhoodChange && (
                <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-150"
                    style={{
                        background: 'var(--bg-hover)',
                        border: '1px solid rgba(30,30,30,0.06)',
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
                            <option key={n.slug} value={n.slug} style={{ background: 'var(--bg-card)' }}>
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
                        background: 'var(--bg-input)',
                        border: '1px solid rgba(30,30,30,0.06)',
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

            {/* Live Count -- subtle */}
            {typeof liveCount === 'number' && (
                <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                        color: 'var(--text-muted)',
                    }}
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--status-success)' }}
                    />
                    {liveCount} live
                </div>
            )}
        </header>
    );
}
