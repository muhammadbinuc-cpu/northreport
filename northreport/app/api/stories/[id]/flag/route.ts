import { NextRequest } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/auth';
import { flagContent } from '@/lib/contentActions';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    const { id } = await params;
    return flagContent('stories', id, auth.userId);
  } catch (error) {
    return handleApiError(error);
  }
}
