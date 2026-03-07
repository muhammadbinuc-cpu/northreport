'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import NavBar from '@/components/NavBar';
import PulseFeed from '@/components/PulseFeed';
import VoiceListener from '@/components/VoiceListener';
import { NEIGHBORHOODS } from '@/lib/constants';

export default function FeedPage() {
  const { user, isLoading } = useUser();
  const [neighborhood, setNeighborhood] = useState('downtown-hamilton');
  const [userRole, setUserRole] = useState('resident');
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          if (data.neighborhood) setNeighborhood(data.neighborhood);
          if (data.role) setUserRole(data.role);
          if (data.settings?.handsFreeEnabled) setVoiceEnabled(true);
        }
      } catch {
        // ignore
      }
    }
    if (user) loadUser();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card rounded-none border-t-0 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">
              Safe<span className="text-[#6366f1]">Pulse</span>
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                fetch('/api/users/me', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ settings: { handsFreeEnabled: !voiceEnabled } }),
                });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                voiceEnabled ? 'bg-[#6366f1] text-white' : 'bg-white/10 text-[#888]'
              }`}
            >
              🎤 {voiceEnabled ? 'Voice On' : 'Voice Off'}
            </button>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-lg mx-auto px-4 py-4">
        <PulseFeed neighborhood={neighborhood} isLeader={userRole === 'leader'} />
      </main>

      {/* Voice listener */}
      <VoiceListener enabled={voiceEnabled} />

      <NavBar />
    </div>
  );
}
