"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollSectionProps {
    children: ReactNode;
    scrollProgress: MotionValue<number>;
    startRange: number;
    endRange: number;
    className?: string;
}

export default function ScrollSection({
    children,
    scrollProgress,
    startRange,
    endRange,
    className = "",
}: ScrollSectionProps) {
    // Fade in as we enter, fade out as we leave
    const opacity = useTransform(
        scrollProgress,
        [
            startRange - 0.1,
            startRange,
            endRange - 0.1,
            endRange,
        ],
        [0, 1, 1, 0]
    );

    // Slide up on enter
    const y = useTransform(
        scrollProgress,
        [startRange - 0.1, startRange, endRange - 0.1, endRange],
        [60, 0, 0, -40]
    );

    return (
        <motion.div
            className={`fixed inset-0 flex items-center justify-center z-10 ${className}`}
            style={{ opacity, y }}
        >
            {children}
        </motion.div>
    );
}

// Text Content Panel Component
export function ContentPanel({
    headline,
    subheadline,
    body,
    align = "left",
}: {
    headline: string;
    subheadline?: string;
    body?: string;
    align?: "left" | "center" | "right";
}) {
    const alignClass = {
        left: "text-left items-start",
        center: "text-center items-center",
        right: "text-right items-end",
    }[align];

    return (
        <div className={`flex flex-col gap-4 max-w-md ${alignClass}`}>
            <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15]"
                style={{
                    background: "linear-gradient(180deg, #fff 0%, #94a3b8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                {headline}
            </h2>
            {subheadline && (
                <p className="text-lg md:text-xl text-teal-400 font-medium">
                    {subheadline}
                </p>
            )}
            {body && (
                <p className="text-base text-gray-400 leading-relaxed">
                    {body}
                </p>
            )}
        </div>
    );
}
