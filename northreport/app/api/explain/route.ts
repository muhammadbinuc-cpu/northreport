import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';
import { callGemini, PROMPTS } from '@/lib/gemini';
import { checkRateLimit, rateLimitError } from '@/lib/rateLimiter';

interface ExplainResult {
  summaryBullets: string[];
  whyItMatters: string;
  riskLevel: string;
  evidence: string[];
  suggestedNextActions: string[];
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!checkRateLimit(auth.userId, 'explain')) return rateLimitError();

    const body = await req.json();
    const { mode, itemId, itemSource, question } = body;

    const db = getDb();

    let input: Record<string, unknown> = {};

    if (mode === 'item' && itemId) {
      const collection = itemSource === 'report' ? 'reports' : 'voices';
      const itemDoc = await db.collection(collection).doc(itemId).get();
      if (!itemDoc.exists) return Response.json({ error: 'Item not found' }, { status: 404 });
      const item = itemDoc.data()!;

      // Get comments if voice
      let topComments: any[] = [];
      if (itemSource === 'voice') {
        const commentsSnapshot = await db
          .collection('voice_comments')
          .where('voiceId', '==', itemId)
          .orderBy('createdAt', 'desc')
          .limit(10)
          .get();
        topComments = commentsSnapshot.docs.map(doc => doc.data());
      }

      // Get neighborhood stats
      const neighborhoodSnapshot = await db.collection('neighborhoods').where('slug', '==', item.neighborhood).limit(1).get();
      const neighborhood = neighborhoodSnapshot.empty ? null : neighborhoodSnapshot.docs[0].data();

      input = {
        item: {
          caption: item.caption || item.description,
          severity: item.severity,
          category: item.category || null,
          aiSummary: item.aiSummary,
          upvotes: item.upvotes || 0,
          commentCount: item.commentCount || 0,
        },
        topComments: topComments.map((c) => ({ 
          text: c.text, 
          createdAt: c.createdAt?.toDate?.() || c.createdAt 
        })),
        neighborhoodStats: neighborhood
          ? {
              reportCount7d: neighborhood.reportCount7d || 0,
              healthScore: neighborhood.healthScore || { overall: 70 },
              trendDirection: neighborhood.trendDirection || 'stable',
            }
          : { reportCount7d: 0, healthScore: { overall: 70 }, trendDirection: 'stable' },
        question: question || null,
      };
    } else if (mode === 'neighborhood') {
      const neighborhoodSnapshot = await db.collection('neighborhoods').where('slug', '==', auth.neighborhood).limit(1).get();
      const neighborhood = neighborhoodSnapshot.empty ? null : neighborhoodSnapshot.docs[0].data();
      
      const recentReportsSnapshot = await db
        .collection('reports')
        .where('neighborhood', '==', auth.neighborhood)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
      const recentReports = recentReportsSnapshot.docs.map(doc => doc.data());
      
      const recentVoicesSnapshot = await db
        .collection('voices')
        .where('neighborhood', '==', auth.neighborhood)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
      const recentVoices = recentVoicesSnapshot.docs.map(doc => doc.data());

      input = {
        item: {
          caption: `Neighborhood overview for ${neighborhood?.name || auth.neighborhood}`,
          severity: null,
          category: null,
          aiSummary: `${recentReports.length} recent reports, ${recentVoices.length} recent voices`,
          upvotes: 0,
          commentCount: 0,
        },
        topComments: [],
        neighborhoodStats: neighborhood
          ? {
              reportCount7d: neighborhood.reportCount7d || 0,
              healthScore: neighborhood.healthScore || { overall: 70 },
              trendDirection: neighborhood.trendDirection || 'stable',
            }
          : { reportCount7d: 0, healthScore: { overall: 70 }, trendDirection: 'stable' },
        question: question || 'What is the overall safety situation?',
      };
    }

    let result: ExplainResult;
    try {
      result = await callGemini<ExplainResult>(
        `${PROMPTS.explain}\n\nINPUT:\n${JSON.stringify(input)}`,
      );
    } catch {
      result = {
        summaryBullets: ['AI analysis temporarily unavailable'],
        whyItMatters: 'Please try again later.',
        riskLevel: 'medium',
        evidence: [],
        suggestedNextActions: ['Check back for updated analysis'],
      };
    }

    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
