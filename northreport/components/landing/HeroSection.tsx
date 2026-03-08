"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useUser } from "@auth0/nextjs-auth0/client";

const PILLS = [
  "AI-Powered Analysis",
  "Community Voices",
  "City Heatmap",
  "Hands-Free Voice",
  "Assisted 311 Filing",
];

export default function HeroSection() {
  const { user } = useUser();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 25 });
  const opacity = useTransform(smoothProgress, [0, 0.7], [1, 0]);
  const y = useTransform(smoothProgress, [0, 1], [0, -60]);
  const scale = useTransform(smoothProgress, [0, 0.7], [1, 0.95]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#faf8f5" }}
    >
      <motion.div
        style={{ opacity, y, scale }}
        className="text-center px-6 max-w-4xl mx-auto pt-24 pb-16"
      >
        {/* Compass */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "#f0ece6", border: "1px solid #e8e2d9" }}
          >
            <svg
              className="animate-compass"
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
            >
              {/* North arrow — crimson */}
              <polygon points="22,5 25.5,22 22,19.5 18.5,22" fill="#8b1a2b" />
              {/* South arrow — warm gray */}
              <polygon points="22,39 25.5,22 22,24.5 18.5,22" fill="#5c5650" />
              {/* Center dot */}
              <circle cx="22" cy="22" r="2.5" fill="#1a1a1a" />
            </svg>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          style={{ color: "#1a1a1a" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Your city&apos;s pulse,{" "}
          <br className="hidden sm:block" />
          reported by the people
          <br className="hidden sm:block" /> who live in it.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl md:text-2xl mb-10 max-w-xl mx-auto"
          style={{ color: "#5c5650" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          NorthReport turns local voices into real change.
        </motion.p>

        {/* CTA */}
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link
            href={user ? "/dashboard" : "/auth/login"}
            className="px-8 py-4 text-lg font-semibold rounded-xl text-white transition-colors duration-150"
            style={{ background: "#8b1a2b" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#7a0f1e")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#8b1a2b")
            }
          >
            {user ? "Go to Dashboard" : "Get Started"}
          </Link>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {PILLS.map((pill, i) => (
              <motion.span
                key={pill}
                className="px-3 py-1.5 text-sm rounded-full"
                style={{
                  background: "#f0ece6",
                  color: "#5c5650",
                  border: "1px solid #e8e2d9",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              >
                {pill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
