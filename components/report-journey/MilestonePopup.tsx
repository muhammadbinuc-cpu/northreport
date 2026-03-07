'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface MilestonePopupProps {
    label: string;
    icon: ReactNode;
    visible: boolean;
}

export default function MilestonePopup({ label, icon, visible }: MilestonePopupProps) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 20,
                    }}
                    className="pointer-events-none"
                    style={{
                        background: 'rgba(15, 23, 42, 0.92)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        borderRadius: 12,
                        borderLeft: '3px solid #14b8a6',
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'white',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {label}
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
