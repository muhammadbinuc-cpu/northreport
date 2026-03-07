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

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!checkRateLimit(auth.userId, 'command')) return rateLimitError();

    const body = await req.json();
    const { transcript, currentRoute, selectedItemId, selectedItemSource } = body;

    if (!transcript) {
      return Response.json({ error: 'Transcript required' }, { status: 400 });
    }

    const input = JSON.stringify({
      transcript,
      currentRoute: currentRoute || '/feed',
      selectedItemId: selectedItemId || null,
      userRole: auth.role,
    });

    let result: CommandResult;
    try {
      result = await callGemini<CommandResult>(`${PROMPTS.voiceCommand}\n\nINPUT:\n${input}`);
    } catch {
      result = {
        intent: 'unknown',
        action: 'unknown',
        targetId: null,
        payload: { text: null },
        requiresConfirm: false,
        confirmPrompt: null,
        spokenResponse: "I didn't understand that. Could you try again?",
      };
    }

    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
