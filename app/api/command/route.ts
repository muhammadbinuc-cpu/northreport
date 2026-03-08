import { NextRequest } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/auth';
import { callGemini, PROMPTS } from '@/lib/gemini';
import { checkRateLimit, rateLimitError } from '@/lib/rateLimiter';

interface CommandResult {
  intent: string;
  action: string;
  targetId: string | null;
  payload: { text: string | null };
  requiresConfirm: boolean;
  confirmPrompt: string | null;
  spokenResponse: string | null;
}

function buildResult(action: string, spokenResponse: string): CommandResult {
  return {
    intent: 'action',
    action,
    targetId: null,
    payload: { text: null },
    requiresConfirm: false,
    confirmPrompt: null,
    spokenResponse,
  };
}

const COMMANDS: Record<string, { action: string; response: string }> = {
  file_report: { action: 'file_report', response: 'Filing a report. Opening camera now.' },
  take_photo: { action: 'take_photo', response: 'Opening camera.' },
  educate: { action: 'educate', response: 'Opening educate mode. Point at something.' },
  submit: { action: 'submit', response: 'Submitting your report.' },
};

function keywordFallback(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes('submit') || lower.includes('send it') || lower.includes('go ahead') || lower.includes('finalize') || lower.includes('confirm')) {
    return 'submit';
  }
  if (
    lower.includes('photo') || lower.includes('picture') ||
    lower.includes('image') || lower.includes('camera') ||
    lower.includes('snap') || lower.includes('capture') ||
    lower.includes('photograph')
  ) {
    return 'take_photo';
  }
  if (
    lower.includes('educate') || lower.includes('teach') ||
    lower.includes('learn') || lower.includes('explain') ||
    lower.includes('what is') || lower.includes("what's") ||
    lower.includes('tell me')
  ) {
    return 'educate';
  }
  // Default: file_report
  return 'file_report';
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!checkRateLimit(auth.userId, 'command')) return rateLimitError();

    const body = await req.json();
    const { transcript } = body;

    if (!transcript) {
      return Response.json({ error: 'Transcript required' }, { status: 400 });
    }

    console.log('[COMMAND] Input:', transcript);

    let command: string;

    try {
      const geminiResult = await callGemini<{ command: string }>(
        `${PROMPTS.voiceCommand}\n\nINPUT: "${transcript}"`
      );
      console.log('[COMMAND] Gemini classified:', geminiResult.command);
      command = geminiResult.command;

      if (!COMMANDS[command]) {
        console.warn('[COMMAND] Invalid Gemini response, falling back to keywords');
        command = keywordFallback(transcript);
      }
    } catch (err) {
      console.error('[COMMAND] Gemini error, using keyword fallback:', err);
      command = keywordFallback(transcript);
    }

    console.log('[COMMAND] Final command:', command);
    const meta = COMMANDS[command];
    return Response.json(buildResult(meta.action, meta.response));
  } catch (error) {
    console.error('[COMMAND] Error processing command:', error);
    return handleApiError(error instanceof Error ? error : new Error(String(error)));
  }
}
