# Architecture

**Analysis Date:** 2026-03-07

## Pattern Overview

**Overall:** Next.js App Router monolith with AI-augmented API layer

**Key Characteristics:**
- Single Next.js 16 application serving both frontend (React 19, client-side rendered pages) and backend (API route handlers)
- All pages use `'use client'` directive -- the app is effectively a client-side SPA wrapped in App Router routing
- AI (Google Gemini) is woven into every write path: content creation, classification, pattern detection, voice commands, and 311 filing
- Two-role authorization model: `resident` (default) and `leader` (elevated access to dashboard/filing features)
- Firebase Firestore is the sole data store; no ORM, direct SDK calls from API routes
- Voice-first interaction model via Web Speech API wake-word detection and ElevenLabs TTS responses

## Layers

**Presentation Layer (Client Components):**
- Purpose: UI rendering, user interaction, client-side state management
- Location: `components/`, `app/*/page.tsx`
- Contains: React components using `'use client'`, Framer Motion animations, Leaflet/Mapbox maps
- Depends on: API routes via `fetch()`, Auth0 client hooks, browser APIs (SpeechRecognition, MediaDevices)
- Used by: App Router pages

**Page Layer (App Router):**
- Purpose: Route definitions and page composition
- Location: `app/*/page.tsx`
- Contains: Page components that compose shell (`AppShell`) + feature components
- Depends on: `components/`, `hooks/`, `lib/constants.ts`
- Used by: Next.js router

**API Layer (Route Handlers):**
- Purpose: Business logic, data access, AI orchestration, authentication enforcement
- Location: `app/api/*/route.ts`
- Contains: RESTful route handlers exporting `GET`, `POST` functions
- Depends on: `lib/auth.ts`, `lib/firebase.ts`, `lib/gemini.ts`, `lib/rateLimiter.ts`, `lib/feedScore.ts`, `lib/geohash.ts`
- Used by: Client components via `fetch('/api/...')`

**Shared Library Layer:**
- Purpose: Reusable server-side utilities, type definitions, configuration
- Location: `lib/`
- Contains: Firebase client (`firebase.ts`), Gemini AI client (`gemini.ts`), auth helpers (`auth.ts`, `auth0.ts`), scoring (`feedScore.ts`), geohashing (`geohash.ts`), rate limiting (`rateLimiter.ts`), TTS (`tts.ts`, `elevenlabs.ts`), types (`types.ts`), constants (`constants.ts`), pattern merging (`mergePatterns.ts`), Hamilton 311 config (`hamilton311Config.ts`)
- Depends on: Firebase Admin SDK, Google Generative AI SDK, Auth0 SDK, ngeohash
- Used by: API routes, some client components

**Hooks Layer:**
- Purpose: Encapsulate complex client-side state and polling logic
- Location: `hooks/`
- Contains: `useLiveIssues.ts` (API polling + issue state), `useLivingCity.tsx` (simulation), `useAgentVoice.ts`, `useCameraVoice.ts`
- Depends on: API routes, `lib/mockIssues.ts`
- Used by: Page components

**Middleware Layer:**
- Purpose: Authentication gate, CSP headers, security
- Location: `proxy.ts` (root)
- Contains: Auth0 middleware delegation for `/auth/*` routes, CSP header injection, security headers
- Depends on: Auth0 SDK
- Used by: Next.js (auto-invoked on matched routes)

## Data Flow

**Content Creation (Voice/Post/Report):**

1. User submits content via UI component (e.g., `ContentComposer`, `SmartReportAgent`, `ReportForm`)
2. Client `POST`s to `/api/voices`, `/api/posts`, or `/api/reports` with caption, media (base64), and GPS coordinates
3. API route calls `requireAuth()` to verify session and extract userId/role/neighborhood
4. API route calls `checkRateLimit()` to enforce per-user limits
5. Location is geohashed via `encodeGeohash()` for privacy (~0.6km precision)
6. Content is classified by Gemini AI (`callGemini` or `callGeminiWithImage`) -- produces `aiSummary`, `severity`, hazard detection
7. Feed score is computed via `computeFeedScore()` (momentum * 0.6 + risk * 0.4)
8. Document is written to Firestore (`voices`, `posts`, or `reports` collection)
9. Response returns the new ID, AI summary, and severity

**Feed Rendering:**

1. `PulseFeed` or `useLiveIssues` hook fetches `/api/feed?neighborhood=X&type=Y&limit=20`
2. API route queries Firestore `voices` and `reports` collections, filtered by neighborhood
3. Stories are filtered for expiration (24h TTL), hidden items excluded client-side
4. User display names batch-resolved from `users` collection (chunked `in` queries, max 30)
5. Items merged into unified feed shape, each scored by `computeFeedScore()`
6. Sorted by feedScore descending, cursor-paginated
7. Client renders `FeedCard` components with upvote/comment/repost/explain actions

