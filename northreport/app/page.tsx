"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useScroll, useTransform, motion } from "framer-motion";
import { useUser } from "@auth0/nextjs-auth0/client";

import HeroSection from "@/components/landing/HeroSection";
import ProblemCards from "@/components/landing/ProblemCards";
import PhoneReveal from "@/components/landing/PhoneReveal";
import HowItWorks from "@/components/landing/HowItWorks";
import FinalCTA from "@/components/landing/FinalCTA";
import "@/components/landing/animations.css";

export default function LandingPage() {
  const { user, isLoading } = useUser();
  const { scrollY } = useScroll();

  // Nav background on scroll
  const navBg = useTransform(
    scrollY,
    [0, 60],
    ["rgba(250,248,245,0)", "rgba(250,248,245,0.95)"]
  );
  const navBorder = useTransform(
    scrollY,
    [0, 60],
    ["rgba(232,226,217,0)", "rgba(232,226,217,1)"]
  );

  // Detect dark section (phone reveal) to tint nav text
  const [inDarkSection, setInDarkSection] = useState(false);
  useEffect(() => {
    return scrollY.on("change", (v) => {
      // Hero ~100vh, ProblemCards ~70vh → phone reveal starts around 170vh
      const heroAndProblem = typeof window !== "undefined" ? window.innerHeight * 1.8 : 1400;
      const phoneRevealEnd = heroAndProblem + window.innerHeight * 2.8;
      setInDarkSection(v > heroAndProblem && v < phoneRevealEnd);
    });
  }, [scrollY]);

  return (
    <main style={{ background: "#faf8f5" }}>
      {/* Fixed nav */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        style={{
          background: navBg,
          borderBottom: `1px solid`,
          borderColor: navBorder,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#8b1a2b" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <polygon points="7,1 8.5,6.5 7,6 5.5,6.5" fill="white" />
                <polygon
                  points="7,13 8.5,7.5 7,8 5.5,7.5"
                  fill="rgba(255,255,255,0.5)"
                />
              </svg>
            </div>
            <span
              className="font-semibold text-base tracking-tight transition-colors duration-300"
              style={{ color: inDarkSection ? "#ffffff" : "#1a1a1a" }}
            >
              NorthReport
            </span>
          </Link>

          {/* Auth button */}
          {!isLoading && (
            <Link
              href={user ? "/feed" : "/auth/login"}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150"
              style={{ background: "#8b1a2b", color: "#ffffff" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#7a0f1e")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#8b1a2b")
              }
            >
              {user ? "Dashboard" : "Sign In"}
            </Link>
          )}
        </div>
      </motion.nav>

      {/* Sections */}
      <HeroSection />
      <ProblemCards />
      <PhoneReveal />
      <HowItWorks />
      <FinalCTA />
    </main>
  );
}
