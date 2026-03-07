'use client';

import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import AutoFileViewer from '@/components/AutoFileViewer';
import SeverityChip from '@/components/SeverityChip';

export default function AutoFilePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filingId, setFilingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [filing, setFiling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/reports?limit=50');
        if (res.ok) {
          const data = await res.json();
          setReports(
            data.reports.filter(
              (r: any) =>
                ['critical', 'high'].includes(r.severity) &&
                ['new', 'acknowledged'].includes(r.status) &&
                !r.autoFiled311
            )
          );
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleFile = async (report: any) => {
    setSelectedReport(report);
  };

  const confirmFile = async () => {
    if (!selectedReport) return;
    setFiling(true);
    try {
      const res = await fetch('/api/auto-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: selectedReport._id }),
      });
      if (res.ok) {
        const data = await res.json();
        setFilingId(data.filingId);
        setSelectedReport(null);
      }
    } catch {
      // ignore
    } finally {
      setFiling(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 glass-card rounded-none border-t-0 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-bold">
            Assisted <span className="text-[#6366f1]">311 Filing</span>
          </h1>
          <p className="text-xs text-[#888]">AI-powered form submission to Hamilton 311</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Active filing viewer */}
        {filingId && <AutoFileViewer filingId={filingId} />}

        {/* Review screen */}
        {selectedReport && !filingId && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold">Review Before Filing to 311</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#888]">Category</span>
                <span>{selectedReport.category} &gt; {selectedReport.subcategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Severity</span>
                <SeverityChip severity={selectedReport.severity} />
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Location</span>
                <span>{selectedReport.locationApprox?.label || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-[#888]">Description</span>
                <p className="mt-1 text-[#ccc]">{selectedReport.description}</p>
              </div>
              {selectedReport.aiSummary && (
                <div>
                  <span className="text-[#888]">AI Summary</span>
                  <p className="mt-1 text-[#ccc] italic">{selectedReport.aiSummary}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={confirmFile}
                disabled={filing}
                className="flex-1 py-3 bg-[#6366f1] hover:bg-[#5558e6] rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {filing ? 'Submitting...' : 'Confirm & Submit to 311'}
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-3 bg-white/10 rounded-xl text-sm"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-[#888] text-center">Or say: &quot;Confirm submit&quot;</p>
          </div>
        )}

        {/* Eligible reports list */}
        {!selectedReport && !filingId && (
          <>
            <h3 className="text-sm font-semibold text-[#888]">
              Eligible Reports (High/Critical, Unfiled)
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <div key={report._id} className="glass-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <SeverityChip severity={report.severity} />
                    <span className="text-xs text-[#888]">
                      {report.category} &gt; {report.subcategory}
                    </span>
                  </div>
                  <p className="text-sm">{report.description?.substring(0, 150)}</p>
                  <p className="text-xs text-[#888]">{report.locationApprox?.label}</p>
                  <button
                    onClick={() => handleFile(report)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs text-red-400 transition-colors"
                  >
                    File to 311
                  </button>
                </div>
              ))
            ) : (
              <div className="glass-card p-8 text-center text-[#888] text-sm">
                No eligible reports for 311 filing.
              </div>
            )}
          </>
        )}
      </main>

      <NavBar />
    </div>
  );
}
