"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function FinalCTA() {
  const { user } = useUser();

  return (
    <>
      {/* CTA section */}
      <section
        className="py-32 px-6 flex flex-col items-center justify-center text-center"
        style={{ background: "#6b0f1a" }}
      >
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-10 leading-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          Ready to make your city better?
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Link
            href={user ? "/dashboard" : "/auth/login"}
            className="inline-block px-10 py-4 text-lg font-semibold rounded-xl transition-colors duration-150"
            style={{ background: "#ffffff", color: "#6b0f1a", fontFamily: "var(--font-utility)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0e1")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
          >
            {user ? "Go to Dashboard" : "Get Started"}
          </Link>
        </motion.div>

        <motion.p
          className="mt-10 text-base"
          style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-utility)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Built for Hack Canada 2026 — powered by Gemini AI
        </motion.p>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ background: "#f5f0e1" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm" style={{ color: "#777" }}>
            &copy; 2026 NorthReport
          </span>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "About", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm transition-colors duration-150"
                style={{ color: "#777" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1e1e1e")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#777")}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
