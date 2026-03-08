'use client';

import { useState, useEffect } from 'react';

interface AutoFileViewerProps {
  filingId: string;
}

interface FilingStatus {
  status: string;
  confirmationNumber: string | null;
  agentLog: string[];
  lastScreenshot: string | null;
}

export default function AutoFileViewer({ filingId }: AutoFileViewerProps) {
  const [filing, setFiling] = useState<FilingStatus | null>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!polling) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/auto-file/${filingId}/status`);
        if (res.ok) {
          const data = await res.json();
          setFiling(data);
          if (data.status === 'completed' || data.status === 'failed') {
            setPolling(false);
          }
        }
      } catch {
        // ignore
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [filingId, polling]);

  if (!filing) {
    return (
      <div className="glass-card p-6 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading filing status...</span>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">311 Filing Agent</h4>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            filing.status === 'completed'
              ? 'bg-emerald-500/20 text-emerald-400'
              : filing.status === 'failed'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          {filing.status}
        </span>
      </div>

      {filing.confirmationNumber && (
        <div className="bg-emerald-500/10 rounded-lg p-3">
          <p className="text-xs text-[#888]">Confirmation Number</p>
          <p className="text-lg font-mono font-bold text-emerald-400">
            {filing.confirmationNumber}
          </p>
        </div>
      )}

      {/* Agent log */}
      <div className="space-y-1">
        <p className="text-xs text-[#888]">Agent Log</p>
        {filing.agentLog.map((log, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="text-[#6366f1] mt-0.5">
              {i === filing.agentLog.length - 1 && filing.status === 'in_progress' ? (
                <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              ) : (
                '✓'
              )}
            </span>
            <span className="text-[#ccc]">{log}</span>
          </div>
        ))}
      </div>

      {filing.lastScreenshot && (
        <div>
          <p className="text-xs text-[#888] mb-1">Last Screenshot</p>
          <img
            src={`data:image/png;base64,${filing.lastScreenshot}`}
            alt="Agent screenshot"
            className="w-full rounded-lg border border-white/10"
          />
        </div>
      )}
    </div>
  );
}
