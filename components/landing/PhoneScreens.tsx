"use client";

import { motion } from "framer-motion";

// Screen 1: Camera/Vision Demo — light mode brand palette
export function VisionScreen() {
    return (
        <div className="h-full flex flex-col" style={{ background: "var(--bg-base)" }}>
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="font-medium">9:41</span>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-2 rounded-sm border flex items-center justify-end pr-0.5" style={{ borderColor: "var(--text-muted)" }}>
                        <div className="w-2 h-1 rounded-sm" style={{ background: "var(--status-success)" }} />
                    </div>
                </div>
            </div>

            {/* Camera viewfinder */}
            <div className="flex-1 px-4 flex flex-col">
                <div className="relative flex-1 rounded-2xl overflow-hidden" style={{ background: "#e8e4dc" }}>
                    {/* Simulated concrete texture */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `
                linear-gradient(135deg, #d4d0c8 0%, #c8c4bc 50%, #d4d0c8 100%),
                repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 40px)
              `,
                        }}
                    >
                        {/* Crack pattern */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M30 20 L35 40 L32 60 L38 80" stroke="#a09890" strokeWidth="3" fill="none" />
                            <path d="M33 45 L45 50 L50 55" stroke="#a09890" strokeWidth="2" fill="none" />
                        </svg>
                    </div>

                    {/* Scanning beam */}
                    <motion.div
                        className="absolute left-0 right-0 h-1"
                        style={{
                            background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
                            boxShadow: "0 0 30px var(--accent-primary), 0 0 60px rgba(107,15,26,0.3)",
                        }}
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Bounding box detection */}
                    <motion.div
                        className="absolute top-[25%] left-[20%] w-[60%] h-[50%] rounded-lg"
                        style={{
                            border: "2px solid var(--status-success)",
                            boxShadow: "0 0 20px rgba(22,101,52,0.2)",
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                    >
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--status-success)" }} />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: "var(--status-success)" }} />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: "var(--status-success)" }} />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--status-success)" }} />
                    </motion.div>

                    {/* Detection label */}
                    <motion.div
                        className="absolute bottom-4 left-4 right-4 p-3 rounded-xl"
                        style={{
                            background: "rgba(255,255,255,0.95)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(22,101,52,0.2)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2 }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--status-success)" }} />
                            <span className="text-xs font-semibold" style={{ color: "var(--status-success)" }}>HAZARD DETECTED</span>
                        </div>
                        <TypewriterText text="Infrastructure / Trip Risk / Severity: High" delay={2.5} />
                    </motion.div>
                </div>

                {/* Capture button */}
                <div className="py-6 flex justify-center">
                    <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center" style={{ borderColor: "rgba(107,15,26,0.2)" }}>
                        <div className="w-12 h-12 rounded-full" style={{ background: "var(--accent-primary)" }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Screen 2: Community Feed — light mode brand palette
export function PulseFeedScreen() {
    return (
        <div className="h-full flex flex-col" style={{ background: "var(--bg-base)" }}>
            {/* Header */}
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-hairline)" }}>
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Community Feed</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--status-success)" }} />
                        <span className="text-xs font-medium" style={{ color: "var(--status-success)" }}>Live</span>
                    </div>
                </div>
            </div>

            {/* Feed items */}
            <div className="flex-1 overflow-hidden px-4 py-3">
                {/* Trend Alert */}
                <motion.div
                    className="mb-3 p-4 rounded-xl"
                    style={{
                        background: "rgba(194,65,12,0.06)",
                        border: "1px solid rgba(194,65,12,0.15)",
                    }}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-warning)" strokeWidth="2">
                            <path d="M13 17h8l-2.6-2.6A9 9 0 0 0 13 3c-3 0-5.68 1.46-7.35 3.71" />
                            <path d="M11 7H3l2.6 2.6A9 9 0 0 0 11 21c3 0 5.68-1.46 7.35-3.71" />
                        </svg>
                        <span className="text-xs font-semibold" style={{ color: "var(--status-warning)" }}>TREND ALERT</span>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>5 Potholes reported on Main St</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>in the last 24 hours</p>
                </motion.div>

                {/* Regular feed items */}
                {[
                    { type: "hazard", title: "Sidewalk crack", time: "12m", severity: "medium" },
                    { type: "story", title: "Park cleanup complete!", time: "1h" },
                    { type: "hazard", title: "Broken streetlight", time: "2h", severity: "high" },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        className="mb-2 p-3 rounded-xl"
                        style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border-hairline)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        }}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1 + i * 0.3 }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.title}</span>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.time}</span>
                        </div>
                        {item.severity && (
                            <span
                                className="text-xs px-2 py-0.5 rounded mt-1 inline-block font-medium"
                                style={{
                                    background: item.severity === "high" ? "rgba(185,28,28,0.08)" : "rgba(146,64,14,0.08)",
                                    color: item.severity === "high" ? "var(--status-critical)" : "var(--status-caution)",
                                }}
                            >
                                {item.severity.toUpperCase()}
                            </span>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// Screen 3: Agent Tracker — light mode brand palette
export function AgentTrackerScreen() {
    return (
        <div className="h-full flex flex-col items-center justify-center px-6" style={{ background: "var(--bg-base)" }}>
            <h2 className="text-lg font-semibold mb-8" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Ticket Progress</h2>

            {/* Progress steps */}
            <div className="w-full max-w-[260px] space-y-4">
                <ProgressStep icon="thinking" label="Analyzing report..." status="complete" delay={0} />
                <ProgressStep icon="filing" label="Auto-Filing to Waterloo.ca..." status="complete" delay={1.5} />
                <ProgressStep icon="confirmed" label="Confirmation Received" sublabel="#CITY-4921" status="active" delay={3} />
            </div>

            {/* Ticket card */}
            <motion.div
                className="mt-8 w-full max-w-[260px] p-4 rounded-xl"
                style={{
                    background: "rgba(22,101,52,0.06)",
                    border: "1px solid rgba(22,101,52,0.15)",
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 4, type: "spring" }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span className="font-semibold text-sm" style={{ color: "var(--status-success)" }}>Ticket Confirmed</span>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>#CITY-4921</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Waterloo 311 &middot; Infrastructure</p>
            </motion.div>
        </div>
    );
}

// Typewriter text effect
function TypewriterText({ text, delay }: { text: string; delay: number }) {
    return (
        <motion.p
            className="text-xs font-mono"
            style={{ color: "var(--text-secondary)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay }}
        >
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay + i * 0.03 }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.p>
    );
}

// Progress step component
function ProgressStep({
    icon,
    label,
    sublabel,
    status,
    delay,
}: {
    icon: "thinking" | "filing" | "confirmed";
    label: string;
    sublabel?: string;
    status: "pending" | "complete" | "active";
    delay: number;
}) {
    return (
        <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
        >
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                    background: status === "active" ? "rgba(22,101,52,0.08)" : "rgba(107,15,26,0.08)",
                    border: `1px solid ${status === "active" ? "rgba(22,101,52,0.2)" : "rgba(107,15,26,0.2)"}`,
                }}
            >
                {icon === "thinking" && (
                    <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "var(--accent-primary)" }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: status === "pending" ? Infinity : 0 }}
                    />
                )}
                {icon === "filing" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                )}
                {icon === "confirmed" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </div>
            <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                {sublabel && <p className="text-xs font-mono" style={{ color: "var(--status-success)" }}>{sublabel}</p>}
            </div>
        </motion.div>
    );
}
