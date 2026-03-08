'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { NEIGHBORHOODS } from '@/lib/constants';

// SVG Icons for categories
const categoryIcons = {
  infrastructure: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="12" y2="18" />
    </svg>
  ),
  environmental: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c4-4 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 8 8 12z" />
      <path d="M12 12c-1.5 0-3-1-3-2.5S10.5 7 12 7s3 1 3 2.5-1.5 2.5-3 2.5z" />
    </svg>
  ),
  safety: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  accessibility: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v6" />
      <path d="M8 10h8" />
      <path d="M10 22l2-8 2 8" />
      <path d="M8 22h2" />
      <path d="M14 22h2" />
    </svg>
  ),
};

const successIcon = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const cameraIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const closeIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const categories = [
  { value: 'infrastructure', label: 'Infrastructure', icon: categoryIcons.infrastructure },
  { value: 'environmental', label: 'Environmental', icon: categoryIcons.environmental },
  { value: 'safety', label: 'Safety', icon: categoryIcons.safety },
  { value: 'accessibility', label: 'Accessibility', icon: categoryIcons.accessibility },
];

const severities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function ReportForm() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('infrastructure');
  const [severity, setSeverity] = useState('medium');
  const [neighborhood, setNeighborhood] = useState('downtown-hamilton');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_048_576) {
      setError('Image must be under 1MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError('');

    let latitude = 43.6532; // Toronto fallback
    let longitude = -79.3832;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    } catch {
      // default Toronto center
    }

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          category,
          neighborhood,
          latitude,
          longitude,
          imageBase64: imagePreview || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to submit');
        return;
      }

      const data = await res.json();
      setSuccess(data);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#22C55E',
          }}
        >
          {successIcon}
        </div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">Report Submitted</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {success.category} · {success.subcategory}
        </p>
        <p className="text-sm">
          <span className={`chip-severity chip-${success.severity}`}>
            {success.severity}
          </span>
        </p>
        {success.aiSummary && (
          <div className="p-4 rounded-xl bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20">
            <p className="text-sm text-[var(--text-secondary)]">{success.aiSummary}</p>
          </div>
        )}
        <button
          onClick={() => router.push('/feed')}
          className="btn-primary"
        >
          Back to Feed
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category */}
      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-3 font-medium">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 ${category === c.value
                ? 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40'
                : 'glass-card border-transparent hover:bg-[var(--glass-hover)]'
                }`}
            >
              <span
                className="flex-shrink-0"
                style={{ color: category === c.value ? 'var(--accent-primary)' : 'var(--ink-muted)' }}
              >
                {c.icon}
              </span>
              <span className="text-sm font-medium">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Severity */}
      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-3 font-medium">Severity</label>
        <div className="flex gap-2">
          {severities.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSeverity(s.value)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${severity === s.value
                ? `chip-severity chip-${s.value}`
                : 'glass-card text-[var(--text-secondary)]'
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Neighborhood */}
      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-2 font-medium">Neighborhood</label>
        <select
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="input-glass w-full"
        >
          {NEIGHBORHOODS.map((n) => (
            <option key={n.slug} value={n.slug} className="bg-[var(--bg-elevated)]">
              {n.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-2 font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail..."
          className="input-glass w-full resize-none h-32"
          required
        />
      </div>

      {/* Photo */}
      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-2 font-medium">Photo (optional)</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="" className="w-full max-h-48 object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
              style={{ color: 'white' }}
            >
              {closeIcon}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full py-4 border border-dashed rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--ink-muted)',
            }}
          >
            {cameraIcon}
            Add Photo
          </button>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-[var(--severity-critical)]"
        >
          {error}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={loading || !description.trim()}
        className="btn-primary w-full py-4 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          'Submit Report'
        )}
      </button>
    </form>
  );
}
