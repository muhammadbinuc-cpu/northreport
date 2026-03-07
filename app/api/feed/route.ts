import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';
import { computeFeedScore } from '@/lib/feedScore';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const { searchParams } = new URL(req.url);
    const neighborhood = searchParams.get('neighborhood') || auth.neighborhood;
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const type = searchParams.get('type') || 'all';

    const db = getDb();
    const now = new Date();

    // Fetch voices
    let voices: any[] = [];
    if (type !== 'report') {
      let voicesQuery = db
        .collection('voices')
        .where('neighborhood', '==', neighborhood)
        .where('hidden', '!=', true);
      
      if (type === 'story') {
        voicesQuery = voicesQuery.where('type', '==', 'story');
      } else if (type === 'post') {
        voicesQuery = voicesQuery.where('type', '==', 'post');
      }

      const voicesSnapshot = await voicesQuery
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      voices = voicesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((v: any) => {
          // Filter expired stories client-side
          if (v.type === 'story' && v.expiresAt) {
            const expiresAt = v.expiresAt.toDate ? v.expiresAt.toDate() : new Date(v.expiresAt);
            return expiresAt > now;
          }
          return true;
        });
    }

    // Fetch reports
    let reports: any[] = [];
    if (type === 'all' || type === 'report') {
      const reportsSnapshot = await db
        .collection('reports')
        .where('neighborhood', '==', neighborhood)
        .where('hidden', '!=', true)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Batch lookup user display names
    const userIds = [...new Set([...voices.map((v) => v.userId), ...reports.map((r) => r.userId)])];
    
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

    // Normalize and merge
    const items = [
      ...voices.map((v: any) => ({
        id: v.id,
        source: 'voice' as const,
        type: v.type,
        userId: v.userId,
        displayName: userMap.get(v.userId)?.displayName || 'Anonymous',
        neighborhood: v.neighborhood,
        caption: v.caption,
        aiSummary: v.aiSummary || null,
        severity: v.severity || null,
        locationApprox: v.locationApprox || null,
        mediaUrl: v.mediaUrl || null,
        upvotes: v.upvotes || 0,
        commentCount: v.commentCount || 0,
        repostCount: v.repostCount || 0,
        feedScore: computeFeedScore(v),
        isTrending: (v.upvotes || 0) >= 5,
        linkedReportId: v.linkedReportId || null,
        linkedVoiceId: null,
        status: null,
        createdAt: v.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        expiresAt: v.expiresAt?.toDate?.()?.toISOString() || null,
      })),
      ...reports.map((r: any) => ({
        id: r.id,
        source: 'report' as const,
        type: 'report' as const,
        userId: r.userId,
        displayName: userMap.get(r.userId)?.displayName || 'Anonymous',
        neighborhood: r.neighborhood,
        caption: r.description,
        aiSummary: r.aiSummary || null,
        severity: r.severity || null,
        locationApprox: r.locationApprox || null,
        mediaUrl: r.imageUrl || null,
        upvotes: r.upvotes || 0,
        commentCount: 0,
        repostCount: 0,
        feedScore: computeFeedScore(r),
        isTrending: (r.upvotes || 0) >= 5,
        linkedReportId: null,
        linkedVoiceId: r.linkedVoiceId || null,
        status: r.status || 'new',
        createdAt: r.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        expiresAt: null,
      })),
    ];

    // Sort by feedScore desc
    items.sort((a, b) => b.feedScore - a.feedScore);

    // Apply cursor pagination
    let startIdx = 0;
    if (cursor) {
      const [cursorScore, cursorId] = cursor.split('_');
      startIdx = items.findIndex(
        (item) => item.feedScore <= parseFloat(cursorScore) && item.id !== cursorId
      );
      if (startIdx === -1) startIdx = items.length;
    }

    const paged = items.slice(startIdx, startIdx + limit);
    const lastItem = paged[paged.length - 1];
    const nextCursor = lastItem ? `${lastItem.feedScore}_${lastItem.id}` : null;

    return Response.json({ items: paged, nextCursor });
  } catch (error) {
    return handleApiError(error);
  }
}
