import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';
import { callGeminiMarkdown, PROMPTS } from '@/lib/gemini';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const { searchParams } = new URL(req.url);
    const neighborhood = searchParams.get('neighborhood') || auth.neighborhood;

    const db = getDb();
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600000);

    // Fetch snapshots
    const reportsSnapshot = await db.collection('reports').where('neighborhood', '==', neighborhood).where('createdAt', '>', weekAgo).orderBy('feedScore', 'desc').limit(20).get();
    const voicesSnapshot = await db.collection('voices').where('neighborhood', '==', neighborhood).where('createdAt', '>', weekAgo).orderBy('feedScore', 'desc').limit(10).get();
    const patternsSnapshot = await db.collection('patterns').where('neighborhood', '==', neighborhood).where('detectedAt', '>', weekAgo).get();

    const reports = reportsSnapshot.docs.map(doc => doc.data());
    const topVoices = voicesSnapshot.docs.map(doc => doc.data());
    const patterns = patternsSnapshot.docs.map(doc => doc.data());

    // Universal "No Data" check - return 200 OK with EMPTY status
    const hasNoData = reports.length === 0 && (!topVoices || topVoices.length === 0) && (!patterns || patterns.length === 0);

    if (hasNoData) {
      return Response.json({
        status: "EMPTY",
        neighborhood: neighborhood
      }, { status: 200 });
    }

    const neighborhoodSnapshot = await db.collection('neighborhoods').where('slug', '==', neighborhood).limit(1).get();
    const neighborhoodDoc = neighborhoodSnapshot.empty ? null : neighborhoodSnapshot.docs[0].data();

    const now = new Date();
    const input = JSON.stringify({
      neighborhood: neighborhoodDoc?.name || neighborhood,
      reports: reports.map((r: any) => ({ category: r.category, subcategory: r.subcategory, severity: r.severity, description: r.description?.substring(0, 200), upvotes: r.upvotes, status: r.status })),
      topVoices: topVoices.map((v: any) => ({ type: v.type, caption: v.caption?.substring(0, 200), upvotes: v.upvotes, commentCount: v.commentCount })),
      patterns: patterns.map((p: any) => ({ type: p.type, description: p.description, severity: p.severity })),
      healthScore: neighborhoodDoc?.healthScore || { overall: 70 },
      period: `${weekAgo.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`,
    });

    // Wrap Gemini call to prevent 500s - fallback to EMPTY state on AI failure
    try {
      const markdown = await callGeminiMarkdown(`${PROMPTS.digest}\n\nINPUT:\n${input}`);
      return Response.json({ status: "SUCCESS", markdown, generatedAt: now.toISOString() });
    } catch (error) {
      console.error("[DIGEST] Gemini Error:", error);
      return Response.json({ status: "EMPTY", neighborhood }); // Fallback to empty state UI
    }
  } catch (error) {
    return handleApiError(error);
  }
}
