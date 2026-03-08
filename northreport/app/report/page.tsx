'use client';

import AppShell from '@/components/AppShell';
import TopBar from '@/components/TopBar';
import SmartReportAgent from '@/components/SmartReportAgent';

export default function ReportPage() {
  return (
    <AppShell>
      <div className="flex flex-col h-screen">
        <TopBar title="City Intake Agent" showSearch={false} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[580px] mx-auto px-6 py-8">
            <SmartReportAgent />
          </div>
        </main>
      </div>
    </AppShell>
  );
}
