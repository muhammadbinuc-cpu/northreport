import { NextRequest } from 'next/server';
import { getDb, generateId } from '@/lib/firebase';
import { requireLeader, handleApiError } from '@/lib/auth';
import { callGemini, PROMPTS } from '@/lib/gemini';

interface PatternResult {
  patterns: Array<{
    type: string;
    description: string;
    severity: string;
    reportIds: string[];
    w0Count: number;
    w1Count: number;
    recommendation: string;
  }>;
  healthScoreUpdate: {
    overall: number;
    infrastructure: number;
    safety: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireLeader();
    const body = await req.json();
    const neighborhood = body.neighborhood || auth.neighborhood;

    const db = getDb();
    const now = new Date();
    const w1Start = new Date(now.getTime() - 14 * 24 * 3600000);

    const reportsSnapshot = await db
      .collection('reports')
      .where('neighborhood', '==', neighborhood)
      .where('createdAt', '>', w1Start)
      .where('hidden', '!=', true)
      .get();
    const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const voicesSnapshot = await db
      .collection('voices')
      .where('neighborhood', '==', neighborhood)
      .where('createdAt', '>', w1Start)
      .where('hidden', '!=', true)
      .get();
    const voices = voicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const neighborhoodSnapshot = await db.collection('neighborhoods').where('slug', '==', neighborhood).limit(1).get();
    const healthScore = neighborhoodSnapshot.empty ? null : neighborhoodSnapshot.docs[0].data();

    const input = JSON.stringify({
      reports: reports.map((r: any) => ({
        id: r.id,
        category: r.category,
        subcategory: r.subcategory,
        severity: r.severity,
        description: r.description?.substring(0, 200),
        cellId: r.locationApprox?.cellId,
        userId: r.userId,
        createdAt: r.createdAt?.toDate?.() || r.createdAt,
      })),
      voices: voices.map((v: any) => ({
        id: v.id,
        type: v.type,
        caption: v.caption?.substring(0, 200),
        severity: v.severity,
        cellId: v.locationApprox?.cellId,
        userId: v.userId,
        createdAt: v.createdAt?.toDate?.() || v.createdAt,
      })),
      neighborhood,
      currentHealthScore: healthScore?.healthScore || { overall: 70, infrastructure: 65, safety: 78 },
    });

    let result: PatternResult;
    try {
      result = await callGemini<PatternResult>(`${PROMPTS.patternDetection}\n\nINPUT:\n${input}`);
    } catch {
      result = { patterns: [], healthScoreUpdate: { overall: 70, infrastructure: 65, safety: 78 } };
    }

    // Persist patterns
    for (const pattern of result.patterns) {
      const patternId = generateId('patterns');
      await db.collection('patterns').doc(patternId).set({
        neighborhood,
        type: pattern.type,
        description: pattern.description,
        relatedReportIds: pattern.reportIds,
        relatedVoiceIds: [],
        severity: pattern.severity,
        w0Count: pattern.w0Count,
        w1Count: pattern.w1Count,
        detectedAt: new Date(),
        acknowledged: false,
      });
    }

    // Update neighborhood health score
    if (result.healthScoreUpdate && !neighborhoodSnapshot.empty) {
      await neighborhoodSnapshot.docs[0].ref.update({
        healthScore: result.healthScoreUpdate,
        lastUpdated: new Date(),
      });
    }

    return Response.json({ patterns: result.patterns });
  } catch (error) {
    return handleApiError(error);
  }
}
