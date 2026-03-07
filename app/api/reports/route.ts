import { NextRequest } from 'next/server';
import { getDb, generateId, FieldValue } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';
import { callGemini, callGeminiWithImage, PROMPTS } from '@/lib/gemini';
import { encodeGeohash, getApproxLabel } from '@/lib/geohash';
import { checkRateLimit, rateLimitError } from '@/lib/rateLimiter';
import { computeFeedScore } from '@/lib/feedScore';

interface ReportClassification {
  category: string;
  subcategory: string;
  severity: string;
  aiSummary: string;
  imageFindings: string | null;
  immediateRisk: boolean;
  suggestedAction: string;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!checkRateLimit(auth.userId, 'reports:create')) return rateLimitError();

    const body = await req.json();
    const { description, latitude, longitude, imageBase64, category, neighborhood } = body;

    if (!description || description.length < 1) {
      return Response.json({ error: 'Description required' }, { status: 400 });
    }
    if (!latitude || !longitude) {
      return Response.json({ error: 'Location required' }, { status: 400 });
    }

    const cellId = encodeGeohash(latitude, longitude);
    const label = getApproxLabel(cellId);

    // AI classification
    let aiResult: ReportClassification;
    try {
      const input = JSON.stringify({ text: description, imageBase64: imageBase64 ? 'present' : null });
      if (imageBase64) {
        aiResult = await callGeminiWithImage<ReportClassification>(
          `${PROMPTS.reportClassification}\n\nINPUT:\n${input}`,
          imageBase64,
        );
      } else {
        aiResult = await callGemini<ReportClassification>(
          `${PROMPTS.reportClassification}\n\nINPUT:\n${input}`,
        );
      }
    } catch {
      aiResult = {
        category: category || 'infrastructure',
        subcategory: 'general',
        severity: 'medium',
        aiSummary: description.substring(0, 100),
        imageFindings: null,
        immediateRisk: false,
        suggestedAction: 'Monitor and assess',
      };
    }

    let imageUrl: string | null = null;
    if (imageBase64) {
      const sizeBytes = (imageBase64.length * 3) / 4;
      if (sizeBytes <= 1_048_576) {
        imageUrl = imageBase64;
      }
    }

    const now = new Date();
    const reportId = generateId('reports');
    const report = {
      userId: auth.userId,
      neighborhood: neighborhood || auth.neighborhood,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      locationApprox: { cellId, label },
      category: aiResult.category,
      subcategory: aiResult.subcategory,
      severity: aiResult.severity,
      description,
      aiSummary: aiResult.aiSummary,
      imageUrl,
      imageAnalysis: aiResult.imageFindings,
      status: 'new',
      upvotes: 0,
      feedScore: 0,
      corroborationCount: 0,
      linkedVoiceId: null,
      autoFiled311: false,
      confirmationNumber311: null,
      filedBy: null,
      flagCount: 0,
      hidden: false,
      createdAt: now,
      updatedAt: now,
    };

    report.feedScore = computeFeedScore(report);

    const db = getDb();
    await db.collection('reports').doc(reportId).set(report);

    return Response.json(
      {
        id: reportId,
        category: report.category,
        subcategory: report.subcategory,
        severity: report.severity,
        aiSummary: report.aiSummary,
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
    const snapshot = await db
      .collection('reports')
      .where('neighborhood', '==', neighborhood)
      .where('hidden', '!=', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const reports = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
    }));

    return Response.json({ reports });
  } catch (error) {
    return handleApiError(error);
  }
}
