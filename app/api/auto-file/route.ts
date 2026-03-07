import { NextRequest } from 'next/server';
import { getDb, generateId, FieldValue } from '@/lib/firebase';
import { requireLeader, handleApiError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireLeader();
    const body = await req.json();
    const { reportId } = body;

    if (!reportId) return Response.json({ error: 'reportId required' }, { status: 400 });

    const db = getDb();
    const reportRef = db.collection('reports').doc(reportId);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) return Response.json({ error: 'Report not found' }, { status: 404 });
    const report = reportDoc.data()!;
    
    if (!['critical', 'high'].includes(report.severity)) {
      return Response.json({ error: 'Only high/critical reports can be filed' }, { status: 400 });
    }
    if (!['new', 'acknowledged'].includes(report.status)) {
      return Response.json({ error: 'Report must be new or acknowledged' }, { status: 400 });
    }
    if (report.autoFiled311) {
      return Response.json({ error: 'Already filed' }, { status: 400 });
    }

    const filingId = generateId('filed_311');
    const filing = {
      reportId: reportId,
      leaderId: auth.userId,
      status: 'pending',
      confirmationNumber: null,
      agentLog: ['Filing initiated'],
      screenshots: [],
      createdAt: new Date(),
      completedAt: null,
    };

    await db.collection('filed_311').doc(filingId).set(filing);

    // Simulate agent completing (in real implementation, this would kick off Playwright)
    setTimeout(async () => {
      try {
        const db = getDb();
        const confirmNum = 'CITY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        
        await db.collection('filed_311').doc(filingId).update({
          status: 'completed',
          confirmationNumber: confirmNum,
          completedAt: new Date(),
          agentLog: FieldValue.arrayUnion(
            'Navigating to 311 form...',
            'Filling category field...',
            'Filling location field...',
            'Filling description...',
            'Submitting form...',
            `Form submitted. Confirmation: ${confirmNum}`,
          ),
        });

        await reportRef.update({
          autoFiled311: true,
          confirmationNumber311: confirmNum,
          filedBy: auth.userId,
          status: 'in_progress',
          updatedAt: new Date(),
        });
      } catch (e) {
        console.error('Auto-file agent error:', e);
      }
    }, 5000);

    return Response.json(
      { filingId: filingId, status: 'pending' },
      { status: 202 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
