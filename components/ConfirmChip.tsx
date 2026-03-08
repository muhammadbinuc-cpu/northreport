'use client';

import { useState } from 'react';

interface ConfirmChipProps {
  prompt: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmChip({ prompt, onConfirm, onCancel }: ConfirmChipProps) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="glass-card p-4 space-y-3">
      <p className="text-sm text-[#f0f0f0]">{prompt}</p>
      <div className="flex gap-2">
        <button
          onClick={async () => {
            setLoading(true);
            await onConfirm();
            setLoading(false);
          }}
          disabled={loading}
          className="px-4 py-2 bg-[#8b1a2b] hover:bg-[#7a0f1e] rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Confirm'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
      <p className="text-xs text-[#888]">Or say &quot;confirm submit&quot;</p>
    </div>
  );
}
