"use client";

import React from "react";

interface CitySkylineProps {
    problemsVisible?: number; // 0 to 1
    pulseProgress?: number; // 0 to 1
    markersVisible?: number; // 0 to 1
}

// Building data: x position, width, height, shade, hasAntenna, windowPattern
interface Building {
    x: number;
    width: number;
    height: number;
    fill: string;
    antenna?: "line" | "triangle" | "double";
    windowCols: number;
    windowRows: number;
}

const buildings: Building[] = [
    { x: 0, width: 70, height: 120, fill: "#1a1a2e", windowCols: 3, windowRows: 5 },
    { x: 65, width: 55, height: 85, fill: "#16213e", windowCols: 2, windowRows: 4 },
    { x: 115, width: 80, height: 160, fill: "#1e293b", antenna: "line", windowCols: 3, windowRows: 7 },
    { x: 190, width: 50, height: 70, fill: "#1a1a2e", windowCols: 2, windowRows: 3 },
    { x: 235, width: 65, height: 140, fill: "#16213e", antenna: "triangle", windowCols: 3, windowRows: 6 },
    { x: 295, width: 85, height: 180, fill: "#1a1a2e", antenna: "double", windowCols: 4, windowRows: 8 },
    { x: 375, width: 60, height: 95, fill: "#1e293b", windowCols: 2, windowRows: 4 },
    { x: 430, width: 75, height: 130, fill: "#16213e", windowCols: 3, windowRows: 6 },
    { x: 500, width: 55, height: 60, fill: "#1a1a2e", windowCols: 2, windowRows: 3 },
    { x: 550, width: 90, height: 150, fill: "#1e293b", antenna: "line", windowCols: 4, windowRows: 7 },
    { x: 635, width: 70, height: 110, fill: "#1a1a2e", windowCols: 3, windowRows: 5 },
    { x: 700, width: 60, height: 75, fill: "#16213e", windowCols: 2, windowRows: 4 },
    { x: 755, width: 80, height: 170, fill: "#1e293b", antenna: "triangle", windowCols: 3, windowRows: 8 },
    { x: 830, width: 55, height: 90, fill: "#1a1a2e", windowCols: 2, windowRows: 4 },
    { x: 880, width: 70, height: 125, fill: "#16213e", windowCols: 3, windowRows: 5 },
];

const VIEWBOX_WIDTH = 960;
const VIEWBOX_HEIGHT = 220;
const GROUND_Y = 200;
const STREET_HEIGHT = 20;

// Seeded random for consistent window patterns
const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
};