**Voice Command Flow:**

1. `VoiceListener` component runs Web Speech API continuously, listening for wake phrase "Hey SafePulse"
2. On wake word detection, mode transitions from `DORMANT` to `ACTIVE`
3. After 3s of silence, accumulated command text is sent to `/api/command`
4. API route sends transcript + context to Gemini (`PROMPTS.voiceCommand`) for intent classification
5. Post-Gemini keyword fallback logic overrides misclassifications
6. Client receives structured `CommandResult` with `intent`, `action`, `spokenResponse`
7. `executeCommand()` navigates via `router.push()` or dispatches custom events
8. `speakWithBlock()` plays TTS response via `/api/tts` (ElevenLabs) with browser fallback

**Pattern Detection & Dashboard:**

1. Leader navigates to `/dashboard` -- fetches health scores, patterns, and draft reports in parallel
2. Leader triggers pattern detection via POST to `/api/patterns/detect`
3. API fetches reports + voices from last N days, strips PII, sends to Gemini for cluster/trend/anomaly analysis
4. Detected patterns persisted to `patterns` collection, neighborhood health score updated
5. Patterns deduplicated/merged via `mergePatterns()` utility before display
6. Dashboard shows health gauges, priority issues, and workflow tools (Pattern Detection -> Digest -> 311 Filing)

**311 Filing Flow:**

1. Leader selects report from dashboard or feed
2. POST to `/api/auto-file` with `reportId` (requires `requireLeader()`)
3. Filing record created in `filed_311` collection with `pending` status
4. Simulated agent completes via `setTimeout` (5s) -- generates confirmation number, updates report status
5. Alternative assisted flow: `/api/311-assist` generates pre-filled form content via Gemini, returns submission steps

**State Management:**
- No global state store (no Redux, Zustand, etc.)
- All state via React `useState`/`useCallback`/`useEffect` hooks at the page level
- `VoiceControlContext` (`lib/voiceContext.tsx`) is the only React Context, used to pause/resume voice listener
- API data fetched on mount or user action, stored in local component state
- Feed uses cursor-based pagination state

## Key Abstractions

**Auth Helpers (`lib/auth.ts`):**
- Purpose: Centralized authentication and authorization for all API routes
- Pattern: `requireAuth()` returns `{ userId, role, neighborhood }` or throws `ApiError(401)`; `requireLeader()` adds role check
- Auto-creates user document on first login with default `resident` role and `downtown-hamilton` neighborhood
- `handleApiError()` maps `ApiError` instances to JSON responses; catches unhandled errors as 500

**Gemini AI Client (`lib/gemini.ts`):**
- Purpose: Unified interface to Google Generative AI with structured JSON output
- Functions: `callGemini<T>()` (text-only), `callGeminiWithImage<T>()` (multimodal), `callGeminiMarkdown()` (raw text)
- All use `gemini-2.0-flash` model
- Includes aggressive JSON extraction: strips markdown fences, finds JSON boundaries, retries parse
- `PROMPTS` object contains all system prompts (report classification, voice classification, voice-to-report conversion, pattern detection, digest, Hamilton agent, etc.)

**Feed Score (`lib/feedScore.ts`):**
- Purpose: Unified ranking formula for mixed content types (posts, stories, reports)
- Formula: `feedScore = momentum * 0.6 + risk * 0.4`
- Momentum: exponential recency decay (12h half-life) multiplied by log-scaled engagement
- Risk: severity weight (1-4) scaled by corroboration count

**Content Actions (`lib/contentActions.ts`):**
- Purpose: Shared CRUD operations for posts and stories (vote, comment, flag, repost)
- Pattern: Generic functions accepting `collection: 'posts' | 'stories'` parameter
- Each action updates the content document and recomputes feedScore
- Flag auto-hides content at 3 flags

**Rate Limiter (`lib/rateLimiter.ts`):**
- Purpose: In-memory per-user rate limiting
- Pattern: Sliding window with configurable max requests and window duration
- Stored in a `Map<string, number[]>` (resets on server restart)

## Entry Points

**Landing Page (`app/page.tsx`):**
- Location: `app/page.tsx`
- Triggers: Unauthenticated users visiting `/`
- Responsibilities: Scroll-driven landing page with Mapbox 3D map background, phone demo sections, auth CTA

**Feed Page (`app/feed/page.tsx`):**
- Location: `app/feed/page.tsx`
- Triggers: Authenticated users navigating to `/feed`
- Responsibilities: Primary app experience -- map-based dashboard with live issue stream, issue detail panels, scan button, notifications, voice commands

