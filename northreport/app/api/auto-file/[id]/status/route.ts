import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebase';
import { requireLeader, handleApiError } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireLeader();
    const { id } = await params;
    const db = getDb();

    const filingDoc = await db.collection('filed_311').doc(id).get();
    if (!filingDoc.exists) return Response.json({ error: 'Filing not found' }, { status: 404 });
    
    const filing = filingDoc.data()!;

    return Response.json({
      status: filing.status,
      confirmationNumber: filing.confirmationNumber,
      agentLog: filing.agentLog,
      lastScreenshot: filing.screenshots?.[filing.screenshots.length - 1] || null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
