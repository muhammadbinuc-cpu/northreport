"use client";

import { useRef } from "react";
import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    type MotionValue,
} from "framer-motion";

/* ── Building component ──────────────────────────────────────── */

interface BuildingProps {
    height: number;
    width: number;
    x: number;
    color: string;
    windowRows: number;
    parallaxSpeed: number;
    scrollProgress: ReturnType<typeof useSpring>;
}

function CityBuilding({
    height,
    width,
    x,
    color,
    windowRows,
    parallaxSpeed,
    scrollProgress,
}: BuildingProps) {
    const translateX = useTransform(
        scrollProgress,
        [0, 0.35],
        [0, (x < 50 ? -1 : 1) * parallaxSpeed * 120]
    );

    const windowColor =
        color === "#d4cfc7"
            ? "#e2ded8"
            : color === "#c2bbb1"
                ? "#d0c9bf"
                : "#c0b9af";

    const windowCols = Math.max(2, Math.floor(width / 24));
    const windows: { row: number; col: number }[] = [];
    for (let r = 0; r < windowRows; r++) {
        for (let c = 0; c < windowCols; c++) {
            if (Math.random() > 0.15) windows.push({ row: r, col: c });
        }
    }

    return (
        <motion.div
            style={{
                position: "absolute",
                bottom: 60,
                left: `${x}%`,
                transform: "translateX(-50%)",
                width,
                height,
                x: translateX,
                zIndex: height > 350 ? 3 : height > 250 ? 2 : 1,
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: color,
                    borderRadius: "6px 6px 0 0",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Windows */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${windowCols}, 1fr)`,
                        gap: "6px 8px",
                        padding: "18px 10px",
                    }}
                >
                    {windows.map((w, i) => (
                        <div
                            key={i}
                            style={{
                                width: 8,
                                height: 10,
                                background: windowColor,
                                borderRadius: 1,
                                gridRow: w.row + 1,
                                gridColumn: w.col + 1,
                            }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

/* ── Problem SVG icons ───────────────────────────────────────── */

function PotholeSVG() {
    return (
        <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
            <ellipse cx="40" cy="30" rx="35" ry="16" fill="#5c5650" opacity="0.6" />
            <ellipse cx="40" cy="30" rx="24" ry="10" fill="#3a3530" />
            <polyline
                points="18,26 28,22 35,28 42,20 52,26 60,22"
                stroke="#8b1a2b"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
            />
        </svg>
    );
}

function BrokenLightSVG() {
    return (
        <svg width="40" height="100" viewBox="0 0 40 100" fill="none">
            <rect x="17" y="20" width="6" height="80" rx="2" fill="#8a8279" />
            <circle cx="20" cy="16" r="12" fill="#d4cfc7" stroke="#b0a89d" strokeWidth="1.5" />
            <line x1="14" y1="10" x2="26" y2="22" stroke="#8b1a2b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="26" y1="10" x2="14" y2="22" stroke="#8b1a2b" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

function TrashSVG() {
    return (
        <svg width="70" height="55" viewBox="0 0 70 55" fill="none">
            <path
                d="M8,48 Q4,35 12,30 Q8,22 18,20 Q16,12 28,14 Q30,8 38,12 Q42,6 48,12 Q55,8 56,16 Q64,14 62,24 Q68,28 64,36 Q70,42 60,48 Z"
                fill="#5c5650"
                stroke="#4a4540"
                strokeWidth="1"
            />
            <path
                d="M22,40 Q18,32 26,28 Q28,22 36,26 Q40,20 44,28 Q50,24 48,34 Q54,36 48,42 Z"
                fill="#4a4540"
            />
        </svg>
    );
}

function CrackSVG({ progress }: { progress: ReturnType<typeof useSpring> }) {
    const dashOffset = useTransform(progress, [0.2, 0.4], [200, 0]);

    return (
        <svg width="30" height="120" viewBox="0 0 30 120" fill="none">
            <motion.polyline
                points="15,5 10,25 18,40 8,60 20,75 12,95 16,115"
                stroke="#8b1a2b"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="200"
                style={{ strokeDashoffset: dashOffset }}
            />
        </svg>
    );
}

/* ── Floating problem label ──────────────────────────────────── */

function ProblemLabel({
    text,
    opacity,
}: {
    text: string;
    opacity: MotionValue<number>;
}) {
    return (
        <motion.span
            style={{
                opacity,
                color: "#8b1a2b",
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
            }}
            className="animate-pulse"
        >
            {text}
        </motion.span>
    );
}

/* ── Buildings data ──────────────────────────────────────────── */

const BUILDINGS = [
    { height: 320, width: 70, x: 6, color: "#c2bbb1", windowRows: 10, parallaxSpeed: 0.7 },
    { height: 420, width: 85, x: 18, color: "#d4cfc7", windowRows: 14, parallaxSpeed: 1.2 },
    { height: 260, width: 60, x: 30, color: "#b0a89d", windowRows: 8, parallaxSpeed: 0.5 },
    { height: 480, width: 90, x: 42, color: "#d4cfc7", windowRows: 16, parallaxSpeed: 1.0 },
    { height: 380, width: 75, x: 58, color: "#c2bbb1", windowRows: 12, parallaxSpeed: 1.0 },
    { height: 500, width: 95, x: 70, color: "#d4cfc7", windowRows: 16, parallaxSpeed: 1.3 },
    { height: 290, width: 65, x: 82, color: "#b0a89d", windowRows: 9, parallaxSpeed: 0.6 },
    { height: 350, width: 72, x: 94, color: "#c2bbb1", windowRows: 11, parallaxSpeed: 0.8 },
];

/* ── Main component ──────────────────────────────────────────── */

export default function CityScrollScene() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 25 });

    /* ── Layer 1: City ── */
    const skyGradientStop = useTransform(smooth, [0, 0.2], [0, 20]);
    const logoOpacity = useTransform(smooth, [0, 0.12], [1, 0]);

    /* ── Layer 2: Problems ── */
    const potholeOpacity = useTransform(smooth, [0.18, 0.28], [0, 1]);
    const potholeScale = useTransform(smooth, [0.18, 0.28], [0.6, 1]);
    const lightOpacity = useTransform(smooth, [0.22, 0.32], [0, 1]);
    const lightY = useTransform(smooth, [0.22, 0.32], [-40, 0]);
    const trashOpacity = useTransform(smooth, [0.26, 0.36], [0, 1]);
    const trashY = useTransform(smooth, [0.26, 0.36], [30, 0]);

    const label1Opacity = useTransform(smooth, [0.25, 0.32], [0, 1]);
    const label2Opacity = useTransform(smooth, [0.29, 0.36], [0, 1]);
    const label3Opacity = useTransform(smooth, [0.33, 0.40], [0, 1]);
    const label4Opacity = useTransform(smooth, [0.37, 0.44], [0, 1]);

    /* Big text */
    const bigTextOpacity = useTransform(smooth, [0.32, 0.42, 0.55, 0.62], [0, 1, 1, 0]);
    const bigTextY = useTransform(smooth, [0.32, 0.42], [30, 0]);

    /* ── Layer 3: Phone rises ── */
    const overlayOpacity = useTransform(smooth, [0.42, 0.6], [0, 0.8]);
    const phoneY = useTransform(smooth, [0.45, 0.68], [800, 0]);
    const phoneOpacity = useTransform(smooth, [0.45, 0.55], [0, 1]);
    const phoneSplashOpacity = useTransform(smooth, [0.55, 0.65], [0, 1]);

    /* ── Layer 4: Transition text ── */
    const transTextOpacity = useTransform(smooth, [0.58, 0.68, 0.82, 0.9], [0, 1, 1, 0]);
    const transTextY = useTransform(smooth, [0.58, 0.68], [20, 0]);

    /* Final fade to dark */
    const finalDarkOpacity = useTransform(smooth, [0.8, 1.0], [0, 1]);

    return (
        <div
            ref={containerRef}
            style={{ height: "400vh", position: "relative" }}
        >
            <div
                className="sticky top-0 h-screen overflow-hidden"
                style={{ background: "#faf8f5" }}
            >
                {/* ─── Sky gradient ─── */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: useTransform(
                            skyGradientStop,
                            (v: number) =>
                                `linear-gradient(to bottom, #faf8f5 ${60 - v}%, #e8e2d9 100%)`
                        ),
                    }}
                />

                {/* ─── Logo ─── */}
                <motion.div
                    className="absolute top-8 left-0 right-0 z-30 flex items-center justify-center gap-2"
                    style={{ opacity: logoOpacity }}
                >
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: "#f0ece6", border: "1px solid #e8e2d9" }}
                    >
                        <svg className="animate-compass" width="22" height="22" viewBox="0 0 44 44" fill="none">
                            <polygon points="22,5 25.5,22 22,19.5 18.5,22" fill="#8b1a2b" />
                            <polygon points="22,39 25.5,22 22,24.5 18.5,22" fill="#5c5650" />
                            <circle cx="22" cy="22" r="2.5" fill="#1a1a1a" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold tracking-tight" style={{ color: "#1a1a1a" }}>
                        North<span style={{ color: "#8b1a2b" }}>Report</span>
                    </span>
                </motion.div>

                {/* ─── Road / ground strip ─── */}
                <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{ height: 60, background: "#c2bbb1", zIndex: 4 }}
                >
                    {/* Road center line */}
                    <div
                        className="absolute top-1/2 left-0 right-0 -translate-y-1/2"
                        style={{
                            height: 2,
                            background: "repeating-linear-gradient(to right, #b0a89d 0, #b0a89d 30px, transparent 30px, transparent 50px)",
                        }}
                    />
                </div>

                {/* ─── Buildings ─── */}
                <div className="absolute inset-0" style={{ zIndex: 1 }}>
                    {BUILDINGS.map((b, i) => (
                        <CityBuilding key={i} {...b} scrollProgress={smooth} />
                    ))}
                </div>

                {/* ─── Problems ─── */}
                <div className="absolute inset-0" style={{ zIndex: 5 }}>
                    {/* Pothole on road */}
                    <motion.div
                        className="absolute hidden md:flex flex-col items-center gap-1"
                        style={{
                            bottom: 30,
                            left: "36%",
                            opacity: potholeOpacity,
                            scale: potholeScale,
                        }}
                    >
                        <ProblemLabel text="UNREPORTED" opacity={label1Opacity} />
                        <PotholeSVG />
                    </motion.div>

                    {/* Broken streetlight */}
                    <motion.div
                        className="absolute hidden md:flex flex-col items-center gap-1"
                        style={{
                            bottom: 60,
                            left: "24%",
                            opacity: lightOpacity,
                            y: lightY,
                        }}
                    >
                        <ProblemLabel text="IGNORED" opacity={label2Opacity} />
                        <BrokenLightSVG />
                    </motion.div>

                    {/* Trash on sidewalk */}
                    <motion.div
                        className="absolute hidden md:flex flex-col items-center gap-1"
                        style={{
                            bottom: 55,
                            right: "22%",
                            opacity: trashOpacity,
                            y: trashY,
                        }}
                    >
                        <ProblemLabel text="UNSEEN" opacity={label3Opacity} />
                        <TrashSVG />
                    </motion.div>

                    {/* Crack on building */}
                    <motion.div
                        className="absolute hidden md:block"
                        style={{
                            bottom: 180,
                            left: "68%",
                            opacity: useTransform(smooth, [0.2, 0.35], [0, 1]),
                        }}
                    >
                        <motion.div className="flex items-start gap-1">
                            <CrackSVG progress={smooth} />
                            <motion.div style={{ paddingTop: 40 }}>
                                <ProblemLabel text="CRUMBLING" opacity={label4Opacity} />
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Mobile: simplified problems */}
                    <motion.div
                        className="absolute bottom-16 left-4 right-4 flex md:hidden justify-around items-end"
                        style={{
                            opacity: useTransform(smooth, [0.2, 0.35], [0, 1]),
                            zIndex: 5,
                        }}
                    >
                        <motion.div className="flex flex-col items-center gap-1" style={{ opacity: potholeOpacity }}>
                            <span className="text-[10px] font-bold" style={{ color: "#8b1a2b" }}>UNREPORTED</span>
                            <svg width="50" height="32" viewBox="0 0 80 50" fill="none">
                                <ellipse cx="40" cy="30" rx="30" ry="12" fill="#3a3530" />
                                <polyline points="18,26 28,22 42,28 60,22" stroke="#8b1a2b" strokeWidth="2" fill="none" />
                            </svg>
                        </motion.div>
                        <motion.div className="flex flex-col items-center gap-1" style={{ opacity: lightOpacity }}>
                            <span className="text-[10px] font-bold" style={{ color: "#8b1a2b" }}>IGNORED</span>
                            <svg width="24" height="60" viewBox="0 0 40 100" fill="none">
                                <rect x="17" y="20" width="6" height="80" rx="2" fill="#8a8279" />
                                <circle cx="20" cy="16" r="10" fill="#d4cfc7" />
                                <line x1="14" y1="10" x2="26" y2="22" stroke="#8b1a2b" strokeWidth="2.5" />
                                <line x1="26" y1="10" x2="14" y2="22" stroke="#8b1a2b" strokeWidth="2.5" />
                            </svg>
                        </motion.div>
                        <motion.div className="flex flex-col items-center gap-1" style={{ opacity: trashOpacity }}>
                            <span className="text-[10px] font-bold" style={{ color: "#8b1a2b" }}>UNSEEN</span>
                            <svg width="45" height="35" viewBox="0 0 70 55" fill="none">
                                <path d="M8,48 Q4,35 12,30 Q16,12 28,14 Q42,6 48,12 Q64,14 62,24 Q70,42 60,48 Z" fill="#5c5650" />
                            </svg>
                        </motion.div>
                    </motion.div>
                </div>

                {/* ─── Big problem text ─── */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center px-8"
                    style={{ zIndex: 8, opacity: bigTextOpacity, y: bigTextY }}
                >
                    <h2
                        className="text-3xl md:text-5xl lg:text-[3.5rem] font-extrabold text-center leading-tight"
                        style={{
                            color: "#1a1a1a",
                            textShadow: "0 2px 20px rgba(250,248,245,0.9), 0 0 40px rgba(250,248,245,0.7)",
                        }}
                    >
                        Every city has problems
                        <br />
                        hiding in plain sight
                    </h2>
                </motion.div>

                {/* ─── Dark overlay ─── */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: "#1a1a1a",
                        opacity: overlayOpacity,
                        zIndex: 10,
                    }}
                />

                {/* ─── Phone rising ─── */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ zIndex: 15, y: phoneY, opacity: phoneOpacity }}
                >
                    <div
                        style={{
                            width: 256,
                            height: 520,
                            borderRadius: "2.5rem",
                            border: "3px solid #333333",
                            background: "#111111",
                            overflow: "hidden",
                            position: "relative",
                            boxShadow:
                                "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
                        }}
                    >
                        {/* Dynamic island */}
                        <div
                            style={{
                                position: "absolute",
                                top: 10,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: 80,
                                height: 22,
                                background: "#000",
                                borderRadius: 12,
                                zIndex: 20,
                            }}
                        />

                        {/* Splash screen */}
                        <motion.div
                            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                            style={{ opacity: phoneSplashOpacity }}
                        >
                            {/* Compass logo — pulsing */}
                            <motion.div
                                className="w-16 h-16 rounded-full flex items-center justify-center"
                                style={{
                                    background: "rgba(139,26,43,0.15)",
                                    border: "1px solid rgba(139,26,43,0.3)",
                                }}
                                animate={{ scale: [1, 1.08, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <svg width="30" height="30" viewBox="0 0 44 44" fill="none">
                                    <polygon points="22,5 25.5,22 22,19.5 18.5,22" fill="#8b1a2b" />
                                    <polygon points="22,39 25.5,22 22,24.5 18.5,22" fill="#5c5650" />
                                    <circle cx="22" cy="22" r="2.5" fill="white" />
                                </svg>
                            </motion.div>
                            <span className="text-base font-bold text-white tracking-tight">
                                North<span style={{ color: "#8b1a2b" }}>Report</span>
                            </span>
                            <span className="text-xs" style={{ color: "#8a8279" }}>
                                Reporting made simple
                            </span>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ─── Transition text ─── */}
                <motion.div
                    className="absolute inset-0 flex items-end justify-center pb-28 md:pb-20 px-8"
                    style={{ zIndex: 18, opacity: transTextOpacity, y: transTextY }}
                >
                    <p
                        className="text-xl md:text-2xl font-semibold text-center max-w-lg"
                        style={{ color: "#a1a1a1" }}
                    >
                        NorthReport turns local voices into real change.
                    </p>
                </motion.div>

                {/* ─── Final dark fill (seamless transition to PhoneReveal) ─── */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: "#1a1a1a",
                        opacity: finalDarkOpacity,
                        zIndex: 20,
                        pointerEvents: "none",
                    }}
                />
            </div>
        </div>
    );
}
