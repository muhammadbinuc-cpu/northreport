"use client";

import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import { useScroll, useSpring, useMotionValueEvent, motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import Map, { type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import problems from "./mapData";
import TextPanel from "./TextPanel";
import PhoneMockup from "./PhoneMockup";

/* ── Camera keyframes (unchanged) ─────────────────────── */

interface CameraKF {
  at: number;
  zoom: number;
  pitch: number;
  bearing: number;
  center: [number, number];
}

const KEYFRAMES: CameraKF[] = [
  { at: 0.0, zoom: 12, pitch: 0, bearing: 0, center: [-80.5204, 43.4643] },
  { at: 0.15, zoom: 16, pitch: 60, bearing: -20, center: [-80.5275, 43.4722] },
  { at: 0.27, zoom: 17, pitch: 60, bearing: -10, center: [-80.5234, 43.4510] },
  { at: 0.42, zoom: 17, pitch: 60, bearing: 10, center: [-80.5310, 43.4625] },
  { at: 0.56, zoom: 14, pitch: 45, bearing: 0, center: [-80.5204, 43.4643] },
  { at: 0.70, zoom: 14, pitch: 45, bearing: 0, center: [-80.5204, 43.4643] },
  { at: 0.90, zoom: 12, pitch: 0, bearing: 0, center: [-80.5204, 43.4643] },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function interpolateCamera(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  let lo = KEYFRAMES[0];
  let hi = KEYFRAMES[KEYFRAMES.length - 1];

  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (p >= KEYFRAMES[i].at && p <= KEYFRAMES[i + 1].at) {
      lo = KEYFRAMES[i];
      hi = KEYFRAMES[i + 1];
      break;
    }
  }

  const range = hi.at - lo.at;
  const t = range === 0 ? 0 : (p - lo.at) / range;

  return {
    zoom: lerp(lo.zoom, hi.zoom, t),
    pitch: lerp(lo.pitch, hi.pitch, t),
    bearing: lerp(lo.bearing, hi.bearing, t),
    center: [
      lerp(lo.center[0], hi.center[0], t),
      lerp(lo.center[1], hi.center[1], t),
    ] as [number, number],
  };
}

/* ── Dot stagger order ────────────────────────────────── */

const ALL_IDS = problems.features.map((f) => f.properties.id);
const STAGGER_ORDER = ALL_IDS.filter((id) => id !== "p1" && id !== "p3");

/* ── Finale section (scroll 85-100%) ──────────────────── */

const FEATURE_PILLS = [
  "AI-Powered Analysis",
  "Community Voices",
  "City Heatmap",
  "Hands-Free Voice",
  "Assisted 311 Filing",
];

function FinaleOverlay({ visible }: { visible: boolean }) {
  const { user } = useUser();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center text-center px-6"
          style={{ willChange: "opacity" }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-3">
              <span className="text-white">North</span>
              <span style={{ color: "#8b1a2b" }}>Report</span>
            </h2>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-lg md:text-xl mb-8 max-w-md"
            style={{ color: "rgba(255,255,255,0.8)" }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your city&apos;s pulse, reported by the people who live in it.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <Link
              href={user ? "/dashboard" : "/api/auth/login"}
              className="inline-block px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg"
              style={{ background: "#fff", color: "#8b1a2b" }}
              aria-label={user ? "Go to your NorthReport dashboard" : "Get started with NorthReport"}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0ece6")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              {user ? "Go to Dashboard →" : "Get Started →"}
            </Link>
          </motion.div>

          {/* Built for */}
          <motion.p
            className="mt-6 text-sm"
            style={{ color: "rgba(255,255,255,0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Built for Hack Canada 2026 — powered by Gemini AI
          </motion.p>

          {/* Feature pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mt-6 max-w-lg"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {FEATURE_PILLS.map((pill) => (
              <span
                key={pill}
                className="px-3 py-1 text-xs rounded-full"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {pill}
              </span>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Scroll indicator ─────────────────────────────────── */

function ScrollIndicator({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 left-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
          style={{ transform: "translateX(-50%)" }}
        >
          <span className="text-sm font-medium" style={{ color: "rgba(30,30,30,0.7)" }}>
            Scroll to explore
          </span>
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M4 8l6 6 6-6" stroke="rgba(30,30,30,0.6)" strokeWidth="2" strokeLinecap="round" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Fixed logo ───────────────────────────────────────── */

function FixedLogo() {
  return (
    <div
      className="fixed top-5 left-5 z-50 flex items-center gap-2 pointer-events-none"
      style={{ opacity: 0.85 }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
      >
        <svg width="16" height="16" viewBox="0 0 44 44" fill="none">
          <polygon points="22,5 25.5,22 22,19.5 18.5,22" fill="white" />
          <polygon points="22,39 25.5,22 22,24.5 18.5,22" fill="rgba(255,255,255,0.5)" />
          <circle cx="22" cy="22" r="2.5" fill="white" />
        </svg>
      </div>
      <span className="text-sm font-bold tracking-tight text-white drop-shadow-md">
        North<span style={{ color: "#8b1a2b" }}>Report</span>
      </span>
    </div>
  );
}

/* ── Main component ───────────────────────────────────── */

export default function CityFlythrough() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);
  const [progress, setProgress] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Dot visibility
  const visibleIdsRef = useRef<Set<string>>(new Set());
  const staggerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const staggerIndexRef = useRef(0);
  const rafRef = useRef<number>(0);
  const mapReadyRef = useRef(false);

  // Green dot transition
  const greenIdsRef = useRef<Set<string>>(new Set());
  const greenTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const greenIndexRef = useRef(0);

  const { scrollYProgress } = useScroll({ target: scrollRef });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 20,
  });

  /* ── Update GeoJSON source ── */

  const updateSource = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || !mapReadyRef.current) return;
    const source = map.getSource("problems");
    if (!source) return;

    const visibleFeatures = problems.features
      .filter((f) => visibleIdsRef.current.has(f.properties.id))
      .map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          color: greenIdsRef.current.has(f.properties.id) ? "#22c55e" : "#6b0f1a",
        },
      }));

    (source as any).setData({
      type: "FeatureCollection" as const,
      features: visibleFeatures,
    });
  }, []);

  /* ── Stagger helpers ── */

  const clearStagger = useCallback(() => {
    if (staggerTimerRef.current) {
      clearInterval(staggerTimerRef.current);
      staggerTimerRef.current = null;
    }
    staggerIndexRef.current = 0;
  }, []);

  const startStagger = useCallback(() => {
    if (staggerTimerRef.current) return;
    if (staggerIndexRef.current >= STAGGER_ORDER.length) return;

    staggerTimerRef.current = setInterval(() => {
      if (staggerIndexRef.current >= STAGGER_ORDER.length) {
        clearInterval(staggerTimerRef.current!);
        staggerTimerRef.current = null;
        return;
      }
      visibleIdsRef.current.add(STAGGER_ORDER[staggerIndexRef.current]);
      staggerIndexRef.current++;
      updateSource();
    }, 100);
  }, [updateSource]);

  /* ── Green transition helpers ── */

  const clearGreen = useCallback(() => {
    if (greenTimerRef.current) {
      clearInterval(greenTimerRef.current);
      greenTimerRef.current = null;
    }
    greenIndexRef.current = 0;
    greenIdsRef.current.clear();
  }, []);

  const startGreen = useCallback(() => {
    if (greenTimerRef.current) return;
    if (greenIndexRef.current >= ALL_IDS.length) return;

    greenTimerRef.current = setInterval(() => {
      const map = mapRef.current?.getMap();
      if (greenIndexRef.current >= ALL_IDS.length) {
        clearInterval(greenTimerRef.current!);
        greenTimerRef.current = null;
        return;
      }
      const id = ALL_IDS[greenIndexRef.current];
      greenIdsRef.current.add(id);
      greenIndexRef.current++;
      updateSource();

      // Brief scale-up effect on the solid layer
      if (map && map.getLayer("problems-solid")) {
        map.setPaintProperty("problems-solid", "circle-radius", 15);
        setTimeout(() => {
          if (map.getLayer("problems-solid")) {
            map.setPaintProperty("problems-solid", "circle-radius", 8);
          }
        }, 150);
      }
    }, 200);
  }, [updateSource]);

  /* ── Drive camera + dots + phone from scroll ── */

  useMotionValueEvent(smoothProgress, "change", (v) => {
    setProgress(v);

    const map = mapRef.current?.getMap();
    if (!map) return;

    // Camera
    const cam = interpolateCamera(v);
    map.jumpTo({
      center: cam.center,
      zoom: cam.zoom,
      pitch: cam.pitch,
      bearing: cam.bearing,
    });

    // Dot visibility
    if (v < 0.2) {
      visibleIdsRef.current.clear();
      clearStagger();
      clearGreen();
    } else if (v < 0.35) {
      visibleIdsRef.current = new Set(["p1"]);
      clearStagger();
      clearGreen();
    } else if (v < 0.5) {
      visibleIdsRef.current = new Set(["p1", "p3"]);
      clearStagger();
      clearGreen();
    } else if (v < 0.7) {
      visibleIdsRef.current.add("p1");
      visibleIdsRef.current.add("p3");
      startStagger();
      // Green starts at 70%
      if (v < 0.7) clearGreen();
    } else {
      // 70%+: start turning dots green
      visibleIdsRef.current.add("p1");
      visibleIdsRef.current.add("p3");
      startStagger();
      startGreen();
    }

    updateSource();
  });

  /* ── Map load: layers + pulse ── */

  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    mapReadyRef.current = true;
    setMapLoaded(true);

    map.addSource("problems", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });

    // Pulse ring (behind)
    map.addLayer({
      id: "problems-pulse",
      type: "circle",
      source: "problems",
      paint: {
        "circle-radius": 8,
        "circle-color": ["get", "color"],
        "circle-opacity": 0.5,
      },
    });

    // Solid dot (on top)
    map.addLayer({
      id: "problems-solid",
      type: "circle",
      source: "problems",
      paint: {
        "circle-radius": 8,
        "circle-color": ["get", "color"],
        "circle-opacity": 1,
      },
    });

    const animatePulse = (timestamp: number) => {
      if (!map.getLayer("problems-pulse")) return;
      const cycle = 2000;
      const t = (timestamp % cycle) / cycle;
      map.setPaintProperty("problems-pulse", "circle-radius", 8 + 22 * t);
      map.setPaintProperty("problems-pulse", "circle-opacity", 0.5 * (1 - t));
      rafRef.current = requestAnimationFrame(animatePulse);
    };

    rafRef.current = requestAnimationFrame(animatePulse);
  }, []);

  /* ── Cleanup ── */

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (staggerTimerRef.current) clearInterval(staggerTimerRef.current);
      if (greenTimerRef.current) clearInterval(greenTimerRef.current);
    };
  }, []);

  /* ── Derived state ── */

  const showPhone = progress >= 0.62 && progress < 0.85;
  const phoneScreen: "scanning" | "feed" | "heatmap" =
    progress < 0.7 ? "scanning" : progress < 0.8 ? "feed" : "heatmap";
  // Normalized progress within scanning phase for result card timing
  const scanningProgress = progress >= 0.62 && progress < 0.7
    ? (progress - 0.62) / 0.08
    : 0;

  const overlayOpacity = progress >= 0.62 && progress < 0.85
    ? Math.min((progress - 0.62) / 0.04, 1) * 0.6
    : 0;

  const showFinale = progress >= 0.85;
  const showScrollIndicator = progress < 0.05;

  /* ── Render ── */

  return (
    <div ref={scrollRef} style={{ height: "600vh", position: "relative" }}>
      {/* Fixed NorthReport logo */}
      <FixedLogo />

      {/* Loading state */}
      {!mapLoaded && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: "#121212" }}
        >
          <motion.p
            className="text-white text-lg font-medium"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            Loading...
          </motion.p>
        </div>
      )}

      {/* Fixed map */}
      <div
        role="img"
        aria-label="Interactive map of Hamilton showing reported city issues"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          willChange: "transform",
        }}
      >
        <Map
          ref={mapRef}
          onLoad={handleMapLoad}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/light-v11"
          initialViewState={{
            longitude: -80.5204,
            latitude: 43.4643,
            zoom: 12,
            pitch: 0,
            bearing: 0,
          }}
          interactive={false}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator visible={showScrollIndicator} />

      {/* Dark overlay for phone section */}
      {overlayOpacity > 0 && (
        <div
          className="fixed inset-0 z-30 pointer-events-none"
          style={{
            background: `rgba(30, 30, 30, ${overlayOpacity})`,
            willChange: "opacity",
          }}
        />
      )}

      {/* Phone mockup */}
      <PhoneMockup
        visible={showPhone}
        screen={phoneScreen}
        progress={scanningProgress}
      />

      {/* ── Text overlays ── */}

      {/* Phase 1: Bird's eye */}
      <TextPanel
        heading="Your city looks fine from up here."
        side="center"
        visible={progress >= 0 && progress < 0.1}
      />

      {/* Phase 2: Transition */}
      <TextPanel
        heading="But look closer."
        side="center"
        visible={progress >= 0.1 && progress < 0.2}
      />

      {/* Phase 3: First pothole */}
      <TextPanel
        badge="UNREPORTED"
        heading="This pothole has been here for 6 months."
        subtext="47 vehicles hit it daily. It's caused $12,000 in damage. Nobody reported it — because reporting takes 45 minutes."
        side="left"
        visible={progress >= 0.2 && progress < 0.35}
      />

      {/* Phase 4: Streetlight */}
      <TextPanel
        badge="IGNORED"
        heading="This streetlight has been dark for 3 weeks."
        subtext="Night-time incidents on this block increased 34%. Residents called 311 twice. Still waiting."
        side="left"
        visible={progress >= 0.35 && progress < 0.5}
      />

      {/* Phase 5: All dots */}
      <TextPanel
        badge="SYSTEMIC"
        heading="Every dot is a problem hiding in plain sight."
        subtext="Potholes, broken lights, illegal dumping, flooding. Your city has hundreds of unreported issues right now."
        side="left"
        visible={progress >= 0.5 && progress < 0.62}
      />

      {/* Phase 6: Phone + scanning */}
      <TextPanel
        heading="NorthReport finds them in 3 seconds."
        subtext="Point your camera at any issue. Gemini AI identifies it, finds the responsible department, cites the relevant bylaw, and prepares a report."
        side="right"
        visible={progress >= 0.62 && progress < 0.7}
      />

      {/* Phase 7: Feed + dots turning green */}
      <TextPanel
        heading="Watch your city heal in real time."
        subtext="Every report filed. Every pattern detected. Every fix tracked. The community feed turns individual complaints into collective action."
        side="right"
        visible={progress >= 0.7 && progress < 0.8}
      />

      {/* Phase 8: Heatmap */}
      <TextPanel
        heading="See the patterns others miss."
        subtext="AI-powered pattern detection flags systemic issues before they become disasters. Move from reactive repairs to predictive planning."
        side="right"
        visible={progress >= 0.8 && progress < 0.85}
      />

      {/* Finale */}
      <FinaleOverlay visible={showFinale} />
    </div>
  );
}
