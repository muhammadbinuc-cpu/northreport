"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StoryPanelProps {
    title: string;
    subtitle?: string;
    body?: string | string[];
    children?: ReactNode;
    active: boolean;
    position?: "left" | "center";
}

export default function StoryPanel({
    title,
    subtitle,
    body,
    children,
    active,
    position = "left",
}: StoryPanelProps) {
    const bodyLines = Array.isArray(body) ? body : body ? [body] : [];

    return (
        <div
            className={`h-screen flex ${position === "center"
                    ? "items-center justify-center"
                    : "items-center justify-start"
                } pointer-events-none`}
        >
            <motion.div
                className={`relative max-w-lg pointer-events-auto ${position === "center" ? "text-center px-8" : "px-8 md:px-12 lg:px-16"
                    }`}
                initial={{ opacity: 0, y: 40 }}
                animate={{
                    opacity: active ? 1 : 0,
                    y: active ? 0 : 40,
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Gradient backdrop - only for non-center panels */}
                {position === "left" && (
                    <div
                        className="absolute inset-0 -left-8 -top-8 -bottom-8 -right-0 rounded-r-2xl -z-10"
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.7) 60%, transparent 100%)",
                        }}
                    />
                )}

                {/* Title */}
                <h2
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
                    style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
                >
                    {title}
                </h2>

                {/* Subtitle */}
                {subtitle && (
                    <p
                        className="text-xl md:text-2xl text-teal-400 font-semibold mb-4"
                        style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
                    >
                        {subtitle}
                    </p>
                )}

                {/* Body text */}
                {bodyLines.map((line, i) => (
                    <p
                        key={i}
                        className="text-base md:text-lg text-gray-300 mb-3 leading-relaxed"
                        style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}
                    >
                        {line}
                    </p>
                ))}

                {/* Children (buttons, icons, etc.) */}
                {children && <div className="mt-6">{children}</div>}
            </motion.div>
        </div>
    );
}
