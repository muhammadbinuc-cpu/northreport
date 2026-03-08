'use client';

import { motion } from 'framer-motion';

interface EnvelopeMarkerProps {
    rotation: number;
    visible: boolean;
}

export default function EnvelopeMarker({ rotation, visible }: EnvelopeMarkerProps) {
    if (!visible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
            }}
            style={{
                transform: `rotate(${rotation}deg)`,
                filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.55))',
            }}
        >
            <svg
                width="60"
                height="30"
                viewBox="0 0 60 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* === Cargo box === */}
                <rect x="1" y="5" width="38" height="17" rx="2.5" fill="#f8fafc" />
                <rect x="1" y="5" width="38" height="17" rx="2.5" stroke="#cbd5e1" strokeWidth="0.6" />

                {/* Red-blue postal stripe along bottom of cargo */}
                <rect x="1" y="18" width="38" height="2" fill="#1d4ed8" />
                <rect x="1" y="20" width="38" height="1.5" fill="#dc2626" />

                {/* Thin accent line top */}
                <rect x="1" y="5" width="38" height="1.2" rx="0.6" fill="#1d4ed8" opacity="0.7" />

                {/* Envelope icon on cargo side */}
                <rect x="11" y="8.5" width="14" height="9" rx="1.5" fill="#eff6ff" stroke="#3b82f6" strokeWidth="0.7" />
                <path
                    d="M12.5 10 L18 14 L23.5 10"
                    stroke="#2563eb"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
                {/* Letter lines inside envelope */}
                <line x1="14" y1="15" x2="22" y2="15" stroke="#93c5fd" strokeWidth="0.5" strokeLinecap="round" />
                <line x1="14" y1="16.5" x2="19" y2="16.5" stroke="#93c5fd" strokeWidth="0.5" strokeLinecap="round" />

                {/* === Cabin === */}
                <path
                    d="M39 7.5 L50 7.5 Q54 7.5 54.5 11.5 L55 22 L39 22 Z"
                    fill="#f1f5f9"
                    stroke="#cbd5e1"
                    strokeWidth="0.6"
                />

                {/* Windshield */}
                <path
                    d="M41 9 L49 9 Q52.5 9 53 12 L53.5 17 L41 17 Z"
                    fill="#bae6fd"
                />
                {/* Windshield glare */}
                <path
                    d="M42 10 L45 10 L43.5 16 L42 16 Z"
                    fill="white"
                    opacity="0.5"
                />
                {/* Windshield divider */}
                <line x1="47" y1="9" x2="47.3" y2="17" stroke="#94a3b8" strokeWidth="0.5" />

                {/* === Undercarriage / chassis === */}
                <rect x="0" y="21.5" width="56" height="2" rx="1" fill="#64748b" />

                {/* === Wheels === */}
                {/* Rear wheel */}
                <circle cx="12" cy="24.5" r="4.5" fill="#1e293b" />
                <circle cx="12" cy="24.5" r="3" fill="#475569" />
                <circle cx="12" cy="24.5" r="1.2" fill="#1e293b" />
                {/* Wheel spokes */}
                <line x1="12" y1="21.8" x2="12" y2="27.2" stroke="#334155" strokeWidth="0.4" />
                <line x1="9.3" y1="24.5" x2="14.7" y2="24.5" stroke="#334155" strokeWidth="0.4" />

                {/* Front wheel */}
                <circle cx="44" cy="24.5" r="4.5" fill="#1e293b" />
                <circle cx="44" cy="24.5" r="3" fill="#475569" />
                <circle cx="44" cy="24.5" r="1.2" fill="#1e293b" />
                {/* Wheel spokes */}
                <line x1="44" y1="21.8" x2="44" y2="27.2" stroke="#334155" strokeWidth="0.4" />
                <line x1="41.3" y1="24.5" x2="46.7" y2="24.5" stroke="#334155" strokeWidth="0.4" />

                {/* === Headlight === */}
                <rect x="54" y="13" width="3.5" height="4.5" rx="1.2" fill="#fbbf24" />
                <rect x="54.5" y="13.8" width="2" height="1.2" rx="0.5" fill="#fef3c7" opacity="0.9" />

                {/* === Tail light === */}
                <rect x="0" y="14" width="2" height="4" rx="1" fill="#ef4444" />

                {/* === Side mirror === */}
                <rect x="54" y="9" width="3" height="2.5" rx="1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.4" />

                {/* === Roof rack / mail light === */}
                <rect x="15" y="2" width="12" height="3.5" rx="1.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.4" />
                {/* "MAIL" text on roof sign */}
                <text
                    x="21"
                    y="4.8"
                    textAnchor="middle"
                    fontSize="3"
                    fontWeight="bold"
                    fill="#1e40af"
                    fontFamily="Arial, sans-serif"
                >
                    MAIL
                </text>
            </svg>
        </motion.div>
    );
}
