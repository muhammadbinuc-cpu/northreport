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
    // Optional scroll-based rotation
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
            {/* Phone outer frame */}
            <div
                className="relative w-[300px] h-[620px] md:w-[340px] md:h-[700px] rounded-[48px] p-[10px]"
                style={{
                    background: "linear-gradient(145deg, #2d2d38 0%, #1a1a22 50%, #2d2d38 100%)",
                    boxShadow: `
            0 60px 120px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.08),
            inset 0 1px 0 rgba(255,255,255,0.15),
            inset 0 -1px 0 rgba(0,0,0,0.3),
            0 0 60px rgba(99,102,241,0.15)
          `,
                }}
            >
                {/* Dynamic Island / Notch */}
                <div
                    className="absolute top-4 left-1/2 -translate-x-1/2 w-[100px] h-[32px] rounded-full z-20 flex items-center justify-center gap-2"
                    style={{ background: "#0a0a0f" }}
                >
                    <div className="w-2 h-2 rounded-full bg-gray-800" />
                    <div className="w-3 h-3 rounded-full bg-gray-800 ring-1 ring-gray-700" />
                </div>

                {/* Screen bezel (inner frame) */}
                <div
                    className="w-full h-full rounded-[40px] overflow-hidden relative"
                    style={{
                        background: "#0a0a0f",
                        boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
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
                            background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)",
                        }}
                    />
                </div>

                {/* Side buttons - Volume */}
                <div
                    className="absolute -left-[3px] top-[140px] w-[3px] h-[40px] rounded-l"
                    style={{ background: "linear-gradient(180deg, #3a3a45, #2a2a35, #3a3a45)" }}
                />
                <div
                    className="absolute -left-[3px] top-[190px] w-[3px] h-[40px] rounded-l"
                    style={{ background: "linear-gradient(180deg, #3a3a45, #2a2a35, #3a3a45)" }}
                />

                {/* Side buttons - Power */}
                <div
                    className="absolute -right-[3px] top-[160px] w-[3px] h-[60px] rounded-r"
                    style={{ background: "linear-gradient(180deg, #3a3a45, #2a2a35, #3a3a45)" }}
                />
            </div>

            {/* Reflection/Glow under phone */}
            <div
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[280px] h-[80px] blur-3xl"
                style={{
                    background: "radial-gradient(ellipse, rgba(99,102,241,0.3) 0%, transparent 70%)",
                }}
            />
        </motion.div>
    );
}
