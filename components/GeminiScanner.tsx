'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Camera,
  X,
  Check,
  Send,
  ScanLine,
  Sparkles,
  Building2,
  Scale,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface AgentAnalysis {
  hazard_detected: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  department: string;
  bylaw_reference: string;
  technical_description: string;
  spoken_response: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-emerald-500/20 text-emerald-400',
};

export default function GeminiScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
  const [description, setDescription] = useState('');
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5_000_000) {
      setError('Image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setError(null);
      analyzeImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Image: string) => {
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data: AgentAnalysis = await res.json();
      setAnalysis(data);
      setDescription(data.technical_description);
    } catch {
      setError('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateDescription = async () => {
    if (!analysis) return;
    setGeneratingDesc(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: analysis.department,
          severity: analysis.severity,
          bylaw_reference: analysis.bylaw_reference,
          technical_description: analysis.technical_description,
        }),
      });

      if (!res.ok) throw new Error('Generation failed');

      const data = await res.json();
      setDescription(data.description);
    } catch {
      setError('Failed to generate description.');
    } finally {
      setGeneratingDesc(false);
    }
  };

  const submitReport = async () => {
    if (!analysis || !imagePreview || !description.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      let latitude = 43.2557;
      let longitude = -79.9192;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch {
        // Use defaults
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          category: 'infrastructure',
          neighborhood: 'downtown-waterloo',
          latitude,
          longitude,
          imageBase64: imagePreview,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitted(true);
      setTimeout(() => {
        resetScanner();
        router.push('/feed');
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetScanner = () => {
    setIsOpen(false);
    setImagePreview(null);
    setAnalysis(null);
    setDescription('');
    setError(null);
    setSubmitted(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: 'var(--accent-primary)',
          color: 'var(--bg-base)',
          boxShadow: 'var(--shadow-glow-accent), var(--shadow-glass-lg)',
        }}
      >
        <ScanLine className="w-6 h-6" />
      </motion.button>

      {/* Scanner Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={(e) => e.target === e.currentTarget && resetScanner()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl overflow-hidden backdrop-blur-xl"
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-glass)',
                boxShadow: 'var(--shadow-glass-lg)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--border-glass)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Scan &amp; File
                </h3>
                <button
                  onClick={resetScanner}
                  className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Image Upload / Preview */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!imagePreview ? (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors hover:border-[var(--accent-primary)]"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-sm">Take or upload a photo</span>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />

                    {/* Scan animation overlay */}
                    {analyzing && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.6)' }}
                      >
                        <motion.div
                          animate={{ y: [-80, 80] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                          className="w-full h-1"
                          style={{ background: 'var(--accent-primary)', boxShadow: 'var(--shadow-glow-accent)' }}
                        />
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Analysis Results */}
                {analysis && !analyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 p-4 rounded-xl"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    {/* Severity + Hazard status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold uppercase ${SEVERITY_COLORS[analysis.severity]}`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {analysis.severity}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {analysis.hazard_detected ? 'Hazard Confirmed' : 'No Hazard Detected'}
                      </span>
                    </div>

                    {/* Department */}
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Building2 className="w-4 h-4 text-crimson-light flex-shrink-0" />
                      <span>{analysis.department}</span>
                    </div>

                    {/* Bylaw */}
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Scale className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{analysis.bylaw_reference}</span>
                    </div>

                    {/* Description textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-[var(--text-muted)] font-medium">
                          Report Description
                        </label>
                        <button
                          onClick={generateDescription}
                          disabled={generatingDesc}
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-crimson/10 text-crimson-light hover:bg-crimson/20 transition-colors disabled:opacity-50"
                        >
                          {generatingDesc ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          {generatingDesc ? 'Generating...' : 'AI Rewrite'}
                        </button>
                      </div>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-crimson/40 transition-all"
                        style={{
                          background: 'var(--bg-glass)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                        placeholder="Describe the issue..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* Error message */}
                {error && (
                  <p className="text-sm" style={{ color: 'var(--severity-critical, #ef4444)' }}>
                    {error}
                  </p>
                )}

                {/* Success message */}
                {submitted && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-2 py-4"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--status-success)', color: 'white' }}
                    >
                      <Check className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Report submitted!
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              {analysis && !submitted && !analyzing && (
                <div className="p-4 border-t border-[var(--border-glass)]">
                  <button
                    onClick={submitReport}
                    disabled={submitting || !description.trim()}
                    className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    style={{
                      background: 'var(--accent-primary)',
                      color: 'var(--bg-base)',
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Filing...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        File 311 Report
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
