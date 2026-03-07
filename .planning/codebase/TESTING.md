# Testing Patterns

**Analysis Date:** 2026-03-07

## Test Framework

**Runner:**
- No test framework is configured
- No test runner, assertion library, or test configuration files exist in the project
- `package.json` has no `test` script defined
- No Jest, Vitest, Mocha, or any other test runner in `dependencies` or `devDependencies`

**Assertion Library:**
- None installed

**Run Commands:**
```bash
# No test commands available
# The project has no test infrastructure
```

## Test File Organization

**Location:**
- No test files exist anywhere in the project source (only in `node_modules/` from third-party packages)
- No `__tests__/` directories
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files

**Naming:**
- No convention established -- recommend co-located tests following Next.js patterns:
  - `lib/feedScore.test.ts` alongside `lib/feedScore.ts`
  - `app/api/feed/route.test.ts` alongside `app/api/feed/route.ts`
  - `components/FeedCard.test.tsx` alongside `components/FeedCard.tsx`

**Recommended Structure:**
```
lib/
  feedScore.ts
  feedScore.test.ts        # Unit tests for scoring logic
  geohash.ts
  geohash.test.ts          # Unit tests for geohash utilities
app/api/feed/
  route.ts
  route.test.ts            # Integration tests for feed API
components/
  FeedCard.tsx
  FeedCard.test.tsx         # Component rendering tests
```

## Test Structure

**Suite Organization:**
No existing test suites to reference. Recommended pattern based on codebase conventions:

```typescript
// lib/feedScore.test.ts
import { describe, it, expect } from 'vitest';
import { computeFeedScore } from './feedScore';

describe('computeFeedScore', () => {
  it('returns higher score for critical severity items', () => {
    const critical = computeFeedScore({
      createdAt: new Date(),
      severity: 'critical',
      upvotes: 0,
    });
    const low = computeFeedScore({
      createdAt: new Date(),
      severity: 'low',
      upvotes: 0,
    });
    expect(critical).toBeGreaterThan(low);
  });

  it('decays score over time with 12h half-life', () => {
    const recent = computeFeedScore({
      createdAt: new Date(),
      severity: 'medium',
    });
    const old = computeFeedScore({
      createdAt: new Date(Date.now() - 24 * 3600000),
      severity: 'medium',
    });
    expect(recent).toBeGreaterThan(old);
  });
});
```

**Patterns:**
- No setup/teardown patterns established
- No test fixtures or factories exist

## Mocking

**Framework:** None installed

**Recommended Approach:**
Given the codebase architecture, these modules would need mocking:

**What to Mock:**
- `lib/firebase.ts` -- Firestore operations (`getDb()`, collection queries)
- `lib/gemini.ts` -- AI API calls (`callGemini`, `callGeminiWithImage`)
- `lib/auth.ts` -- Auth session (`requireAuth`, `requireLeader`)
- `lib/elevenlabs.ts` -- TTS API calls (`generateTTS`)
- `lib/rateLimiter.ts` -- Rate limit checks (or reset between tests)
- External `fetch` calls in client-side code

**What NOT to Mock:**
- `lib/feedScore.ts` -- Pure computation, test directly
- `lib/geohash.ts` -- Pure utility functions, test directly
- `lib/constants.ts` -- Static data, use as-is
- `lib/voicePatterns.ts` -- Pure string matching, test directly
- `lib/mergePatterns.ts` -- Pure data transformation, test directly
- `lib/contentActions.ts` -- Test with mocked Firestore only

**Recommended Mocking Pattern:**
```typescript
// Example: Mocking Firebase for API route tests
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/firebase', () => ({
  getDb: vi.fn(() => ({
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
    get: vi.fn().mockResolvedValue({ exists: true, data: () => mockData }),
    set: vi.fn().mockResolvedValue(undefined),
  })),
  generateId: vi.fn(() => 'mock-id-123'),
  FieldValue: { increment: vi.fn((n) => n), arrayUnion: vi.fn((...args) => args) },
}));

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    userId: 'test-user',
    role: 'resident',
    neighborhood: 'downtown-hamilton',
  }),
  handleApiError: vi.fn((error) =>
    Response.json({ error: 'Internal server error' }, { status: 500 })
  ),
}));
```

