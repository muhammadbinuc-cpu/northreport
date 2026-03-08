import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth();
    const db = getDb();
    const userDoc = await db.collection('users').doc(auth.userId).get();
    
    if (!userDoc.exists) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    return Response.json({ _id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await req.json();
    const db = getDb();

    const allowedUpdates: Record<string, unknown> = {};
    if (body.neighborhood) allowedUpdates.neighborhood = body.neighborhood;
    if (body.displayName) allowedUpdates.displayName = body.displayName;
    if (body.settings) allowedUpdates.settings = body.settings;
    allowedUpdates.updatedAt = new Date();

    await db.collection('users').doc(auth.userId).update(allowedUpdates);

    const userDoc = await db.collection('users').doc(auth.userId).get();
    return Response.json({ _id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    return handleApiError(error);
  }
}
