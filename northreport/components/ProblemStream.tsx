'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import Image from 'next/image';

interface Issue {
    id: string;
    caption: string;
    aiSummary: string | null;
    severity: string | null;
    category?: string;
    mediaUrl: string | null;
    neighborhood: string;
    createdAt: string;
    status?: string;
    locationApprox?: { label: string } | null;
}

interface ProblemStreamProps {
    neighborhood: string;
}

// Severity color mapping
const severityColors: Record<string, string> = {
    critical: 'var(--severity-critical)',
    high: 'var(--severity-high)',
    medium: 'var(--severity-medium)',
    low: 'var(--severity-low)',
};

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

export default function ProblemStream({ neighborhood }: ProblemStreamProps) {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useAnimationControls();

    // Fetch issues
    useEffect(() => {
        async function loadIssues() {
            try {
                const res = await fetch(`/api/feed?neighborhood=${neighborhood}&limit=20`);
                if (res.ok) {
                    const data = await res.json();
                    setIssues(data.items || []);
                }
            } catch {
                // Mock data fallback
                setIssues([
                    { id: '1', caption: 'Pothole on Main St', aiSummary: 'Large pothole near intersection', severity: 'high', mediaUrl: null, neighborhood, createdAt: new Date().toISOString(), locationApprox: { label: 'Main St & 1st Ave' } },
                    { id: '2', caption: 'Broken streetlight', aiSummary: 'Light not working at night', severity: 'medium', mediaUrl: null, neighborhood, createdAt: new Date().toISOString(), locationApprox: { label: 'Oak Avenue' } },
                    { id: '3', caption: 'Graffiti on wall', aiSummary: 'New graffiti spotted', severity: 'low', mediaUrl: null, neighborhood, createdAt: new Date().toISOString(), locationApprox: { label: 'Downtown' } },
                ]);
            } finally {
                setLoading(false);
            }
        }
        loadIssues();
    }, [neighborhood]);

    // Auto-scroll animation
    useEffect(() => {
        if (issues.length === 0 || isPaused) return;

        const cardWidth = 320; // px
        const gap = 16; // px
        const totalWidth = (cardWidth + gap) * issues.length;
        const duration = issues.length * 8; // seconds for full scroll

        controls.start({
            x: -totalWidth,
            transition: {
                duration,
                ease: 'linear',
                repeat: Infinity,
            },
        });

        return () => {
            controls.stop();
        };
    }, [issues, isPaused, controls]);

    // Duplicate items for seamless loop
    const displayItems = [...issues, ...issues];

    if (loading) {
        return (
            <div className="h-48 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (issues.length === 0) {
        return (
            <div
                className="h-48 flex items-center justify-center rounded-2xl backdrop-blur-xl"
                style={{
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-glass)'
                }}
            >
                <p className="text-[var(--text-muted)]">No issues reported yet</p>
            </div>
        );
    }

    return (
        <div
            className="relative overflow-hidden py-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Gradient masks for seamless edges */}
            <div
                className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, var(--bg-base), transparent)' }}
            />
            <div
                className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to left, var(--bg-base), transparent)' }}
            />

            <motion.div
                ref={containerRef}
                className="flex gap-4"
                animate={controls}
                style={{ width: 'max-content' }}
            >
                {displayItems.map((issue, index) => (
                    <IssueCard key={`${issue.id}-${index}`} issue={issue} />
                ))}
            </motion.div>
        </div>
    );
}

function IssueCard({ issue }: { issue: Issue }) {
    const severityColor = severityColors[issue.severity || 'medium'] || severityColors.medium;

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative flex-shrink-0 w-80 h-44 rounded-2xl overflow-hidden cursor-pointer backdrop-blur-xl"
            style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-glass)',
                boxShadow: 'var(--shadow-glass-md)',
            }}
        >
            {/* Background image or gradient */}
            {issue.mediaUrl ? (
                <div className="absolute inset-0">
                    <Image
                        src={issue.mediaUrl}
                        alt={issue.caption}
                        fill
                        className="object-cover"
                    />
                    <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(10,14,20,0.9) 0%, rgba(10,14,20,0.3) 100%)' }}
                    />
                </div>
            ) : (
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-base) 100%)`,
                    }}
                />
            )}

            {/* Content overlay */}
            <div className="relative h-full p-4 flex flex-col justify-between">
                {/* Top row: severity badge */}
                <div className="flex items-center justify-between">
                    <span
                        className="px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                        style={{
                            background: `${severityColor}20`,
                            color: severityColor,
                        }}
                    >
                        {issue.severity || 'pending'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                        {timeAgo(issue.createdAt)}
                    </span>
                </div>

                {/* Bottom content */}
                <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2">
                        {issue.aiSummary || issue.caption}
                    </h4>
                    {issue.locationApprox?.label && (
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                            </svg>
                            {issue.locationApprox.label}
                        </div>
                    )}
                </div>
            </div>

            {/* Accent glow on hover */}
            <motion.div
                className="absolute inset-0 pointer-events-none opacity-0"
                whileHover={{ opacity: 1 }}
                style={{
                    boxShadow: `inset 0 0 30px ${severityColor}30`,
                }}
            />
        </motion.div>
    );
}
