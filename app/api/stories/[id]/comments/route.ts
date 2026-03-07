import { NextRequest } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/auth';
import { getComments } from '@/lib/contentActions';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    return getComments('stories', id);
  } catch (error) {
    return handleApiError(error);
  }
}
