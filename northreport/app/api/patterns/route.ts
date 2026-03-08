import { NextRequest } from 'next/server';
import { getDb } from '@/lib/firebase';
import { requireAuth, handleApiError } from '@/lib/auth';
import { mergePatterns } from '@/lib/mergePatterns';

function generateSignificance(pattern: any): string {
  const count = pattern.reportCount || pattern.count || 1;

  if (count < 5) {
    return `This issue was identified from ${count === 1 ? 'a recent report' : `${count} reports`}. Review recommended to determine whether follow-up action is required.`;
  } else {
    return `This issue was identified from ${count} reports in this area. The volume suggests a recurring condition that may warrant coordinated response.`;
  }
}

function sanitizeText(text: string, count: number): string {
  if (!text || count > 1) return text || '';
  return text
    .replace(/Multiple reports and voices/gi, 'Report')
    .replace(/Multiple reports/gi, 'Report')
    .replace(/multiple residents/gi, 'a resident')
    .replace(/reported by multiple/gi, 'reported by a');
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const { searchParams } = new URL(req.url);
    const neighborhood = searchParams.get('neighborhood') || auth.neighborhood;
    const issueId = searchParams.get('issueId');

    const db = getDb();

    // If issueId is provided, fetch single issue with related reports
    if (issueId) {
      const patternDoc = await db.collection('patterns').doc(issueId).get();

      if (!patternDoc.exists) {
        // Try to find in reports collection instead
        const reportDoc = await db.collection('reports').doc(issueId).get();
        if (reportDoc.exists) {
          const reportData = reportDoc.data();
          return Response.json({
            status: 'SUCCESS',
            issue: {
              _id: reportDoc.id,
              type: 'report',
              title: reportData?.description?.substring(0, 80) || 'Report',
              description: reportData?.description || '',
              category: reportData?.category || 'General',
              severity: reportData?.severity || 'medium',
              significance: generateSignificance(reportData),
              reportCount: 1,
              reports: [{ _id: reportDoc.id, ...reportData }],
              location: reportData?.locationApprox,
              createdAt: reportData?.createdAt || new Date().toISOString(),
            },
          });
        }
        return Response.json({ status: 'NOT_FOUND', error: 'Issue not found' }, { status: 404 });
      }

      const patternData = patternDoc.data();

      // Fetch related reports for this pattern
      let relatedReports: any[] = [];
      if (patternData?.reportIds && patternData.reportIds.length > 0) {
        const reportSnapshots = await Promise.all(
          patternData.reportIds.slice(0, 10).map((id: string) =>
            db.collection('reports').doc(id).get()
          )
        );
        relatedReports = reportSnapshots
          .filter(doc => doc.exists)
          .map(doc => ({ _id: doc.id, ...doc.data() }));
      }

      return Response.json({
        status: 'SUCCESS',
        issue: {
          _id: patternDoc.id,
          type: 'pattern',
          title: sanitizeText(patternData?.description || patternData?.type || 'Pattern Detected', patternData?.reportCount || 1),
          description: sanitizeText(patternData?.description || '', patternData?.reportCount || 1),
          category: patternData?.category || 'General',
          severity: patternData?.severity || 'medium',
          significance: generateSignificance(patternData),
          reportCount: patternData?.reportCount || patternData?.count || relatedReports.length || 1,
          reports: relatedReports,
          location: patternData?.location,
          createdAt: patternData?.detectedAt || patternData?.createdAt || new Date().toISOString(),
        },
      });
    }

    // Default: fetch all patterns
    const snapshot = await db
      .collection('patterns')
      .where('neighborhood', '==', neighborhood)
      .orderBy('detectedAt', 'desc')
      .limit(20)
      .get();

    const rawPatterns = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
    }));

    // Dedupe and merge similar patterns
    const patterns = mergePatterns(rawPatterns as any);

    // Return EMPTY status if no patterns found
    if (patterns.length === 0) {
      return Response.json({ status: "EMPTY", patterns: [], neighborhood }, { status: 200 });
    }

    return Response.json({ status: "SUCCESS", patterns });
  } catch (error) {
    return handleApiError(error);
  }
}

