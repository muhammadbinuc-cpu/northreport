'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import dynamic from 'next/dynamic';
import NavBar from '@/components/NavBar';
import { NEIGHBORHOODS } from '@/lib/constants';

const CityMap = dynamic(() => import('@/components/CityMap'), { ssr: false });

export default function MapPage() {
  const { user } = useUser();
  const [neighborhood, setNeighborhood] = useState('downtown-hamilton');

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          if (data.neighborhood) setNeighborhood(data.neighborhood);
        }
      } catch {
        // ignore
      }
    }
    if (user) loadUser();
  }, [user]);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 glass-card rounded-none border-t-0 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">
              Live City <span className="text-[#6366f1]">Map</span>
            </h1>
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="text-xs text-[#888] bg-transparent outline-none cursor-pointer"
            >
              {NEIGHBORHOODS.map((n) => (
                <option key={n.slug} value={n.slug}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-8rem)]">
        <CityMap neighborhood={neighborhood} />
      </main>

      <NavBar />
    </div>
  );
}
