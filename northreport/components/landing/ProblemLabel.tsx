"use client";

import React from "react";

interface ProblemLabelProps {
    text: string;
    position: "left" | "center" | "right";
    visible: boolean;
    type: "warning" | "info";
}

const ProblemLabel: React.FC<ProblemLabelProps> = ({
    text,
    position,
    visible,
    type,
}) => {
    const positionStyles: Record<typeof position, React.CSSProperties> = {
        left: { left: "25%", transform: "translateX(-50%)" },
        center: { left: "60%", transform: "translateX(-50%)" },
        right: { left: "80%", transform: "translateX(-50%)" },
    };

    const borderColor = type === "warning" ? "#fbbf24" : "#14b8a6";

    return (
        <div
            style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                ...positionStyles[position],
                background: "rgba(10, 15, 30, 0.9)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderLeft: `3px solid ${borderColor}`,
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.85)",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                opacity: visible ? 1 : 0,
                transform: visible
                    ? `translateX(-50%) translateY(0)`
                    : `translateX(-50%) translateY(8px)`,
                transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
                pointerEvents: visible ? "auto" : "none",
                zIndex: 20,
                willChange: "opacity, transform",
            }}
        >
            {/* Small arrow pointing down */}
            <div
                style={{
                    position: "absolute",
                    bottom: "-6px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "6px solid rgba(10, 15, 30, 0.9)",
                }}
            />
            {text}
        </div>
    );
};

export default ProblemLabel;
