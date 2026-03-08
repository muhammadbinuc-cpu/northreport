'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';

const textLines = [
  'What if reporting took 10 seconds?',
  'What if AI could see the patterns humans miss?',
  'What if your voice alone could fix your street?',
];

function TextLine({
  line,
  index,
  isLast,
  progress,
}: {
  line: string;
  index: number;
  isLast: boolean;
  progress: MotionValue<number>;
}) {
  const lineStart = 0.35 + index * 0.18;
  const opacity = useTransform(
    progress,
    [lineStart, lineStart + 0.12, lineStart + 0.3, lineStart + 0.38],
    [0, 1, 1, isLast ? 1 : 0.3]
  );
  const y = useTransform(progress, [lineStart, lineStart + 0.12], [25, 0]);

  return (
    <motion.p
      className="text-lg md:text-2xl font-semibold text-center"
      style={{
        opacity,
        y,
        color: '#14b8a6',
        textShadow: '0 0 30px rgba(20,184,166,0.3), 0 2px 20px rgba(0,0,0,0.8)',
      }}
    >
      {line}
    </motion.p>
  );
}

export default function SolutionReveal({
  scrollY,
}: {
  scrollY: MotionValue<number>;
}) {
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const sectionStart = vh * 2.5;
  const sectionLength = vh * 1.3;

  const progress = useTransform(
    scrollY,
    [sectionStart, sectionStart + sectionLength],
    [0, 1]
  );

  const pulseX = useTransform(progress, [0, 0.3], ['-10%', '110%']);
  const pulseOpacity = useTransform(progress, [0, 0.05, 0.25, 0.35], [0, 1, 1, 0]);

  const markersOpacity = useTransform(progress, [0.25, 0.4], [0, 1]);
  const markersScale = useTransform(progress, [0.25, 0.4], [0.5, 1]);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      {/* Teal scan pulse wave */}
      <motion.div
        className="absolute bottom-0"
        style={{
          left: pulseX,
          opacity: pulseOpacity,
          width: '4px',
          height: '60vh',
          background: 'linear-gradient(to top, #14b8a6, transparent)',
          boxShadow: '0 0 40px 15px rgba(20, 184, 166, 0.3), 0 0 80px 30px rgba(20, 184, 166, 0.1)',
        }}
      />

      {/* Glow markers */}
      <motion.div style={{ opacity: markersOpacity, scale: markersScale }}>
        {[
          { bottom: '39vh', left: '14%' },
          { bottom: '53vh', left: '47%' },
          { bottom: '57vh', right: '17%' },
        ].map((pos, i) => (
          <div key={i} className="absolute" style={pos}>
            <div className="relative">
              <div
                className="w-4 h-4 rounded-full bg-teal-400"
                style={{
                  boxShadow: '0 0 12px 4px rgba(20,184,166,0.5), 0 0 24px 8px rgba(20,184,166,0.2)',
                }}
              />
              <div
                className="absolute inset-0 w-4 h-4 rounded-full bg-teal-400/50 animate-ping"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Text reveals */}
      <div className="absolute top-[12%] left-0 right-0 flex flex-col items-center gap-6 px-6">
        {textLines.map((line, i) => (
          <TextLine
            key={i}
            line={line}
            index={i}
            isLast={i === textLines.length - 1}
            progress={progress}
          />
        ))}
      </div>
    </div>
  );
}