## Fixtures and Factories

**Test Data:**
- `scripts/seed.ts` contains comprehensive seed data that could serve as test fixture source
- `lib/mockIssues.ts` contains `MockIssue` interface and `generateMockComment()` factory function used by the live demo simulation

**Recommended fixture approach based on existing data shapes:**
```typescript
// test/fixtures/voices.ts
import type { ContentItem } from '@/lib/types';

export function createMockPost(overrides?: Partial<ContentItem>): ContentItem {
  return {
    type: 'post',
    userId: 'test-user-1',
    neighborhood: 'downtown-hamilton',
    caption: 'Test post caption',
    mediaUrl: null,
    mediaKind: 'text',
    location: { type: 'Point', coordinates: [-79.8711, 43.2557] },
    locationApprox: { cellId: 'dpz8gx', label: 'near King & James' },
    aiSummary: null,
    severity: 'medium',
    upvotes: 0,
    commentCount: 0,
    repostCount: 0,
    feedScore: 0,
    linkedReportId: null,
    flagCount: 0,
    flaggedBy: [],
    hidden: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

**Fixture Locations:**
- No dedicated fixtures directory exists
- Seed data lives in `scripts/seed.ts`
- Mock data types in `lib/mockIssues.ts`
- Recommend creating `test/fixtures/` directory

## Coverage

**Requirements:** None enforced -- no coverage tooling is configured

**Recommendation:**
```bash
# After adding Vitest:
npx vitest --coverage     # Run with coverage
```

## Test Types

**Unit Tests (Priority 1 -- easiest to add):**
- Pure logic in `lib/` is immediately testable with no mocking:
  - `lib/feedScore.ts` -- `computeFeedScore()` scoring algorithm
  - `lib/geohash.ts` -- `encodeGeohash()`, `decodeGeohash()`, `getApproxLabel()`
  - `lib/voicePatterns.ts` -- `containsWakeWord()`, `stripWakeWords()`
  - `lib/mergePatterns.ts` -- `mergePatterns()` deduplication logic
  - `lib/rateLimiter.ts` -- `checkRateLimit()` (uses in-memory store, easily testable)

**Integration Tests (Priority 2 -- require mocking):**
- API route handlers in `app/api/*/route.ts`
- Test auth flow, validation, Firestore operations, response shapes
- Mock Firebase, Gemini, and Auth0

**Component Tests (Priority 3 -- require React testing setup):**
- `components/SeverityChip.tsx` -- simple render test
- `components/FeedCard.tsx` -- interaction tests (vote, comment)
- `components/PulseFeed.tsx` -- data fetching and filtering

**E2E Tests:**
- Not configured
- No Playwright, Cypress, or similar framework present
- The app relies on Auth0 login which would require E2E auth handling

## Recommended Setup

To add testing to this project, install Vitest (aligns with the Vite-compatible Next.js setup):

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

**Recommended `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

**Add to `package.json` scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

## Highest-Value Test Targets

These files contain critical business logic with zero test coverage:

| File | Function | Why It Matters |
|------|----------|---------------|
| `lib/feedScore.ts` | `computeFeedScore()` | Controls feed ranking for all users |
| `lib/gemini.ts` | `extractJsonFromResponse()` | Parses every AI response; failure breaks classification |
| `lib/auth.ts` | `requireAuth()`, `handleApiError()` | Guards every API endpoint |
| `lib/rateLimiter.ts` | `checkRateLimit()` | Prevents abuse across all endpoints |
| `lib/contentActions.ts` | `voteOnContent()`, `flagContent()` | Core engagement actions with side effects |
| `lib/mergePatterns.ts` | `mergePatterns()` | Pattern dedup logic shown to community leaders |
| `lib/geohash.ts` | `encodeGeohash()` | Location privacy depends on correct precision |

---

*Testing analysis: 2026-03-07*
