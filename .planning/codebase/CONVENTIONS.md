# Coding Conventions

**Analysis Date:** 2026-03-07

## Naming Patterns

**Files:**
- Components: PascalCase `.tsx` files in `components/` (e.g., `FeedCard.tsx`, `AppShell.tsx`, `SeverityChip.tsx`)
- Sub-feature components: nested in PascalCase subdirs (e.g., `components/landing/HamiltonHero.tsx`, `components/report-journey/ReportJourney.tsx`)
- Lib modules: camelCase `.ts` files in `lib/` (e.g., `feedScore.ts`, `rateLimiter.ts`, `contentActions.ts`)
- Exception: `lib/voiceContext.tsx` uses `.tsx` because it contains JSX (context provider)
- Hooks: camelCase with `use` prefix in `hooks/` (e.g., `useAgentVoice.ts`, `useLiveIssues.ts`)
- API routes: kebab-case directory names under `app/api/` (e.g., `app/api/auto-file/`, `app/api/agent-command/`), each containing `route.ts`
- Pages: `page.tsx` inside kebab-case route directories (e.g., `app/dashboard/auto-file/page.tsx`)
- Config files: camelCase (e.g., `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts`)

**Functions:**
- Use camelCase for all functions: `computeFeedScore`, `requireAuth`, `handleApiError`, `checkRateLimit`
- API route handlers use uppercase HTTP method names: `GET`, `POST` (Next.js convention)
- Helper/utility functions are standalone exports, not class methods
- React components use PascalCase: `FeedCard`, `AppShell`, `SeverityChip`
- Custom hooks use `use` prefix with camelCase: `useAgentVoice`, `useLiveIssues`

**Variables:**
- Constants: UPPER_SNAKE_CASE for module-level constants (e.g., `SEVERITY_MAP`, `MOMENTUM_WEIGHT`, `WAKE_PATTERNS`, `HAMILTON_CENTER`)
- CSS custom properties use kebab-case with category prefix: `--bg-base`, `--text-primary`, `--accent-primary`, `--shadow-glass-md`
- Local variables: camelCase (e.g., `cellId`, `aiResult`, `voiceRef`)
- State: camelCase (e.g., `localUpvotes`, `showComments`, `commentText`)

**Types:**
- Interfaces: PascalCase, no `I` prefix (e.g., `FeedItemData`, `ScoringItem`, `ContentBase`, `ReportClassification`)
- Type aliases: PascalCase (e.g., `ContentItem`, `VoiceMode`, `Collection`)
- Props interfaces: `{ComponentName}Props` suffix (e.g., `FeedCardProps`, `AppShellProps`, `PulseFeedProps`)
- Generic type parameters: single letter `T` (e.g., `callGemini<T>`)

## Code Style

**Formatting:**
- No Prettier config detected -- relies on editor defaults and ESLint
- 2-space indentation (observed consistently across all files)
- Single quotes for strings in TypeScript/JavaScript
- Semicolons used consistently at end of statements
- Trailing commas used in multi-line objects and arrays
- Max line length: not enforced, some lines exceed 200 chars (especially in `scripts/seed.ts`)

**Linting:**
- ESLint 9 with flat config in `eslint.config.mjs`
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- No custom rules added beyond Next.js defaults
- Occasional `// eslint-disable-next-line` used sparingly (e.g., `react-hooks/exhaustive-deps` in `components/PulseFeed.tsx`)
- `/* eslint-disable @typescript-eslint/no-require-imports */` used in `scripts/seed.ts`
- Run with: `npm run lint`

**TypeScript:**
- Strict mode enabled in `tsconfig.json` (`"strict": true`)
- Target: ES2017, module: ESNext, moduleResolution: bundler
- Non-null assertions (`!`) used for Firestore document data access: `doc.data()!`
- `as any` casts used when passing Firestore data to scoring functions: `computeFeedScore(updated as any)`
- Generic type parameters used for AI response parsing: `callGemini<ReportClassification>(...)`
- Interfaces preferred over types for object shapes

## Import Organization

**Order:**
1. External/framework imports (`next/server`, `react`, `framer-motion`)
2. Auth imports (`@auth0/nextjs-auth0`, `@auth0/nextjs-auth0/client`)
3. Internal lib imports using path alias (`@/lib/firebase`, `@/lib/auth`, `@/lib/gemini`)
4. Internal component imports (`@/components/AppShell`, `@/components/FeedCard`)
5. Internal hook imports (`@/hooks/useLiveIssues`)
6. Relative imports for sibling files (`./SeverityChip`, `./FeedCard`)

