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
    const [isHovering, setIsHovering] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    const handleClick = useCallback(() => {
        setShowFlash(true);
        setTimeout(() => {
            setShowFlash(false);
            setIsOpen(true);
        }, 100);
    }, []);

    const breatheDuration = isHovering ? 1 : 2;
    const sonarDuration = isHovering ? 1.5 : 3;

    // Position variants for smooth animation
    // Use x offset instead of CSS transform for smooth animation
    const isTopRight = position === 'top-right';

    // Smaller size for top-right position
    const size = isTopRight ? 56 : 80;

    return (
        <>
            {/* Shutter Flash */}
            <AnimatePresence>
                {showFlash && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} exit={{ opacity: 0 }} transition={{ duration: 0.05 }}
                        className="fixed inset-0 bg-white pointer-events-none" style={{ zIndex: 99999 }} />
                )}
            </AnimatePresence>

            {/* Hero Scan Button - Animates between positions */}
            <motion.button
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={handleClick}
                className={`fixed rounded-full flex items-center justify-center ${className}`}
                initial={false}
                animate={{
                    top: isTopRight ? 24 : 'auto',
                    right: isTopRight ? 24 : 'auto',
                    bottom: isTopRight ? 'auto' : 56,
                    left: isTopRight ? 'auto' : '50%',
                    x: isTopRight ? 0 : '-50%',
                    width: size,
                    height: size,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 20,
                    mass: 1,
                }}
                style={{
                    zIndex: 10000,
                    background: 'linear-gradient(135deg, #22D3EE 0%, #8B5CF6 50%, #A855F7 100%)',
                    border: '3px solid rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: `
                        0 0 40px rgba(34, 211, 238, 0.5),
                        0 0 80px rgba(168, 85, 247, 0.3),
                        0 10px 40px rgba(0, 0, 0, 0.4),
                        0 0 0 8px rgba(0,0,0,0.3)
                    `,
                    color: 'white',
                }}
                whileTap={{ scale: 0.92 }}
            >
                <motion.svg
                    animate={{ width: position === 'top-right' ? 24 : 32, height: position === 'top-right' ? 24 : 32 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    <circle cx="12" cy="12" r="3" />
                </motion.svg>

                {/* Breathing glow */}
                <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                    animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 30px rgba(34, 211, 238, 0.4)', '0 0 60px rgba(168, 85, 247, 0.7)', '0 0 30px rgba(34, 211, 238, 0.4)'] }}
                    transition={{ duration: breatheDuration, repeat: Infinity, ease: 'easeInOut' }} />

                {/* Sonar ring 1 */}
                <motion.div className="absolute inset-0 rounded-full pointer-events-none" style={{ border: '2px solid rgba(34, 211, 238, 0.6)' }}
                    animate={{ scale: [1, 2.5], opacity: [0.8, 0] }} transition={{ duration: sonarDuration, repeat: Infinity, ease: 'easeOut' }} />

                {/* Sonar ring 2 */}
                <motion.div className="absolute inset-0 rounded-full pointer-events-none" style={{ border: '2px solid rgba(168, 85, 247, 0.5)' }}
                    animate={{ scale: [1, 2.5], opacity: [0.6, 0] }} transition={{ duration: sonarDuration, repeat: Infinity, ease: 'easeOut', delay: sonarDuration / 2 }} />
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
