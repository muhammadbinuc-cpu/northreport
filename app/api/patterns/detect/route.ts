import { NextRequest } from 'next/server';
import { getDb, generateId } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';
import { callGemini, PROMPTS } from '@/lib/gemini';
import { mergePatterns } from '@/lib/mergePatterns';

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
    const auth = await requireAuth();
    const body = await req.json();
    const neighborhood = body.neighborhood || auth.neighborhood;
    const windowDays = Math.min(body.windowDays || 14, 30); // Cap at 30 days
    const limit = Math.min(body.limit || 50, 100); // Cap at 100 for cost protection

    const db = getDb();
    const now = new Date();
    const w1Start = new Date(now.getTime() - windowDays * 24 * 3600000);

    // Fetch reports with limit for cost protection
    const reportsSnapshot = await db
      .collection('reports')
      .where('neighborhood', '==', neighborhood)
      .where('createdAt', '>', w1Start)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch voices with limit
    const voicesSnapshot = await db
      .collection('voices')
      .where('neighborhood', '==', neighborhood)
      .where('createdAt', '>', w1Start)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    const voices = voicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const neighborhoodSnapshot = await db.collection('neighborhoods').where('slug', '==', neighborhood).limit(1).get();
    const healthScore = neighborhoodSnapshot.empty ? null : neighborhoodSnapshot.docs[0].data();

    const analyzedCount = reports.length + voices.length;

    // If no data to analyze, return empty (not an error)
    if (analyzedCount === 0) {
      return Response.json({
        status: 'OK',
        neighborhood,
        windowDays,
        analyzedCount: 0,
        patterns: [],
        lastRun: now.toISOString(),
      });
    }

    // Prepare input with PII protection (truncate descriptions)
    const input = JSON.stringify({
      reports: reports.map((r: any) => ({
        id: r.id,
        category: r.category,
        subcategory: r.subcategory,
        severity: r.severity,
        description: r.description?.substring(0, 300)?.replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]')?.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]'),
        cellId: r.locationApprox?.cellId,
        userId: r.userId,
        createdAt: r.createdAt?.toDate?.() || r.createdAt,
      })),
      voices: voices.map((v: any) => ({
        id: v.id,
        type: v.type,
        caption: v.caption?.substring(0, 300)?.replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]')?.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]'),
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
    } catch (error) {
      console.error('[PATTERNS] Gemini Error:', error);
      // Return empty patterns on Gemini failure (not a crash)
      return Response.json({
        status: 'OK',
        neighborhood,
        windowDays,
        analyzedCount,
        patterns: [],
        lastRun: now.toISOString(),
        message: 'AI analysis temporarily unavailable',
      });
    }

    // Validate result structure
    if (!result || !Array.isArray(result.patterns)) {
      return Response.json({
        status: 'OK',
        neighborhood,
        windowDays,
        analyzedCount,
        patterns: [],
        lastRun: now.toISOString(),
      });
    }

    // Persist patterns to Firestore
    const persistedPatterns = [];
    for (const pattern of result.patterns.slice(0, 5)) { // Max 5 patterns
      const patternId = generateId('patterns');
      const patternDoc = {
        neighborhood,
        type: pattern.type,
        description: pattern.description,
        relatedReportIds: pattern.reportIds || [],
        relatedVoiceIds: [],
        severity: pattern.severity,
        w0Count: pattern.w0Count || 0,
        w1Count: pattern.w1Count || 0,
        recommendation: pattern.recommendation,
        detectedAt: new Date(),
        acknowledged: false,
      };
      await db.collection('patterns').doc(patternId).set(patternDoc);
      persistedPatterns.push({ _id: patternId, ...patternDoc });
    }

    // Update neighborhood health score
    if (result.healthScoreUpdate && !neighborhoodSnapshot.empty) {
      await neighborhoodSnapshot.docs[0].ref.update({
        healthScore: result.healthScoreUpdate,
        lastUpdated: new Date(),
      });
    }

    // Dedupe before returning
    const uniquePatterns = mergePatterns(persistedPatterns as any);

    return Response.json({
      status: 'OK',
      neighborhood,
      windowDays,
      analyzedCount,
      patterns: uniquePatterns,
      lastRun: now.toISOString(),
    });
  } catch (error) {
    console.error('[PATTERNS] Error:', error);
    return handleApiError(error);
  }
}
