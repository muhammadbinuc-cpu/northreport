"use client";

import { useRef, useEffect } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapSceneProps {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
    children?: React.ReactNode;
}

export default function MapScene({
    longitude,
    latitude,
    zoom,
    pitch,
    bearing,
    children,
}: MapSceneProps) {
    const mapRef = useRef<MapRef>(null);

    // Smoothly animate to new position when props change
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.easeTo({
                center: [longitude, latitude],
                zoom,
                pitch,
                bearing,
                duration: 100, // Short duration since we're getting frequent updates
                easing: (t: number) => t, // Linear since Framer Motion handles easing
            });
        }
    }, [longitude, latitude, zoom, pitch, bearing]);

    return (
        <div className="fixed inset-0 z-0">
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude,
                    latitude,
                    zoom,
                    pitch,
                    bearing,
                }}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                style={{ width: "100%", height: "100%" }}
                // Disable all interactions - scroll controls the map
                interactive={false}
                attributionControl={false}
                logoPosition="bottom-right"
            >
                {children}
            </Map>
        </div>
    );
}
