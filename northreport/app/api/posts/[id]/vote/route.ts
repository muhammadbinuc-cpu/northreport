import { NextRequest } from 'next/server';
import { requireAuth, handleApiError } from '@/lib/auth';
import { checkRateLimit, rateLimitError } from '@/lib/rateLimiter';
import { voteOnContent } from '@/lib/contentActions';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (!checkRateLimit(auth.userId, 'votes')) return rateLimitError();
    const { id } = await params;
    return voteOnContent('posts', id, auth.userId);
  } catch (error) {
    return handleApiError(error);
  }
}
