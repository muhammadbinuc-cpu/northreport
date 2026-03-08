'use client';

import { motion } from 'framer-motion';

interface EnvelopeMarkerProps {
    rotation: number;
    visible: boolean;
}

export default function EnvelopeMarker({ rotation, visible }: EnvelopeMarkerProps) {
    if (!visible) return null;

    return (
        <div
            style={{
                transform: `rotate(${rotation}deg)`,
                width: 64,
                height: 64,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Ground shadow — elongated oval beneath the car */}
            <div
                style={{
                    position: 'absolute',
                    bottom: -4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 48,
                    height: 14,
                    borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
                    filter: 'blur(3px)',
                }}
            />

            {/* Outer pulse ring */}
            <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                style={{
                    position: 'absolute',
                    inset: -6,
                    borderRadius: '50%',
                    border: '2px solid #6B0F1A',
                }}
            />

            {/* Motion trail — fading streak behind the car */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: '55%',
                    transform: 'translateY(-50%)',
                    width: 32,
                    height: 6,
                    borderRadius: 3,
                    background: 'linear-gradient(to left, rgba(107,15,26,0.35), transparent)',
                    filter: 'blur(2px)',
                }}
            />

            {/* Car body — styled div instead of floating image */}
            <div
                style={{
                    width: 40,
                    height: 22,
                    borderRadius: 6,
                    background: 'linear-gradient(135deg, #8B1A2B 0%, #6B0F1A 50%, #4A0A12 100%)',
                    boxShadow: '0 2px 8px rgba(107,15,26,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                    position: 'relative',
                    zIndex: 2,
                }}
            >
                {/* Windshield */}
                <div
                    style={{
                        position: 'absolute',
                        top: 3,
                        right: 4,
                        width: 12,
                        height: 16,
                        borderRadius: '3px 5px 5px 3px',
                        background: 'linear-gradient(135deg, rgba(200,220,255,0.7) 0%, rgba(150,180,220,0.5) 100%)',
                        border: '1px solid rgba(255,255,255,0.15)',
                    }}
                />

                {/* Front headlights */}
                <motion.div
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    style={{
                        position: 'absolute',
                        top: 3,
                        left: -2,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: '#FFE066',
                        boxShadow: '0 0 6px 2px rgba(255,224,102,0.6)',
                    }}
                />
                <motion.div
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    style={{
                        position: 'absolute',
                        bottom: 3,
                        left: -2,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: '#FFE066',
                        boxShadow: '0 0 6px 2px rgba(255,224,102,0.6)',
                    }}
                />

                {/* Wheels */}
                <div
                    style={{
                        position: 'absolute',
                        top: -3,
                        left: 6,
                        width: 8,
                        height: 6,
                        borderRadius: 2,
                        background: '#222',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: -3,
                        left: 6,
                        width: 8,
                        height: 6,
                        borderRadius: 2,
                        background: '#222',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: -3,
                        right: 6,
                        width: 8,
                        height: 6,
                        borderRadius: 2,
                        background: '#222',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: -3,
                        right: 6,
                        width: 8,
                        height: 6,
                        borderRadius: 2,
                        background: '#222',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    }}
                />
            </div>
        </div>
    );
}
