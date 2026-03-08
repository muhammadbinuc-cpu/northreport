'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentVoice } from '@/hooks/useAgentVoice';
import type { VoiceMode } from '@/hooks/useAgentVoice';
import { useVoiceControl } from '@/lib/voiceContext';
import dynamic from 'next/dynamic';
import {
  Camera,
  Upload,
  MapPin,
  StickyNote,
  ScanLine,
  Building2,
  AlertTriangle,
  Scale,
  FileText,
  CheckCircle2,
  ArrowRight,
  X,
  Shield,
  Loader2,
  Mic,
  Pencil,
  Send,
  Clock,
  Hash,
  User,
} from 'lucide-react';

const ReportJourney = dynamic(() => import('./report-journey/ReportJourney'), { ssr: false });


/* ─── Types ─── */
interface AgentAnalysis {
  hazard_detected: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  department: string;
  bylaw_reference: string;
  technical_description: string;
  spoken_response: string;
}

type Step = 'intake' | 'scanning' | 'consultation' | 'form-preview' | 'filing';

const SEVERITY_CHIP: Record<string, string> = {
  critical: 'bg-red-700/[0.08] text-red-700 border-red-700/20',
  high: 'bg-orange-700/[0.08] text-orange-700 border-orange-700/20',
  medium: 'bg-amber-700/[0.08] text-amber-700 border-amber-700/20',
  low: 'bg-green-700/[0.08] text-green-700 border-green-700/20',
};

/* ─── Subcomponents ─── */