**Map Page (`app/map/page.tsx`):**
- Location: `app/map/page.tsx`
- Triggers: Navigation to `/map`
- Responsibilities: Full-screen 3D map with hotspot visualization, dynamic import of `Map3D` (no SSR)

**Dashboard (`app/dashboard/page.tsx`):**
- Location: `app/dashboard/page.tsx`
- Triggers: Leader role users navigating to `/dashboard`
- Responsibilities: Command center with health gauges, pattern detection, digest, 311 filing workflow, draft review

**Report Page (`app/report/page.tsx`):**
- Location: `app/report/page.tsx`
- Triggers: Navigation to `/report`
- Responsibilities: Camera-based hazard reporting via `SmartReportAgent` component (Gemini Vision analysis)

**API Routes:**
- Location: `app/api/*/route.ts`
- Triggers: Client `fetch()` calls
- Key routes:
  - `app/api/feed/route.ts` -- GET unified feed (voices + reports, scored and paginated)
  - `app/api/voices/route.ts` -- POST create voice (story/post), GET list voices
  - `app/api/posts/route.ts` -- POST create post, GET list posts
  - `app/api/reports/route.ts` -- POST create report, GET list reports
  - `app/api/voices/[id]/vote/route.ts` -- POST upvote voice
  - `app/api/voices/[id]/convert/route.ts` -- POST convert voice to report (via Gemini)
  - `app/api/command/route.ts` -- POST voice command classification
  - `app/api/explain/route.ts` -- POST AI explanation of feed items
  - `app/api/patterns/detect/route.ts` -- POST trigger pattern detection
  - `app/api/digest/route.ts` -- GET weekly digest (Gemini markdown)
  - `app/api/auto-file/route.ts` -- POST initiate 311 filing (leader only)
  - `app/api/311-assist/route.ts` -- POST/GET assisted 311 form generation
  - `app/api/gemini-analyze/route.ts` -- POST image analysis (Hamilton agent)
  - `app/api/hotspots/route.ts` -- GET geohash-bucketed activity hotspots
  - `app/api/tts/route.ts` -- POST text-to-speech via ElevenLabs
  - `app/api/health/route.ts` -- GET neighborhood health score
  - `app/api/users/me/route.ts` -- GET current user profile

**Middleware (`proxy.ts`):**
- Location: `proxy.ts` (project root)
- Triggers: Every request matching the `config.matcher` patterns
- Responsibilities: Auth0 middleware delegation for `/auth/*`, CSP and security header injection for all pages, nonce generation

## Error Handling

**Strategy:** Try-catch at API route level with centralized error mapper

**Patterns:**
- All API routes wrap handler body in `try { ... } catch (error) { return handleApiError(error); }`
- `ApiError` class extends `Error` with `status` field for HTTP status codes
- `handleApiError()` in `lib/auth.ts`: maps `ApiError` to `Response.json({ error }, { status })`, logs unhandled errors, returns 500 for unknowns
- AI call failures are gracefully degraded: fallback to default classification values rather than failing the request
- Rate limit violations return `429` via `rateLimitError()` helper
- Client-side errors are silently caught (`catch { /* ignore */ }`) -- no user-facing error UI in most components

## Cross-Cutting Concerns

**Logging:**
- Server-side `console.log`/`console.error` with `[TAG]` prefixes (e.g., `[GEMINI]`, `[VOICE]`, `[COMMAND]`, `[TTS]`, `[PATTERNS]`)
- No structured logging framework
- Client-side `console.log`/`console.warn` for voice state machine debugging

**Validation:**
- Manual validation at the top of each API route handler (checking required fields, length limits, type checks)
- No schema validation library (no Zod, Joi, etc.)
- Image size validated by estimating base64 byte size (`(length * 3) / 4`)

**Authentication:**
- Auth0 v4 SDK (`@auth0/nextjs-auth0`)
- `Auth0Provider` wraps root layout (`app/layout.tsx`)
- `proxy.ts` middleware protects `/feed/*`, `/map/*`, `/dashboard/*`, `/report/*`, `/auth/*`
- API routes call `requireAuth()` or `requireLeader()` as first operation
- Auto-provisioning: new users get a Firestore `users` document on first API call with default role `resident`

**Location Privacy:**
- All coordinates stored with exact precision in `location.coordinates` (GeoJSON Point)
- Public-facing location uses 6-char geohash (~0.6km precision) via `lib/geohash.ts`
- Approximate labels mapped from 4-char geohash prefixes to Hamilton neighborhood names

**Security Headers:**
- CSP, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy, X-XSS-Protection
- Applied both in `proxy.ts` middleware and `next.config.ts` headers

**Content Moderation:**
- Flag-based: 3 flags auto-hides content (`hidden: true`)
- Hidden content filtered out in feed queries (client-side filter to avoid composite index)

---

*Architecture analysis: 2026-03-07*
