'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

const drawerVariants = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
};

const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export default function DetailDrawer({ isOpen, onClose, title, children }: DetailDrawerProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        variants={backdropVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 z-40"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.aside
                        variants={drawerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="fixed right-0 top-0 bottom-0 w-[400px] glass-card rounded-l-2xl rounded-r-none border-r-0 z-50 flex flex-col"
                    >
                        {/* Header */}
                        <header className="flex items-center justify-between p-4 border-b border-[var(--glass-border)]">
                            <h2 className="font-semibold text-[var(--text-primary)]">
                                {title || 'Details'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--glass-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                ✕
                            </button>
                        </header>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {children}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