function ScanOverlay() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-15">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full h-px"
            style={{ top: `${(i + 1) * 12.5}%`, background: 'var(--accent-primary)' }}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute h-full w-px"
            style={{ left: `${(i + 1) * 12.5}%`, background: 'var(--accent-primary)' }}
          />
        ))}
      </div>

      {/* Sweeping scan bar */}
      <motion.div
        className="absolute left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(to right, transparent, var(--accent-primary), transparent)',
          boxShadow: '0 0 20px 4px rgba(107, 15, 26, 0.3)',
        }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Corner brackets */}
      {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
        <div
          key={pos}
          className={`absolute w-6 h-6 ${pos}`}
          style={{
            borderColor: 'rgba(107, 15, 26, 0.5)',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderRadius: '4px',
            borderRight: pos.includes('left') ? 'none' : undefined,
            borderLeft: pos.includes('right') ? 'none' : undefined,
            borderBottom: pos.includes('top') ? 'none' : undefined,
            borderTop: pos.includes('bottom') ? 'none' : undefined,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Voice Aura: Pulsing ring around agent card ─── */

function VoiceAura({ voiceMode }: { voiceMode: VoiceMode }) {
  return (
    <AnimatePresence>
      {voiceMode !== 'idle' && (
        <>
          {/* Outer pulsing ring */}
          <motion.div
            key="aura-outer"
            className="absolute -inset-3 rounded-3xl pointer-events-none z-0"
            initial={{ opacity: 0 }}
            animate={{
              opacity: voiceMode === 'listening' ? [0.3, 0.6, 0.3] : 0.4,
              scale: voiceMode === 'listening' ? [1, 1.02, 1] : 1,
            }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{
              border: '2px solid rgba(107, 15, 26, 0.3)',
              boxShadow:
                '0 0 30px rgba(107, 15, 26, 0.1), inset 0 0 30px rgba(107, 15, 26, 0.03)',
            }}
          />
          {/* Inner glow ring */}
          <motion.div
            key="aura-inner"
            className="absolute -inset-1.5 rounded-[20px] pointer-events-none z-0"
            initial={{ opacity: 0 }}
            animate={{
              opacity: voiceMode === 'listening' ? [0.2, 0.5, 0.2] : 0.3,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
            style={{
              border: '1px solid rgba(107, 15, 26, 0.2)',
              boxShadow: '0 0 20px rgba(107, 15, 26, 0.08)',
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Voice HUD: Inline status indicator for voice interaction ─── */

function VoiceHUD({
  voiceMode,
  transcript,
}: {
  voiceMode: VoiceMode;
  transcript: string;
}) {
  return (
    <AnimatePresence mode="wait">
      {voiceMode === 'idle' && (
        <motion.div
          key="voice-idle"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 p-3 rounded-xl"
          style={{ background: 'rgba(107, 15, 26, 0.04)', border: '1px solid rgba(107, 15, 26, 0.08)' }}
        >
          <Mic className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Say{' '}
            <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>
              &ldquo;Hey NorthReport&rdquo;
            </span>{' '}
            to speak with the agent
          </p>
        </motion.div>
      )}

      {voiceMode === 'listening' && (
        <motion.div
          key="voice-listening"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-3 rounded-xl space-y-2"
          style={{ background: 'rgba(107, 15, 26, 0.06)', border: '1px solid rgba(107, 15, 26, 0.15)' }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Mic className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            </motion.div>
            <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--accent-primary)' }}>
              Listening...
            </p>
            {/* Animated sound bars */}
            <div className="flex items-center gap-0.5 ml-auto">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 rounded-full"
                  style={{ background: 'var(--accent-primary)' }}
                  animate={{ height: ['4px', '12px', '4px'] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.12,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
          {transcript && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm italic"
              style={{ color: 'var(--text-secondary)' }}
            >
              &ldquo;{transcript}&rdquo;
            </motion.p>
          )}
        </motion.div>
      )}

      {voiceMode === 'processing' && (
        <motion.div
          key="voice-processing"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-3 rounded-xl space-y-2"
          style={{ background: 'rgba(107, 15, 26, 0.06)', border: '1px solid rgba(107, 15, 26, 0.15)' }}
        >
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent-primary)' }} />
            <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--accent-primary)' }}>
              Processing command...
            </p>
          </div>
          {transcript && (
            <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
              &ldquo;{transcript}&rdquo;
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Component ─── */

export default function SmartReportAgent() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<Step>('intake');
  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [address, setAddress] = useState('137 University Ave W, Waterloo, ON');
  const [notes, setNotes] = useState('');
  const [analysis, setAnalysis] = useState<AgentAnalysis | null>(null);
  const [error, setError] = useState('');
  const [filingLoading, setFilingLoading] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 43.4643, lng: -80.5204 });
  const [reportId, setReportId] = useState<string | null>(null);
  const [refNumber] = useState(() => `WR-${Date.now().toString(36).toUpperCase()}`);

  /* ── Pick up captured image/GPS from CaptureCamera via sessionStorage ── */
  useEffect(() => {
    const img = sessionStorage.getItem('capturedImage');
    if (img) {
      setImage(img);
      sessionStorage.removeItem('capturedImage');
    }
    const gps = sessionStorage.getItem('capturedGps');
    if (gps) {
      const { latitude, longitude } = JSON.parse(gps);
      setUserLocation({ lat: latitude, lng: longitude });
      sessionStorage.removeItem('capturedGps');
    }
  }, []);

  /* ── Pause global VoiceListener only during consultation (useAgentVoice takes over mic) ── */
  const { pauseVoice, resumeVoice } = useVoiceControl();
  const isConsulting = step === 'consultation' && analysis !== null;
  useEffect(() => {
    console.log('[SmartReportAgent] isConsulting:', isConsulting);
    if (isConsulting) {
      console.log('[SmartReportAgent] Calling pauseVoice()');
      pauseVoice();
    }
    else {
      console.log('[SmartReportAgent] Calling resumeVoice()');
      resumeVoice();
    }
  }, [isConsulting, pauseVoice, resumeVoice]);

  const handleAnalyzeRef = useRef<() => void>(() => { });

  const { voiceMode, transcript: voiceTranscript } = useAgentVoice({
    enabled: isConsulting,
    initialGreeting: analysis?.spoken_response ?? null,
    reportState: analysis
      ? {
        department: analysis.department,
        severity: analysis.severity,
        technical_description: analysis.technical_description,
        bylaw_reference: analysis.bylaw_reference,
      }
      : null,
    onRefine: (newDescription: string) => {
      setAnalysis((prev) =>
        prev ? { ...prev, technical_description: newDescription } : prev
      );
    },
    onFile: () => {
      handleFile();
    },
    onCancel: () => {
      setStep('intake');
      setAnalysis(null);
    },
    onAnalyze: () => {
      handleAnalyzeRef.current();
    },
  });

  /* ── Image upload ── */
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_097_152) {
      setError('Image must be under 2 MB');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ── Camera ── */
  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError('Could not access camera.');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setImage(canvas.toDataURL('image/jpeg', 0.7));
    closeCamera();
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  /* ── Listen for global voice "analyze" event ── */
  useEffect(() => {
    const handler = () => { handleAnalyzeRef.current(); };
    window.addEventListener('northreport:analyze', handler);
    return () => { window.removeEventListener('northreport:analyze', handler); };
  }, []);

  /* ── Listen for global voice "open camera" event ── */
  useEffect(() => {
    const handler = () => { openCamera(); };
    window.addEventListener('northreport:open-camera', handler);
    return () => { window.removeEventListener('northreport:open-camera', handler); };
  }, []);

  /* ── Submit to AI ── */
  // Keep ref current for voice callback
  useEffect(() => { handleAnalyzeRef.current = handleAnalyze; });
  const handleAnalyze = async () => {
    if (!image) return;
    setStep('scanning');
    setError('');

    try {
      const res = await fetch('/api/gemini-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          userContext: notes || undefined,
          location: address,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data: AgentAnalysis = await res.json();
      setAnalysis(data);
      setStep('consultation');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStep('intake');
    }
  };

  /* ── Save & Submit Report ── */
  const handleFile = async () => {
    if (!analysis) return;
    setFilingLoading(true);

    try {
      let latitude = userLocation.lat;
      let longitude = userLocation.lng;

      // Geocode the entered address so the report & animation has a real origin
      if (address) {
        try {
          const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
          const geoRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&proximity=-80.5204,43.4643&limit=1`);
          const geoData = await geoRes.json();
          if (geoData.features && geoData.features.length > 0) {
            longitude = geoData.features[0].center[0];
            latitude = geoData.features[0].center[1];
          }
        } catch (err) {
          console.error('Geocoding failed:', err);
        }
      }

      const isDefault = latitude === 43.4643 && longitude === -80.5204;
      if (isDefault) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        ).catch(() => null);
        if (pos) {
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        }
      }

      // Crucial: Update the state so ReportJourney uses these new coordinates
      setUserLocation({ lat: latitude, lng: longitude });

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: analysis.technical_description,
          category: 'infrastructure',
          neighborhood: 'downtown-waterloo',
          latitude,
          longitude,
          imageBase64: image,
          status: 'submitted',
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Submitting report failed');
      }
      setReportId(resData.id);
      sessionStorage.setItem('newReportId', resData.id);
      setUserLocation({ lat: latitude, lng: longitude });
      setStep('form-preview');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submitting report failed');
    } finally {
      setFilingLoading(false);
    }
  };

  /* ─── Transition wrapper ─── */
  const pageVariants = {
    initial: { opacity: 0, y: 24, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -16, scale: 0.97 },
  };

  return (
    <div className="w-full max-w-[560px] mx-auto">
      <AnimatePresence mode="wait">
        {/* ─────────── STEP 1: INTAKE ─────────── */}
        {step === 'intake' && (
          <motion.div
            key="intake"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Header badge */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(107, 15, 26, 0.1)', border: '1px solid rgba(107, 15, 26, 0.15)' }}
              >
                <Shield className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-utility)' }}>
                  Waterloo AI Agent
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Smart City Intake System</p>
              </div>
            </div>

            {/* Card */}
            <div
              className="rounded-2xl p-6 space-y-5"
              style={{
                background: 'var(--palette-cream)',
                border: '1px solid var(--border-hairline)',
                boxShadow: 'var(--shadow-glass-md)',
              }}
            >
              {/* Hidden file input for gallery */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />
              <canvas ref={canvasRef} className="hidden" />

              {image ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={image}
                    alt="Captured hazard"
                    className="w-full max-h-56 object-cover"
                  />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={openCamera}
                    className="w-full py-8 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center gap-3"
                    style={{ borderColor: 'var(--border-subtle)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(107, 15, 26, 0.3)';
                      e.currentTarget.style.background = 'rgba(107, 15, 26, 0.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(107, 15, 26, 0.06)' }}
                    >
                      <Camera className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Take a Photo
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Open camera to capture the hazard
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(107, 15, 26, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    <Upload className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Upload from Gallery
                    </span>
                  </button>
                </div>
              )}

              {/* Address */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  <MapPin className="w-3 h-3" /> Location
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                  placeholder="Enter address..."
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-muted)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  <StickyNote className="w-3 h-3" /> Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all resize-none outline-none"
                  placeholder="Any extra context for the AI agent..."
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-muted)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm"
                  style={{ color: 'var(--severity-critical)' }}
                >
                  {error}
                </motion.p>
              )}

              {/* Submit button */}
              <button
                onClick={handleAnalyze}
                disabled={!image}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--accent-primary)',
                  boxShadow: '0 4px 12px rgba(107, 15, 26, 0.2)',
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--accent-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent-primary)';
                }}
              >
                <ScanLine className="w-4 h-4" />
                Analyze with AI Agent
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ─────────── STEP 2: SCANNING ─────────── */}
        {step === 'scanning' && (
          <motion.div
            key="scanning"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'var(--palette-cream)',
                border: '1px solid var(--border-hairline)',
                boxShadow: 'var(--shadow-glass-md)',
              }}
            >
              {/* Scanning image */}
              <div className="relative rounded-2xl overflow-hidden mb-6">
                <img
                  src={image!}
                  alt="Scanning"
                  className="w-full max-h-72 object-cover"
                />
                <ScanOverlay />
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(107, 15, 26, 0.1)', border: '1px solid rgba(107, 15, 26, 0.15)' }}
                  >
                    <ScanLine className="w-5 h-5 animate-pulse" style={{ color: 'var(--accent-primary)' }} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    AI Agent Analyzing...
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Cross-referencing Waterloo bylaws & Ontario regulations
                  </p>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5 mt-5 justify-center">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--accent-primary)' }}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─────────── STEP 3: CONSULTATION ─────────── */}
        {step === 'consultation' && analysis && (
          <motion.div
            key="consultation"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-4 relative"
          >
            {/* Voice Aura rings */}
            <VoiceAura voiceMode={voiceMode} />

            {/* Agent header */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="relative w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(107, 15, 26, 0.1)', border: '1px solid rgba(107, 15, 26, 0.15)' }}
              >
                <Shield className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                {/* Voice active indicator dot */}
                {voiceMode !== 'idle' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                    style={{ background: 'var(--accent-primary)', boxShadow: '0 0 8px rgba(107, 15, 26, 0.5)' }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'var(--accent-primary)' }}
                      animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--accent-primary)' }}>
                  Agent Assessment
                </p>
                {voiceMode === 'listening' && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Voice Active
                  </motion.span>
                )}
              </div>
            </div>

            {/* Image thumbnail */}
            <div className="rounded-xl overflow-hidden max-h-32">
              <img
                src={image!}
                alt="Analyzed"
                className="w-full h-32 object-cover opacity-80"
              />
            </div>

            {/* Findings card */}
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{
                background: 'var(--palette-cream)',
                border: '1px solid var(--border-hairline)',
                boxShadow: 'var(--shadow-glass-md)',
              }}
            >
              {/* Severity badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border ${SEVERITY_CHIP[analysis.severity]}`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {analysis.severity} severity
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {analysis.hazard_detected ? 'Hazard Confirmed' : 'No Hazard'}
                </span>
              </div>

              {/* Department */}
              <div
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-hairline)' }}
              >
                <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-medium" style={{ color: 'var(--text-muted)' }}>
                    Department
                  </p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {analysis.department}
                  </p>
                </div>
              </div>

              {/* Bylaw reference */}
              <div
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-hairline)' }}
              >
                <Scale className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--severity-medium)' }} />
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-medium" style={{ color: 'var(--text-muted)' }}>
                    Applicable Regulation
                  </p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {analysis.bylaw_reference}
                  </p>
                </div>
              </div>

              {/* Technical description — editable */}
              <div
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-hairline)' }}
              >
                <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-wide font-medium" style={{ color: 'var(--text-muted)' }}>
                      Report Summary
                    </p>
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-faint)' }}>
                      <Pencil className="w-2.5 h-2.5" /> Tap to edit
                    </span>
                  </div>
                  <motion.div
                    key={analysis.technical_description}
                    initial={{ backgroundColor: 'rgba(107, 15, 26, 0.08)' }}
                    animate={{ backgroundColor: 'rgba(107, 15, 26, 0)' }}
                    transition={{ duration: 1.5 }}
                    className="rounded-md mt-0.5 -mx-1"
                  >
                    <textarea
                      value={analysis.technical_description}
                      onChange={(e) =>
                        setAnalysis((prev) =>
                          prev ? { ...prev, technical_description: e.target.value } : prev
                        )
                      }
                      rows={3}
                      className="w-full bg-transparent text-sm leading-relaxed px-1 resize-none transition-colors outline-none"
                      style={{ color: 'var(--text-secondary)' }}
                      onFocus={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(107, 15, 26, 0.2)';
                        e.currentTarget.style.borderRadius = '6px';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Spoken response preview */}
              <div
                className="p-3 rounded-xl"
                style={{ background: 'rgba(107, 15, 26, 0.04)', border: '1px solid rgba(107, 15, 26, 0.1)' }}
              >
                <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  &ldquo;{analysis.spoken_response}&rdquo;
                </p>
              </div>

              {/* Voice interaction HUD */}
              <VoiceHUD voiceMode={voiceMode} transcript={voiceTranscript} />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep('intake');
                  setAnalysis(null);
                }}
                className="flex-1 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: 'var(--palette-cream)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--palette-cream)';
                }}
              >
                Start Over
              </button>
              <button
                onClick={handleFile}
                disabled={filingLoading}
                className="flex-[2] py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                style={{
                  background: 'var(--accent-primary)',
                  boxShadow: '0 4px 12px rgba(107, 15, 26, 0.2)',
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--accent-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent-primary)';
                }}
              >
                {filingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit to 311
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─────────── STEP 4: FORM PREVIEW ─────────── */}
        {step === 'form-preview' && analysis && (
          <motion.div
            key="form-preview"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(107, 15, 26, 0.1)', border: '1px solid rgba(107, 15, 26, 0.15)' }}
              >
                <FileText className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-utility)' }}>
                  311 Service Request
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Review before filing</p>
              </div>
            </div>

            {/* Form card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--palette-cream)',
                border: '1px solid var(--border-hairline)',
                boxShadow: 'var(--shadow-glass-md)',
              }}
            >
              {/* Form header bar */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ background: 'var(--accent-primary)' }}
              >
                <span className="text-xs font-bold text-white tracking-wider uppercase">
                  City of Waterloo — 311 Form
                </span>
                <span className="text-[10px] text-white/70 font-mono">
                  {refNumber}
                </span>
              </div>

              {/* Image */}
              {image && (
                <div className="px-5 pt-4">
                  <img
                    src={image}
                    alt="Report photo"
                    className="w-full h-36 object-cover rounded-xl"
                    style={{ border: '1px solid var(--border-hairline)' }}
                  />
                </div>
              )}

              {/* Form fields */}
              <div className="px-5 py-4 space-y-3">
                {/* Reference */}
                <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                  <Hash className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>Reference #</p>
                    <p className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{refNumber}</p>
                  </div>
                </div>

                {/* Department */}
                <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                  <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>Department</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{analysis.department}</p>
                  </div>
                </div>

                {/* Severity */}
                <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>Priority</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${SEVERITY_CHIP[analysis.severity]}`}>
                      {analysis.severity}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>Location</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{address}</p>
                  </div>
                </div>

                {/* Bylaw */}
                <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                  <Scale className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>Applicable Regulation</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{analysis.bylaw_reference}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                  <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>Description</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{analysis.technical_description}</p>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-start gap-3 py-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>Submitted</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {new Date().toLocaleString('en-CA', { dateStyle: 'long', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div
                className="px-5 py-3 flex items-center gap-2"
                style={{ background: 'rgba(22, 163, 74, 0.08)', borderTop: '1px solid rgba(22, 163, 74, 0.15)' }}
              >
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700">Report Verified &amp; Ready to File</span>
              </div>
            </div>

            {/* File button */}
            <button
              onClick={() => setStep('filing')}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'var(--accent-primary)',
                boxShadow: '0 4px 12px rgba(107, 15, 26, 0.2)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-primary)'; }}
            >
              <Send className="w-4 h-4" />
              File to Waterloo City Hall
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ─────────── STEP 5: FILING ANIMATION ─────────── */}
        {step === 'filing' && (
          <ReportJourney
            reportLocation={userLocation}
            reportType="311 Service Request"
            onComplete={() => {
              router.push('/dashboard');
            }}
            isVisible={true}
          />
        )}

      </AnimatePresence>

      {/* Live camera viewfinder */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="flex-1 object-cover w-full"
            />
            <div className="absolute top-6 right-6">
              <button
                onClick={closeCamera}
                className="p-3 rounded-full backdrop-blur-md"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="absolute bottom-12 left-0 right-0 flex justify-center">
              <button
                onClick={capturePhoto}
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                style={{ border: '4px solid rgba(255,255,255,0.9)' }}
              >
                <div className="w-[58px] h-[58px] rounded-full bg-white/95" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
