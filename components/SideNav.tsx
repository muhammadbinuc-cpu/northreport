'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import NorthReportLogo from './landing/NorthReportLogo';

const navItems = [
    {
        href: '/feed',
        label: 'Feed',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
            </svg>
        ),
    },
    {
        href: '/map',
        label: 'Map',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
        ),
    },
    {
        href: '/report',
        label: 'Report',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
        ),
    },
    {
        href: '/dashboard',
        label: 'Command',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
    },
];

export default function SideNav() {
    const pathname = usePathname();
    const isMapPage = pathname === '/map';
    const navBg = isMapPage ? 'rgba(255,255,255,0.95)' : 'rgba(245,240,225,0.92)';

    return (
        <>
            {/* Desktop top nav */}
            <nav
                className="fixed top-0 left-0 right-0 z-50 hidden md:flex items-center px-6"
                style={{
                    height: 'var(--main-nav-height, 56px)',
                    background: navBg,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--border-hairline)',
                }}
            >
                <Link href="/" className="flex items-center">
                    <NorthReportLogo size="sm" />
                </Link>

                <div className="flex-1" />

                <div className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname?.startsWith(item.href);
                        return (
                            <Link key={item.href} href={item.href}>
                                <span
                                    className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                                    style={{
                                        color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                                        background: isActive ? 'rgba(107,15,26,0.06)' : 'transparent',
                                    }}
                                >
                                    {item.icon}
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                <div className="w-6" />

                {/* User avatar */}
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                        background: 'rgba(107,15,26,0.08)',
                        color: 'var(--accent-primary)',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
            </nav>

            {/* Mobile bottom tab bar */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]"
                style={{
                    height: '64px',
                    background: isMapPage ? 'rgba(255,255,255,0.97)' : 'rgba(245,240,225,0.95)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderTop: '1px solid var(--border-hairline)',
                }}
            >
                {navItems.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 relative">
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-tab-indicator"
                                    className="absolute top-0 left-[25%] right-[25%] h-[2px] rounded-full"
                                    style={{ background: 'var(--accent-primary)' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                {item.icon}
                            </span>
                            <span
                                className="text-[10px] font-medium"
                                style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Mobile top bar (just logo) */}
            <div
                className="fixed top-0 left-0 right-0 z-50 flex md:hidden items-center px-4"
                style={{
                    height: 'var(--main-nav-height, 56px)',
                    background: navBg,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--border-hairline)',
                }}
            >
                <Link href="/" className="flex items-center">
                    <NorthReportLogo size="sm" />
                </Link>
                <div className="flex-1" />
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(107,15,26,0.08)', color: 'var(--accent-primary)' }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>
            </div>
        </>
    );
}
