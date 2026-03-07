'use client';

import { motion } from 'framer-motion';
import SeverityChip from './SeverityChip';

interface Pattern {
  _id?: string;
  type: string;
  description: string;
  severity: string;
  w0Count: number;
  w1Count: number;
  recommendation?: string;
  detectedAt?: string;
}

export default function PatternCard({ pattern }: { pattern: Pattern }) {
  const changePercent =
    pattern.w1Count > 0
      ? Math.round(((pattern.w0Count - pattern.w1Count) / pattern.w1Count) * 100)
      : pattern.w0Count > 0
      ? 100
      : 0;

  const isUp = changePercent > 0;
  const typeIcon =
    pattern.type === 'cluster' ? '📍' : pattern.type === 'trend' ? '📈' : '⚠️';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card p-4 space-y-2 ${
        pattern.severity === 'critical' ? 'pulse-critical' : pattern.severity === 'high' ? 'pulse-high' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{typeIcon}</span>
        <span className="text-xs text-[#888] capitalize">{pattern.type}</span>
        <SeverityChip severity={pattern.severity} />
      </div>

      <p className="text-sm">{pattern.description}</p>

      <div className="flex items-center gap-4 text-xs">
        <span className="text-[#888]">
          This week: <span className="text-white font-medium">{pattern.w0Count}</span>
        </span>
        <span className="text-[#888]">
          Last week: <span className="text-white font-medium">{pattern.w1Count}</span>
        </span>
        {changePercent !== 0 && (
          <span className={isUp ? 'text-red-400' : 'text-emerald-400'}>
            {isUp ? '↑' : '↓'} {Math.abs(changePercent)}%
          </span>
        )}
      </div>

      {pattern.recommendation && (
        <p className="text-xs text-[#6366f1]">→ {pattern.recommendation}</p>
      )}
    </motion.div>
  );
}
