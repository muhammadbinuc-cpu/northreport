'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface VoiceControlContextType {
  paused: boolean;
  pauseVoice: () => void;
  resumeVoice: () => void;
}

const VoiceControlContext = createContext<VoiceControlContextType>({
  paused: false,
  pauseVoice: () => {},
  resumeVoice: () => {},
});

export const useVoiceControl = () => useContext(VoiceControlContext);

export function VoiceControlProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);

  const pauseVoice = useCallback(() => setPaused(true), []);
  const resumeVoice = useCallback(() => setPaused(false), []);

  return (
    <VoiceControlContext.Provider value={{ paused, pauseVoice, resumeVoice }}>
      {children}
    </VoiceControlContext.Provider>
  );
}
