"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useUser } from "@auth0/nextjs-auth0/client";
import NorthReportLogo from "@/components/landing/NorthReportLogo";
import PhoneFrame from "@/components/landing/PhoneFrame";
import {
  VisionScreen,
  PulseFeedScreen,
  AgentTrackerScreen,
} from "@/components/landing/PhoneScreens";

/* ─── Fade-in-on-scroll wrapper ─── */
function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated counter ─── */
function AnimatedStat({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="text-center"
    >
      <p className="text-3xl md:text-5xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--accent-primary)" }}>
        {value}
      </p>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  const { user, isLoading } = useUser();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroContentY = useTransform(scrollY, [0, 500], [0, -60]);

  return (
    <main className="relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* ═══════ HERO ═══════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col">
        {/* Background gradient — warm, elegant */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 50% 0%, rgba(107,15,26,0.08) 0%, transparent 60%),
                radial-gradient(ellipse 60% 40% at 80% 20%, rgba(107,15,26,0.05) 0%, transparent 50%),
                radial-gradient(ellipse 50% 50% at 20% 80%, rgba(107,15,26,0.03) 0%, transparent 50%),
                var(--bg-base)
              `,
            }}
          />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(107,15,26,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(107,15,26,0.3) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Top Nav */}
        <nav className="relative z-20 px-6 py-5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <NorthReportLogo size="md" showText />
            </div>
            {isLoading ? null : user ? (
              <Link
                href="/feed"
                className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all hover:shadow-md active:scale-[0.98]"
                style={{ background: "var(--accent-primary)", color: "#fff" }}
              >
                Open Feed
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all border hover:shadow-sm active:scale-[0.98]"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 flex-1 flex items-center justify-center px-6 pb-16"
          style={{ y: heroContentY }}
        >
          <div className="text-center max-w-3xl">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{
                background: "rgba(107,15,26,0.06)",
                border: "1px solid rgba(107,15,26,0.1)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--status-success)" }} />
              <span className="text-xs font-medium tracking-wide" style={{ color: "var(--accent-primary)" }}>
                Built for Hack Canada 2026
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              See it. Report it.
              <br />
              <span style={{ color: "var(--accent-primary)" }}>Fix it.</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ color: "var(--text-secondary)" }}
            >
              NorthReport turns what your community sees into what your city
              acts on. Snap a hazard, AI classifies it, your neighborhood improves.
            </motion.p>

            <motion.div
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link
                href={user ? "/feed" : "/auth/login"}
                className="px-8 py-3.5 text-base font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
                style={{
                  background: "var(--accent-primary)",
                  color: "#fff",
                  boxShadow: "0 4px 24px rgba(107, 15, 26, 0.25)",
                }}
              >
                {user ? "Open Feed" : "Get Started"}
              </Link>
              <Link
                href="#how-it-works"
                className="px-6 py-3.5 text-base font-medium rounded-xl border transition-all hover:shadow-sm active:scale-[0.98]"
                style={{
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                  background: "var(--bg-card)",
                }}
              >
                Learn More
              </Link>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              className="mt-20 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <motion.svg
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </motion.svg>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatedStat value="500+" label="Reports Filed" delay={0} />
          <AnimatedStat value="12" label="Neighborhoods" delay={0.1} />
          <AnimatedStat value="94%" label="Resolution Rate" delay={0.2} />
          <AnimatedStat value="<2min" label="Avg. Report Time" delay={0.3} />
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3 text-center"
              style={{ color: "var(--accent-primary)", letterSpacing: "0.15em" }}
            >
              How It Works
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-16"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              From hazard to resolution in three steps
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Spot & Report",
                desc: "Point your camera at any hazard. Gemini AI classifies the issue type, severity, and location instantly.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Community Validates",
                desc: "Neighbors upvote and corroborate. AI detects patterns — five complaints become one clear signal.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "City Acts",
                desc: "NorthReport auto-files 311 reports with all details attached. Track your ticket until resolution.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.1}>
                <div
                  className="relative p-8 rounded-2xl h-full transition-all hover:shadow-lg group"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-hairline)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <span
                    className="text-6xl font-bold absolute top-6 right-6 transition-colors"
                    style={{ color: "rgba(107,15,26,0.06)", fontFamily: "var(--font-display)" }}
                  >
                    {item.step}
                  </span>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(107,15,26,0.06)", color: "var(--accent-primary)" }}
                  >
                    {item.icon}
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURE 1 — Vision Scanner ═══════ */}
      <section className="px-6 py-20 md:py-28 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <FadeIn className="flex-1 lg:order-1">
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--accent-primary)", letterSpacing: "0.12em" }}>
                AI Vision
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
              >
                Don&apos;t fill out forms.
                <br />
                Just point and shoot.
              </h2>
              <p className="text-base leading-relaxed max-w-md" style={{ color: "var(--text-secondary)" }}>
                Gemini Vision analyzes hazards instantly — classifying issue type,
                estimating severity, and drafting a structured report. No typing required.
              </p>
              <div className="flex gap-3 mt-8">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(107,15,26,0.06)", color: "var(--accent-primary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  Auto-classify
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(107,15,26,0.06)", color: "var(--accent-primary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  Severity scoring
                </div>
              </div>
            </FadeIn>
            <FadeIn className="lg:order-2" delay={0.2}>
              <PhoneFrame>
                <VisionScreen />
              </PhoneFrame>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURE 2 — Community Feed ═══════ */}
      <section className="px-6 py-20 md:py-28 overflow-hidden" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <FadeIn className="flex-1">
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--accent-primary)", letterSpacing: "0.12em" }}>
                Community Feed
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
              >
                One report is noise.
                <br />
                Five reports is a pattern.
              </h2>
              <p className="text-base leading-relaxed max-w-md" style={{ color: "var(--text-secondary)" }}>
                NorthReport groups neighborhood data to find root causes. Content rises
                by momentum and risk — the most critical updates always surface first.
              </p>
              <div className="flex gap-3 mt-8">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(107,15,26,0.06)", color: "var(--accent-primary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  Trend detection
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(107,15,26,0.06)", color: "var(--accent-primary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  Smart ranking
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <PhoneFrame>
                <PulseFeedScreen />
              </PhoneFrame>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURE 3 — 311 Auto-Filing ═══════ */}
      <section className="px-6 py-20 md:py-28 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <FadeIn className="flex-1 lg:order-1">
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--accent-primary)", letterSpacing: "0.12em" }}>
                311 Auto-Filing
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
              >
                We don&apos;t just report it.
                <br />
                We file it.
              </h2>
              <p className="text-base leading-relaxed max-w-md" style={{ color: "var(--text-secondary)" }}>
                Watch the AI agent navigate the city 311 portal, file your ticket
                with every detail attached, and track it until resolution.
              </p>
              <div className="flex gap-3 mt-8">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(107,15,26,0.06)", color: "var(--accent-primary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  Auto-fill forms
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(107,15,26,0.06)", color: "var(--accent-primary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  Track progress
                </div>
              </div>
            </FadeIn>
            <FadeIn className="lg:order-2" delay={0.2}>
              <PhoneFrame>
                <AgentTrackerScreen />
              </PhoneFrame>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center">
          <FadeIn>
            <div
              className="rounded-3xl p-12 md:p-16"
              style={{
                background: "var(--accent-primary)",
                boxShadow: "0 20px 60px rgba(107,15,26,0.2)",
              }}
            >
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ready to make your neighborhood safer?
              </h2>
              <p className="text-base mb-8 leading-relaxed text-white/70">
                Join the community that sees, understands, and acts.
              </p>
              <Link
                href={user ? "/feed" : "/auth/login"}
                className="inline-block px-8 py-3.5 text-base font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-[var(--bg-base)] hover:shadow-lg"
                style={{ color: "var(--accent-primary)" }}
              >
                {user ? "Open Feed" : "Get Started Free"}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="px-6 pb-8">
        <div
          className="max-w-5xl mx-auto pt-6 text-center"
          style={{ borderTop: "1px solid var(--border-hairline)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Built for Hack Canada 2026 &middot; Powered by Gemini AI
          </p>
        </div>
      </footer>
    </main>
  );
}
