'use client';

import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import PatternCard from '@/components/PatternCard';
import { NEIGHBORHOODS } from '@/lib/constants';

export default function PatternsPage() {
  const [neighborhood, setNeighborhood] = useState('downtown-hamilton');
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/patterns?neighborhood=${neighborhood}`);
        if (res.ok) {
          const data = await res.json();
          setPatterns(data.patterns || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [neighborhood]);

  const detectPatterns = async () => {
    setDetecting(true);
    try {
      const res = await fetch('/api/patterns/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ neighborhood }),
      });
      if (res.ok) {
        const data = await res.json();
        setPatterns((prev) => [...data.patterns, ...prev]);
      }
    } catch {
      // ignore
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 glass-card rounded-none border-t-0 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">
              Pattern <span className="text-[#6366f1]">Alerts</span>
            </h1>
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="text-xs text-[#888] bg-transparent outline-none cursor-pointer"
            >
              {NEIGHBORHOODS.map((n) => (
                <option key={n.slug} value={n.slug}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={detectPatterns}
            disabled={detecting}
            className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e6] rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {detecting ? 'Detecting...' : 'Detect Patterns'}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : patterns.length > 0 ? (
          patterns.map((p, i) => <PatternCard key={p._id || i} pattern={p} />)
        ) : (
          <div className="glass-card p-8 text-center text-[#888]">
            <p>No patterns detected yet.</p>
            <p className="text-sm mt-2">Click &quot;Detect Patterns&quot; to analyze recent data.</p>
          </div>
        )}
      </main>

      <NavBar />
    </div>
  );
}
