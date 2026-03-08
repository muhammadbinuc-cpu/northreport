"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform, useSpring } from "framer-motion";

const STEPS = [
  {
    num: "01",
    title: "Report",
    description: "Spot an issue? Report it in seconds with voice, photo, or text.",
  },
  {
    num: "02",
    title: "AI Analysis",
    description: "Gemini AI categorizes, prioritizes, and routes your report automatically.",
  },
  {
    num: "03",
    title: "Action",
    description: "Your city responds. Track real-time progress on every report.",
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

function AnimatedNumber({ target, active }: { target: string; active: boolean }) {
  const [display, setDisplay] = useState("00");

  useEffect(() => {
    if (!active) return;
    const targetNum = parseInt(target);
    let current = 0;
    const timer = setInterval(() => {
      current++;
      setDisplay(String(current).padStart(2, "0"));
      if (current >= targetNum) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, [active, target]);

  return <>{display}</>;
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px 0px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "center center"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 25 });
  const lineScaleX = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section className="py-28 px-6" style={{ background: "#faf7ed" }}>
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-20"
          style={{ color: "#1e1e1e", fontFamily: "var(--font-playfair)" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          How NorthReport Works
        </motion.h2>

        <div className="relative" ref={sectionRef}>
          <div
            className="hidden md:block absolute top-10 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5"
            style={{ background: "rgba(107,15,26,0.15)" }}
          >
            <motion.div
              className="h-full origin-left"
              style={{ background: "#6b0f1a", scaleX: lineScaleX }}
            />
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8"
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            transition={{ staggerChildren: 0.2, delayChildren: 0.1 }}
          >
            {STEPS.map((step) => (
              <motion.div
                key={step.num}
                variants={stepVariants}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center md:items-start text-center md:text-left"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6 relative z-10"
                  style={{ background: "#faf7ed", border: "2px solid rgba(107,15,26,0.15)" }}
                >
                  <span
                    className="font-bold"
                    style={{ color: "#6b0f1a", fontSize: "1.6rem", lineHeight: 1, fontFamily: "var(--font-playfair)" }}
                  >
                    <AnimatedNumber target={step.num} active={isInView} />
                  </span>
                </div>

                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ color: "#1e1e1e", fontFamily: "var(--font-playfair)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "#555", fontFamily: "var(--font-utility)" }}
                >
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
