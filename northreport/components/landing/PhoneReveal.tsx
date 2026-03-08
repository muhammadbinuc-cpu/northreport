"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";

/* ── Mock phone screens ─────────────────────────────────────── */

function FeedScreen() {
  const items = [
    { category: "Road", title: "Pothole on King St W", votes: 24, time: "2m ago" },
    { category: "Safety", title: "Broken streetlight at Erb & Caroline", votes: 18, time: "15m ago" },
    { category: "Waste", title: "Illegal dumping near park", votes: 11, time: "1h ago" },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: "#f8f7f5" }}>
      <div
        className="px-4 py-3 flex items-center gap-2 flex-shrink-0"
        style={{ background: "#fff", borderBottom: "1px solid #e8e2d9" }}
      >
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "#8b1a2b" }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <polygon points="5,1 6,5 5,4.5 4,5" fill="white" />
          </svg>
        </div>
        <span className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>
          NorthReport Feed
        </span>
      </div>
      <div className="flex-1 overflow-hidden p-3 space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl p-3"
            style={{ background: "#fff", border: "1px solid #e8e2d9" }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: "#f2d5da", color: "#8b1a2b" }}
              >
                {item.category}
              </span>
              <span className="text-[10px]" style={{ color: "#8a8279" }}>
                {item.time}
              </span>
            </div>
            <p className="text-[11px] font-medium leading-snug" style={{ color: "#1a1a1a" }}>
              {item.title}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#8b1a2b">
                <path d="M12 4l-8 8h5v8h6v-8h5z" />
              </svg>
              <span className="text-[10px] font-medium" style={{ color: "#8b1a2b" }}>
                {item.votes}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeatmapScreen() {
  const dots = [
    { x: 28, y: 38, r: 48, o: 0.75 },
    { x: 62, y: 22, r: 34, o: 0.55 },
    { x: 50, y: 62, r: 40, o: 0.65 },
    { x: 18, y: 68, r: 26, o: 0.45 },
    { x: 74, y: 52, r: 30, o: 0.5 },
    { x: 40, y: 82, r: 20, o: 0.35 },
  ];

  return (
    <div className="h-full relative" style={{ background: "#111" }}>
      {/* Subtle grid */}
      {[20, 40, 60, 80].map((p) => (
        <div
          key={`h${p}`}
          className="absolute left-0 right-0"
          style={{ top: `${p}%`, height: 1, background: "rgba(255,255,255,0.05)" }}
        />
      ))}
      {[20, 40, 60, 80].map((p) => (
        <div
          key={`v${p}`}
          className="absolute top-0 bottom-0"
          style={{ left: `${p}%`, width: 1, background: "rgba(255,255,255,0.05)" }}
        />
      ))}

      {/* Heat dots */}
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.r,
            height: d.r,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, rgba(139,26,43,${d.o}) 0%, rgba(139,26,43,0) 70%)`,
          }}
        />
      ))}

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="text-[10px]" style={{ color: "#8a8279" }}>
          Live Heatmap View
        </span>
      </div>
    </div>
  );
}

function VoiceScreen() {
  return (
    <div
      className="h-full flex flex-col items-center justify-center gap-4"
      style={{ background: "#fff" }}
    >
      {/* Pulsing rings + mic */}
      <div className="relative flex items-center justify-center w-28 h-28">
        <div
          className="absolute inset-0 rounded-full animate-mic-pulse"
          style={{ background: "rgba(139,26,43,0.08)" }}
        />
        <div
          className="absolute inset-2 rounded-full animate-mic-pulse-delay"
          style={{ background: "rgba(139,26,43,0.12)" }}
        />
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center z-10"
          style={{ background: "#8b1a2b" }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </div>
      </div>
      <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
        Listening...
      </p>
      <p className="text-xs" style={{ color: "#8a8279" }}>
        Say &ldquo;Hey NorthReport&rdquo;
      </p>
    </div>
  );
}

/* ── Feature descriptions ───────────────────────────────────── */

const FEATURES = [
  {
    side: "left",
    title: "Community Feed",
    description:
      "Real-time ranked feed of community reports. See what matters most in your neighborhood. Upvote issues to help prioritize city resources.",
  },
  {
    side: "right",
    title: "City Heatmap",
    description:
      "Snap Map-style heatmap with privacy-preserving bucketing. See where issues cluster without exposing individual reporters.",
  },
  {
    side: "left",
    title: "Hands-Free Voice",
    description:
      '"Hey NorthReport" — navigate, report issues, and ask questions entirely by voice. Powered by ElevenLabs.',
  },
] as const;

/* ── Phone frame ────────────────────────────────────────────── */

function PhoneFrame({
  s1o,
  s2o,
  s3o,
  phoneY,
}: {
  s1o: MotionValue<number>;
  s2o: MotionValue<number>;
  s3o: MotionValue<number>;
  phoneY: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{ y: phoneY }}
      className="relative flex-shrink-0 z-10"
    >
      <div
        style={{
          width: 256,
          height: 520,
          borderRadius: "2.5rem",
          border: "3px solid #333333",
          background: "#111111",
          overflow: "hidden",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          position: "relative",
        }}
      >
        {/* Dynamic island */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 80,
            height: 22,
            background: "#000",
            borderRadius: 12,
            zIndex: 20,
          }}
        />

        {/* Screens */}
        <div style={{ position: "absolute", inset: 0, paddingTop: 40 }}>
          <motion.div style={{ opacity: s1o, position: "absolute", inset: 0, paddingTop: 40 }}>
            <FeedScreen />
          </motion.div>
          <motion.div style={{ opacity: s2o, position: "absolute", inset: 0, paddingTop: 40 }}>
            <HeatmapScreen />
          </motion.div>
          <motion.div style={{ opacity: s3o, position: "absolute", inset: 0, paddingTop: 40 }}>
            <VoiceScreen />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main section ───────────────────────────────────────────── */

export default function PhoneReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 25,
  });

  // Phone slides up from below viewport
  const rawPhoneY = useTransform(smoothProgress, [0, 0.2], [600, 0]);
  const phoneY = useSpring(rawPhoneY, { stiffness: 120, damping: 30 });

  // Screen opacities — scroll-driven crossfade
  const f1o = useTransform(smoothProgress, [0, 0.25, 0.33], [1, 1, 0]);
  const f2o = useTransform(smoothProgress, [0.25, 0.33, 0.58, 0.66], [0, 1, 1, 0]);
  const f3o = useTransform(smoothProgress, [0.58, 0.66, 1], [0, 1, 1]);

  // Feature text Y transforms (subtle slide in sync with opacity)
  const f1y = useTransform(smoothProgress, [0, 0.15], [30, 0]);
  const f2y = useTransform(smoothProgress, [0.25, 0.38], [30, 0]);
  const f3y = useTransform(smoothProgress, [0.58, 0.71], [30, 0]);

  const featureOpacities: MotionValue<number>[] = [f1o, f2o, f3o];
  const featureYs: MotionValue<number>[] = [f1y, f2y, f3y];

  return (
    <div
      ref={containerRef}
      style={{ height: "300vh", background: "#1a1a1a" }}
    >
      <div
        className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="w-full max-w-6xl mx-auto px-6 flex items-center justify-center gap-12 relative">

          {/* Left feature text area (features 1 & 3) */}
          <div className="hidden lg:block flex-1 relative" style={{ height: 200 }}>
            {[0, 2].map((fi) => (
              <motion.div
                key={fi}
                className="absolute inset-0 flex flex-col justify-center items-end text-right"
                style={{ opacity: featureOpacities[fi], y: featureYs[fi] }}
              >
                <h3
                  className="text-3xl font-bold text-white leading-tight mb-3"
                >
                  {FEATURES[fi].title}
                </h3>
                <p
                  className="text-base leading-relaxed max-w-xs"
                  style={{ color: "#a1a1a1" }}
                >
                  {FEATURES[fi].description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Phone */}
          <PhoneFrame
            s1o={f1o}
            s2o={f2o}
            s3o={f3o}
            phoneY={phoneY}
          />

          {/* Right feature text area (feature 2) */}
          <div className="hidden lg:block flex-1 relative" style={{ height: 200 }}>
            <motion.div
              className="absolute inset-0 flex flex-col justify-center"
              style={{ opacity: f2o, y: f2y }}
            >
              <h3 className="text-3xl font-bold text-white leading-tight mb-3">
                {FEATURES[1].title}
              </h3>
              <p
                className="text-base leading-relaxed max-w-xs"
                style={{ color: "#a1a1a1" }}
              >
                {FEATURES[1].description}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Mobile: feature text below phone */}
        <div className="lg:hidden absolute bottom-16 left-0 right-0 px-8 text-center">
          {FEATURES.map((f, fi) => (
            <motion.div
              key={fi}
              className="absolute left-8 right-8 text-center"
              style={{ opacity: featureOpacities[fi], y: featureYs[fi] }}
            >
              <h3 className="text-2xl font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm" style={{ color: "#a1a1a1" }}>
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
