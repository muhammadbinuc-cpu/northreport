'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

interface ProblemDef {
  icon: ReactNode;
  label: string;
  position: CSSProperties;
  scrollRange: [number, number];
}

const problems: ProblemDef[] = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <ellipse cx="18" cy="22" rx="14" ry="8" fill="#292524" stroke="#f59e0b" strokeWidth="1.5" />
        <ellipse cx="18" cy="22" rx="8" ry="4" fill="#1c1917" />
        <path d="M14 20 Q18 16 22 20" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    ),
    label: 'Pothole reported 3 weeks ago. Still there.',
    position: { bottom: '38vh', left: '12%' },
    scrollRange: [0.0, 0.3],
  },
  {
    icon: (
      <svg width="32" height="56" viewBox="0 0 32 56" fill="none">
        <rect x="14" y="16" width="4" height="40" fill="#374151" rx="2" />
        <circle cx="16" cy="12" r="8" fill="#1f2937" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="16" cy="12" r="4" fill="#f59e0b" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.08;0.3" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    label: 'Broken light. 12 complaints. No action.',
    position: { bottom: '52vh', left: '45%' },
    scrollRange: [0.15, 0.5],
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="4" width="32" height="32" fill="#1f2937" stroke="#374151" strokeWidth="1" rx="2" />
        <path d="M8 12 L18 28 L24 18 L32 32" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
        <path d="M12 8 L14 20" stroke="#f59e0b" strokeWidth="0.8" opacity="0.6" />
        <path d="M26 10 L22 22" stroke="#f59e0b" strokeWidth="0.8" opacity="0.6" />
      </svg>
    ),
    label: 'Infrastructure decay. Invisible until it\'s too late.',
    position: { bottom: '56vh', right: '15%' },
    scrollRange: [0.3, 0.65],
  },
];

function ProblemItem({
  problem,
  sectionProgress,
}: {
  problem: ProblemDef;
  sectionProgress: MotionValue<number>;
}) {
  const opacity = useTransform(
    sectionProgress,
    [
      problem.scrollRange[0],
      problem.scrollRange[0] + 0.15,
      problem.scrollRange[1],
      problem.scrollRange[1] + 0.15,
    ],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    sectionProgress,
    [problem.scrollRange[0], problem.scrollRange[0] + 0.15],
    [20, 0]
  );

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-2"
      style={{ ...problem.position, opacity, y }}
    >
      <div className="drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
        {problem.icon}
      </div>
      <span
        className="text-xs md:text-sm text-amber-400/90 font-medium text-center max-w-[200px] whitespace-nowrap"
        style={{ textShadow: '0 0 20px rgba(0,0,0,0.8)' }}
      >
        {problem.label}
      </span>
    </motion.div>
  );
}

export default function ProblemOverlay({
  scrollY,
}: {
  scrollY: MotionValue<number>;
}) {
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const sectionStart = vh;
  const sectionLength = vh * 1.5;

  const sectionProgress = useTransform(
    scrollY,
    [sectionStart, sectionStart + sectionLength],
    [0, 1]
  );

  const summaryOpacity = useTransform(sectionProgress, [0.7, 0.9], [0, 1]);
  const summaryY = useTransform(sectionProgress, [0.7, 0.9], [30, 0]);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      {problems.map((problem, i) => (
        <ProblemItem key={i} problem={problem} sectionProgress={sectionProgress} />
      ))}

      <motion.div
        className="absolute top-[15%] left-0 right-0 text-center px-6"
        style={{ opacity: summaryOpacity, y: summaryY }}
      >
        <p
          className="text-lg md:text-2xl text-[#e2e8f0] font-medium max-w-2xl mx-auto leading-relaxed"
          style={{ textShadow: '0 2px 30px rgba(0,0,0,0.9)' }}
        >
          Every neighborhood has problems hiding in plain sight.
          <br />
          <span className="text-amber-400/80">
            311 takes 20 minutes to file. Most people don&apos;t bother.
          </span>
        </p>
      </motion.div>
    </div>
  );
}
