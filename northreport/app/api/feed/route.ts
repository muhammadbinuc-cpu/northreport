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

    // Fetch voices (filter hidden client-side to avoid composite index requirement)
    let voices: any[] = [];
    if (type !== 'report') {
      let voicesQuery: FirebaseFirestore.Query = db
        .collection('voices')
        .where('neighborhood', '==', neighborhood);

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
          if (v.hidden === true) return false;
          // Filter expired stories
          if (v.type === 'story' && v.expiresAt) {
            const expiresAt = v.expiresAt.toDate ? v.expiresAt.toDate() : new Date(v.expiresAt);
            return expiresAt > now;
          }
          return true;
        });
    }

    // Fetch reports (filter hidden client-side to avoid composite index requirement)
    let reports: any[] = [];
    if (type === 'all' || type === 'report') {
      const reportsSnapshot = await db
        .collection('reports')
        .where('neighborhood', '==', neighborhood)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      reports = reportsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((r: any) => r.hidden !== true);
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

    // Helper to safely convert Firestore Timestamp or Date to JS Date
    const toDate = (ts: any): Date =>
      ts?.toDate ? ts.toDate() : ts instanceof Date ? ts : new Date(ts ?? Date.now());

    // Normalize and merge
    const items = [
      ...voices.map((v: any) => {
        const created = toDate(v.createdAt);
        const coords = v.location?.coordinates; // [lng, lat]
        return {
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
          latitude: coords ? coords[1] : null,
          longitude: coords ? coords[0] : null,
          mediaUrl: v.mediaUrl || null,
          upvotes: v.upvotes || 0,
          commentCount: v.commentCount || 0,
          repostCount: v.repostCount || 0,
          feedScore: computeFeedScore({ ...v, createdAt: created }),
          isTrending: (v.upvotes || 0) >= 5,
          linkedReportId: v.linkedReportId || null,
          linkedVoiceId: null,
          status: null,
          createdAt: created.toISOString(),
          expiresAt: v.expiresAt ? toDate(v.expiresAt).toISOString() : null,
        };
      }),
      ...reports.map((r: any) => {
        const created = toDate(r.createdAt);
        const coords = r.location?.coordinates; // [lng, lat]
        return {
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
          latitude: coords ? coords[1] : null,
          longitude: coords ? coords[0] : null,
          mediaUrl: r.imageUrl || null,
          upvotes: r.upvotes || 0,
          commentCount: 0,
          repostCount: 0,
          feedScore: computeFeedScore({ ...r, createdAt: created }),
          isTrending: (r.upvotes || 0) >= 5,
          linkedReportId: null,
          linkedVoiceId: r.linkedVoiceId || null,
          status: r.status || 'new',
          createdAt: created.toISOString(),
          expiresAt: null,
        };
      }),
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
