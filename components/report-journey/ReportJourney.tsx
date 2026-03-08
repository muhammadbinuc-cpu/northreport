'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox';
import { motion, AnimatePresence } from 'framer-motion';
import along from '@turf/along';
import length from '@turf/length';
import bearing from '@turf/bearing';
import { lineString, point } from '@turf/helpers';
import EnvelopeMarker from './EnvelopeMarker';
import { CheckCircle2 } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Location {
    lat: number;
    lng: number;
}

interface ReportJourneyProps {
    reportLocation: Location;
    reportType: string;
    onComplete: () => void;
    isVisible: boolean;
}

// Hardcoded destination
const WATERLOO_CITY_HALL = {
    lat: 43.4643,
    lng: -80.5204,
    name: 'Waterloo City Hall',
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const TRAVEL_DURATION = 14000;

function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerpAngle(from: number, to: number, t: number): number {
    const diff = ((to - from + 540) % 360) - 180;
    return from + diff * t;
}

function createCurvedRoute(
    start: [number, number],
    end: [number, number]
): [number, number][] {
    const midX = (start[0] + end[0]) / 2;
    const midY = (start[1] + end[1]) / 2;
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const controlPoint: [number, number] = [midX + (-dy * 0.15), midY + (dx * 0.15)];
    const points: [number, number][] = [];
    for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        points.push([
            (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * controlPoint[0] + t * t * end[0],
            (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * controlPoint[1] + t * t * end[1],
        ]);
    }
    return points;
}

export default function ReportJourney({
    reportLocation,
    reportType,
    onComplete,
    isVisible,
}: ReportJourneyProps) {
    const dest = WATERLOO_CITY_HALL;
    const mapRef = useRef<MapRef | null>(null);
    const animationRef = useRef<number | null>(null);
    const phaseStartRef = useRef<number>(0);
    const smoothBearingRef = useRef<number | null>(null);
    const smoothPosRef = useRef<[number, number] | null>(null);
    const smoothCamRef = useRef<[number, number] | null>(null);

    const [phase, setPhase] = useState<'init' | 'travel' | 'arrival'>('init');
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const [carPosition, setCarPosition] = useState<[number, number]>([
        reportLocation.lng,
        reportLocation.lat,
    ]);
    const [carRotation, setCarRotation] = useState(0);
    const [showArrivalCard, setShowArrivalCard] = useState(false);
    const [arrivalBurst, setArrivalBurst] = useState(false);

    const [viewState, setViewState] = useState({
        longitude: reportLocation.lng,
        latitude: reportLocation.lat,
        zoom: 17,
        pitch: 65,
        bearing: 0,
    });

    // Fetch driving route
    const fetchRoute = useCallback(async (): Promise<[number, number][]> => {
        try {
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${reportLocation.lng},${reportLocation.lat};${dest.lng},${dest.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);
            if (!res.ok) throw new Error('Directions API failed');
            const data = await res.json();
            if (data.routes?.[0]) return data.routes[0].geometry.coordinates;
            throw new Error('No route');
        } catch {
            return createCurvedRoute(
                [reportLocation.lng, reportLocation.lat],
                [dest.lng, dest.lat]
            );
        }
    }, [reportLocation, dest.lng, dest.lat]);

    // Main animation
    useEffect(() => {
        if (!isVisible) return;
        let cancelled = false;

        const run = async () => {
            const coords = await fetchRoute();
            if (cancelled) return;

            setRouteCoords(coords);

            // Handle edge case where origin and destination are identical
            if (coords.length < 2) {
                setPhase('arrival');
                setCarPosition([dest.lng, dest.lat]);
                setTimeout(() => {
                    if (cancelled) return;
                    setArrivalBurst(true);
                    setTimeout(() => {
                        if (cancelled) return;
                        setShowArrivalCard(true);
                    }, 400);
                }, 500);
                return;
            }

            const line = lineString(coords);
            const totalLen = length(line, { units: 'kilometers' });
            const initBearing = bearing(
                point([reportLocation.lng, reportLocation.lat]),
                point([dest.lng, dest.lat])
            );

            // Start tight on car, facing the route
            setViewState({
                longitude: reportLocation.lng,
                latitude: reportLocation.lat,
                zoom: 17.5,
                pitch: 68,
                bearing: initBearing,
            });

            // Begin travel
            setPhase('travel');
            phaseStartRef.current = performance.now();
            smoothBearingRef.current = null;
            smoothPosRef.current = null;
            smoothCamRef.current = null;

            const POS_LERP = 0.14;
            const BEARING_LERP = 0.07;
            const CAM_POS_LERP = 0.09;
            const CAM_BEARING_LERP = 0.05;
            const LOOK_AHEAD_KM = Math.max(0.3, totalLen * 0.05);

            const animate = (time: number) => {
                if (cancelled) return;
                const elapsed = time - phaseStartRef.current;
                const t = Math.min(elapsed / TRAVEL_DURATION, 1);
                const eased = easeInOutCubic(t);

                // Car position
                // Clamp distance to avoid floating point errors sending it slightly past the line end
                const dist = Math.min(Math.max(0, totalLen * eased), Math.max(0, totalLen - 0.0001));
                let pt;
                try {
                    pt = along(line, dist, { units: 'kilometers' });
                } catch {
                    // Fallback to end of line if Turf throws unexpectedly
                    pt = point(line.geometry.coordinates[line.geometry.coordinates.length - 1] as [number, number]);
                }
                const rawPos = pt.geometry.coordinates as [number, number];

                if (!smoothPosRef.current) {
                    smoothPosRef.current = rawPos;
                } else {
                    smoothPosRef.current = [
                        smoothPosRef.current[0] + (rawPos[0] - smoothPosRef.current[0]) * POS_LERP,
                        smoothPosRef.current[1] + (rawPos[1] - smoothPosRef.current[1]) * POS_LERP,
                    ];
                }
                setCarPosition(smoothPosRef.current);

                // Car bearing (look ahead)
                const nextDist = Math.min(dist + LOOK_AHEAD_KM, Math.max(0, totalLen - 0.0001));
                let nextPt;
                try {
                    nextPt = along(line, nextDist, { units: 'kilometers' });
                } catch {
                    nextPt = pt; // Fallback to current position if lookahead fails
                }
                const targetBearing = bearing(point(rawPos), point(nextPt.geometry.coordinates as [number, number]));

                if (smoothBearingRef.current === null) {
                    smoothBearingRef.current = targetBearing;
                } else {
                    smoothBearingRef.current = lerpAngle(smoothBearingRef.current, targetBearing, BEARING_LERP);
                }
                setCarRotation(smoothBearingRef.current);

                // Camera follows car with slight lag
                if (!smoothCamRef.current) {
                    smoothCamRef.current = smoothPosRef.current;
                } else {
                    smoothCamRef.current = [
                        smoothCamRef.current[0] + (smoothPosRef.current[0] - smoothCamRef.current[0]) * CAM_POS_LERP,
                        smoothCamRef.current[1] + (smoothPosRef.current[1] - smoothCamRef.current[1]) * CAM_POS_LERP,
                    ];
                }

                setViewState(prev => ({
                    ...prev,
                    longitude: smoothCamRef.current![0],
                    latitude: smoothCamRef.current![1],
                    bearing: lerpAngle(prev.bearing, smoothBearingRef.current!, CAM_BEARING_LERP),
                    zoom: 17.5,
                    pitch: 68,
                }));

                if (t < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    // Arrival
                    setPhase('arrival');
                    setCarPosition([dest.lng, dest.lat]);
                    setTimeout(() => {
                        if (cancelled) return;
                        setArrivalBurst(true);
                        setTimeout(() => {
                            if (cancelled) return;
                            setShowArrivalCard(true);
                        }, 400);
                    }, 500);
                }
            };

            animationRef.current = requestAnimationFrame(animate);
        };

        run();
        return () => {
            cancelled = true;
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isVisible, fetchRoute, reportLocation, dest.lng, dest.lat]);

    // 3D buildings on load
    const handleMapLoad = useCallback(() => {
        const map = mapRef.current?.getMap();
        if (!map || map.getLayer('3d-buildings')) return;

        const layers = map.getStyle().layers;
        const labelId = layers?.find((l: any) => l.type === 'symbol' && l.layout?.['text-field'])?.id;

        map.addLayer({
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
                'fill-extrusion-color': '#F5F0E1',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.8,
            },
        }, labelId);

        map.setLight({
            anchor: 'viewport',
            color: '#ffffff',
            intensity: 0.4,
            position: [1.5, 180, 30],
        });
    }, []);

    if (!isVisible) return null;

    const routeGeoJson: GeoJSON.Feature<GeoJSON.LineString> | null =
        routeCoords.length > 1
            ? {
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: routeCoords },
            }
            : null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50"
                style={{ background: '#F5F0E1' }}
            >
                <Map
                    ref={mapRef}
                    {...viewState}
                    onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
                    mapStyle="mapbox://styles/mapbox/light-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    scrollZoom={false}
                    dragPan={false}
                    dragRotate={false}
                    touchZoomRotate={false}
                    keyboard={false}
                    doubleClickZoom={false}
                    onLoad={handleMapLoad}
                    style={{ width: '100%', height: '100%' }}
                >
                    {/* Route glow */}
                    {routeGeoJson && (
                        <Source id="route-glow" type="geojson" data={routeGeoJson}>
                            <Layer
                                id="route-glow-layer"
                                type="line"
                                paint={{
                                    'line-color': '#6B0F1A',
                                    'line-width': 12,
                                    'line-opacity': 0.12,
                                    'line-blur': 8,
                                }}
                            />
                        </Source>
                    )}

                    {/* Route line */}
                    {routeGeoJson && (
                        <Source id="route" type="geojson" data={routeGeoJson}>
                            <Layer
                                id="route-layer"
                                type="line"
                                paint={{
                                    'line-color': '#6B0F1A',
                                    'line-width': 4,
                                    'line-opacity': 0.7,
                                }}
                            />
                        </Source>
                    )}

                    {/* Start dot */}
                    <Marker longitude={reportLocation.lng} latitude={reportLocation.lat} anchor="center">
                        <div
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: '#6B0F1A',
                                border: '2px solid white',
                                boxShadow: '0 2px 8px rgba(107, 15, 26, 0.4)',
                            }}
                        />
                    </Marker>

                    {/* Destination marker */}
                    <Marker longitude={dest.lng} latitude={dest.lat} anchor="center">
                        <div className="relative">
                            {arrivalBurst && (
                                <>
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0.8 }}
                                        animate={{ scale: 3.5, opacity: 0 }}
                                        transition={{ duration: 0.7 }}
                                        style={{
                                            position: 'absolute',
                                            inset: -10,
                                            borderRadius: '50%',
                                            border: '2px solid #22c55e',
                                        }}
                                    />
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0.6 }}
                                        animate={{ scale: 2.5, opacity: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        style={{
                                            position: 'absolute',
                                            inset: -10,
                                            borderRadius: '50%',
                                            border: '2px solid #22c55e',
                                        }}
                                    />
                                </>
                            )}
                            <motion.div
                                animate={arrivalBurst ? { scale: [1, 1.3, 1] } : {}}
                                transition={{ duration: 0.3 }}
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: arrivalBurst ? '#22c55e' : 'white',
                                    border: '2.5px solid',
                                    borderColor: arrivalBurst ? '#22c55e' : '#6B0F1A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: arrivalBurst
                                        ? '0 0 20px rgba(34, 197, 94, 0.5)'
                                        : '0 2px 10px rgba(107, 15, 26, 0.25)',
                                }}
                            >
                                {arrivalBurst ? (
                                    <CheckCircle2 size={16} color="white" />
                                ) : (
                                    <span style={{ fontSize: 12 }}>🏛</span>
                                )}
                            </motion.div>
                        </div>
                    </Marker>

                    {/* Car */}
                    {phase === 'travel' && (
                        <Marker longitude={carPosition[0]} latitude={carPosition[1]} anchor="center">
                            <div style={{ zIndex: 50, position: 'relative' }}>
                                <EnvelopeMarker rotation={carRotation - 90} visible={true} />
                            </div>
                        </Marker>
                    )}
                </Map>

                {/* Status pill at top */}
                <motion.div
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
                    className="fixed top-[env(safe-area-inset-top,16px)] left-0 right-0 z-50 flex justify-center"
                    style={{ paddingTop: 16 }}
                >
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.92)',
                            backdropFilter: 'blur(16px)',
                            borderRadius: 20,
                            padding: '10px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                            border: '1px solid rgba(107, 15, 26, 0.1)',
                        }}
                    >
                        {phase === 'travel' && (
                            <>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.2, repeat: Infinity }}
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: '#6B0F1A',
                                    }}
                                />
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#1E1E1E' }}>
                                    Filing to {dest.name}...
                                </span>
                            </>
                        )}
                        {phase === 'arrival' && (
                            <>
                                <CheckCircle2 size={16} color="#22c55e" />
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#1E1E1E' }}>
                                    Delivered
                                </span>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Arrival card */}
                <AnimatePresence>
                    {showArrivalCard && (
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed bottom-0 left-0 right-0 z-50"
                            style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(24px)',
                                borderTopLeftRadius: 28,
                                borderTopRightRadius: 28,
                                padding: '28px 24px',
                                paddingBottom: 'calc(28px + env(safe-area-inset-bottom))',
                                boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 14px',
                                        boxShadow: '0 6px 24px rgba(34, 197, 94, 0.25)',
                                    }}
                                >
                                    <CheckCircle2 size={28} color="white" />
                                </motion.div>

                                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1E1E1E', marginBottom: 4 }}>
                                    Report Delivered
                                </h2>
                                <p style={{ fontSize: 14, color: '#888' }}>
                                    {reportType} &rarr; {dest.name}
                                </p>
                            </div>

                            <button
                                onClick={onComplete}
                                style={{
                                    width: '100%',
                                    padding: '14px 32px',
                                    borderRadius: 14,
                                    background: '#6B0F1A',
                                    border: 'none',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 16px rgba(107, 15, 26, 0.25)',
                                    transition: 'transform 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                Done
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
}
