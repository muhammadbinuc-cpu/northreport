'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import VoiceOverlay from './VoiceOverlay';
import { speak } from '@/lib/tts';

type VoiceMode = 'DORMANT' | 'ACTIVE';

interface Command {
  intent: string;
  action: string;
  targetId: string | null;
  payload: { text: string | null };
  requiresConfirm: boolean;
  confirmPrompt: string | null;
  spokenResponse: string | null;
}

export default function VoiceListener({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<VoiceMode>('DORMANT');
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<Command | null>(null);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'restarting'>('idle');
  const [confirmPending, setConfirmPending] = useState<Command | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || !enabled) return;
    try {
      recognitionRef.current.start();
      isListeningRef.current = true;
      setStatus('listening');
    } catch {
      // Already started
    }
  }, [enabled]);

  const stopRecognition = useCallback(() => {
    if (!recognitionRef.current) return;
    isListeningRef.current = false;
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
    setStatus('idle');
  }, []);

  const executeCommand = useCallback(
    (cmd: Command) => {
      switch (cmd.action) {
        case 'open_feed':
          router.push('/feed');
          break;
        case 'open_map':
          router.push('/map');
          break;
        case 'open_dashboard':
          router.push('/dashboard');
          break;
        case 'go_back':
          router.back();
          break;
        default:
          if (cmd.spokenResponse) {
            speak(cmd.spokenResponse);
          }
      }
    },
    [router]
  );

  const handleCommand = useCallback(
    async (text: string) => {
      setStatus('processing');
      try {
        const res = await fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: text,
            currentRoute: window.location.pathname,
            selectedItemId: null,
            selectedItemSource: null,
          }),
        });
        const cmd: Command = await res.json();
        setLastCommand(cmd);

        if (cmd.intent === 'unknown') {
          speak(cmd.spokenResponse || "I didn't understand that. Try again.");
          setStatus('listening');
          return;
        }

        if (cmd.requiresConfirm) {
          setConfirmPending(cmd);
          speak(cmd.confirmPrompt || `Please confirm: ${cmd.action}`);
          setStatus('listening');
          return;
        }

        executeCommand(cmd);
        if (cmd.spokenResponse) speak(cmd.spokenResponse);
      } catch {
        speak('Sorry, something went wrong.');
      }
      setStatus('listening');
    },
    [executeCommand]
  );

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onend = () => {
      if (isListeningRef.current) {
        setStatus('restarting');
        setTimeout(() => {
          try {
            recognition.start();
            setStatus('listening');
          } catch {
            // ignore
          }
        }, 300);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        isListeningRef.current = false;
        setStatus('idle');
      } else if (event.error !== 'no-speech') {
        setTimeout(() => {
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch {
              // ignore
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = (event: any) => {
      const results = Array.from(event.results) as any[];
      const fullTranscript = results
        .map((r: any) => r[0].transcript)
        .join(' ')
        .toLowerCase();

      setTranscript(fullTranscript);

      if (mode === 'DORMANT') {
        if (
          fullTranscript.includes('hey safepulse') ||
          fullTranscript.includes('hey safe pulse')
        ) {
          setMode('ACTIVE');
          setTranscript('');
          // Play chime
          try {
            const audio = new Audio(
              'data:audio/wav;base64,UklGRl9vT19teleURhdGEAAAAAA=='
            );
            audio.play().catch(() => {});
          } catch {
            // ignore
          }
          recognition.stop();
        }
      } else if (mode === 'ACTIVE') {
        // Reset inactivity timer
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
          setMode('DORMANT');
          setTranscript('');
        }, 30000);

        if (
          fullTranscript.includes('bye safepulse') ||
          fullTranscript.includes('bye safe pulse')
        ) {
          setMode('DORMANT');
          setTranscript('');
          return;
        }

        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          handleCommand(lastResult[0].transcript);
        }
      }
    };

    recognitionRef.current = recognition;
    startRecognition();

    return () => {
      isListeningRef.current = false;
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Restart recognition when mode changes
  useEffect(() => {
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }, [mode]);

  if (!enabled) return null;

  return (
    <>
      {/* Dormant indicator */}
      {mode === 'DORMANT' && (
        <div className="fixed bottom-20 left-4 z-40 flex items-center gap-2">
          <div className="w-3 h-3 bg-[#6366f1] rounded-full listening-dot" />
          <span className="text-xs text-[#888]">Listening...</span>
        </div>
      )}

      {/* Active overlay */}
      <VoiceOverlay
        isActive={mode === 'ACTIVE'}
        transcript={transcript}
        status={status}
        lastCommand={lastCommand}
        confirmPending={confirmPending}
        onClose={() => setMode('DORMANT')}
        onConfirm={() => {
          if (confirmPending) {
            executeCommand(confirmPending);
            setConfirmPending(null);
          }
        }}
        onCancel={() => setConfirmPending(null)}
      />

      {/* Push-to-talk button */}
      <button
        onClick={() => {
          if (mode === 'DORMANT') {
            setMode('ACTIVE');
          } else {
            setMode('DORMANT');
          }
        }}
        className={`fixed bottom-20 left-4 z-40 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          mode === 'ACTIVE'
            ? 'bg-red-500 shadow-lg shadow-red-500/25'
            : 'bg-white/10 hover:bg-white/20'
        }`}
      >
        🎤
      </button>
    </>
  );
}
