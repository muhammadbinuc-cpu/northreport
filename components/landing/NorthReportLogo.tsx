"use client";

interface NorthReportLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "default" | "light";
}

export default function NorthReportLogo({
  size = "md",
  showText = true,
  variant = "default",
}: NorthReportLogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-base", gap: "gap-2" },
    md: { icon: 36, text: "text-xl", gap: "gap-2.5" },
    lg: { icon: 48, text: "text-3xl", gap: "gap-3" },
    xl: { icon: 72, text: "text-5xl md:text-6xl", gap: "gap-4" },
  };

  const { icon, text, gap } = sizes[size];
  const northColor = variant === "light" ? "#F5F0E1" : "#1E1E1E";
  const bubbleStroke = variant === "light" ? "rgba(30,30,30,0.6)" : "#fff";

  return (
    <div className={`flex items-center ${gap}`}>
      {/* Compass icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer thin circle */}
        <circle cx="21" cy="24" r="20" stroke="#6b0f1a" strokeWidth="1.5" fill="none" />
        {/* Filled maroon circle */}
        <circle cx="21" cy="24" r="16.5" fill="#6b0f1a" />
        {/* Compass needle — north (white) */}
        <polygon points="21,9 24.5,24 21,21 17.5,24" fill="white" />
        {/* Compass needle — south (translucent) */}
        <polygon points="21,39 24.5,24 21,27 17.5,24" fill="rgba(255,255,255,0.35)" />
        {/* Center dot */}
        <circle cx="21" cy="24" r="2" fill="white" />
        {/* Exclamation bubble */}
        <circle
          cx="37"
          cy="9"
          r="7"
          fill="#6b0f1a"
          stroke={bubbleStroke}
          strokeWidth="2"
        />
        {/* Exclamation line */}
        <rect x="35.8" y="4.5" width="2.4" height="5.5" rx="1.2" fill="white" />
        {/* Exclamation dot */}
        <circle cx="37" cy="12.5" r="1.3" fill="white" />
      </svg>

      {/* Text */}
      {showText && (
        <span
          className={`font-bold tracking-tight ${text}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span style={{ color: northColor }}>North</span>
          <span style={{ color: "#6b0f1a" }}>Report</span>
        </span>
      )}
    </div>
  );
}
