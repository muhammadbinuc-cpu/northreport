"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const LandingNav: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        // Check initial scroll position
        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                background: scrolled
                    ? "rgba(10, 15, 30, 0.85)"
                    : "transparent",
                backdropFilter: scrolled ? "blur(12px)" : "none",
                WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
                borderBottom: scrolled
                    ? "1px solid rgba(255, 255, 255, 0.05)"
                    : "1px solid transparent",
            }}
        >
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-xl font-bold text-white tracking-tight hover:opacity-90 transition-opacity"
                >
                    Safe<span className="text-[#14b8a6]">Pulse</span>
                </Link>

                {/* Sign In button */}
                <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                        color: "#14b8a6",
                        border: "1px solid rgba(20, 184, 166, 0.5)",
                        background: "rgba(20, 184, 166, 0.08)",
                    }}
                >
                    Sign In
                </Link>
            </div>
        </nav>
    );
};

export default LandingNav;
