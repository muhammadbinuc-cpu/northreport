"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const CARDS = [
  {
    emoji: "🕳️",
    title: "Potholes",
    description:
      "Road damage goes unreported for months, costing cities millions.",
  },
  {
    emoji: "💡",
    title: "Broken Streetlights",
    description:
      "Dark streets create safety hazards that nobody hears about.",
  },
  {
    emoji: "🗑️",
    title: "Illegal Dumping",
    description:
      "Waste piles up in neighborhoods with no easy way to report.",
  },
  {
    emoji: "🏚️",
    title: "Neglected Infrastructure",
    description: "Community concerns get buried in bureaucracy.",
  },
];

const containerVariants = {
  hidden: {},
  show: {},
};

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0 },
};

export default function ProblemCards() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <section
      className="py-24 px-6"
      style={{ background: "#faf8f5" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Section heading */}
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-16"
          style={{ color: "#1a1a1a" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          Every city has problems hiding in plain sight
        </motion.h2>

        {/* Cards grid */}
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          transition={{ staggerChildren: 0.15 }}
        >
          {CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              transition={{ duration: 0.55 }}
              whileHover={{
                y: -4,
                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.06)",
              }}
              className="rounded-xl p-8 cursor-pointer"
              style={{
                background: "#ffffff",
                border: "1px solid #e8e2d9",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <div className="text-4xl mb-4">{card.emoji}</div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: "#1a1a1a" }}
              >
                {card.title}
              </h3>
              <p className="text-base leading-relaxed" style={{ color: "#5c5650" }}>
                {card.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
