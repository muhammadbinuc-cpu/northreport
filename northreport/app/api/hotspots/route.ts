import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const { searchParams } = new URL(req.url);
    const neighborhood = searchParams.get('neighborhood') || auth.neighborhood;
    const hours = Math.min(parseInt(searchParams.get('hours') || '24'), 168);

    const db = getDb();
    const since = new Date(Date.now() - hours * 3600000);

    // Fetch voices in time range (filter hidden client-side to avoid composite index)
    const voicesSnapshot = await db
      .collection('voices')
      .where('neighborhood', '==', neighborhood)
      .where('createdAt', '>', since)
      .get();

    // Fetch reports in time range (filter hidden client-side to avoid composite index)
    const reportsSnapshot = await db
      .collection('reports')
      .where('neighborhood', '==', neighborhood)
      .where('createdAt', '>', since)
      .get();


    // Group by cellId (client-side aggregation since Firestore doesn't have MongoDB-style aggregation)
    const cellMap = new Map<string, {
      cellId: string;
      count: number;
      uniqueUsers: Set<string>;
      label: string;
      center: number[];
      topSeverity: string | null;
      recentItems: any[];
    }>();

    // Process voices
    voicesSnapshot.docs.forEach(doc => {
      const v = doc.data();
      // Skip hidden items (filtered client-side to avoid composite index)
      if (v.hidden === true) return;
      const cellId = v.locationApprox?.cellId;
      if (!cellId) return;

      if (!cellMap.has(cellId)) {
        cellMap.set(cellId, {
          cellId,
          count: 0,
          uniqueUsers: new Set(),
          label: v.locationApprox?.label || '',
          center: v.location?.coordinates || [],
          topSeverity: null,
          recentItems: [],
        });
      }

      const cell = cellMap.get(cellId)!;
      cell.count++;
      cell.uniqueUsers.add(v.userId);
      if (cell.recentItems.length < 3) {
        cell.recentItems.push({
          id: doc.id,
          source: 'voice',
          caption: v.caption,
          severity: v.severity,
        });
      }
      if (v.severity && (!cell.topSeverity || severityRank(v.severity) > severityRank(cell.topSeverity))) {
        cell.topSeverity = v.severity;
      }
    });

    // Process reports
    reportsSnapshot.docs.forEach(doc => {
      const r = doc.data();
      // Skip hidden items (filtered client-side to avoid composite index)
      if (r.hidden === true) return;
      const cellId = r.locationApprox?.cellId;
      if (!cellId) return;

      if (!cellMap.has(cellId)) {
        cellMap.set(cellId, {
          cellId,
          count: 0,
          uniqueUsers: new Set(),
          label: r.locationApprox?.label || '',
          center: r.location?.coordinates || [],
          topSeverity: null,
          recentItems: [],
        });
      }

      const cell = cellMap.get(cellId)!;
      cell.count++;
      cell.uniqueUsers.add(r.userId);
      if (cell.recentItems.length < 3) {
        cell.recentItems.push({
          id: doc.id,
          source: 'report',
          caption: r.description,
          severity: r.severity,
        });
      }
      if (r.severity && (!cell.topSeverity || severityRank(r.severity) > severityRank(cell.topSeverity))) {
        cell.topSeverity = r.severity;
      }
    });

    // Filter and format hotspots
    const hotspots = Array.from(cellMap.values())
      .filter(h => h.uniqueUsers.size >= 1)
      .map(h => ({
        cellId: h.cellId,
        count: h.count,
        uniqueUsers: h.uniqueUsers.size,
        label: h.label,
        center: h.center,
        topSeverity: h.topSeverity,
        recentItems: h.recentItems,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

    return Response.json({ hotspots });
  } catch (error) {
    return handleApiError(error);
  }
}

function severityRank(severity: string): number {
  const ranks: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  return ranks[severity] || 0;
}