const CitySkyline: React.FC<CitySkylineProps> = ({
    problemsVisible = 0,
    pulseProgress = 0,
    markersVisible = 0,
}) => {
    // Problem positions (percentage of viewbox width)
    const potholeX = VIEWBOX_WIDTH * 0.25;
    const streetlightX = VIEWBOX_WIDTH * 0.6;
    const crackX = VIEWBOX_WIDTH * 0.8;

    // Find building near crack position for the wall crack
    const crackBuilding = buildings.find((b) => b.x <= crackX && b.x + b.width >= crackX) || buildings[12];

    return (
        <svg
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            preserveAspectRatio="xMidYMax slice"
            style={{
                width: "100%",
                height: "200px",
                display: "block",
            }}
            aria-label="City skyline illustration"
        >
            <defs>
                {/* Gradient for the pulse sweep */}
                <linearGradient id="pulseSweep" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0" />
                    <stop offset="30%" stopColor="#14b8a6" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.8" />
                    <stop offset="70%" stopColor="#14b8a6" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                </linearGradient>

                {/* Glow filter for markers */}
                <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Glow filter for lit windows */}
                <filter id="windowGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Sky gradient background */}
            <rect x="0" y="0" width={VIEWBOX_WIDTH} height={GROUND_Y} fill="#0a0a1a" />

            {/* Buildings */}
            {buildings.map((building, idx) => {
                const buildingY = GROUND_Y - building.height;
                const windowWidth = 6;
                const windowHeight = 8;
                const windowGapX = (building.width - 10) / building.windowCols;
                const windowGapY = (building.height - 20) / building.windowRows;

                return (
                    <g key={idx}>
                        {/* Building body */}
                        <rect
                            x={building.x}
                            y={buildingY}
                            width={building.width}
                            height={building.height}
                            fill={building.fill}
                        />

                        {/* Antenna */}
                        {building.antenna === "line" && (
                            <line
                                x1={building.x + building.width / 2}
                                y1={buildingY}
                                x2={building.x + building.width / 2}
                                y2={buildingY - 15}
                                stroke="#2d3748"
                                strokeWidth="2"
                            />
                        )}
                        {building.antenna === "triangle" && (
                            <polygon
                                points={`
                  ${building.x + building.width / 2},${buildingY - 12}
                  ${building.x + building.width / 2 - 8},${buildingY}
                  ${building.x + building.width / 2 + 8},${buildingY}
                `}
                                fill="#2d3748"
                            />
                        )}
                        {building.antenna === "double" && (
                            <>
                                <line
                                    x1={building.x + building.width / 3}
                                    y1={buildingY}
                                    x2={building.x + building.width / 3}
                                    y2={buildingY - 10}
                                    stroke="#2d3748"
                                    strokeWidth="2"
                                />
                                <line
                                    x1={building.x + (building.width * 2) / 3}
                                    y1={buildingY}
                                    x2={building.x + (building.width * 2) / 3}
                                    y2={buildingY - 10}
                                    stroke="#2d3748"
                                    strokeWidth="2"
                                />
                            </>
                        )}

                        {/* Windows */}
                        {Array.from({ length: building.windowRows }).map((_, row) =>
                            Array.from({ length: building.windowCols }).map((_, col) => {
                                const isLit = seededRandom(idx * 100 + row * 10 + col) > 0.5;
                                const wx = building.x + 5 + col * windowGapX + (windowGapX - windowWidth) / 2;
                                const wy = buildingY + 10 + row * windowGapY;

                                return (
                                    <rect
                                        key={`${row}-${col}`}
                                        x={wx}
                                        y={wy}
                                        width={windowWidth}
                                        height={windowHeight}
                                        fill={isLit ? "#fbbf24" : "#0d1117"}
                                        opacity={isLit ? 0.35 : 0.8}
                                        filter={isLit ? "url(#windowGlow)" : undefined}
                                    />
                                );
                            })
                        )}
                    </g>
                );
            })}

            {/* Street */}
            <rect x="0" y={GROUND_Y} width={VIEWBOX_WIDTH} height={STREET_HEIGHT} fill="#111" />

            {/* Road markings - dashed center line */}
            {Array.from({ length: 20 }).map((_, i) => (
                <rect
                    key={i}
                    x={i * 50 + 10}
                    y={GROUND_Y + STREET_HEIGHT / 2 - 1}
                    width="30"
                    height="2"
                    fill="#374151"
                />
            ))}

            {/* === PROBLEMS LAYER === */}
            {problemsVisible > 0 && (
                <g style={{ opacity: problemsVisible }}>
                    {/* Pothole at ~25% from left */}
                    <g>
                        <ellipse cx={potholeX} cy={GROUND_Y + 10} rx="20" ry="8" fill="#1f1f1f" />
                        <ellipse cx={potholeX} cy={GROUND_Y + 10} rx="16" ry="5" fill="#0a0a0a" />
                        {/* Cracks radiating from pothole */}
                        <path
                            d={`M${potholeX - 20} ${GROUND_Y + 8} L${potholeX - 30} ${GROUND_Y + 5} L${potholeX - 35} ${GROUND_Y + 10}`}
                            stroke="#f97316"
                            strokeWidth="1.5"
                            fill="none"
                        />
                        <path
                            d={`M${potholeX + 20} ${GROUND_Y + 12} L${potholeX + 28} ${GROUND_Y + 8} L${potholeX + 35} ${GROUND_Y + 14}`}
                            stroke="#f97316"
                            strokeWidth="1.5"
                            fill="none"
                        />
                        <path
                            d={`M${potholeX + 5} ${GROUND_Y + 16} L${potholeX + 10} ${GROUND_Y + 18}`}
                            stroke="#f97316"
                            strokeWidth="1"
                            fill="none"
                        />
                        {/* Orange glow on pothole */}
                        <ellipse cx={potholeX} cy={GROUND_Y + 10} rx="22" ry="10" fill="#f97316" opacity="0.15" />
                    </g>

                    {/* Broken streetlight at ~60% from left */}
                    <g>
                        {/* Lamp post */}
                        <rect x={streetlightX - 3} y={GROUND_Y - 70} width="6" height="70" fill="#374151" />
                        {/* Lamp arm */}
                        <rect x={streetlightX - 3} y={GROUND_Y - 70} width="25" height="4" fill="#374151" />
                        {/* Lamp head */}
                        <polygon
                            points={`${streetlightX + 15},${GROUND_Y - 70} ${streetlightX + 25},${GROUND_Y - 70} ${streetlightX + 28},${GROUND_Y - 60} ${streetlightX + 12},${GROUND_Y - 60}`}
                            fill="#4b5563"
                        />
                        {/* Flickering light */}
                        <ellipse
                            cx={streetlightX + 20}
                            cy={GROUND_Y - 55}
                            rx="8"
                            ry="12"
                            fill="#fbbf24"
                            opacity="0.4"
                            style={{
                                animation: "flicker 3s step-start infinite",
                            }}
                        />
                        {/* Broken indication - sparks */}
                        <circle cx={streetlightX + 24} cy={GROUND_Y - 62} r="2" fill="#f97316" opacity="0.8" />
                        <circle cx={streetlightX + 18} cy={GROUND_Y - 58} r="1.5" fill="#fbbf24" opacity="0.6" />
                    </g>

                    {/* Wall crack at ~80% from left */}
                    <g>
                        <path
                            d={`
                M${crackX} ${GROUND_Y - crackBuilding.height + 20}
                L${crackX - 3} ${GROUND_Y - crackBuilding.height + 35}
                L${crackX + 2} ${GROUND_Y - crackBuilding.height + 50}
                L${crackX - 4} ${GROUND_Y - crackBuilding.height + 65}
                L${crackX + 1} ${GROUND_Y - crackBuilding.height + 80}
                L${crackX - 2} ${GROUND_Y - crackBuilding.height + 95}
              `}
                            stroke="#f97316"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* Branch cracks */}
                        <path
                            d={`M${crackX - 3} ${GROUND_Y - crackBuilding.height + 35} L${crackX - 10} ${GROUND_Y - crackBuilding.height + 40}`}
                            stroke="#f97316"
                            strokeWidth="1.5"
                            fill="none"
                        />
                        <path
                            d={`M${crackX + 2} ${GROUND_Y - crackBuilding.height + 50} L${crackX + 8} ${GROUND_Y - crackBuilding.height + 55}`}
                            stroke="#f97316"
                            strokeWidth="1.5"
                            fill="none"
                        />
                    </g>
                </g>
            )}

            {/* === PULSE SWEEP LAYER === */}
            {pulseProgress > 0 && (
                <rect
                    x={pulseProgress * VIEWBOX_WIDTH - 40}
                    y="0"
                    width="80"
                    height={GROUND_Y + STREET_HEIGHT}
                    fill="url(#pulseSweep)"
                    style={{ opacity: 0.6, mixBlendMode: "screen" }}
                />
            )}

            {/* === MARKERS LAYER === */}
            {markersVisible > 0 && (
                <g style={{ opacity: markersVisible }}>
                    {/* Pothole marker */}
                    <g filter="url(#markerGlow)">
                        <circle
                            cx={potholeX}
                            cy={GROUND_Y - 5}
                            r="8"
                            fill="#14b8a6"
                            style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
                        />
                        <circle cx={potholeX} cy={GROUND_Y - 5} r="4" fill="#fff" opacity="0.8" />
                    </g>

                    {/* Streetlight marker */}
                    <g filter="url(#markerGlow)">
                        <circle
                            cx={streetlightX + 10}
                            cy={GROUND_Y - 80}
                            r="8"
                            fill="#14b8a6"
                            style={{ animation: "pulse-glow 2s ease-in-out infinite", animationDelay: "0.3s" }}
                        />
                        <circle cx={streetlightX + 10} cy={GROUND_Y - 80} r="4" fill="#fff" opacity="0.8" />
                    </g>

                    {/* Wall crack marker */}
                    <g filter="url(#markerGlow)">
                        <circle
                            cx={crackX}
                            cy={GROUND_Y - crackBuilding.height}
                            r="8"
                            fill="#14b8a6"
                            style={{ animation: "pulse-glow 2s ease-in-out infinite", animationDelay: "0.6s" }}
                        />
                        <circle cx={crackX} cy={GROUND_Y - crackBuilding.height} r="4" fill="#fff" opacity="0.8" />
                    </g>
                </g>
            )}

            {/* Inject keyframes for inline styles */}
            <style>
                {`
          @keyframes pulse-glow {
            0%, 100% { transform-origin: center; transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.3); opacity: 0.4; }
          }
          @keyframes flicker {
            0%, 100% { opacity: 0.4; }
            10% { opacity: 0.1; }
            30% { opacity: 0.35; }
            50% { opacity: 0.05; }
            70% { opacity: 0.25; }
            90% { opacity: 0.15; }
          }
        `}
            </style>
        </svg>
    );
};

export default CitySkyline;
