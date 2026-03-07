'use client';

import { useState } from 'react';
import NavBar from '@/components/NavBar';
import DigestView from '@/components/DigestView';
import { NEIGHBORHOODS } from '@/lib/constants';

export default function DigestPage() {
  const [neighborhood, setNeighborhood] = useState('downtown-hamilton');

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 glass-card rounded-none border-t-0 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-bold">
            Weekly <span className="text-[#6366f1]">Digest</span>
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
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        <DigestView neighborhood={neighborhood} />
      </main>

      <NavBar />
    </div>
  );
}
