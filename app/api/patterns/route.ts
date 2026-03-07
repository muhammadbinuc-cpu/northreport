import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebase';
import { requireLeader, handleApiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireLeader();
    const { searchParams } = new URL(req.url);
    const neighborhood = searchParams.get('neighborhood') || auth.neighborhood;

    const db = getDb();
    const snapshot = await db
      .collection('patterns')
      .where('neighborhood', '==', neighborhood)
      .orderBy('detectedAt', 'desc')
      .limit(20)
      .get();

    const patterns = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
    }));

    return Response.json({ patterns });
  } catch (error) {
    return handleApiError(error);
  }
}
