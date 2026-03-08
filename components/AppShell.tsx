'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import SideNav from './SideNav';
import VoiceListener from './VoiceListener';
import { VoiceControlProvider, useVoiceControl } from '@/lib/voiceContext';

interface AppShellProps {
    children: ReactNode;
}

function AppShellInner({ children }: AppShellProps) {
    const pathname = usePathname();
    const isMapPage = pathname === '/map';
    const { paused } = useVoiceControl();

    return (
        <div className="min-h-screen relative">
            {/* Navigation */}
            <SideNav />

            {/* Global Voice Navigation */}
            <VoiceListener enabled={!paused} />

            {/* Main Content Area */}
            <main
                className={`min-h-screen pt-14 ${isMapPage ? '' : 'pb-20 md:pb-0'}`}
                style={{ background: isMapPage ? '#ffffff' : 'var(--bg-base)' }}
            >
                {children}
            </main>
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
