'use client';

import { useState } from 'react';

export default function DigestView({ neighborhood }: { neighborhood: string }) {
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState('');

  const generateDigest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/digest?neighborhood=${neighborhood}`);
      if (res.ok) {
        const data = await res.json();
        setMarkdown(data.markdown);
        setGeneratedAt(data.generatedAt);
      }
    } catch {
      setMarkdown('Failed to generate digest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Weekly Digest</h3>
        <button
          onClick={generateDigest}
          disabled={loading}
          className="px-4 py-2 bg-[#6366f1] hover:bg-[#5558e6] rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Digest'}
        </button>
      </div>

      {generatedAt && (
        <p className="text-xs text-[#888]">
          Generated: {new Date(generatedAt).toLocaleString()}
        </p>
      )}

      {markdown && (
        <div className="glass-card p-6 prose prose-invert prose-sm max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: markdown
                .replace(/^### (.*)/gm, '<h3>$1</h3>')
                .replace(/^## (.*)/gm, '<h2>$1</h2>')
                .replace(/^# (.*)/gm, '<h1>$1</h1>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/^\- (.*)/gm, '<li>$1</li>')
                .replace(/\n/g, '<br/>'),
            }}
          />
        </div>
      )}

      {!markdown && !loading && (
        <div className="glass-card p-8 text-center text-[#888]">
          <p>Click &quot;Generate Digest&quot; to create a weekly safety summary</p>
        </div>
      )}
    </div>
  );
}
