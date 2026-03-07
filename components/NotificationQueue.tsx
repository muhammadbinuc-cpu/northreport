'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SocialNotification {
    id: string;
    type: 'reply' | 'upvote' | 'new_report';
    issueId: string;
    username: string;
    avatar?: string;
    message: string;
    timestamp: string;
}

interface NotificationQueueProps {
    notifications: SocialNotification[];
    onDismiss: (id: string) => void;
    onNotificationClick: (issueId: string) => void;
}

// Queue system - notifications stack and appear one after another
export function NotificationQueue({ notifications, onDismiss, onNotificationClick }: NotificationQueueProps) {
    return (
        <div className="fixed top-20 left-4 z-[9500] flex flex-col gap-3 max-w-sm pointer-events-none">
            <AnimatePresence>
                {notifications.slice(0, 3).map((notification, index) => (
                    <NotificationToast
                        key={notification.id}
                        notification={notification}
                        index={index}
                        onDismiss={onDismiss}
                        onClick={onNotificationClick}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

function NotificationToast({
    notification,
    index,
    onDismiss,
    onClick,
}: {
    notification: SocialNotification;
    index: number;
    onDismiss: (id: string) => void;
    onClick: (issueId: string) => void;
}) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Auto-dismiss after 5 seconds
        timerRef.current = setTimeout(() => {
            onDismiss(notification.id);
        }, 5000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [notification.id, onDismiss]);

    const handleClick = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        onClick(notification.issueId);
        onDismiss(notification.id);
    }, [notification.id, notification.issueId, onClick, onDismiss]);

    const typeColors = {
        reply: '#22D3EE',
        upvote: '#F472B6',
        new_report: '#FBBF24',
    };

    const typeIcons = {
        reply: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
        ),
        upvote: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        ),
        new_report: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
            </svg>
        ),
    };

    const color = typeColors[notification.type];

    return (
        <motion.div
            initial={{ x: -300, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -100, opacity: 0, scale: 0.95 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                delay: index * 0.1,
            }}
            onClick={handleClick}
            className="pointer-events-auto cursor-pointer flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl"
            style={{
                background: 'rgba(20, 25, 35, 0.9)',
                border: `1px solid ${color}40`,
                boxShadow: `0 0 20px ${color}30, 0 8px 32px rgba(0,0,0,0.4)`,
            }}
        >
            {/* Avatar */}
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: `${color}30`, color }}
            >
                {notification.avatar || notification.username[0].toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span style={{ color }}>{typeIcons[notification.type]}</span>
                    <span className="text-sm font-semibold text-white truncate">
                        @{notification.username}
                    </span>
                </div>
                <p className="text-xs text-gray-300 truncate mt-0.5">
                    {notification.message}
                </p>
            </div>

            {/* Close button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(notification.id);
                }}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                style={{ color: 'gray' }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </motion.div>
    );
}

// Hook for managing notification queue
export function useNotificationQueue() {
    const [notifications, setNotifications] = useState<SocialNotification[]>([]);

    const addNotification = useCallback((notification: Omit<SocialNotification, 'id' | 'timestamp'>) => {
        const newNotification: SocialNotification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: new Date().toISOString(),
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const dismissNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        notifications,
        addNotification,
        dismissNotification,
        clearAll,
    };
}
