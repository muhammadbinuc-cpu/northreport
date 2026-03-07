import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebase';
import { requireLeader, handleApiError } from '@/lib/auth';
import { callGeminiMarkdown, PROMPTS } from '@/lib/gemini';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireLeader();
    const { searchParams } = new URL(req.url);
    const neighborhood = searchParams.get('neighborhood') || auth.neighborhood;

    const db = getDb();
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600000);

    const reportsSnapshot = await db
      .collection('reports')
      .where('neighborhood', '==', neighborhood)
      .where('createdAt', '>', weekAgo)
      .orderBy('feedScore', 'desc')
      .limit(20)
      .get();
    const reports = reportsSnapshot.docs.map(doc => doc.data());

    const voicesSnapshot = await db
      .collection('voices')
      .where('neighborhood', '==', neighborhood)
      .where('createdAt', '>', weekAgo)
      .orderBy('feedScore', 'desc')
      .limit(10)
      .get();
    const topVoices = voicesSnapshot.docs.map(doc => doc.data());

    const patternsSnapshot = await db
      .collection('patterns')
      .where('neighborhood', '==', neighborhood)
      .where('detectedAt', '>', weekAgo)
      .get();
    const patterns = patternsSnapshot.docs.map(doc => doc.data());

    const neighborhoodSnapshot = await db.collection('neighborhoods').where('slug', '==', neighborhood).limit(1).get();
    const neighborhoodDoc = neighborhoodSnapshot.empty ? null : neighborhoodSnapshot.docs[0].data();

    const now = new Date();
    const input = JSON.stringify({
      neighborhood: neighborhoodDoc?.name || neighborhood,
      reports: reports.map((r: any) => ({
        category: r.category,
        subcategory: r.subcategory,
        severity: r.severity,
        description: r.description?.substring(0, 200),
        upvotes: r.upvotes,
        status: r.status,
      })),
      topVoices: topVoices.map((v: any) => ({
        type: v.type,
        caption: v.caption?.substring(0, 200),
        upvotes: v.upvotes,
        commentCount: v.commentCount,
      })),
      patterns: patterns.map((p: any) => ({
        type: p.type,
        description: p.description,
        severity: p.severity,
      })),
      healthScore: neighborhoodDoc?.healthScore || { overall: 70 },
      period: `${weekAgo.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`,
    });

    let markdown: string;
    try {
      markdown = await callGeminiMarkdown(`${PROMPTS.digest}\n\nINPUT:\n${input}`);
    } catch {
      markdown = `# Weekly Digest for ${neighborhood}\n\nDigest generation temporarily unavailable. Please try again.`;
    }

    return Response.json({ markdown, generatedAt: now.toISOString() });
  } catch (error) {
    return handleApiError(error);
  }
}
