import { NextRequest } from 'next/server';
import { getDb, generateId, FieldValue } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';
import { computeFeedScore } from '@/lib/feedScore';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const { text } = body;

    if (!text || text.length < 1 || text.length > 300) {
      return Response.json({ error: 'Comment must be 1-300 chars' }, { status: 400 });
    }

    const db = getDb();
    const commentId = generateId('voice_comments');

    const comment = {
      voiceId: id,
      userId: auth.userId,
      text,
      createdAt: new Date(),
    };

    await db.collection('voice_comments').doc(commentId).set(comment);

    // Update voice comment count
    const voiceRef = db.collection('voices').doc(id);
    const voiceDoc = await voiceRef.get();
    
    if (voiceDoc.exists) {
      const voiceData = voiceDoc.data()!;
      await voiceRef.update({
        commentCount: FieldValue.increment(1),
        updatedAt: new Date(),
      });

      const updatedVoice = { ...voiceData, commentCount: (voiceData.commentCount || 0) + 1 };
      const newScore = computeFeedScore(updatedVoice as any);
      await voiceRef.update({ feedScore: newScore });
    }

    return Response.json(
      { id: commentId, text: comment.text, createdAt: comment.createdAt.toISOString() },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
