import { NextRequest } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/auth';
import { checkRateLimit, rateLimitError } from '@/lib/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!checkRateLimit(auth.userId, 'tts')) return rateLimitError();

    const { text } = await req.json();
    if (!text || text.length > 500) {
      return Response.json({ error: 'Invalid text' }, { status: 400 });
    }

    const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
    const API_KEY = process.env.ELEVENLABS_API_KEY;

    if (!API_KEY) {
      return Response.json({ error: 'TTS not configured', fallback: true }, { status: 503 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.8 },
        }),
      }
    );

    if (!response.ok) {
      return Response.json({ error: 'TTS failed', fallback: true }, { status: 503 });
    }

    return new Response(response.body, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
