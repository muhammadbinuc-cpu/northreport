'use client';

import NavBar from '@/components/NavBar';
import ReportForm from '@/components/ReportForm';

export default function ReportPage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 glass-card rounded-none border-t-0 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-bold">
            Submit <span className="text-[#6366f1]">Report</span>
          </h1>
          <p className="text-xs text-[#888]">Report a safety or infrastructure issue</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <ReportForm />
      </main>

      <NavBar />
    </div>
  );
}
