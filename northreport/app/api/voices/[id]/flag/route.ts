import { NextRequest } from 'next/server';
import { getDb, FieldValue } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    const { id } = await params;
    const db = getDb();

    const voiceRef = db.collection('voices').doc(id);
    const voiceDoc = await voiceRef.get();
    
    if (!voiceDoc.exists) {
      return Response.json({ error: 'Voice not found' }, { status: 404 });
    }

    const voice = voiceDoc.data()!;

    if (voice.flaggedBy?.includes(auth.userId)) {
      return Response.json({ error: 'Already flagged' }, { status: 409 });
    }

    const newFlagCount = (voice.flagCount || 0) + 1;
    
    await voiceRef.update({
      flagCount: FieldValue.increment(1),
      flaggedBy: FieldValue.arrayUnion(auth.userId),
      updatedAt: new Date(),
    });

    // Auto-hide at 3 flags
    if (newFlagCount >= 3) {
      await voiceRef.update({ hidden: true });
    }

    return Response.json({ flagCount: newFlagCount });
  } catch (error) {
    return handleApiError(error);
  }
}
