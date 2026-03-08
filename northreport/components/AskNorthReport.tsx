"use client";

import { FeedItem } from "./FeedCard";

interface AskNorthReportProps {
  item: FeedItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AskNorthReport({ item, isOpen, onClose }: AskNorthReportProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 rounded-2xl p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold text-white mb-2">Ask NorthReport</h2>
        <p className="text-zinc-400 text-sm mb-4">{item.caption}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
