import { NextRequest } from 'next/server';
import { getDb, generateId } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';
import { callGemini, callGeminiWithImage, PROMPTS } from '@/lib/gemini';
import { encodeGeohash, getApproxLabel } from '@/lib/geohash';
import { checkRateLimit, rateLimitError } from '@/lib/rateLimiter';
import { computeFeedScore } from '@/lib/feedScore';

interface ContentClassification {
  aiSummary: string;
  severity: string | null;
  isHazard: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!checkRateLimit(auth.userId, 'stories:create')) return rateLimitError();

    const body = await req.json();
    const { caption, mediaBase64, latitude, longitude } = body;

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
    let aiResult: ContentClassification = { aiSummary: '', severity: null, isHazard: false };
    try {
      const prompt = `Analyze this community story:\nText: "${caption}"`;
      if (mediaBase64) {
        aiResult = await callGeminiWithImage<ContentClassification>(prompt, mediaBase64, PROMPTS.voiceClassification);
      } else {
        aiResult = await callGemini<ContentClassification>(
          `${PROMPTS.voiceClassification}\n\nINPUT:\n${prompt}`,
        );
      }
    } catch {
      aiResult = { aiSummary: caption.substring(0, 100), severity: null, isHazard: false };
    }

    const now = new Date();
    const storyId = generateId('stories');
    const story = {
      userId: auth.userId,
      neighborhood: auth.neighborhood,
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
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24h from now
      createdAt: now,
      updatedAt: now,
    };

    story.feedScore = computeFeedScore(story);

    const db = getDb();
    await db.collection('stories').doc(storyId).set(story);

    return Response.json(
      {
        id: storyId,
        aiSummary: story.aiSummary,
        severity: story.severity,
        expiresAt: story.expiresAt.toISOString(),
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const db = getDb();
    const now = new Date();
    
    const snapshot = await db
      .collection('stories')
      .where('neighborhood', '==', neighborhood)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    // Filter out expired stories
    const stories = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((story: any) => {
        if (story.expiresAt) {
          const expiresAt = story.expiresAt.toDate ? story.expiresAt.toDate() : new Date(story.expiresAt);
          return expiresAt > now;
        }
        return true;
      });

    return Response.json({ stories });
  } catch (error) {
    return handleApiError(error);
  }
}