**Path Aliases:**
- `@/*` maps to project root (configured in `tsconfig.json` `paths`)
- Always use `@/lib/...` for lib imports, `@/components/...` for components, `@/hooks/...` for hooks
- Relative imports (`./`) only used within the same directory (e.g., component importing sibling component)

**Import Style:**
- Named imports preferred: `import { getDb, generateId, FieldValue } from '@/lib/firebase'`
- Default imports for components: `import AppShell from '@/components/AppShell'`
- Type-only imports used where appropriate: `import type { Metadata } from "next"`

## Error Handling

**API Routes Pattern:**
Every API route handler follows this exact structure:
```typescript
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    // ... business logic ...
    return Response.json({ data }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Custom Error Class:**
- `ApiError` class in `lib/auth.ts` extends `Error` with a `status` property
- Thrown for auth failures: `throw new ApiError(401, 'Unauthorized')`, `throw new ApiError(403, 'Leader role required')`

**Error Response Format:**
- All API errors return `Response.json({ error: 'message' }, { status: code })`
- Standard status codes: 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict/duplicate), 429 (rate limit), 500 (internal), 503 (service unavailable)
- `handleApiError()` in `lib/auth.ts` is the central error handler -- logs unhandled errors with `console.error`

**AI Fallback Pattern:**
AI calls (Gemini) are wrapped in try/catch with graceful fallbacks:
```typescript
let aiResult: ReportClassification;
try {
  aiResult = await callGemini<ReportClassification>(...);
} catch {
  aiResult = {
    category: category || 'infrastructure',
    subcategory: 'general',
    severity: 'medium',
    aiSummary: description.substring(0, 100),
    // ... sensible defaults ...
  };
}
```

**JSON Parse Resilience:**
`lib/gemini.ts` implements progressive JSON cleanup for AI responses:
1. Try raw `JSON.parse(text)`
2. Strip markdown code fences and retry
3. Find JSON boundaries (`{` to `}` or `[` to `]`) and extract
4. Throw `AI_PARSE_ERROR` only if all strategies fail

**Client-Side Error Handling:**
- Optimistic UI updates with rollback on failure (see `FeedCard.tsx` vote handler)
- Empty catch blocks `catch { /* ignore */ }` used for non-critical failures (geolocation, health data loading)
- `console.warn` used for degraded functionality (e.g., TTS fallback to browser speech synthesis)

## Logging

**Framework:** `console` (no external logging library)

**Patterns:**
- Tag-based log format: `[MODULE_NAME]` prefix in uppercase (e.g., `[GEMINI]`, `[TTS]`, `[AGENT_VOICE]`)
- `console.log` for normal operational info: `console.log('[TTS] Upstream status:', response.status)`
- `console.error` for failures: `console.error('[GEMINI] JSON parse failed. Cleaned text:', cleaned.substring(0, 500))`
- `console.warn` for degraded states: `console.warn('[TTS Client] Falling back to browser TTS:', err)`
- Log truncation for large payloads: `text.substring(0, 500)`, `cleaned.substring(0, 200)`
- Timing logs for external API calls: `const t0 = Date.now(); ... const elapsed = Date.now() - t0;`

**When to Log:**
- Log all external API calls (Gemini, ElevenLabs) with status and timing
- Log AI response content (truncated) for debugging parse issues
- Log voice recognition lifecycle events (`[AGENT_VOICE]` module)
- Do NOT log request bodies or user data

## Comments

**When to Comment:**
- Section headers using box-style dividers in CSS: `/* === SECTION NAME === */`
- Brief inline comments for non-obvious logic: `// 6-char geohash ~ 0.6km precision`
- Comment collections/schemas inline: `// Firestore 'in' queries limited to 30 items`
- JSDoc used only for complex utility functions (e.g., `extractBase64Data`, `extractJsonFromResponse` in `lib/gemini.ts`)
- No JSDoc on components or API route handlers

