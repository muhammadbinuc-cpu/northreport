'use client';

import { useEffect, useState } from 'react';
import { SEVERITY_COLORS, HAMILTON_CENTER } from '@/lib/constants';

interface Hotspot {
  cellId: string;
  label: string;
  center: [number, number];
  count: number;
  uniqueUsers: number;
  topSeverity: string | null;
  recentItems: Array<{ id: string; source: string; caption: string; severity: string }>;
}

interface CityMapProps {
  neighborhood: string;
}

export default function CityMap({ neighborhood }: CityMapProps) {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    async function fetchHotspots() {
      setLoading(true);
      try {
        const res = await fetch(`/api/hotspots?neighborhood=${neighborhood}`);
        if (res.ok) {
          const data = await res.json();
          setHotspots(data.hotspots);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchHotspots();
  }, [neighborhood]);

  useEffect(() => {
    // Dynamically load Leaflet
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      const L = (await import('leaflet')).default;
      // @ts-expect-error CSS import
      await import('leaflet/dist/leaflet.css');

      const container = document.getElementById('city-map');
      if (!container || (container as any)._leaflet_id) return;

      const map = L.map('city-map').setView(
        [HAMILTON_CENTER.lat, HAMILTON_CENTER.lng],
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      // Add hotspot markers
      hotspots.forEach((hotspot) => {
        if (!hotspot.center) return;
        const [lng, lat] = hotspot.center;
        const color = SEVERITY_COLORS[hotspot.topSeverity || 'low'] || '#6366f1';
        const radius = Math.min(hotspot.count * 5 + 15, 50);

        const circle = L.circleMarker([lat, lng], {
          radius,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.3,
        }).addTo(map);

        circle.bindPopup(`
          <div style="color: #333;">
            <strong>${hotspot.label}</strong><br/>
            ${hotspot.count} reports • ${hotspot.uniqueUsers} users<br/>
            ${hotspot.topSeverity ? `Top severity: ${hotspot.topSeverity}` : ''}
          </div>
        `);

        circle.on('click', () => {
          setSelectedHotspot(hotspot);
        });
      });

      setMapLoaded(true);
    };

    if (hotspots.length > 0 || !loading) {
      loadLeaflet();
    }
  }, [hotspots, loading]);

  return (
    <div className="relative h-full">
      <div id="city-map" className="w-full h-full rounded-xl overflow-hidden" style={{ minHeight: '60vh' }} />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/80 rounded-xl">
          <div className="w-6 h-6 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Hotspot detail panel */}
      {selectedHotspot && (
        <div className="absolute bottom-4 left-4 right-4 glass-card p-4 space-y-2 z-[1000]">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{selectedHotspot.label}</h4>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="text-[#888] hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-[#888]">
            {selectedHotspot.count} items • {selectedHotspot.uniqueUsers} unique users
          </p>
          <div className="space-y-1">
            {selectedHotspot.recentItems.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 rounded-lg p-2 text-xs"
              >
                <span className="text-[#888]">{item.source}</span> — {item.caption?.substring(0, 80)}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && hotspots.length === 0 && mapLoaded && (
        <div className="absolute top-4 left-4 glass-card px-3 py-2 z-[1000]">
          <p className="text-xs text-[#888]">No hotspots yet (need 3+ unique users)</p>
        </div>
      )}
    </div>
  );
}
