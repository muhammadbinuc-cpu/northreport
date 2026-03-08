import { NextRequest } from 'next/server';
import { getDb, generateId, FieldValue } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';
import { computeFeedScore } from '@/lib/feedScore';
import { checkRateLimit, rateLimitError } from '@/lib/rateLimiter';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!checkRateLimit(auth.userId, 'votes')) return rateLimitError();

    const { id } = await params;
    const db = getDb();
    const voteId = `${id}_${auth.userId}`;

    // Check if already voted
    const existingVote = await db.collection('voice_votes').doc(voteId).get();
    if (existingVote.exists) {
      return Response.json({ error: 'Already voted' }, { status: 409 });
    }

    // Create vote
    await db.collection('voice_votes').doc(voteId).set({
      voiceId: id,
      userId: auth.userId,
      value: 1,
      createdAt: new Date(),
    });

    // Get current voice and update
    const voiceRef = db.collection('voices').doc(id);
    const voiceDoc = await voiceRef.get();
    
    if (!voiceDoc.exists) {
      return Response.json({ error: 'Voice not found' }, { status: 404 });
    }

    const voiceData = voiceDoc.data()!;
    const newUpvotes = (voiceData.upvotes || 0) + 1;
    
    await voiceRef.update({
      upvotes: FieldValue.increment(1),
      updatedAt: new Date(),
    });

    // Recompute feedScore
    const updatedVoice = { ...voiceData, upvotes: newUpvotes };
    const newScore = computeFeedScore(updatedVoice as any);
    await voiceRef.update({ feedScore: newScore });

    return Response.json({ upvotes: newUpvotes });
  } catch (error) {
    return handleApiError(error);
  }
}
