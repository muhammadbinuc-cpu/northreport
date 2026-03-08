"use client";

import type { ReactNode } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";

interface PhoneFrameProps {
    children: ReactNode;
    scrollProgress?: MotionValue<number>;
    rotateRange?: [number, number];
    className?: string;
}

export default function PhoneFrame({
    children,
    scrollProgress,
    rotateRange = [0, 0],
    className = "",
}: PhoneFrameProps) {
    const rotateY = scrollProgress
        ? useTransform(scrollProgress, [0, 1], rotateRange)
        : 0;

    return (
        <motion.div
            className={`relative ${className}`}
            style={{
                rotateY,
                transformStyle: "preserve-3d",
                transformPerspective: "1200px",
            }}
        >
            {/* Phone outer frame — light titanium finish */}
            <div
                className="relative w-[300px] h-[620px] md:w-[340px] md:h-[700px] rounded-[48px] p-[10px]"
                style={{
                    background: "linear-gradient(145deg, #e8e6e3 0%, #d4d2cf 50%, #e8e6e3 100%)",
                    boxShadow: `
            0 40px 80px rgba(30,30,30,0.15),
            0 0 0 1px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.8),
            inset 0 -1px 0 rgba(0,0,0,0.08),
            0 0 40px rgba(107,15,26,0.08)
          `,
                }}
            >
                {/* Dynamic Island */}
                <div
                    className="absolute top-4 left-1/2 -translate-x-1/2 w-[100px] h-[32px] rounded-full z-20 flex items-center justify-center gap-2"
                    style={{ background: "#1a1a1e" }}
                >
                    <div className="w-2 h-2 rounded-full bg-gray-700" />
                    <div className="w-3 h-3 rounded-full bg-gray-700 ring-1 ring-gray-600" />
                </div>

                {/* Screen bezel */}
                <div
                    className="w-full h-full rounded-[40px] overflow-hidden relative"
                    style={{
                        background: "var(--bg-base)",
                        boxShadow: "inset 0 0 10px rgba(0,0,0,0.06)",
                    }}
                >
                    {/* Screen content */}
                    <div className="w-full h-full overflow-hidden">
                        {children}
                    </div>

                    {/* Screen glare effect */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%)",
                        }}
                    />
                </div>

                {/* Side buttons - Volume */}
                <div
                    className="absolute -left-[3px] top-[140px] w-[3px] h-[40px] rounded-l"
                    style={{ background: "linear-gradient(180deg, #d4d2cf, #c0bebb, #d4d2cf)" }}
                />
                <div
                    className="absolute -left-[3px] top-[190px] w-[3px] h-[40px] rounded-l"
                    style={{ background: "linear-gradient(180deg, #d4d2cf, #c0bebb, #d4d2cf)" }}
                />

                {/* Side buttons - Power */}
                <div
                    className="absolute -right-[3px] top-[160px] w-[3px] h-[60px] rounded-r"
                    style={{ background: "linear-gradient(180deg, #d4d2cf, #c0bebb, #d4d2cf)" }}
                />
            </div>

            {/* Subtle reflection under phone */}
            <div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[260px] h-[60px] blur-3xl"
                style={{
                    background: "radial-gradient(ellipse, rgba(107,15,26,0.12) 0%, transparent 70%)",
                }}
            />
        </motion.div>
    );
}
