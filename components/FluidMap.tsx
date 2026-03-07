'use client';

import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import type { MockIssue } from '@/lib/mockIssues';
import { HAMILTON_CENTER } from '@/lib/constants';

interface FluidMapProps {
    issues: MockIssue[];
    onIssueSelect?: (issue: MockIssue) => void;
    focusedIssueId?: string | null;
    newIssueId?: string | null;
    pulseIssueId?: string | null;
    duplicatePopup?: { issueId: string; message: string } | null;
    isVisible?: boolean;
    isBlurred?: boolean;
    viewMode?: 'feed' | 'map';
}

export interface FluidMapRef {
    flyTo: (coords: [number, number]) => void;
    resetView: () => void;
    triggerPulse: (issueId: string) => void;
    fitToIssues: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
    critical: '#ff3b3b',
    high: '#ff8c00',
    medium: '#ffd700',
    low: '#00d4aa',
};

// Haversine distance in meters
function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m: number): string {
    return m < 1000 ? `${Math.round(m)}m away` : `${(m / 1000).toFixed(1)}km away`;
}

// Create "YOU" marker for user location
function createYouMarker(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'you-marker';
    container.innerHTML = `
        <div class="you-dot-container">
            <div class="you-ping"></div>
            <div class="you-dot"></div>
        </div>
        <div class="you-label">YOU</div>
    `;
    return container;
}

