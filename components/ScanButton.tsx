'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CaptureCamera from './CaptureCamera';

interface ScanButtonProps {
    className?: string;
    position?: 'top-right' | 'bottom-center';
}

export default function ScanButton({ className = '', position = 'bottom-center' }: ScanButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = useCallback(() => {
        setIsOpen(true);
    }, []);

    const isTopRight = position === 'top-right';
    const size = isTopRight ? 48 : 64;

    return (
        <>
            {/* Scan Button */}
            <motion.button
                onClick={handleClick}
                className={`fixed rounded-full flex items-center justify-center ${className}`}
                initial={false}
                animate={{
                    top: isTopRight ? 72 : 'auto',
                    right: isTopRight ? 24 : 'auto',
                    bottom: isTopRight ? 'auto' : 32,
                    left: isTopRight ? 'auto' : '50%',
                    x: isTopRight ? 0 : '-50%',
                    width: size,
                    height: size,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 25,
                }}
                style={{
                    zIndex: 10000,
                    background: 'var(--accent-primary)',
                    color: 'white',
                    boxShadow: '0 2px 12px rgba(107, 15, 26, 0.25)',
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(107, 15, 26, 0.35)' }}
                whileTap={{ scale: 0.95 }}
            >
                <svg
                    width={isTopRight ? 20 : 26}
                    height={isTopRight ? 20 : 26}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            </motion.button>

            {/* Scanner Modal */}
            <AnimatePresence>
                {isOpen && <ScannerModal onClose={() => setIsOpen(false)} />}
            </AnimatePresence>
        </>
    );
}

function ScannerModal({ onClose }: { onClose: () => void }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10001]">
            <CaptureCamera onClose={onClose} />
        </motion.div>
    );
}
