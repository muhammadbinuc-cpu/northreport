"use client";

import { Marker } from "react-map-gl/mapbox";

interface MarkerData {
    id: string;
    longitude: number;
    latitude: number;
    type: "problem" | "pattern";
    label?: string;
}

interface SceneMarkersProps {
    markers: MarkerData[];
    showPattern: boolean; // When true, markers turn teal
    showSonar: boolean; // When true, show sonar ping animation
    patternCenter?: { longitude: number; latitude: number };
    opacity?: number;
}

// CSS for pulsing markers and sonar effect
const markerStyles = `
  @keyframes marker-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.6; }
  }
  @keyframes sonar-ping {
    0% { transform: scale(0.5); opacity: 0.8; }
    100% { transform: scale(4); opacity: 0; }
  }
  .problem-marker {
    width: 16px;
    height: 16px;
    background: #f59e0b;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.5);
    box-shadow: 0 0 12px #f59e0b;
    animation: marker-pulse 2s ease-in-out infinite;
  }
  .pattern-marker {
    width: 16px;
    height: 16px;
    background: #14b8a6;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.5);
    box-shadow: 0 0 12px #14b8a6;
    animation: marker-pulse 2s ease-in-out infinite;
  }
  .sonar-ring {
    position: absolute;
    width: 40px;
    height: 40px;
    border: 2px solid #14b8a6;
    border-radius: 50%;
    animation: sonar-ping 2s ease-out infinite;
  }
  .sonar-ring:nth-child(2) { animation-delay: 0.5s; }
  .sonar-ring:nth-child(3) { animation-delay: 1s; }
`;

export default function SceneMarkers({
    markers,
    showPattern,
    showSonar,
    patternCenter,
    opacity = 1,
}: SceneMarkersProps) {
    return (
        <>
            <style>{markerStyles}</style>

            {/* Problem/Pattern markers */}
            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    longitude={marker.longitude}
                    latitude={marker.latitude}
                    anchor="center"
                >
                    <div
                        style={{ opacity, transition: "opacity 0.5s ease" }}
                    >
                        <div className={showPattern ? "pattern-marker" : "problem-marker"} />
                        {marker.label && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "20px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    whiteSpace: "nowrap",
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    color: "#fff",
                                    textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                                    background: "rgba(0,0,0,0.5)",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                }}
                            >
                                {marker.label}
                            </div>
                        )}
                    </div>
                </Marker>
            ))}

            {/* Sonar ping effect at pattern center */}
            {showSonar && patternCenter && (
                <Marker
                    longitude={patternCenter.longitude}
                    latitude={patternCenter.latitude}
                    anchor="center"
                >
                    <div
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity,
                        }}
                    >
                        <div className="sonar-ring" />
                        <div className="sonar-ring" />
                        <div className="sonar-ring" />
                        {/* Center dot */}
                        <div
                            style={{
                                position: "absolute",
                                width: "12px",
                                height: "12px",
                                background: "#14b8a6",
                                borderRadius: "50%",
                                boxShadow: "0 0 20px #14b8a6",
                            }}
                        />
                    </div>
                </Marker>
            )}
        </>
    );
}
