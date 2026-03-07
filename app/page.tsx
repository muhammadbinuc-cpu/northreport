'use client';

import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { user, isLoading } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/10 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6 max-w-2xl relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#6366f1] flex items-center justify-center text-2xl">
            🛡️
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Safe<span className="text-[#6366f1]">Pulse</span>
          </h1>
        </div>

        <p className="text-xl text-[#ccc] leading-relaxed">
          Every city has problems hiding in plain sight. SafePulse turns community signals into understanding — and understanding into action.
        </p>

        <div className="flex flex-wrap justify-center gap-3 text-sm text-[#888]">
          <span className="glass-card px-3 py-1.5">AI-Powered Analysis</span>
          <span className="glass-card px-3 py-1.5">Community Voices</span>
          <span className="glass-card px-3 py-1.5">Live Safety Map</span>
          <span className="glass-card px-3 py-1.5">Hands-Free Voice</span>
          <span className="glass-card px-3 py-1.5">Assisted 311 Filing</span>
        </div>

        <div className="pt-4">
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto" />
          ) : user ? (
            <Link
              href="/feed"
              className="inline-block px-8 py-4 bg-[#6366f1] hover:bg-[#5558e6] rounded-2xl text-lg font-semibold transition-colors shadow-lg shadow-[#6366f1]/25"
            >
              Open Pulse Feed →
            </Link>
          ) : (
            <Link
              href="/api/auth/login"
              className="inline-block px-8 py-4 bg-[#6366f1] hover:bg-[#5558e6] rounded-2xl text-lg font-semibold transition-colors shadow-lg shadow-[#6366f1]/25"
            >
              Get Started →
            </Link>
          )}
        </div>

        <p className="text-xs text-[#666]">
          Built for Hamilton, Ontario — powered by Gemini AI
        </p>
      </motion.div>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-4xl w-full relative z-10"
      >
        <div className="glass-card p-6 space-y-2">
          <span className="text-2xl">📡</span>
          <h3 className="font-semibold">Pulse Feed</h3>
          <p className="text-sm text-[#888]">
            Real-time ranked feed of community stories, posts, and reports.
          </p>
        </div>
        <div className="glass-card p-6 space-y-2">
          <span className="text-2xl">🗺️</span>
          <h3 className="font-semibold">Live City Map</h3>
          <p className="text-sm text-[#888]">
            Snap Map-style hotspot heatmap with privacy-preserving bucketing.
          </p>
        </div>
        <div className="glass-card p-6 space-y-2">
          <span className="text-2xl">🎤</span>
          <h3 className="font-semibold">Hands-Free Voice</h3>
          <p className="text-sm text-[#888]">
            &quot;Hey SafePulse&quot; — navigate, report, and ask questions by voice.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
