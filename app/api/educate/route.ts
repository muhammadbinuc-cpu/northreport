import { NextRequest } from 'next/server';
import { callGeminiWithImage, PROMPTS } from '@/lib/gemini';
import { requireAuth, handleApiError, ApiError } from '@/lib/auth';
import { checkRateLimit, rateLimitError } from '@/lib/rateLimiter';

export interface EducateResponse {
  identified_subject: string;
  description: string;
  community_impact: string;
  why_it_matters: string;
  related_topics: string[];
  severity_context: string | null;
  actionable_tips: string[];
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();

    if (!checkRateLimit(auth.userId, 'educate')) {
      return rateLimitError();
    }

    let body: { image?: string };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { image } = body;

    if (!image) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }

    if (typeof image !== 'string') {
      return Response.json({ error: 'Image must be a base64 string' }, { status: 400 });
    }

    const analysis = await callGeminiWithImage<EducateResponse>(
      PROMPTS.educate,
      image,
    );

    return Response.json(analysis);
  } catch (error) {
    console.error('[API] /api/educate error:', error);

    if (error instanceof ApiError) {
      return handleApiError(error);
    }

    if (error instanceof Error) {
      return handleApiError(error);
    }

    return handleApiError(new Error(String(error)));
  }
}
