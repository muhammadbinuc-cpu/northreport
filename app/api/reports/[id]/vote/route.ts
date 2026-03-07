import { NextRequest } from 'next/server';
import { getDb, FieldValue } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';
import { computeFeedScore } from '@/lib/feedScore';
import { checkRateLimit, rateLimitError } from '@/lib/rateLimiter';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!checkRateLimit(auth.userId, 'votes')) return rateLimitError();

    const { id } = await params;
    const db = getDb();

    const reportRef = db.collection('reports').doc(id);
    const reportDoc = await reportRef.get();
    
    if (!reportDoc.exists) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    const reportData = reportDoc.data()!;
    const newUpvotes = (reportData.upvotes || 0) + 1;

    await reportRef.update({
      upvotes: FieldValue.increment(1),
      updatedAt: new Date(),
    });

    const updatedReport = { ...reportData, upvotes: newUpvotes };
    const newScore = computeFeedScore(updatedReport as any);
    await reportRef.update({ feedScore: newScore });

    return Response.json({ upvotes: newUpvotes });
  } catch (error) {
    return handleApiError(error);
  }
}
