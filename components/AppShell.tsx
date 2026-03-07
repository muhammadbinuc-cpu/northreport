'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import SideNav from './SideNav';
import VoiceListener from './VoiceListener';
import { VoiceControlProvider, useVoiceControl } from '@/lib/voiceContext';

interface AppShellProps {
    children: ReactNode;
}

const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

const pageTransition = {
    duration: 0.3,
    ease: 'easeInOut' as const,
};

function AppShellInner({ children }: AppShellProps) {
    const pathname = usePathname();
    const isMapPage = pathname === '/map';
    const { paused } = useVoiceControl();

    return (
        <div className="min-h-screen relative">
            {/* Left Rail Navigation - fixed, overlays everything */}
            <SideNav />

            {/* Global Voice Navigation — paused when camera is open */}
            <VoiceListener enabled={!paused} />

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                <motion.main
                    key={pathname}
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                    className={`min-h-screen ${isMapPage ? '' : 'ml-[72px] bg-paper-base'}`}
                    style={isMapPage ? {} : { background: 'var(--paper-base)' }}
                >
                    {children}
                </motion.main>
            </AnimatePresence>
        </div>
    );
}

export default function AppShell({ children }: AppShellProps) {
    return (
        <VoiceControlProvider>
            <AppShellInner>{children}</AppShellInner>
        </VoiceControlProvider>
    );
}
