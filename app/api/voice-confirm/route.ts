import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebase';
import { requireAuth, requireLeader, handleApiError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, targetId, confirmMethod, voiceTranscript } = body;

    const db = getDb();

    // Leader-only actions
    if (['file_to_311', 'moderate'].includes(action)) {
      const auth = await requireLeader();

      if (confirmMethod === 'voice' && voiceTranscript) {
        const lower = voiceTranscript.toLowerCase();
        if (!lower.includes('confirm') && !lower.includes('yes') && !lower.includes('submit')) {
          return Response.json({ error: 'Confirmation phrase not recognized' }, { status: 400 });
        }
      }

      if (action === 'file_to_311') {
        const reportDoc = await db.collection('reports').doc(targetId).get();
        if (!reportDoc.exists) return Response.json({ error: 'Report not found' }, { status: 404 });

        return Response.json({
          executed: true,
          result: { action: 'file_to_311', reportId: targetId, status: 'initiated' },
        });
      }

      if (action === 'moderate') {
        await db.collection('voices').doc(targetId).update({
          hidden: true,
          updatedAt: new Date(),
        });
        return Response.json({ executed: true, result: { action: 'moderate', hidden: true } });
      }
    }

    if (action === 'delete') {
      const auth = await requireAuth();
      const voiceDoc = await db.collection('voices').doc(targetId).get();
      if (!voiceDoc.exists) return Response.json({ error: 'Voice not found' }, { status: 404 });
      
      const voice = voiceDoc.data()!;

      if (voice.userId !== auth.userId && auth.role !== 'leader') {
        return Response.json({ error: 'Not authorized' }, { status: 403 });
      }

      await db.collection('voices').doc(targetId).update({
        hidden: true,
        updatedAt: new Date(),
      });
      return Response.json({ executed: true, result: { action: 'delete', hidden: true } });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
