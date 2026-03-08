import { NextRequest } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/auth';
import { callGemini, PROMPTS } from '@/lib/gemini';
import { checkRateLimit, rateLimitError } from '@/lib/rateLimiter';

interface CameraCommandResult {
  action: string;
  spokenResponse: string;
}

// Keyword fallback — if the transcript clearly matches a keyword, skip Gemini
function keywordFallback(transcript: string, state: string): CameraCommandResult | null {
  const t = transcript.toLowerCase();

  if (state === 'streaming') {
    if (/\b(capture|snap|shoot|photo|picture|take)\b/.test(t))
      return { action: 'capture', spokenResponse: 'Photo captured.' };
    if (/\b(close|cancel|never mind|exit)\b/.test(t))
      return { action: 'close', spokenResponse: 'Closing camera.' };
  }

  if (state === 'captured') {
    // Check educate BEFORE report — "educate" is more specific
    if (/\b(educate|learn|what is|what's this|identify|explain|teach|tell me)\b/.test(t))
      return { action: 'educate', spokenResponse: 'Analyzing image.' };
    if (/\b(report|file|submit)\b/.test(t))
      return { action: 'report', spokenResponse: 'Opening report.' };
    if (/\b(retake|redo|again|new photo)\b/.test(t))
      return { action: 'retake', spokenResponse: 'Retaking photo.' };
    if (/\b(close|done|cancel|exit)\b/.test(t))
      return { action: 'close', spokenResponse: 'Closing camera.' };
  }

  if (state === 'educate') {
    if (/\b(report|file|submit)\b/.test(t))
      return { action: 'report', spokenResponse: 'Opening report.' };
    if (/\b(back|go back)\b/.test(t))
      return { action: 'back', spokenResponse: 'Going back.' };
    if (/\b(done|finish|thanks|close|exit)\b/.test(t))
      return { action: 'close', spokenResponse: 'Done.' };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!checkRateLimit(auth.userId, 'camera-command')) return rateLimitError();

    const { transcript, cameraState, activeFlow } = await req.json();

    if (!transcript) {
      return Response.json({ error: 'Transcript required' }, { status: 400 });
    }

    const state = activeFlow === 'educate' ? 'educate' : cameraState;

    // Try keyword match first — fast and reliable
    const fallback = keywordFallback(transcript, state);
    if (fallback) {
      console.log('[CAMERA-CMD] Keyword match:', fallback);
      return Response.json(fallback);
    }

    // Fall back to Gemini for ambiguous commands
    const input = JSON.stringify({ transcript, cameraState: state });

    let result: CameraCommandResult;
    try {
      result = await callGemini<CameraCommandResult>(
        `${PROMPTS.cameraCommand}\n\nINPUT:\n${input}`
      );
      console.log('[CAMERA-CMD] Gemini:', result);
    } catch (err) {
      console.error('[CAMERA-CMD] Gemini error:', err);
      result = { action: 'unknown', spokenResponse: "I didn't catch that. Try again." };
    }

    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
