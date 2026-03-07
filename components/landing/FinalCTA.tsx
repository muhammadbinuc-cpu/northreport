"use client";

import Link from "next/link";
import { motion, useTransform, type MotionValue } from "framer-motion";

interface FinalCTAProps {
    scrollProgress: MotionValue<number>;
}

export default function FinalCTA({ scrollProgress }: FinalCTAProps) {
    // Section visibility: 0.9 to 1.0 of total scroll
    const sectionStart = 0.9;

    const opacity = useTransform(
        scrollProgress,
        [sectionStart - 0.05, sectionStart],
        [0, 1]
    );

    return (
        <section className="h-[100vh] relative">
            <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
                {/* Aurora gradients - more intense for CTA */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `
              radial-gradient(ellipse at 50% 80%, rgba(0, 212, 170, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 40%),
              radial-gradient(ellipse at 80% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 40%)
            `,
                    }}
                />

                <motion.div
                    className="text-center px-6 max-w-3xl"
                    style={{ opacity }}
                >
                    {/* Main headline */}
                    <motion.h2
                        className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
                        initial={{ y: 30 }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span
                            style={{
                                background: "linear-gradient(180deg, #fff 0%, #94a3b8 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Your neighborhood
                        </span>
                        <br />
                        <span className="text-teal-400">deserves to be heard.</span>
                    </motion.h2>

                    {/* Subtitle */}
                    <motion.p
                        className="text-xl text-gray-400 mb-10 max-w-xl mx-auto"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Join 500,000+ residents making their cities smarter, safer, and more responsive.
                    </motion.p>

                    {/* CTA buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Link
                            href="/feed"
                            className="group relative px-10 py-4 text-lg font-semibold rounded-xl overflow-hidden transition-all hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #14b8a6 0%, #00d4aa 100%)",
                                boxShadow: "0 0 40px rgba(20,184,166,0.4), 0 8px 32px rgba(0,0,0,0.3)",
                            }}
                        >
                            <span className="relative z-10 text-white">Get Started Free</span>
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{
                                    background: "linear-gradient(135deg, #00d4aa 0%, #14b8a6 100%)",
                                }}
                            />
                        </Link>

                        <Link
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="px-10 py-4 text-lg font-semibold rounded-xl transition-all hover:scale-105"
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(20,184,166,0.4)",
                                color: "#14b8a6",
                                boxShadow: "0 0 20px rgba(20,184,166,0.1)",
                            }}
                        >
                            Learn More
                        </Link>
                    </motion.div>

                    {/* Trust signals */}
                    <motion.div
                        className="flex items-center justify-center gap-6 mt-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span>Privacy-first</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>Real-time updates</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <span>311 integrated</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Animated particles in background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full bg-teal-400/30"
                            style={{
                                left: `${10 + i * 12}%`,
                                top: `${20 + (i % 3) * 25}%`,
                            }}
                            animate={{
                                y: [-20, 20, -20],
                                opacity: [0.2, 0.5, 0.2],
                            }}
                            transition={{
                                duration: 4 + i * 0.5,
                                repeat: Infinity,
                                delay: i * 0.3,
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
