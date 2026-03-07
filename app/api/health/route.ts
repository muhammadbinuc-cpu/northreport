import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const { searchParams } = new URL(req.url);
    const neighborhood = searchParams.get('neighborhood') || auth.neighborhood;

    const db = getDb();
    const snapshot = await db.collection('neighborhoods').where('slug', '==', neighborhood).limit(1).get();

    if (snapshot.empty) {
      return Response.json({
        overall: 70,
        infrastructure: 65,
        safety: 78,
        reportCount7d: 0,
        voiceCount7d: 0,
        trendDirection: 'stable',
      });
    }

    const doc = snapshot.docs[0].data();
    return Response.json({
      overall: doc.healthScore?.overall || 70,
      infrastructure: doc.healthScore?.infrastructure || 65,
      safety: doc.healthScore?.safety || 78,
      reportCount7d: doc.reportCount7d || 0,
      voiceCount7d: doc.voiceCount7d || 0,
      trendDirection: doc.trendDirection || 'stable',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
