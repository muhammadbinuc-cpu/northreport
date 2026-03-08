'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';

interface Hotspot {
    cellId: string;
    label: string;
    center: [number, number];
    count: number;
    uniqueUsers: number;
    topSeverity: string | null;
    momentum: number;
    recentItems: Array<{ id: string; source: string; caption: string; severity: string; type: string }>;
}

interface Report {
    id: string;
    description: string;
    category: string;
    severity: string;
    locationApprox?: { lat: number; lng: number; label?: string };
    createdAt?: string;
}

interface Map3DProps {
    neighborhood: string;
    onHotspotSelect?: (hotspot: Hotspot | null) => void;
    flyToLocation?: [number, number] | null;
    reports?: Report[];
}

// Waterloo center
const WATERLOO_CENTER: [number, number] = [-80.5204, 43.4643];

const SEVERITY_COLORS: Record<string, string> = {
    critical: '#ff3b3b',
    high: '#ff8c00',
    medium: '#ffd700',
    low: '#00d4aa',
};

export default function Map3D({ neighborhood, onHotspotSelect, flyToLocation, reports = [] }: Map3DProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const userMarker = useRef<mapboxgl.Marker | null>(null);
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    // Get user's location
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.longitude, position.coords.latitude]);
                },
                () => {
                    // Fallback to Toronto on error/denial
                    setUserLocation(WATERLOO_CENTER);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setUserLocation(WATERLOO_CENTER);
        }
    }, []);

    // Fetch hotspots
    useEffect(() => {
        async function fetchHotspots() {
            setLoading(true);
            try {
                const res = await fetch(`/api/hotspots?neighborhood=${neighborhood}`);
                if (res.ok) {
                    const data = await res.json();
                    setHotspots(data.hotspots || []);
                }
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        }
        fetchHotspots();
    }, [neighborhood]);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || !userLocation || map.current) return;

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
            console.error('Mapbox token not found');
            return;
        }

        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: userLocation,
            zoom: 15,
            pitch: 60,
            bearing: -17.6,
            antialias: true,
        });

        map.current.on('load', () => {
            if (!map.current) return;

            // Add 3D buildings
            const layers = map.current.getStyle().layers;
            const labelLayerId = layers?.find(
                (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
            )?.id;

            map.current.addLayer(
                {
                    id: '3d-buildings',
                    source: 'composite',
                    'source-layer': 'building',
                    filter: ['==', 'extrude', 'true'],
                    type: 'fill-extrusion',
                    minzoom: 14,
                    paint: {
                        'fill-extrusion-color': '#E8E2D9',
                        'fill-extrusion-height': ['get', 'height'],
                        'fill-extrusion-base': ['get', 'min_height'],
                        'fill-extrusion-opacity': 0.9,
                    },
                },
                labelLayerId
            );

            // Add sky layer
            map.current.addLayer({
                id: 'sky',
                type: 'sky',
                paint: {
                    'sky-type': 'atmosphere',
                    'sky-atmosphere-sun': [0.0, 90.0],
                    'sky-atmosphere-sun-intensity': 15,
                },
            });

            // Add user location marker with pulse
            if (userLocation && !userMarker.current) {
                // Create custom marker element
                const markerEl = document.createElement('div');
                markerEl.className = 'user-location-marker';
                markerEl.innerHTML = `
                    <div class="user-marker-ping"></div>
                    <div class="user-marker-dot"></div>
                `;

                userMarker.current = new mapboxgl.Marker({ element: markerEl })
                    .setLngLat(userLocation)
                    .addTo(map.current);
            }

            setLoading(false);
        });

        // Cleanup
        return () => {
            userMarker.current?.remove();
            userMarker.current = null;
            map.current?.remove();
            map.current = null;
        };
    }, [userLocation]);

    // Add hotspot layers (with retry if style hasn't loaded yet)
    useEffect(() => {
        if (!map.current || hotspots.length === 0) return;

        const addLayers = () => {
            if (!map.current) return;

            // Remove existing source if present
            if (map.current.getSource('hotspots')) {
                if (map.current.getLayer('hotspot-glow')) map.current.removeLayer('hotspot-glow');
                if (map.current.getLayer('hotspot-towers')) map.current.removeLayer('hotspot-towers');
                map.current.removeSource('hotspots');
            }

            // Create GeoJSON from hotspots
            const geojson: GeoJSON.FeatureCollection = {
                type: 'FeatureCollection',
                features: hotspots.map((h) => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: h.center,
                    },
                    properties: {
                        id: h.cellId,
                        label: h.label,
                        severity: h.topSeverity || 'low',
                        momentum: h.momentum || h.count,
                        count: h.count,
                    },
                })),
            };

            map.current.addSource('hotspots', {
                type: 'geojson',
                data: geojson,
            });

            // Glow layer (circles)
            map.current.addLayer({
                id: 'hotspot-glow',
                type: 'circle',
                source: 'hotspots',
                paint: {
                    'circle-radius': ['*', ['get', 'momentum'], 3],
                    'circle-color': [
                        'case',
                        ['==', ['get', 'severity'], 'critical'], SEVERITY_COLORS.critical,
                        ['==', ['get', 'severity'], 'high'], SEVERITY_COLORS.high,
                        ['==', ['get', 'severity'], 'medium'], SEVERITY_COLORS.medium,
                        SEVERITY_COLORS.low,
                    ],
                    'circle-opacity': 0.3,
                    'circle-blur': 1,
                },
            });

            // Tower layer (3D extrusion)
            map.current.addLayer({
                id: 'hotspot-towers',
                type: 'circle',
                source: 'hotspots',
                paint: {
                    'circle-radius': ['*', ['get', 'momentum'], 1.5],
                    'circle-color': [
                        'case',
                        ['==', ['get', 'severity'], 'critical'], SEVERITY_COLORS.critical,
                        ['==', ['get', 'severity'], 'high'], SEVERITY_COLORS.high,
                        ['==', ['get', 'severity'], 'medium'], SEVERITY_COLORS.medium,
                        SEVERITY_COLORS.low,
                    ],
                    'circle-opacity': 0.9,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': 'rgba(255,255,255,0.3)',
                },
            });

            // Click handler
            map.current.on('click', 'hotspot-towers', (e) => {
                if (!e.features?.[0]) return;
                const props = e.features[0].properties;
                const hotspot = hotspots.find((h) => h.cellId === props?.id);
                if (hotspot) {
                    setSelectedHotspot(hotspot);
                    onHotspotSelect?.(hotspot);
                }
            });

            // Cursor change
            map.current.on('mouseenter', 'hotspot-towers', () => {
                if (map.current) map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'hotspot-towers', () => {
                if (map.current) map.current.getCanvas().style.cursor = '';
            });
        };

        if (map.current.isStyleLoaded()) {
            addLayers();
        } else {
            map.current.once('style.load', addLayers);
        }
    }, [hotspots, onHotspotSelect]);

    // Add report markers
    const reportMarkers = useRef<mapboxgl.Marker[]>([]);
    useEffect(() => {
        if (!map.current) return;

        // Clear old markers
        reportMarkers.current.forEach(m => m.remove());
        reportMarkers.current = [];

        const addReportMarkers = () => {
            if (!map.current) return;

            reports.forEach((report) => {
                // Extract coordinates: prefer locationApprox.lat/lng, fall back to GeoJSON location.coordinates
                let lng: number | undefined;
                let lat: number | undefined;
                if (report.locationApprox?.lat && report.locationApprox?.lng) {
                    lat = report.locationApprox.lat;
                    lng = report.locationApprox.lng;
                } else if (report.location?.coordinates?.length === 2) {
                    lng = report.location.coordinates[0];
                    lat = report.location.coordinates[1];
                }
                if (!lat || !lng) return;

                const color = SEVERITY_COLORS[report.severity] || SEVERITY_COLORS.low;

                const el = document.createElement('div');
                el.style.cssText = `
                    width: 14px; height: 14px;
                    background: ${color};
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 8px ${color}80;
                    cursor: pointer;
                `;

                const popup = new mapboxgl.Popup({ offset: 12, closeButton: false, maxWidth: '220px' })
                    .setHTML(`
                        <div style="font-family: Halant, Georgia, serif; padding: 4px 0;">
                            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: ${color}; margin-bottom: 4px;">
                                ${report.severity} · ${report.category || 'General'}
                            </div>
                            <div style="font-size: 13px; color: #1E1E1E; line-height: 1.4;">
                                ${report.description?.substring(0, 120) || 'No description'}${(report.description?.length || 0) > 120 ? '...' : ''}
                            </div>
                            ${report.locationApprox?.label ? `<div style="font-size: 11px; color: #888; margin-top: 4px;">${report.locationApprox.label}</div>` : ''}
                        </div>
                    `);

                const marker = new mapboxgl.Marker({ element: el })
                    .setLngLat([lng, lat])
                    .setPopup(popup)
                    .addTo(map.current!);

                reportMarkers.current.push(marker);
            });
        };

        if (map.current.isStyleLoaded()) {
            addReportMarkers();
        } else {
            map.current.once('style.load', addReportMarkers);
        }

        return () => {
            reportMarkers.current.forEach(m => m.remove());
            reportMarkers.current = [];
        };
    }, [reports]);

    // Fly to location
    useEffect(() => {
        if (!map.current || !flyToLocation) return;

        map.current.flyTo({
            center: flyToLocation,
            zoom: 17,
            pitch: 65,
            bearing: 0,
            duration: 1500,
            essential: true,
        });
    }, [flyToLocation]);

    const closeHotspotDrawer = useCallback(() => {
        setSelectedHotspot(null);
        onHotspotSelect?.(null);
    }, [onHotspotSelect]);

    return (
        <div className="relative w-full h-full overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Blue vignette overlay */}
            <div
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                    background: `
                        radial-gradient(ellipse 90% 70% at 50% 50%, transparent 40%, rgba(10, 14, 20, 0.5) 100%),
                        linear-gradient(to bottom, rgba(10, 14, 20, 0.3) 0%, transparent 20%, transparent 80%, rgba(10, 14, 20, 0.4) 100%)
                    `,
                }}
            />

            {/* Cyan accent glow edges */}
            <div
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                    boxShadow: 'inset 0 0 100px 50px rgba(10, 14, 20, 0.6), inset 0 0 200px 100px rgba(139, 26, 43, 0.05)',
                }}
            />

            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--paper-base)]/80 backdrop-blur-sm">
                    <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Hotspot Drawer */}
            <AnimatePresence>
                {selectedHotspot && (
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute bottom-0 left-0 right-0 glass-card rounded-b-none p-4 max-h-[40vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h4 className="font-semibold text-[var(--text-primary)]">{selectedHotspot.label}</h4>
                                <p className="text-xs text-[var(--text-secondary)]">
                                    {selectedHotspot.count} items · {selectedHotspot.uniqueUsers} users
                                </p>
                            </div>
                            <button
                                onClick={closeHotspotDrawer}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--glass-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Stacked content */}
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {selectedHotspot.recentItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex-shrink-0 w-48 glass-card p-3 space-y-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs">
                                            {item.type === 'story' ? '📖' : item.type === 'report' ? '📋' : '💬'}
                                        </span>
                                        <span className={`chip-severity chip-${item.severity || 'low'}`}>
                                            {item.severity || 'low'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] line-clamp-3">
                                        {item.caption}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
