'use client';

import Image from 'next/image';
import AppShell from '@/components/AppShell';
import SmartReportAgent from '@/components/SmartReportAgent';

export default function ReportPage() {
  return (
    <AppShell>
      <div className="flex flex-col min-h-screen">
        {/* Page Header — cream tinted */}
        <header
          className="px-6 py-5 shrink-0 flex items-center gap-4"
          style={{
            background: 'var(--palette-cream)',
            borderBottom: '1px solid var(--border-hairline)',
          }}
        >
          <Image
            src="/logo.png"
            alt="NorthReport"
            width={48}
            height={48}
            className="rounded-lg"
          />
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Report an Issue
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              AI-powered intake — snap a photo and let the agent handle the rest
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[580px] mx-auto px-6 py-8 pb-12">
            <SmartReportAgent />
          </div>
        </main>
      </div>
    </AppShell>
  );
}