// Snapchat-style photo marker with pointer arrow
function createPhotoMarker(issue: MockIssue, userLat: number, userLng: number, isFocused: boolean, isNew: boolean): HTMLElement {
    const container = document.createElement('div');
    container.className = 'snap-marker';
    container.setAttribute('data-issue-id', issue.id);

    const color = SEVERITY_COLORS[issue.severity] || '#ffd700';

    // Photo wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'snap-marker-photo';
    wrapper.style.borderColor = isFocused ? color : 'white';
    if (isFocused) wrapper.style.boxShadow = `0 4px 15px rgba(0,0,0,0.4), 0 0 20px ${color}`;
    if (isNew) wrapper.classList.add('snap-marker-new');

    const img = document.createElement('img');
    img.src = issue.imageUrl;
    img.alt = issue.title;
    img.draggable = false;
    img.onerror = () => { img.src = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&q=80'; };
    wrapper.appendChild(img);

    // Label
    const label = document.createElement('div');
    label.className = 'snap-marker-label';
    const dist = calcDistance(userLat, userLng, issue.latitude, issue.longitude);
    const title = issue.title.length > 18 ? issue.title.slice(0, 16) + '...' : issue.title;
    label.innerHTML = `
        <div class="snap-marker-title">${title}</div>
        <div class="snap-marker-dist" style="color:${color}">${formatDistance(dist)}</div>
    `;

    // Pointer arrow (anchored at bottom - this is the geographic point)
    const pointer = document.createElement('div');
    pointer.className = 'snap-marker-pointer';
    pointer.style.borderTopColor = isFocused ? color : 'white';

    container.appendChild(wrapper);
    container.appendChild(label);
    container.appendChild(pointer);

    return container;
}

const FluidMap = forwardRef<FluidMapRef, FluidMapProps>(function FluidMap(
    { issues, onIssueSelect, focusedIssueId, newIssueId, pulseIssueId, duplicatePopup, isVisible = true, isBlurred = false, viewMode = 'feed' },
    ref
) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
    const youMarker = useRef<mapboxgl.Marker | null>(null);
    const orbitAnimationRef = useRef<number | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [userLoc, setUserLoc] = useState<[number, number]>([HAMILTON_CENTER.lng, HAMILTON_CENTER.lat]);
    const [activePulse, setActivePulse] = useState<string | null>(null);

    const triggerPulse = useCallback((id: string) => {
        setActivePulse(id);
        setTimeout(() => setActivePulse(null), 3000);
    }, []);

    // Fit map to show all issues + user
    const fitToIssues = useCallback(() => {
        if (!map.current || issues.length === 0) return;
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(userLoc);
        issues.forEach(issue => bounds.extend([issue.longitude, issue.latitude]));
        map.current.fitBounds(bounds, { padding: 80, pitch: 0, bearing: 0, duration: 1500 });
    }, [issues, userLoc]);

    useImperativeHandle(ref, () => ({
        flyTo: (coords) => map.current?.flyTo({ center: coords, zoom: 17, pitch: 45, bearing: 30, duration: 2000 }),
        resetView: () => map.current?.flyTo({ center: userLoc, zoom: 15, pitch: 45, bearing: 0, duration: 1500 }),
        triggerPulse,
        fitToIssues,
    }), [userLoc, triggerPulse, fitToIssues]);

    useEffect(() => { if (pulseIssueId) triggerPulse(pulseIssueId); }, [pulseIssueId, triggerPulse]);

    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            (p) => setUserLoc([p.coords.longitude, p.coords.latitude]),
            () => { },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    // Camera states: Ambient orbit (feed) vs Tactical view (map)
    // FIX: Only trigger camera moves on actual viewMode transitions, not on data updates
    const prevViewModeRef = useRef(viewMode);
    const hasInitializedCamera = useRef(false);

    useEffect(() => {
        if (!map.current || !isLoaded) return;

        // Cancel any existing orbit first
        if (orbitAnimationRef.current) {
            cancelAnimationFrame(orbitAnimationRef.current);
            orbitAnimationRef.current = null;
        }

        // Only trigger camera moves on ACTUAL viewMode transitions
        const isTransition = prevViewModeRef.current !== viewMode || !hasInitializedCamera.current;
        prevViewModeRef.current = viewMode;
        hasInitializedCamera.current = true;

        if (!isTransition) return; // Silent update - don't move camera

        if (viewMode === 'feed') {
            // Ambient orbit around user at 45° pitch
            map.current.flyTo({ center: userLoc, zoom: 15, pitch: 45, bearing: 0, duration: 1000 });

            let bearing = 0;
            const orbit = () => {
                if (!map.current || viewMode !== 'feed') return;
                bearing = (bearing + 0.05) % 360;
                map.current.setBearing(bearing);
                orbitAnimationRef.current = requestAnimationFrame(orbit);
            };
            // Start orbit after fly animation
            setTimeout(() => { if (viewMode === 'feed') orbit(); }, 1200);
        } else {
            // Tactical top-down view - fit all issues
            if (map.current && issues.length > 0) {
                const bounds = new mapboxgl.LngLatBounds();
                bounds.extend(userLoc);
                issues.forEach(issue => bounds.extend([issue.longitude, issue.latitude]));
                map.current.fitBounds(bounds, { padding: 80, pitch: 0, bearing: 0, duration: 1500 });
            }
        }

        return () => {
            if (orbitAnimationRef.current) {
                cancelAnimationFrame(orbitAnimationRef.current);
                orbitAnimationRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode, isLoaded]); // FIX: issues and userLoc not in deps - camera only moves on mode transitions

    useEffect(() => {
        if (!mapContainer.current || map.current) return;
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) return;

        mapboxgl.accessToken = token;
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: userLoc,
            zoom: 15,
            pitch: 45,
            bearing: 0,
            antialias: true,
        });

        map.current.on('load', () => {
            if (!map.current) return;
            const layers = map.current.getStyle().layers;
            const labelId = layers?.find(l => l.type === 'symbol' && l.layout?.['text-field'])?.id;

            // WHITE CITY: 3D buildings in pure white
            map.current.addLayer({
                id: '3d-buildings',
                source: 'composite',
                'source-layer': 'building',
                filter: ['==', 'extrude', 'true'],
                type: 'fill-extrusion',
                minzoom: 14,
                paint: {
                    'fill-extrusion-color': '#FFFFFF',
                    'fill-extrusion-height': ['get', 'height'],
                    'fill-extrusion-base': ['get', 'min_height'],
                    'fill-extrusion-opacity': 0.8,
                },
            }, labelId);

            // Directional light for tactile depth / shadows
            map.current.setLight({
                anchor: 'viewport',
                color: '#ffffff',
                intensity: 0.4,
                position: [1.5, 180, 30], // azimuth, polar, intensity
            });

            // Sky layer
            map.current.addLayer({
                id: 'sky',
                type: 'sky',
                paint: {
                    'sky-type': 'atmosphere',
                    'sky-atmosphere-sun': [0, 0],
                    'sky-atmosphere-sun-intensity': 5,
                },
            });

            // Add "YOU" marker for user location
            const youEl = createYouMarker();
            youMarker.current = new mapboxgl.Marker({
                element: youEl,
                anchor: 'center',
                pitchAlignment: 'map',
                rotationAlignment: 'map',
            })
                .setLngLat(userLoc)
                .addTo(map.current);

            setIsLoaded(true);
        });

        return () => {
            if (orbitAnimationRef.current) cancelAnimationFrame(orbitAnimationRef.current);
            markers.current.forEach(m => m.remove());
            markers.current.clear();
            youMarker.current?.remove();
            map.current?.remove();
            map.current = null;
        };
    }, [userLoc]);

    // Update YOU marker position
    useEffect(() => {
        if (youMarker.current) {
            youMarker.current.setLngLat(userLoc);
        }
    }, [userLoc]);

    // Update issue markers
    useEffect(() => {
        if (!map.current || !isLoaded) return;
        const currentIds = new Set(markers.current.keys());
        const newIds = new Set(issues.map(i => i.id));

        currentIds.forEach(id => {
            if (!newIds.has(id)) {
                markers.current.get(id)?.remove();
                markers.current.delete(id);
            }
        });

        issues.forEach(issue => {
            const el = createPhotoMarker(issue, userLoc[1], userLoc[0], focusedIssueId === issue.id, newIssueId === issue.id);
            el.onclick = () => onIssueSelect?.(issue);
            markers.current.get(issue.id)?.remove();

            // Anchor at 'bottom' - pointer arrow tip is the geographic coordinate
            const marker = new mapboxgl.Marker({
                element: el,
                anchor: 'bottom',
                pitchAlignment: 'viewport',
                rotationAlignment: 'viewport',
            })
                .setLngLat([issue.longitude, issue.latitude])
                .addTo(map.current!);
            markers.current.set(issue.id, marker);
        });
    }, [issues, isLoaded, userLoc, focusedIssueId, newIssueId, onIssueSelect]);

    return (
        <div className="absolute inset-0" style={{ opacity: isVisible ? 1 : 0.3, filter: isBlurred ? 'blur(8px)' : 'none', transition: 'all 0.3s' }}>
            <style jsx global>{`
                /* Gravity drop animation for new markers */
                @keyframes gravity-drop {
                    0% { opacity: 0; transform: translateY(-100px) scale(0.5); }
                    60% { transform: translateY(10px) scale(1.1); }
                    80% { transform: translateY(-5px) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                
                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(3); opacity: 0; }
                }
                
                /* YOU Marker Styles */
                .you-marker {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    pointer-events: none;
                }
                .you-dot-container {
                    position: relative;
                    width: 20px;
                    height: 20px;
                    overflow: visible;
                }
                .you-dot {
                    position: relative;
                    width: 20px;
                    height: 20px;
                    background: #22D3EE;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 15px rgba(34, 211, 238, 0.8), 0 2px 8px rgba(0,0,0,0.3);
                    z-index: 2;
                }
                .you-ping {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 20px;
                    height: 20px;
                    background: rgba(34, 211, 238, 0.4);
                    border-radius: 50%;
                    animation: pulse-ring 2s ease-out infinite;
                    transform-origin: center center;
                    z-index: 1;
                    pointer-events: none;
                }
                .you-label {
                    position: relative;
                    margin-top: 6px;
                    padding: 3px 10px;
                    background: #22D3EE;
                    color: white;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(34, 211, 238, 0.6), 0 2px 6px rgba(0,0,0,0.3);
                    z-index: 2;
                }
                
                /* Snap Marker Styles - pointer-events:none on children, only container clickable */
                .snap-marker {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    will-change: transform;
                    transition: transform 0.25s cubic-bezier(0.17, 0.67, 0.83, 0.67), filter 0.25s ease;
                }
                .snap-marker:hover {
                    transform: scale(1.1);
                    filter: brightness(1.1);
                }
                .snap-marker-photo {
                    width: 60px;
                    height: 60px;
                    border-radius: 16px;
                    border: 3px solid white;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                    background: #1a1a2e;
                    pointer-events: none;
                }
                .snap-marker-photo img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    pointer-events: none;
                }
                .snap-marker-new .snap-marker-photo {
                    animation: gravity-drop 0.6s cubic-bezier(0.34,1.56,0.64,1);
                }
                .snap-marker-label {
                    margin-top: 6px;
                    padding: 4px 10px;
                    background: rgba(0,0,0,0.85);
                    backdrop-filter: blur(10px);
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.15);
                    text-align: center;
                    max-width: 120px;
                    white-space: nowrap;
                    pointer-events: none;
                }
                .snap-marker-title {
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    line-height: 1.3;
                }
                .snap-marker-dist {
                    font-size: 10px;
                }
                /* Pointer arrow - tip is the anchor point */
                .snap-marker-pointer {
                    width: 0;
                    height: 0;
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-top: 10px solid white;
                    margin-top: 4px;
                    pointer-events: none;
                }
            `}</style>

            <div ref={mapContainer} className="w-full h-full" />

            {/* Vignette overlay */}
            <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(10,20,35,0.6) 100%)' }} />

            {/* Loading state */}
            {!isLoaded && <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-base)]"><div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>}

            {/* Pulse animation overlay */}
            <AnimatePresence>
                {activePulse && (
                    <motion.div key={`pulse-${activePulse}`} initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: 4, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 3 }}
                        className="absolute pointer-events-none" style={{ left: '50%', top: '50%', width: 40, height: 40, marginLeft: -20, marginTop: -20, borderRadius: '50%', border: `3px solid ${SEVERITY_COLORS[issues.find(i => i.id === activePulse)?.severity || 'medium']}` }} />
                )}
            </AnimatePresence>

            {/* Duplicate popup */}
            <AnimatePresence>
                {duplicatePopup && (
                    <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}
                        className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 px-6 py-4 rounded-2xl backdrop-blur-xl"
                        style={{ background: 'linear-gradient(135deg, rgba(255,140,0,0.9), rgba(255,59,59,0.9))', color: 'white', boxShadow: '0 0 40px rgba(255,140,0,0.6)' }}>
                        <p className="text-sm font-bold">⚠️ {duplicatePopup.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default FluidMap;
