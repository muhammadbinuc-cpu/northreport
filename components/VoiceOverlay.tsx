'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ConfirmChip from './ConfirmChip';

interface Command {
  intent: string;
  action: string;
  targetId: string | null;
  payload: { text: string | null };
  requiresConfirm: boolean;
  confirmPrompt: string | null;
  spokenResponse: string | null;
}

interface VoiceOverlayProps {
  isActive: boolean;
  transcript: string;
  status: string;
  lastCommand: Command | null;
  confirmPending: Command | null;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function VoiceOverlay({
  isActive,
  transcript,
  status,
  lastCommand,
  confirmPending,
  onClose,
  onConfirm,
  onCancel,
}: VoiceOverlayProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-x-0 bottom-0 z-50 p-4"
        >
          <div className="glass-card p-6 space-y-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full listening-dot" />
                <span className="text-sm font-medium">Voice Mode Active</span>
              </div>
              <button
                onClick={onClose}
                className="text-[#888] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Status */}
            <div className="text-xs text-[#888]">
              {status === 'listening' && 'Listening...'}
              {status === 'processing' && 'Processing command...'}
              {status === 'restarting' && 'Restarting...'}
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-[#ccc] italic">&quot;{transcript}&quot;</p>
              </div>
            )}

            {/* Last command */}
            {lastCommand && !confirmPending && (
              <div className="bg-[#6366f1]/10 rounded-lg p-3">
                <p className="text-xs text-[#888]">
                  {lastCommand.intent === 'unknown' ? 'Not understood' : `${lastCommand.intent}`}
                </p>
                <p className="text-sm text-[#6366f1]">
                  {lastCommand.action !== 'unknown'
                    ? `→ ${lastCommand.action.replace(/_/g, ' ')}`
                    : lastCommand.spokenResponse}
                </p>
              </div>
            )}

            {/* Confirm pending */}
            {confirmPending && (
              <ConfirmChip
                prompt={confirmPending.confirmPrompt || `Confirm: ${confirmPending.action}`}
                onConfirm={onConfirm}
                onCancel={onCancel}
              />
            )}

            <p className="text-xs text-[#888] text-center">
              Say &quot;Bye SafePulse&quot; to exit voice mode
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
