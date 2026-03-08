'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

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
                width: 130,
                height: 130,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
            }}
        >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image
                    src="/red-car-3d.png"
                    alt="Red 3D Car Icon"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </motion.div>
    );
}
