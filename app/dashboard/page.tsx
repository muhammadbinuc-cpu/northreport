'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import NavBar from '@/components/NavBar';
import HealthGauge from '@/components/HealthGauge';
import PatternCard from '@/components/PatternCard';
import { NEIGHBORHOODS } from '@/lib/constants';

export default function DashboardPage() {
  const { user } = useUser();
  const [neighborhood, setNeighborhood] = useState('downtown-hamilton');
  const [health, setHealth] = useState<any>(null);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [healthRes, patternsRes] = await Promise.all([
          fetch(`/api/health?neighborhood=${neighborhood}`),
          fetch(`/api/patterns?neighborhood=${neighborhood}`),
        ]);

        if (healthRes.ok) setHealth(await healthRes.json());
        if (patternsRes.ok) {
          const data = await patternsRes.json();
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
        setPatterns(data.patterns || []);
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
              Leader <span className="text-[#6366f1]">Dashboard</span>
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
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Health scores */}
            {health && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h3 className="text-sm font-semibold text-[#888] mb-4">Neighborhood Health</h3>
                <div className="flex justify-around">
                  <HealthGauge label="Overall" value={health.overall} color="#6366f1" />
                  <HealthGauge label="Infrastructure" value={health.infrastructure} color="#ff8c00" />
                  <HealthGauge label="Safety" value={health.safety} color="#00d4aa" />
                </div>
                <div className="flex justify-around mt-4 text-xs text-[#888]">
                  <span>{health.reportCount7d} reports (7d)</span>
                  <span>{health.voiceCount7d} voices (7d)</span>
                  <span className="capitalize">Trend: {health.trendDirection}</span>
                </div>
              </motion.div>
            )}

            {/* Quick links */}
            <div className="grid grid-cols-3 gap-3">
              <Link
                href="/dashboard/patterns"
                className="glass-card p-4 text-center hover:bg-white/10 transition-colors"
              >
                <span className="text-2xl">📈</span>
                <p className="text-xs mt-1">Patterns</p>
              </Link>
              <Link
                href="/dashboard/digest"
                className="glass-card p-4 text-center hover:bg-white/10 transition-colors"
              >
                <span className="text-2xl">📋</span>
                <p className="text-xs mt-1">Digest</p>
              </Link>
              <Link
                href="/dashboard/auto-file"
                className="glass-card p-4 text-center hover:bg-white/10 transition-colors"
              >
                <span className="text-2xl">📝</span>
                <p className="text-xs mt-1">311 Filing</p>
              </Link>
            </div>

            {/* Patterns */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Recent Patterns</h3>
                <button
                  onClick={detectPatterns}
                  disabled={detecting}
                  className="px-3 py-1.5 bg-[#6366f1] hover:bg-[#5558e6] rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {detecting ? 'Detecting...' : 'Detect Patterns'}
                </button>
              </div>

              {patterns.length > 0 ? (
                <div className="space-y-3">
                  {patterns.map((p, i) => (
                    <PatternCard key={p._id || i} pattern={p} />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-6 text-center text-[#888] text-sm">
                  No patterns detected. Click &quot;Detect Patterns&quot; to analyze.
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <NavBar />
    </div>
  );
}
