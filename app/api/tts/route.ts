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
      console.log('[TTS] Missing API Key');
      return Response.json({ error: 'TTS not configured', fallback: true }, { status: 503 });
    }

    const t0 = Date.now();
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
    const elapsed = Date.now() - t0;

    console.log(`[TTS] Upstream status: ${response.status} ${response.statusText}`);
    console.log(`[TTS] Upstream headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorDetail: string;
      try {
        errorDetail = await response.text();
      } catch {
        errorDetail = '(could not read error body)';
      }
      console.error(`[TTS] ElevenLabs ${response.status} after ${elapsed}ms:`, errorDetail);
      return Response.json(
        { error: 'TTS failed', status: response.status, detail: errorDetail, fallback: true },
        { status: 503 },
      );
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`[TTS] ElevenLabs OK in ${elapsed}ms. Size: ${audioBuffer.byteLength} bytes`);

    if (audioBuffer.byteLength < 100) {
       console.warn('[TTS] Warning: Audio buffer is suspiciously small, might be an error.');
    }

    return new Response(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error) {
    console.error('[TTS] Handler Error:', error);
    return handleApiError(error);
  }
}
