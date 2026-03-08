import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const db = getDb();

    const snapshot = await db
      .collection('voice_comments')
      .where('voiceId', '==', id)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const comments = snapshot.docs.map(doc => doc.data());
    
    // Batch lookup users
    const userIds = [...new Set(comments.map((c) => c.userId))];
    
    const userMap = new Map<string, any>();
    if (userIds.length > 0) {
      // Firestore 'in' queries limited to 30 items
      const chunks = [];
      for (let i = 0; i < userIds.length; i += 30) {
        chunks.push(userIds.slice(i, i + 30));
      }
      
      for (const chunk of chunks) {
        const usersSnapshot = await db.collection('users').where('__name__', 'in', chunk).get();
        usersSnapshot.docs.forEach(doc => userMap.set(doc.id, doc.data()));
      }
    }

    const enriched = comments.map((c, idx) => ({
      id: snapshot.docs[idx].id,
      userId: c.userId,
      displayName: userMap.get(c.userId)?.displayName || 'Anonymous',
      text: c.text,
      createdAt: c.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    return Response.json({ comments: enriched });
  } catch (error) {
    return handleApiError(error);
  }
}
