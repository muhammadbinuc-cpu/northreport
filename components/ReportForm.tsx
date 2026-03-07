'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { NEIGHBORHOODS } from '@/lib/constants';

export default function ReportForm() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('infrastructure');
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

    let latitude = 43.2557;
    let longitude = -79.8711;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    } catch {
      // default Hamilton center
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
      <div className="glass-card p-6 space-y-4 text-center">
        <div className="text-4xl">✅</div>
        <h3 className="text-lg font-semibold">Report Submitted</h3>
        <p className="text-sm text-[#888]">
          Category: {success.category} &gt; {success.subcategory}
        </p>
        <p className="text-sm text-[#888]">Severity: {success.severity?.toUpperCase()}</p>
        <p className="text-sm text-[#ccc]">{success.aiSummary}</p>
        <button
          onClick={() => router.push('/feed')}
          className="px-6 py-3 bg-[#6366f1] rounded-xl text-sm font-semibold"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold">Submit a Report</h3>

      <div>
        <label className="text-xs text-[#888] block mb-1">Neighborhood</label>
        <select
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm outline-none"
        >
          {NEIGHBORHOODS.map((n) => (
            <option key={n.slug} value={n.slug}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-[#888] block mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="infrastructure">Infrastructure</option>
          <option value="environmental">Environmental</option>
          <option value="safety">Safety</option>
          <option value="accessibility">Accessibility</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-[#888] block mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail..."
          className="w-full bg-white/5 rounded-xl p-3 text-sm outline-none resize-none h-32 focus:ring-1 focus:ring-[#6366f1]"
          required
        />
      </div>

      <div>
        <label className="text-xs text-[#888] block mb-1">Photo (optional)</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="" className="w-full max-h-40 object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full py-3 border border-dashed border-white/20 rounded-xl text-sm text-[#888] hover:border-white/40 transition-colors"
          >
            + Add Photo
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading || !description.trim()}
        className="w-full py-3 bg-[#6366f1] hover:bg-[#5558e6] rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  );
}
