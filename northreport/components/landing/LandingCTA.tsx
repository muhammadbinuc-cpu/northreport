'use client';

import Link from 'next/link';
import { motion, useTransform, type MotionValue } from 'framer-motion';

export default function LandingCTA({
  scrollY,
}: {
  scrollY: MotionValue<number>;
}) {
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const sectionStart = vh * 4.8;
  const sectionLength = vh * 0.4;

  const progress = useTransform(
    scrollY,
    [sectionStart, sectionStart + sectionLength],
    [0, 1]
  );

  const opacity = useTransform(progress, [0, 0.5], [0, 1]);
  const scale = useTransform(progress, [0, 0.5], [0.95, 1]);
  const bgOpacity = useTransform(progress, [0, 0.4], [0, 0.7]);

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          backgroundColor: 'rgba(10, 10, 15, 1)',
          opacity: bgOpacity,
        }}
      />

      {/* CTA Content */}
      <motion.div
        className="fixed inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
        style={{ opacity, scale }}
      >
        <div className="text-center px-6 pointer-events-auto">
          <h2
            className="text-3xl md:text-5xl font-bold mb-8 text-[#e2e8f0]"
            style={{ textShadow: '0 0 40px rgba(20,184,166,0.2)' }}
          >
            Your neighborhood deserves
            <br />
            <span className="text-teal-400">to be heard.</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-[#0a0a0f] font-semibold rounded-2xl transition-colors text-lg"
              style={{
                boxShadow: '0 0 24px rgba(20,184,166,0.3), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              Get Started
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 rounded-2xl font-semibold text-lg transition-colors border border-[rgba(255,255,255,0.15)] text-[#e2e8f0] hover:bg-[rgba(255,255,255,0.05)]"
            >
              Learn More
            </Link>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 opacity-60">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1 L10 5 L14 6 L11 9 L12 14 L8 11.5 L4 14 L5 9 L2 6 L6 5 Z"
                  fill="#14b8a6"
                  opacity="0.8"
                />
              </svg>
            </div>
            <span className="text-sm font-medium tracking-wide">
              Safe<span className="text-teal-400">Pulse</span>
            </span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
