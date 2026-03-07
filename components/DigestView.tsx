'use client';

import { useState } from 'react';
import { Shield, Plus, Map as MapIcon, Info } from 'lucide-react';
import Link from 'next/link';

// Simple markdown to HTML parser
function parseMarkdown(markdown: string): string {
  let html = markdown;

  html = html.replace(/^### (.*)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2 text-[#a78bfa]">$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1 class="text-xl font-bold mt-4 mb-3">$1</h1>');

  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inUnorderedList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      if (inUnorderedList) { processedLines.push('</ul>'); inUnorderedList = false; }
      if (inOrderedList) { processedLines.push('</ol>'); inOrderedList = false; }
      continue;
    }

    const unorderedMatch = trimmedLine.match(/^[-*] (.*)$/);
    if (unorderedMatch) {
      if (!inUnorderedList) {
        if (inOrderedList) { processedLines.push('</ol>'); inOrderedList = false; }
        processedLines.push('<ul class="list-disc list-inside space-y-1 my-2">');
        inUnorderedList = true;
      }
      processedLines.push(`<li>${unorderedMatch[1]}</li>`);
      continue;
    }

    const orderedMatch = trimmedLine.match(/^\d+\. (.*)$/);
    if (orderedMatch) {
      if (!inOrderedList) {
        if (inUnorderedList) { processedLines.push('</ul>'); inUnorderedList = false; }
        processedLines.push('<ol class="list-decimal list-inside space-y-1 my-2">');
        inOrderedList = true;
      }
      processedLines.push(`<li>${orderedMatch[1]}</li>`);
      continue;
    }

    if (inUnorderedList) { processedLines.push('</ul>'); inUnorderedList = false; }
    if (inOrderedList) { processedLines.push('</ol>'); inOrderedList = false; }

    if (trimmedLine.startsWith('<h') || trimmedLine.startsWith('<ul') || trimmedLine.startsWith('<ol')) {
      processedLines.push(line);
    } else {
      processedLines.push(`<p class="my-2">${line}</p>`);
    }
  }

  if (inUnorderedList) processedLines.push('</ul>');
  if (inOrderedList) processedLines.push('</ol>');

  return processedLines.join('\n');
}

// Professional Empty State Component
const DigestEmptyState = ({ neighborhood }: { neighborhood: string }) => {
  const label = neighborhood.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="flex flex-col items-center py-12 w-full space-y-12 animate-in fade-in slide-in-from-bottom-4">
      {/* Monitoring indicator */}
      <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-widest">Monitoring for community activity...</span>
      </div>

      {/* Main card */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-10 text-center shadow-2xl max-w-lg">
        <div className="bg-indigo-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">No safety reports yet for {label}</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Your weekly digest will automatically appear here once residents begin submitting reports.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/report"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Create First Report
          </Link>
          <Link
            href="/map"
            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center"
          >
            <MapIcon className="w-4 h-4 mr-2" /> View Live Map
          </Link>
        </div>
      </div>

      {/* Faded Preview Section */}
      <div className="w-full opacity-10 grayscale pointer-events-none select-none px-4 max-w-xl">
        <div className="flex items-center mb-4 space-x-2">
          <Info className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Example Weekly Digest Preview</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {['3 Potholes', '2 Outages', '1 Flooding'].map((t, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white">
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type DigestStatus = 'IDLE' | 'LOADING' | 'EMPTY' | 'READY' | 'ERROR';

export default function DigestView({ neighborhood }: { neighborhood: string }) {
  const [markdown, setMarkdown] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [status, setStatus] = useState<DigestStatus>('IDLE');

  const generateDigest = async () => {
    setStatus('LOADING');
    setMarkdown('');

    try {
      const res = await fetch(`/api/digest?neighborhood=${neighborhood}`);
      const data = await res.json();

      if (data.status === "EMPTY") {
        setStatus('EMPTY');
      } else if (res.ok && data.status === "SUCCESS") {
        setMarkdown(data.markdown);
        setGeneratedAt(data.generatedAt);
        setStatus('READY');
      } else {
        setStatus('ERROR');
      }
    } catch {
      setStatus('ERROR');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Weekly Digest</h3>
        <button
          onClick={generateDigest}
          disabled={status === 'LOADING'}
          className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e6] rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {status === 'LOADING' && (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {status === 'LOADING' ? 'Generating...' : 'Generate Digest'}
        </button>
      </div>

      {generatedAt && status === 'READY' && (
        <p className="text-xs text-[#888]">
          Generated: {new Date(generatedAt).toLocaleString()}
        </p>
      )}

      {/* Loading state */}
      {status === 'LOADING' && (
        <div className="glass-card p-8 text-center animate-pulse">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#a78bfa] font-medium">Generating your digest...</p>
            <p className="text-xs text-[#888]">This may take a few seconds</p>
          </div>
        </div>
      )}

      {/* Empty State - Professional UI */}
      {status === 'EMPTY' && (
        <DigestEmptyState neighborhood={neighborhood} />
      )}

      {/* Error State */}
      {status === 'ERROR' && (
        <div className="glass-card p-8 text-center border border-red-500/20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-400 font-medium">Failed to generate digest</p>
            <p className="text-sm text-[#888]">Please try again later.</p>
          </div>
        </div>
      )}

      {/* Rendered digest */}
      {status === 'READY' && markdown && (
        <div className="glass-card p-6 prose prose-invert prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }} />
        </div>
      )}

      {/* Initial idle state */}
      {status === 'IDLE' && (
        <div className="glass-card p-8 text-center text-[#888]">
          <p>Click &quot;Generate Digest&quot; to create a weekly safety summary</p>
        </div>
      )}
    </div>
  );
}
