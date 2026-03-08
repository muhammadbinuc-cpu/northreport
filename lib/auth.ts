import { auth0 } from './auth0';
import { getDb } from './firebase';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireAuth(): Promise<{ userId: string; role: string; neighborhood: string }> {
  const session = await auth0.getSession();
  if (!session) throw new ApiError(401, 'Unauthorized');

  const db = getDb();
  const sub = session.user.sub;
  const userDoc = await db.collection('users').doc(sub).get();

  if (!userDoc.exists) {
    // Auto-create user on first login
    const newUser = {
      role: 'resident',
      neighborhood: 'downtown-waterloo',
      displayName: session.user.name || session.user.email || 'Anonymous',
      email: session.user.email || '',
      avatarUrl: session.user.picture || null,
      settings: { handsFreeEnabled: false },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection('users').doc(sub).set(newUser);
    
    return {
      userId: sub,
      role: 'resident',
      neighborhood: 'downtown-waterloo',
    };
  }

  const user = userDoc.data()!;
  return {
    userId: sub,
    role: user.role || 'resident',
    neighborhood: user.neighborhood || 'downtown-waterloo',
  };
}

export async function requireLeader(): Promise<{ userId: string; role: string; neighborhood: string }> {
  const auth = await requireAuth();
  if (auth.role !== 'leader') throw new ApiError(403, 'Leader role required');
  return auth;
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error('Unhandled API error:', error);
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
