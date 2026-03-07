'use client';

import { useState, useEffect, useCallback } from 'react';
import FeedCard, { FeedItem } from './FeedCard';
import AskSafePulse from './AskSafePulse';
import VoiceComposer from './VoiceComposer';

interface PulseFeedProps {
  neighborhood: string;
  isLeader?: boolean;
}

export default function PulseFeed({ neighborhood, isLeader }: PulseFeedProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [explainItem, setExplainItem] = useState<FeedItem | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  const fetchFeed = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          neighborhood,
          limit: '20',
          type: typeFilter,
        });
        if (!reset && cursor) params.set('cursor', cursor);

        const res = await fetch(`/api/feed?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (reset) {
            setItems(data.items);
          } else {
            setItems((prev) => [...prev, ...data.items]);
          }
          setCursor(data.nextCursor);
          setHasMore(!!data.nextCursor && data.items.length > 0);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [neighborhood, cursor, typeFilter]
  );

  useEffect(() => {
    fetchFeed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neighborhood, typeFilter]);

  const handleConvert = async (voiceId: string) => {
    const res = await fetch(`/api/voices/${voiceId}/convert`, { method: 'POST' });
    if (res.ok) {
      fetchFeed(true);
    }
  };

  const handleFile311 = async (reportId: string) => {
    if (!confirm('Are you sure you want to file this report to 311?')) return;
    const res = await fetch('/api/auto-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId }),
    });
    if (res.ok) {
      const data = await res.json();
      alert(`Filing initiated! ID: ${data.filingId}`);
    }
  };

  // Separate stories for the stories row
  const stories = items.filter((i) => i.type === 'story');
  const feedItems = items;

  return (
    <div className="space-y-4">
      {/* Stories row */}
      {stories.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {stories.map((story) => (
            <button
              key={story.id}
              className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-[#6366f1] bg-[#6366f1]/20 flex items-center justify-center text-lg relative"
              onClick={() => setExplainItem(story)}
            >
              <span>{story.displayName.charAt(0).toUpperCase()}</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#6366f1] rounded-full flex items-center justify-center">
                <span className="text-[8px]">📖</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {['all', 'post', 'story', 'report'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              typeFilter === t
                ? 'bg-[#6366f1] text-white'
                : 'bg-white/5 text-[#888] hover:bg-white/10'
            }`}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
          </button>
        ))}
      </div>

      {/* Feed items */}
      <div className="space-y-3">
        {feedItems.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            onExplain={setExplainItem}
            isLeader={isLeader}
            onConvert={handleConvert}
            onFile311={handleFile311}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <button
          onClick={() => fetchFeed()}
          className="w-full py-3 text-sm text-[#888] hover:text-white transition-colors"
        >
          Load more
        </button>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-12 text-[#888]">
          <p className="text-lg mb-2">No pulse yet</p>
          <p className="text-sm">Be the first to share what&#39;s happening</p>
        </div>
      )}

      {/* Floating create button */}
      <button
        onClick={() => setComposerOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#6366f1] rounded-full flex items-center justify-center text-2xl shadow-lg shadow-[#6366f1]/25 hover:bg-[#5558e6] transition-colors z-40"
      >
        +
      </button>

      {/* Modals */}
      <VoiceComposer
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreated={() => fetchFeed(true)}
      />
      <AskSafePulse
        item={explainItem}
        isOpen={!!explainItem}
        onClose={() => setExplainItem(null)}
      />
    </div>
  );
}
