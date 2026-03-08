'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Professional SVG icons
const icons = {
    feed: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 11a9 9 0 0 1 9 9" />
            <path d="M4 4a16 16 0 0 1 16 16" />
            <circle cx="5" cy="19" r="1" fill="currentColor" />
        </svg>
    ),
    map: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
    ),
    report: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    ),
    dashboard: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
    ),
    user: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    ),
};

const navItems = [
    { href: '/feed', label: 'Activity', icon: icons.feed },
    { href: '/map', label: 'City Map', icon: icons.map },
    { href: '/report', label: 'Submit', icon: icons.report },
    { href: '/dashboard', label: 'Command', icon: icons.dashboard },
];

export default function SideNav() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed left-0 top-0 bottom-0 z-50 flex flex-col items-center py-5 backdrop-blur-xl"
            style={{
                width: 'var(--nav-width)',
                background: 'var(--bg-glass)',
                borderRight: '1px solid var(--border-glass)',
                boxShadow: 'var(--shadow-glass-md)',
            }}
        >
            {/* Logo */}
            <Link href="/" className="mb-8">
                <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                        background: 'var(--accent-primary)',
                        color: 'var(--bg-base)',
                        boxShadow: 'var(--shadow-glow-accent)',
                    }}
                >
                    {icons.logo}
                </motion.div>
            </Link>

            {/* Nav Items */}
            <div className="flex-1 flex flex-col gap-1 w-full px-2">
                {navItems.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex flex-col items-center justify-center py-3 px-2 rounded-lg cursor-pointer relative transition-all duration-150"
                                style={{
                                    background: isActive ? 'var(--bg-hover)' : 'transparent',
                                    color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                                }}
                            >
                                {/* Active indicator bar */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r"
                                        style={{ background: 'var(--accent-primary)' }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="mb-1">{item.icon}</span>
                                <span
                                    className="text-[10px] font-medium"
                                    style={{
                                        letterSpacing: '0.02em',
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                    }}
                                >
                                    {item.label}
                                </span>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>

            {/* User avatar */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150"
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-secondary)',
                }}
            >
                {icons.user}
            </motion.div>
        </nav>
    );
}
