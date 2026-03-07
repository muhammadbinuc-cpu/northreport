const store = new Map<string, number[]>();

const limits: Record<string, { max: number; windowMs: number }> = {
  'voices:create': { max: 50, windowMs: 3600000 },
  votes: { max: 50, windowMs: 60000 },
  'reports:create': { max: 50, windowMs: 3600000 },
  explain: { max: 50, windowMs: 60000 },
  tts: { max: 50, windowMs: 60000 },
  command: { max: 50, windowMs: 60000 },
};

export function checkRateLimit(userId: string, action: string): boolean {
  const config = limits[action];
  if (!config) return true;

  const key = `${userId}:${action}`;
  const now = Date.now();
  const timestamps = store.get(key) || [];

  // Remove expired timestamps
  const valid = timestamps.filter((t) => now - t < config.windowMs);

  if (valid.length >= config.max) {
    return false;
  }

  valid.push(now);
  store.set(key, valid);
  return true;
}

export function rateLimitError(): Response {
  return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
