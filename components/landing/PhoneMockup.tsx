"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PhoneMockupProps {
  visible: boolean;
  screen: "scanning" | "feed" | "heatmap";
  progress: number;
}

/* ── Corner bracket SVG ──────────────────────────────── */

function Bracket({ rotate }: { rotate: number }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path
        d="M2 10V4a2 2 0 012-2h6"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Scanning screen ─────────────────────────────────── */

function ScanningScreen({ progress }: { progress: number }) {
  // Show result card after progress passes ~0.65 within the scanning phase
  const showResult = progress > 0.65;

  return (
    <div
      className="h-full relative flex items-center justify-center"
      style={{ background: "#1a1a1a" }}
    >
      {/* Corner brackets */}
      <div className="absolute top-5 left-5"><Bracket rotate={0} /></div>
      <div className="absolute top-5 right-5"><Bracket rotate={90} /></div>
      <div className="absolute bottom-5 left-5"><Bracket rotate={270} /></div>
      <div className="absolute bottom-5 right-5"><Bracket rotate={180} /></div>

      {/* Scanning text */}
      <motion.p
        className="text-lg text-white font-medium"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontFamily: "var(--font-utility)" }}
      >
        Scanning...
      </motion.p>

      {/* Result card slides up */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-4 left-3 right-3 rounded-xl p-4"
            style={{ background: "#2a2a2a" }}
          >
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white mb-2"
              style={{ background: "#6b0f1a" }}
            >
              Pothole Detected
            </span>
            <p className="text-white text-xs font-medium mb-1">
              Roads Department — Region of Waterloo
            </p>
            <p className="text-[10px] mb-0.5" style={{ color: "#999" }}>
              Ontario MMS Section 16.3 cited
            </p>
            <p className="text-[10px]" style={{ color: "#999" }}>
              Report ready to file
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Feed screen ─────────────────────────────────────── */

function FeedScreen() {
  const items = [
    { category: "Road", title: "Pothole on King St W", votes: 24, time: "2m ago" },
    { category: "Safety", title: "Broken streetlight at Erb & Caroline", votes: 18, time: "15m ago" },
    { category: "Waste", title: "Illegal dumping near park", votes: 11, time: "1h ago" },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: "#faf7ed" }}>
      <div
        className="px-4 py-3 flex items-center gap-2 flex-shrink-0"
        style={{ background: "#fff", borderBottom: "1px solid rgba(107,15,26,0.1)" }}
      >
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "#6b0f1a" }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <polygon points="5,1 6,5 5,4.5 4,5" fill="white" />
          </svg>
        </div>
        <span
          className="text-xs font-semibold"
          style={{ color: "#1e1e1e", fontFamily: "var(--font-utility)" }}
        >
          NorthReport Feed
        </span>
      </div>
      <div className="flex-1 overflow-hidden p-3 space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl p-3"
            style={{
              background: "#fff",
              border: "1px solid rgba(107,15,26,0.1)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: "rgba(107,15,26,0.08)", color: "#6b0f1a" }}
              >
                {item.category}
              </span>
              <span className="text-[10px]" style={{ color: "#999" }}>
                {item.time}
              </span>
            </div>
            <p
              className="text-[11px] font-medium leading-snug"
              style={{ color: "#1e1e1e" }}
            >
              {item.title}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#6b0f1a">
                <path d="M12 4l-8 8h5v8h6v-8h5z" />
              </svg>
              <span
                className="text-[10px] font-medium"
                style={{ color: "#6b0f1a" }}
              >
                {item.votes}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Heatmap screen ──────────────────────────────────── */

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
            background: `radial-gradient(circle, rgba(107,15,26,${d.o}) 0%, rgba(107,15,26,0) 70%)`,
          }}
        />
      ))}

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="text-[10px]" style={{ color: "#999" }}>
          Live Heatmap View
        </span>
      </div>
    </div>
  );
}

/* ── PhoneMockup ─────────────────────────────────────── */

const PhoneMockup = React.memo(function PhoneMockup({ visible, screen, progress }: PhoneMockupProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100vh", opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed z-50 left-1/2"
          style={{ top: "50%", transform: "translate(-50%, -50%)", willChange: "transform, opacity" }}
        >
          <motion.div
            animate={{ y: 0 }}
            style={{ transform: "translateY(-50%)" }}
          >
            <div
              className="w-[240px] h-[500px] md:w-[300px] md:h-[620px]"
              style={{
                borderRadius: "3rem",
                border: "3px solid #1e1e1e",
                background: "#1a1a1a",
                overflow: "hidden",
                boxShadow: "0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              {/* Notch */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 120,
                  height: 28,
                  background: "#000",
                  borderRadius: 9999,
                  zIndex: 20,
                }}
              />

              {/* Screens with crossfade */}
              <div style={{ position: "absolute", inset: 0, paddingTop: 42 }}>
                <AnimatePresence mode="wait">
                  {screen === "scanning" && (
                    <motion.div
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ position: "absolute", inset: 0, top: 42 }}
                    >
                      <ScanningScreen progress={progress} />
                    </motion.div>
                  )}
                  {screen === "feed" && (
                    <motion.div
                      key="feed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ position: "absolute", inset: 0, top: 42 }}
                    >
                      <FeedScreen />
                    </motion.div>
                  )}
                  {screen === "heatmap" && (
                    <motion.div
                      key="heatmap"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ position: "absolute", inset: 0, top: 42 }}
                    >
                      <HeatmapScreen />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default PhoneMockup;

