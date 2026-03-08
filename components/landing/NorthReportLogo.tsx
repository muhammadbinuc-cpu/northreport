"use client";

interface NorthReportLogoProps {
    size?: "sm" | "md" | "lg";
    showText?: boolean;
}

export default function NorthReportLogo({ size = "md", showText = true }: NorthReportLogoProps) {
    const sizes = {
        sm: { icon: 28, text: "text-base", gap: "gap-2" },
        md: { icon: 36, text: "text-lg", gap: "gap-2.5" },
        lg: { icon: 48, text: "text-2xl", gap: "gap-3" },
    };

    const { icon, text, gap } = sizes[size];

    return (
        <div className={`flex items-center ${gap}`}>
            <img
                src="/logo.png"
                alt="NorthReport"
                width={icon}
                height={icon}
                className="object-contain"
            />
            {showText && (
                <span
                    className={`font-semibold tracking-tight ${text}`}
                    style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--text-primary)",
                    }}
                >
                    NorthReport
                </span>
            )}
        </div>
    );
}
