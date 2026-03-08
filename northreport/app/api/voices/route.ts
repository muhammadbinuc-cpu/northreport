import { NextRequest } from 'next/server';
import { getDb, generateId, FieldValue } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';
import { callGemini, callGeminiWithImage, PROMPTS } from '@/lib/gemini';
import { encodeGeohash, getApproxLabel } from '@/lib/geohash';
import { checkRateLimit, rateLimitError } from '@/lib/rateLimiter';
import { computeFeedScore } from '@/lib/feedScore';

interface VoiceClassification {
  aiSummary: string;
  severity: string | null;
  isHazard: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!checkRateLimit(auth.userId, 'voices:create')) return rateLimitError();

    const body = await req.json();
    const { type, caption, mediaBase64, latitude, longitude } = body;

    if (!type || !['story', 'post'].includes(type)) {
      return Response.json({ error: 'Invalid type' }, { status: 400 });
    }
    if (!caption || caption.length < 1 || caption.length > 500) {
      return Response.json({ error: 'Caption must be 1-500 chars' }, { status: 400 });
    }
    if (!latitude || !longitude) {
      return Response.json({ error: 'Location required' }, { status: 400 });
    }

    // Validate media size
    let mediaUrl: string | null = null;
    let mediaKind: 'image' | 'text' = 'text';
    if (mediaBase64) {
      const sizeBytes = (mediaBase64.length * 3) / 4;
      if (sizeBytes > 1_048_576) {
        return Response.json({ error: 'Image must be under 1MB' }, { status: 400 });
      }
      mediaUrl = mediaBase64;
      mediaKind = 'image';
    }

    const cellId = encodeGeohash(latitude, longitude);
    const label = getApproxLabel(cellId);

    // AI classification
    let aiResult: VoiceClassification = { aiSummary: '', severity: null, isHazard: false };
    try {
      const prompt = `Analyze this community voice post:\nText: "${caption}"`;
      if (mediaBase64) {
        aiResult = await callGeminiWithImage<VoiceClassification>(prompt, mediaBase64, PROMPTS.voiceClassification);
      } else {
        aiResult = await callGemini<VoiceClassification>(
          `${PROMPTS.voiceClassification}\n\nINPUT:\n${prompt}`,
        );
      }
    } catch {
      aiResult = { aiSummary: caption.substring(0, 100), severity: null, isHazard: false };
    }

    const now = new Date();
    const voiceId = generateId('voices');
    const voice = {
      userId: auth.userId,
      neighborhood: auth.neighborhood,
      type,
      caption,
      mediaUrl,
      mediaKind,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      locationApprox: { cellId, label },
      aiSummary: aiResult.aiSummary || null,
      severity: aiResult.severity || null,
      upvotes: 0,
      commentCount: 0,
      repostCount: 0,
      feedScore: 0,
      linkedReportId: null,
      flagCount: 0,
      flaggedBy: [],
      hidden: false,
      expiresAt: type === 'story' ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : null,
      createdAt: now,
      updatedAt: now,
    };

    voice.feedScore = computeFeedScore(voice);

    const db = getDb();
    await db.collection('voices').doc(voiceId).set(voice);

    return Response.json(
      {
        id: voiceId,
        aiSummary: voice.aiSummary,
        severity: voice.severity,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const { searchParams } = new URL(req.url);
    const neighborhood = searchParams.get('neighborhood') || auth.neighborhood;
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const db = getDb();
    let query = db
      .collection('voices')
      .where('neighborhood', '==', neighborhood)
      .where('hidden', '!=', true);
    
    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const voices = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
    }));

    return Response.json({ voices });
  } catch (error) {
    return handleApiError(error);
  }
}
