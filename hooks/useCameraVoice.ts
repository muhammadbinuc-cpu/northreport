'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { containsWakeWord, stripWakeWords } from '@/lib/voicePatterns';
import { speak } from '@/lib/tts';

type CameraState = 'requesting' | 'streaming' | 'denied' | 'captured';
type VoiceState = 'idle' | 'listening' | 'executing';

interface UseCameraVoiceOptions {
  enabled: boolean;
  context: {
    cameraState: CameraState;
    activeFlow: 'educate' | null;
  };
  callbacks: {
    handleCapture: () => void;
    handleRetake: () => void;
    handleClose: () => void;
    handleEducate: () => void;
    navigateToReport: () => void;
    onBackFromEducate: () => void;
  };
}

// Map Gemini's action string → callback + fallback TTS
function executeAction(
  action: string,
  callbacks: UseCameraVoiceOptions['callbacks'],
): (() => void) | null {
  switch (action) {
    case 'capture': return callbacks.handleCapture;
    case 'report': return callbacks.navigateToReport;
    case 'educate': return callbacks.handleEducate;
    case 'retake': return callbacks.handleRetake;
    case 'close': return callbacks.handleClose;
    case 'back': return callbacks.onBackFromEducate;
    default: return null;
  }
}

export function useCameraVoice({ enabled, context, callbacks }: UseCameraVoiceOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const modeRef = useRef<'DORMANT' | 'ACTIVE'>('DORMANT');
  const commandBufferRef = useRef('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeakingRef = useRef(false);
  const contextRef = useRef(context);
  const callbacksRef = useRef(callbacks);

  // Keep refs current
  useEffect(() => { contextRef.current = context; }, [context]);
  useEffect(() => { callbacksRef.current = callbacks; }, [callbacks]);

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
  }, []);

  const speakBrief = useCallback(async (text: string) => {
    isSpeakingRef.current = true;
    commandBufferRef.current = '';
    setTranscript('');
    try {
      await speak(text);
    } finally {
      setTimeout(() => {
        isSpeakingRef.current = false;
        commandBufferRef.current = '';
      }, 2000);
    }
  }, []);

  const goIdle = useCallback(() => {
    modeRef.current = 'DORMANT';
    setVoiceState('idle');
    setTranscript('');
    commandBufferRef.current = '';
    clearTimers();
  }, [clearTimers]);

  const processCommand = useCallback(async (text: string) => {
    const cleaned = stripWakeWords(text);
    if (!cleaned || cleaned.length < 2) { goIdle(); return; }

    setVoiceState('executing');
    setTranscript(cleaned);

    try {
      const res = await fetch('/api/camera-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: cleaned,
          cameraState: contextRef.current.cameraState,
          activeFlow: contextRef.current.activeFlow,
        }),
      });

      if (!res.ok) throw new Error('Camera command failed');

      const result: { action: string; spokenResponse: string } = await res.json();
      console.log('[CAMERA-VOICE] Gemini result:', result);

      const callback = executeAction(result.action, callbacksRef.current);
      if (callback) {
        callback();
        await speakBrief(result.spokenResponse || 'Done.');
      } else {
        await speakBrief(result.spokenResponse || "I didn't understand that. Try again.");
      }
    } catch (err) {
      console.error('[CAMERA-VOICE] Error:', err);
      await speakBrief("Sorry, something went wrong. Try again.");
    }

    goIdle();
  }, [goIdle, speakBrief]);

  // Main speech recognition lifecycle
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let recognition: any = null;
    let cleanup = false;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        if (cleanup) { stream.getTracks().forEach(t => t.stop()); return; }
        stream.getTracks().forEach(t => t.stop());

        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;

        recognition.onend = () => {
          if (isListeningRef.current && !cleanup) {
            setTimeout(() => {
              try { recognition?.start(); } catch { /* ignore */ }
            }, 300);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            isListeningRef.current = false;
            setVoiceState('idle');
          } else if (event.error !== 'no-speech' && !cleanup) {
            setTimeout(() => {
              if (isListeningRef.current) {
                try { recognition?.start(); } catch { /* ignore */ }
              }
            }, 1000);
          }
        };

        recognition.onresult = (event: any) => {
          const results = Array.from(event.results) as any[];
          const fullTranscript = results.map((r: any) => r[0].transcript).join(' ').toLowerCase().trim();

          if (isSpeakingRef.current) return;

          // DORMANT: listen for wake word
          if (modeRef.current === 'DORMANT') {
            setTranscript(fullTranscript);
            if (containsWakeWord(fullTranscript)) {
              const afterWake = stripWakeWords(fullTranscript);

              modeRef.current = 'ACTIVE';
              setVoiceState('listening');
              commandBufferRef.current = '';
              setTranscript('');

              if (afterWake && afterWake.length > 2) {
                commandBufferRef.current = afterWake;
              }

              if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
              inactivityTimerRef.current = setTimeout(() => {
                if (commandBufferRef.current) {
                  processCommand(commandBufferRef.current);
                } else {
                  goIdle();
                }
              }, 4000);
            }
          }
          // ACTIVE: accumulate command
          else if (modeRef.current === 'ACTIVE') {
            const currentCommand = stripWakeWords(fullTranscript);
            if (currentCommand && currentCommand !== commandBufferRef.current) {
              commandBufferRef.current = currentCommand;
              setTranscript(currentCommand);

              if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
              inactivityTimerRef.current = setTimeout(() => {
                if (commandBufferRef.current) processCommand(commandBufferRef.current);
                else goIdle();
              }, 4000);

              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = setTimeout(() => {
                if (commandBufferRef.current) processCommand(commandBufferRef.current);
              }, 2000);
            }
          }
        };

        try {
          recognition.start();
          isListeningRef.current = true;
        } catch { /* ignore */ }
      })
      .catch(() => { /* mic permission denied */ });

    return () => {
      cleanup = true;
      isListeningRef.current = false;
      try { recognition?.abort(); } catch { /* ignore */ }
      try { recognition?.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
      modeRef.current = 'DORMANT';
      clearTimers();
    };
  }, [enabled, processCommand, goIdle, clearTimers]);

  return { voiceState, transcript };
}
