"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TextPanelProps {
  badge?: string;
  heading: string;
  subtext?: string;
  side: "left" | "right" | "center";
  visible: boolean;
}

const TextPanel = React.memo(function TextPanel({
  badge,
  heading,
  subtext,
  side,
  visible,
}: TextPanelProps) {
  const desktopPosition =
    side === "left"
      ? "md:left-8 md:right-auto md:top-1/2 md:-translate-y-1/2 md:max-w-[420px]"
      : side === "right"
        ? "md:left-auto md:right-8 md:top-1/2 md:-translate-y-1/2 md:max-w-[420px]"
        : "md:left-1/2 md:right-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:text-center md:max-w-none";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={heading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={[
            "fixed z-40 pointer-events-none",
            "bottom-0 left-0 right-0 rounded-t-2xl p-6 max-w-full",
            "md:bottom-auto md:rounded-2xl md:p-8",
            desktopPosition,
            "backdrop-blur-xl",
          ].join(" ")}
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(107, 15, 26, 0.15)",
            willChange: "opacity, transform",
          }}
        >
          {badge && (
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider text-white mb-4"
              style={{ background: "#6b0f1a", fontFamily: "var(--font-utility)" }}
            >
              {badge}
            </span>
          )}

          <h2
            className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight"
            style={{ color: "#1e1e1e", fontFamily: "var(--font-playfair)" }}
          >
            {heading}
          </h2>

          {subtext && (
            <p
              className="mt-3 text-sm md:text-base leading-relaxed"
              style={{ color: "#555", fontFamily: "var(--font-utility)" }}
            >
              {subtext}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default TextPanel;

