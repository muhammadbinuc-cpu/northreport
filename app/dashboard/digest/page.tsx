'use client';

import { useState } from 'react';
import AppShell from '@/components/AppShell';
import TopBar from '@/components/TopBar';
import DigestView from '@/components/DigestView';
import { NEIGHBORHOODS } from '@/lib/constants';

export default function DigestPage() {
  const [neighborhood, setNeighborhood] = useState('downtown-waterloo');

  return (
    <AppShell>
      <div className="flex flex-col h-screen">
        <TopBar
          title="Weekly Digest"
          neighborhood={neighborhood}
          onNeighborhoodChange={setNeighborhood}
          showSearch={false}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-6">
            <DigestView neighborhood={neighborhood} />
          </div>
        </main>
      </div>
    </AppShell>
  );
}
