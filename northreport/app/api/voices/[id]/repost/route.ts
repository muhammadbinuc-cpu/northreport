import { NextRequest } from 'next/server';
import { getDb, FieldValue } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';
import { computeFeedScore } from '@/lib/feedScore';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    const { id } = await params;
    const db = getDb();
    const repostId = `${id}_${auth.userId}`;

    // Check if already reposted
    const existingRepost = await db.collection('voice_reposts').doc(repostId).get();
    if (existingRepost.exists) {
      return Response.json({ error: 'Already reposted' }, { status: 409 });
    }

    // Create repost
    await db.collection('voice_reposts').doc(repostId).set({
      voiceId: id,
      userId: auth.userId,
      createdAt: new Date(),
    });

    // Update voice repost count
    const voiceRef = db.collection('voices').doc(id);
    const voiceDoc = await voiceRef.get();
    
    if (!voiceDoc.exists) {
      return Response.json({ error: 'Voice not found' }, { status: 404 });
    }

    const voiceData = voiceDoc.data()!;
    const newRepostCount = (voiceData.repostCount || 0) + 1;

    await voiceRef.update({
      repostCount: FieldValue.increment(1),
      updatedAt: new Date(),
    });

    const updatedVoice = { ...voiceData, repostCount: newRepostCount };
    const newScore = computeFeedScore(updatedVoice as any);
    await voiceRef.update({ feedScore: newScore });

    return Response.json({ repostCount: newRepostCount });
  } catch (error) {
    return handleApiError(error);
  }
}
