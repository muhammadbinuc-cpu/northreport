"use client";

interface NorthReportLogoProps {
    size?: "sm" | "md" | "lg";
    showText?: boolean;
}

export default function NorthReportLogo({ size = "md", showText = true }: NorthReportLogoProps) {
    const sizes = {
        sm: { icon: 28, text: "text-sm" },
        md: { icon: 36, text: "text-lg" },
        lg: { icon: 48, text: "text-2xl" },
    };

    const { icon, text } = sizes[size];

    return (
        <div className="flex items-center gap-2">
            <div
                className="rounded-full flex items-center justify-center"
                style={{
                    width: icon,
                    height: icon,
                    background: "rgba(139,26,43,0.08)",
                    border: "1px solid rgba(139,26,43,0.15)",
                }}
            >
                <svg width={icon * 0.55} height={icon * 0.55} viewBox="0 0 44 44" fill="none">
                    <polygon points="22,5 25.5,22 22,19.5 18.5,22" fill="#8b1a2b" />
                    <polygon points="22,39 25.5,22 22,24.5 18.5,22" fill="rgba(139,26,43,0.45)" />
                    <circle cx="22" cy="22" r="2.5" fill="#8b1a2b" />
                </svg>
            </div>
            {showText && (
                <span className={`font-bold tracking-tight ${text}`}>
                    <span style={{ color: "var(--text-primary, #1a1a1a)" }}>North</span>
                    <span style={{ color: "#8b1a2b" }}>Report</span>
                </span>
            )}
        </div>
    );
}
