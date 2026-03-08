'use client';

import { useRef, useMemo } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';

interface Building {
  width: number;
  height: number;
  left: number;
  windows: { row: number; col: number }[];
  shade: string;
}

function generateBuildings(count: number): Building[] {
  const buildings: Building[] = [];
  const shades = ['#0d1117', '#111827', '#0f172a', '#131a2b', '#0e1525'];
  let x = -2;
  for (let i = 0; i < count; i++) {
    const w = 4 + Math.random() * 6;
    const h = 15 + Math.random() * 30;
    const windows: { row: number; col: number }[] = [];
    const cols = Math.floor(w / 2.2);
    const rows = Math.floor(h / 4);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.35) windows.push({ row: r, col: c });
      }
    }
    buildings.push({
      width: w,
      height: h,
      left: x,
      windows,
      shade: shades[i % shades.length],
    });
    x += w + 0.3 + Math.random() * 1.5;
  }
  return buildings;
}

export default function CityScene({ scrollY }: { scrollY: MotionValue<number> }) {
  const buildings = useMemo(() => generateBuildings(22), []);
  const flickerRef = useRef<number>(7);

  const skyGradient = useTransform(
    scrollY,
    [0, 2500],
    [
      'linear-gradient(to bottom, #050a18 0%, #0a1628 40%, #0f1a2a 100%)',
      'linear-gradient(to bottom, #030810 0%, #070e1a 40%, #0a0f1a 100%)',
    ]
  );

  return (
    <motion.div
      className="fixed inset-0 z-0 overflow-hidden"
      style={{ background: skyGradient }}
    >
      {/* Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() > 0.8 ? 2 : 1,
              height: Math.random() > 0.8 ? 2 : 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              opacity: 0.2 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>

      {/* City skyline */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '45vh' }}>
        <svg
          viewBox="0 0 100 50"
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ display: 'block' }}
        >
          {buildings.map((b, i) => (
            <g key={i}>
              <rect
                x={b.left}
                y={50 - b.height}
                width={b.width}
                height={b.height}
                fill={b.shade}
                stroke="rgba(255,255,255,0.03)"
                strokeWidth={0.1}
              />
              {b.windows.map((w, wi) => {
                const isFlicker = i === flickerRef.current && w.row === 0;
                return (
                  <rect
                    key={wi}
                    x={b.left + 0.6 + w.col * 2.2}
                    y={50 - b.height + 1.5 + w.row * 4}
                    width={1.2}
                    height={1.8}
                    fill={isFlicker ? '#f59e0b' : '#14b8a6'}
                    opacity={isFlicker ? 0.15 : 0.08 + Math.random() * 0.12}
                    rx={0.15}
                  />
                );
              })}
            </g>
          ))}
          {/* Ground line */}
          <rect x={0} y={49.5} width={100} height={0.5} fill="#0a0a0f" />
        </svg>
      </div>

      {/* Ground */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '2vh',
          background: 'linear-gradient(to bottom, #0a0f1a, #0a0a0f)',
        }}
      />
    </motion.div>
  );
}
