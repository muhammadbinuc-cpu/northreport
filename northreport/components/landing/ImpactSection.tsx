"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

interface ImpactSectionProps {
    scrollProgress: MotionValue<number>;
}

export default function ImpactSection({ scrollProgress }: ImpactSectionProps) {
    // Section visibility: 0.7 to 0.9 of total scroll
    const sectionStart = 0.7;
    const sectionEnd = 0.9;

    const opacity = useTransform(
        scrollProgress,
        [sectionStart - 0.05, sectionStart, sectionEnd - 0.05, sectionEnd],
        [0, 1, 1, 0]
    );

    // Gauge fill progress
    const gaugeProgress = useTransform(
        scrollProgress,
        [sectionStart, sectionStart + 0.15],
        [0, 87]
    );

    return (
        <section className="h-[200vh] relative">
            <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
                {/* Aurora gradients */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `
              radial-gradient(ellipse at 50% 50%, rgba(0, 212, 170, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 10% 90%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)
            `,
                    }}
                />

                <motion.div
                    className="flex flex-col items-center justify-center"
                    style={{ opacity }}
                >
                    {/* Massive Health Gauge */}
                    <GiantGauge progress={gaugeProgress} />

                    {/* Text */}
                    <motion.div className="text-center mt-12">
                        <p className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                            From <span className="text-amber-400">&quot;Reported&quot;</span> to{" "}
                            <span className="text-green-400">&quot;Resolved&quot;</span>
                        </p>
                        <p className="text-xl text-gray-500">In record time.</p>
                    </motion.div>

                    {/* Stats row */}
                    <div className="flex gap-12 mt-12">
                        <StatCard value="2.3x" label="Faster response" delay={0.2} />
                        <StatCard value="89%" label="Resolution rate" delay={0.4} />
                        <StatCard value="12k" label="Reports filed" delay={0.6} />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// Giant animated gauge
function GiantGauge({ progress }: { progress: MotionValue<number> }) {
    const radius = 140;
    const circumference = 2 * Math.PI * radius;

    const strokeDashoffset = useTransform(progress, (p) => {
        const progressValue = (p / 100) * circumference;
        return circumference - progressValue;
    });

    return (
        <div className="relative w-80 h-80 md:w-96 md:h-96">
            {/* Glow effect */}
            <div
                className="absolute inset-0 blur-3xl"
                style={{
                    background: "radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 60%)",
                }}
            />

            <svg className="w-full h-full -rotate-90" viewBox="0 0 320 320">
                {/* Background circle */}
                <circle
                    cx="160"
                    cy="160"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="16"
                />

                {/* Progress arc */}
                <motion.circle
                    cx="160"
                    cy="160"
                    r={radius}
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset }}
                    filter="url(#glow)"
                />

                {/* Gradient definition */}
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="50%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#00d4aa" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            {/* Center value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="text-6xl md:text-7xl font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.span>
                        {useTransform(progress, (p) => Math.round(p))}
                    </motion.span>
                    <span className="text-4xl text-gray-500">%</span>
                </motion.span>
                <span className="text-gray-500 text-sm tracking-widest uppercase mt-2">
                    City Health Score
                </span>
            </div>
        </div>
    );
}

// Stat card component
function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
    return (
        <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
        >
            <div
                className="px-6 py-4 rounded-xl"
                style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                }}
            >
                <p className="text-3xl font-bold text-teal-400">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
        </motion.div>
    );
}
