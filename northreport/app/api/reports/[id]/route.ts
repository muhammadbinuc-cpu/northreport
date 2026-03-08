import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';

// GET single report by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await requireAuth();
        const { id } = await params;
        const db = getDb();

        const reportDoc = await db.collection('reports').doc(id).get();

        if (!reportDoc.exists) {
            return Response.json({ error: 'Report not found' }, { status: 404 });
        }

        const report = reportDoc.data()!;

        // Only allow owner to view their drafts
        if (report.status === 'draft' && report.userId !== auth.userId) {
            return Response.json({ error: 'Not authorized' }, { status: 403 });
        }

        return Response.json({ _id: reportDoc.id, ...report });
    } catch (error) {
        return handleApiError(error);
    }
}

// PATCH to update report status (draft -> submitted)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await requireAuth();
        const { id } = await params;
        const body = await req.json();
        const db = getDb();

        const reportRef = db.collection('reports').doc(id);
        const reportDoc = await reportRef.get();

        if (!reportDoc.exists) {
            return Response.json({ error: 'Report not found' }, { status: 404 });
        }

        const report = reportDoc.data()!;

        // Verify ownership
        if (report.userId !== auth.userId) {
            return Response.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Only allow draft -> submitted transition
        if (report.status !== 'draft') {
            return Response.json({ error: 'Only draft reports can be updated' }, { status: 400 });
        }

        if (body.status && body.status !== 'submitted') {
            return Response.json({ error: 'Invalid status transition' }, { status: 400 });
        }

        const updates: Record<string, any> = {
            updatedAt: new Date(),
        };

        // Update status if provided
        if (body.status === 'submitted') {
            updates.status = 'submitted';
        }

        // Update description if provided
        if (body.description && typeof body.description === 'string') {
            updates.description = body.description;
        }

        await reportRef.update(updates);

        return Response.json({
            _id: id,
            ...report,
            ...updates
        });
    } catch (error) {
        return handleApiError(error);
    }
}
