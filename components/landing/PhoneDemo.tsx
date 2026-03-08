"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

interface PhoneDemoProps {
    scrollProgress: MotionValue<number>;
}

export default function PhoneDemo({ scrollProgress }: PhoneDemoProps) {
    // Section visibility: 0.4 to 0.7 of total scroll
    const sectionStart = 0.4;
    const sectionEnd = 0.7;

    const opacity = useTransform(
        scrollProgress,
        [sectionStart - 0.05, sectionStart, sectionEnd - 0.05, sectionEnd],
        [0, 1, 1, 0]
    );

    // Phone tilt animation
    const rotateY = useTransform(
        scrollProgress,
        [sectionStart, sectionStart + 0.1, sectionEnd - 0.1, sectionEnd],
        [-15, 0, 0, 15]
    );

    // Screen states based on scroll progress within section
    const screenProgress = useTransform(
        scrollProgress,
        [sectionStart, sectionEnd],
        [0, 1]
    );

    return (
        <section className="h-[300vh] relative">
            <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
                {/* Aurora gradients */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `
              radial-gradient(ellipse at 30% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, rgba(0, 212, 170, 0.08) 0%, transparent 40%)
            `,
                    }}
                />

                {/* 3D Phone */}
                <motion.div
                    className="relative"
                    style={{
                        opacity,
                        rotateY,
                        transformStyle: "preserve-3d",
                        transformPerspective: "1200px",
                    }}
                >
                    {/* Phone frame */}
                    <div
                        className="relative w-[280px] h-[580px] md:w-[320px] md:h-[660px] rounded-[40px] p-3"
                        style={{
                            background: "linear-gradient(145deg, #2a2a35 0%, #1a1a22 100%)",
                            boxShadow: `
                0 50px 100px rgba(0,0,0,0.5),
                0 0 0 1px rgba(255,255,255,0.1),
                inset 0 0 0 1px rgba(255,255,255,0.05)
              `,
                        }}
                    >
                        {/* Notch */}
                        <div
                            className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full z-10"
                            style={{ background: "#0a0a0f" }}
                        />

                        {/* Screen */}
                        <div
                            className="w-full h-full rounded-[32px] overflow-hidden relative"
                            style={{ background: "#0a0a0f" }}
                        >
                            {/* Screen content based on progress */}
                            <PhoneScreen screenProgress={screenProgress} />
                        </div>

                        {/* Side buttons */}
                        <div
                            className="absolute -right-1 top-28 w-1 h-12 rounded-r"
                            style={{ background: "#3a3a45" }}
                        />
                        <div
                            className="absolute -right-1 top-44 w-1 h-12 rounded-r"
                            style={{ background: "#3a3a45" }}
                        />
                        <div
                            className="absolute -left-1 top-36 w-1 h-16 rounded-l"
                            style={{ background: "#3a3a45" }}
                        />
                    </div>

                    {/* Glow under phone */}
                    <div
                        className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-32 blur-3xl"
                        style={{
                            background: "radial-gradient(ellipse, rgba(20,184,166,0.3) 0%, transparent 70%)",
                        }}
                    />
                </motion.div>

                {/* Text */}
                <motion.div
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center"
                    style={{ opacity }}
                >
                    <p className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                        Don&apos;t fill out forms.
                    </p>
                    <p className="text-4xl md:text-5xl font-bold text-teal-400 tracking-tight">
                        Just speak.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

// Phone screen content component
function PhoneScreen({ screenProgress }: { screenProgress: MotionValue<number> }) {
    const step1Opacity = useTransform(screenProgress, [0, 0.15, 0.3], [1, 1, 0]);
    const step2Opacity = useTransform(screenProgress, [0.25, 0.4, 0.55, 0.7], [0, 1, 1, 0]);
    const step3Opacity = useTransform(screenProgress, [0.65, 0.8, 1], [0, 1, 1]);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Step 1: Hands-free Mode */}
            <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
                style={{ opacity: step1Opacity }}
            >
                <motion.div
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                    style={{
                        background: "rgba(20,184,166,0.15)",
                        border: "2px solid rgba(20,184,166,0.4)",
                    }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                </motion.div>
                <span className="text-teal-400 font-semibold text-lg mb-2">Hands-Free Mode</span>
                <span className="text-gray-500 text-sm text-center">
                    &quot;I see a pothole on King Street near the coffee shop.&quot;
                </span>

                {/* Sound wave visualization */}
                <div className="flex items-center gap-1 mt-6">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-teal-400 rounded-full"
                            animate={{
                                height: [8, 24 + Math.random() * 16, 8],
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.05,
                            }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Step 2: AI Analysis */}
            <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
                style={{ opacity: step2Opacity }}
            >
                {/* Pothole image placeholder with scan effect */}
                <div
                    className="w-48 h-36 rounded-xl mb-6 relative overflow-hidden"
                    style={{
                        background: "linear-gradient(135deg, #1a1a22 0%, #2a2a35 100%)",
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}
                >
                    {/* Simulated image content */}
                    <div className="absolute inset-4 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800" />

                    {/* Scan line */}
                    <motion.div
                        className="absolute left-0 right-0 h-0.5"
                        style={{
                            background: "linear-gradient(90deg, transparent, #14b8a6, transparent)",
                            boxShadow: "0 0 20px #14b8a6",
                        }}
                        animate={{ top: ["0%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>

                <span className="text-crimson-light font-semibold text-lg mb-2">Analyzing...</span>
                <div className="flex items-center gap-2">
                    <motion.div
                        className="w-2 h-2 rounded-full bg-crimson"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-gray-500 text-sm">
                        Detected: Road Hazard · Severity: Medium
                    </span>
                </div>
            </motion.div>

            {/* Step 3: Action Taken */}
            <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
                style={{ opacity: step3Opacity }}
            >
                <motion.div
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                    style={{
                        background: "rgba(34,197,94,0.15)",
                        border: "2px solid rgba(34,197,94,0.4)",
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </motion.div>
                <span className="text-green-400 font-semibold text-lg mb-2">Report Filed!</span>
                <span className="text-gray-500 text-sm text-center">
                    311 ticket #HM-2847 created.
                    <br />
                    City notified automatically.
                </span>

                {/* Success particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-green-400"
                            style={{
                                left: `${30 + Math.random() * 40}%`,
                                top: "50%",
                            }}
                            animate={{
                                y: [-20, -60 - Math.random() * 40],
                                x: (Math.random() - 0.5) * 60,
                                opacity: [1, 0],
                                scale: [1, 0.5],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