**JSDoc/TSDoc:**
- Minimal usage -- only on exported utility functions where behavior is non-obvious
- Use `/** */` style with `@param` and `@returns` rarely
- Example from `lib/gemini.ts`:
```typescript
/**
 * Extracts pure base64 data from various data URI formats
 * Handles: data:image/png;base64,XXX, data:image/jpeg;base64,XXX, etc.
 */
function extractBase64Data(imageInput: string): { mimeType: string; data: string } {
```

## Function Design

**Size:**
- API route handlers: 20-80 lines typically; largest is `app/api/feed/route.ts` GET at ~160 lines
- Lib functions: generally 5-40 lines
- Component functions: up to 500+ lines for page-level components (e.g., `app/feed/page.tsx`)

**Parameters:**
- Destructured objects for component props: `({ item, onExplain, onSelect }: FeedCardProps)`
- Simple positional args for utility functions: `computeFeedScore(item: ScoringItem)`
- Options object pattern for hooks: `useLiveIssues({ injectInterval = 30000 }: UseLiveIssuesOptions)`

**Return Values:**
- API routes always return `Response` objects (never throw to caller)
- Lib functions return typed values or `null` for missing data
- Hooks return object with named properties: `{ voiceMode, transcript }`

## Module Design

**Exports:**
- Named exports preferred for utility functions and types
- Default exports for React components (one per file)
- Re-exports used in `lib/firebase.ts`: `export { getDb as getFirestore }` for backward compatibility
- Prompt templates exported as single `PROMPTS` object from `lib/gemini.ts`

**Barrel Files:**
- Not used -- each file is imported directly by path
- No `index.ts` files in any directory

## Component Patterns

**Client Components:**
- All page-level and interactive components use `'use client'` directive at top of file
- Layout file (`app/layout.tsx`) is a server component
- Server components are rare -- most UI is client-rendered

**State Management:**
- React hooks only (`useState`, `useEffect`, `useCallback`, `useRef`) -- no global store
- Context API used only for `VoiceControlProvider` in `lib/voiceContext.tsx`
- Data fetching via `fetch()` in `useEffect` or `useCallback` -- no SWR, React Query, or server actions

**Animation:**
- Framer Motion for all animations: `motion.div`, `AnimatePresence`, `variants`
- Standard animation variants defined as const objects above components:
```typescript
const cardVariants = {
  initial: { opacity: 0, y: 24, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  hover: { y: -2, boxShadow: 'var(--shadow-paper-lg)' },
};
```

**Styling:**
- Tailwind CSS 4 utility classes combined with CSS custom properties via `style={{ color: 'var(--text-primary)' }}`
- Custom CSS classes in `app/globals.css` using BEM-like naming: `incident-card__header`, `nav-item__label`
- CSS variables define the entire design system in `:root` of `globals.css`
- Inline SVG icons defined as objects at top of page components (not extracted to separate files)

## API Route Conventions

**Standard Flow:**
1. Auth check: `const auth = await requireAuth()`
2. Rate limit check: `if (!checkRateLimit(auth.userId, 'action')) return rateLimitError()`
3. Parse body: `const body = await req.json()` or parse `searchParams`
4. Validate input: return 400 with `{ error: 'message' }` for invalid data
5. Business logic (Firestore operations, AI calls)
6. Return response: `Response.json({ data }, { status: 201 })` for creates, `Response.json({ data })` for reads

**Dynamic Route Params (Next.js 16):**
```typescript
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;  // params is a Promise in Next.js 16
  // ...
}
```

**Query Parameters:**
- Pagination: `limit` (capped with `Math.min(parseInt(...), 50)`), `cursor` (score-based)
- Filtering: `neighborhood`, `type`
- Default values use `||` operator: `searchParams.get('limit') || '20'`

## Firestore Conventions

**Document IDs:**
- Generated via `generateId(collectionName)` in `lib/firebase.ts`
- Composite IDs for unique constraints: `${contentId}_${userId}` for votes/reposts

**Timestamps:**
- Use `new Date()` for all timestamps (not Firestore server timestamps)
- Always include both `createdAt` and `updatedAt` on document creation
- Update `updatedAt` on every write operation

**Query Patterns:**
- Filter by neighborhood first (partition key), then order by `createdAt` desc
- Client-side filtering for `hidden` flag to avoid composite index requirements
- Batch user lookups with 30-item chunks: `db.collection('users').where('__name__', 'in', chunk)`

---

*Convention analysis: 2026-03-07*
