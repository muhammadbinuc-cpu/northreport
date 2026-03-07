import { NextRequest } from 'next/server';
import { getDb, generateId } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';
import { callGemini, callGeminiWithImage, PROMPTS } from '@/lib/gemini';

interface ConversionResult {
  convert: boolean;
  reason: string;
  reportDraft: {
    category: string;
    subcategory: string;
    severity: string;
    aiSummary: string;
    suggestedAction: string;
  } | null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    const { id } = await params;
    const db = getDb();

    const voiceDoc = await db.collection('voices').doc(id).get();
    if (!voiceDoc.exists) {
      return Response.json({ error: 'Voice not found' }, { status: 404 });
    }
    
    const voice = voiceDoc.data()!;
    if (voice.linkedReportId) {
      return Response.json({ error: 'Already converted' }, { status: 400 });
    }

    const input = JSON.stringify({
      caption: voice.caption,
      mediaKind: voice.mediaKind || 'text',
      imageBase64: null,
    });

    let result: ConversionResult;
    try {
      if (voice.mediaUrl && voice.mediaKind === 'image') {
        result = await callGeminiWithImage<ConversionResult>(
          `${PROMPTS.voiceToReport}\n\nINPUT:\n${input}`,
          voice.mediaUrl,
        );
      } else {
        result = await callGemini<ConversionResult>(`${PROMPTS.voiceToReport}\n\nINPUT:\n${input}`);
      }
    } catch {
      return Response.json({ error: 'AI processing failed' }, { status: 500 });
    }

    if (!result.convert) {
      return Response.json({ converted: false, reason: result.reason });
    }

    const reportId = generateId('reports');
    const report = {
      userId: auth.userId,
      neighborhood: voice.neighborhood,
      location: voice.location,
      locationApprox: voice.locationApprox,
      category: result.reportDraft!.category,
      subcategory: result.reportDraft!.subcategory,
      severity: result.reportDraft!.severity,
      description: voice.caption,
      aiSummary: result.reportDraft!.aiSummary,
      imageUrl: voice.mediaUrl,
      imageAnalysis: null,
      status: 'new',
      upvotes: 0,
      feedScore: 0,
      corroborationCount: 0,
      linkedVoiceId: id,
      autoFiled311: false,
      confirmationNumber311: null,
      filedBy: null,
      flagCount: 0,
      hidden: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('reports').doc(reportId).set(report);
    await db.collection('voices').doc(id).update({
      linkedReportId: reportId,
      updatedAt: new Date(),
    });

    return Response.json({
      converted: true,
      reportId: reportId,
      reportDraft: result.reportDraft,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
