# Codebase Concerns

**Analysis Date:** 2026-03-07

## Tech Debt

**Triplicate Content Collections (voices / posts / stories):**
- Issue: The codebase maintains three parallel Firestore collections (`voices`, `posts`, `stories`) with nearly identical schemas and duplicate CRUD route logic. The `voices` collection stores both posts and stories (distinguished by a `type` field), while `posts` and `stories` are separate collections with their own identical route handlers. The feed API (`app/api/feed/route.ts`) only queries the `voices` collection, meaning items created via `/api/posts` or `/api/stories` never appear in the feed.
- Files:
  - `app/api/voices/route.ts` (writes to `voices` collection, supports `type: 'post' | 'story'`)
  - `app/api/posts/route.ts` (writes to `posts` collection, duplicates voice creation logic)
  - `app/api/stories/route.ts` (writes to `stories` collection, duplicates voice creation logic)
  - `app/api/feed/route.ts` (lines 21-47 only query `voices`, never `posts` or `stories`)
  - `app/api/posts/[id]/vote/route.ts` uses `contentActions.ts` (writes to `content_votes`)
  - `app/api/voices/[id]/vote/route.ts` uses inline logic (writes to `voice_votes`)
- Impact: Posts and stories created via the dedicated routes are invisible in the feed. Vote/comment/repost metadata is split across different sub-collections (`voice_votes` vs `content_votes`, `voice_comments` vs `content_comments`). This creates data inconsistency and confusing behavior.
- Fix approach: Consolidate on a single `content` or `voices` collection. Remove the separate `posts` and `stories` routes and collections, or migrate `feed/route.ts` to query all three. Unify the vote/comment/repost sub-collections.

**In-Memory Rate Limiter Loses State on Restart:**
- Issue: Rate limiting uses an in-memory `Map` that resets on every server restart or new serverless function instance. It also never prunes old entries, causing unbounded memory growth in long-running processes.
- Files: `lib/rateLimiter.ts`
- Impact: Rate limits are ineffective in serverless/multi-instance deployments. No protection against coordinated abuse. Memory leak in long-running dev server.
- Fix approach: Move rate limiting to a persistent store (Firestore or Redis). Add a periodic cleanup or TTL-based eviction. Alternatively, use Vercel's `@vercel/edge-rate-limit` or similar.

**Missing Rate Limit Keys for posts and stories:**
- Issue: The rate limiter config defines keys for `voices:create` and `reports:create`, but the posts route uses `posts:create` and stories uses `stories:create` -- neither of which exist in the `limits` map in `lib/rateLimiter.ts`. The `checkRateLimit` function returns `true` (allow) for unknown keys (line 16).
- Files: `lib/rateLimiter.ts` (lines 3-12), `app/api/posts/route.ts` (line 20), `app/api/stories/route.ts` (line 19)
- Impact: Posts and stories have no rate limiting at all, allowing unlimited creation.
- Fix approach: Add `'posts:create'` and `'stories:create'` to the `limits` map, or consolidate on a single content creation key.

**Two Firestore Writes for feedScore Updates (Non-Atomic):**
- Issue: Every vote, comment, and repost operation makes two separate `update()` calls to the content document: first to increment the counter, then to recalculate and set the `feedScore`. These are not batched or transactional.
- Files: `lib/contentActions.ts` (lines 33-40, 68-75, 159-166), `app/api/voices/[id]/vote/route.ts` (lines 41-49), `app/api/reports/[id]/vote/route.ts` (lines 25-32)
- Impact: Race conditions under concurrent writes. The feedScore calculation reads stale data (the local spread object, not the actual DB state after increment). Under load, feedScores can drift from their true values.
- Fix approach: Use a Firestore transaction to atomically read, compute, and write both fields. Or use a Firestore `batch()` to combine both updates. Or compute feedScore from the incremented value directly.

**Simulated 311 Auto-Filing with setTimeout:**
- Issue: The auto-file endpoint uses `setTimeout` (5 seconds) to simulate a Playwright-based 311 filing agent. This runs after the HTTP response is sent, meaning it can silently fail, has no retry logic, and the closure captures stale references.
- Files: `app/api/auto-file/route.ts` (lines 44-74)
- Impact: In serverless environments, the function may terminate before the setTimeout callback executes. Failures are silently swallowed. No mechanism to retry or track failed filings.
- Fix approach: Replace with a proper job queue (e.g., Cloud Tasks, BullMQ) or at minimum use a Firestore-triggered Cloud Function. For demo purposes, mark it clearly as mock.

**Pervasive `as any` Type Casts:**
- Issue: 18 occurrences of `as any` across the codebase, primarily around `computeFeedScore()` calls and Web Speech API usage. The `computeFeedScore` function expects a `ScoringItem` interface but is always called with `as any`.
- Files: `lib/contentActions.ts`, `app/api/voices/[id]/vote/route.ts`, `app/api/reports/[id]/vote/route.ts`, `hooks/useAgentVoice.ts`, `hooks/useCameraVoice.ts`, `components/VoiceListener.tsx`
- Impact: Suppresses type errors. If the Firestore document shape diverges from `ScoringItem`, feedScore computation silently produces incorrect results. No compiler safety net.
- Fix approach: Define proper TypeScript interfaces for Firestore document shapes and align them with `ScoringItem`. Use type narrowing or adapter functions instead of `as any`.

**No Cleanup of Expired Stories:**
- Issue: Expired stories (24h TTL) are only filtered client-side at read time. They are never deleted from Firestore. The `stories` collection and stories within the `voices` collection grow indefinitely.
- Files: `app/api/stories/route.ts` (lines 124-136 - client-side filter), `app/api/feed/route.ts` (lines 41-45 - client-side filter)
- Impact: Growing storage costs. Increasingly slow queries as expired documents accumulate. No server-side enforcement of the 24h TTL.
- Fix approach: Add a Cloud Function triggered on a schedule (e.g., daily) to delete expired stories. Or use Firestore TTL policies if available.

## Known Bugs

**Report Votes Allow Unlimited Voting (No Dedup Check):**
- Symptoms: A user can vote on the same report multiple times because `app/api/reports/[id]/vote/route.ts` does not check for an existing vote before incrementing.
- Files: `app/api/reports/[id]/vote/route.ts` (lines 7-38)
- Trigger: Call `POST /api/reports/{id}/vote` multiple times for the same user.
- Workaround: The voices vote route (`app/api/voices/[id]/vote/route.ts`) correctly checks `voice_votes` for duplicates, but the report vote route skips this entirely.

**Feed Excludes Posts and Stories Collections:**
- Symptoms: Content created via `/api/posts` or `/api/stories` endpoints never appears in the Pulse Feed.
- Files: `app/api/feed/route.ts` (queries only `voices` and `reports` collections)
- Trigger: Create a post via `POST /api/posts` then load the feed.
- Workaround: Use the `/api/voices` endpoint instead, which writes to the collection the feed actually queries.

**Inconsistent Document ID Field Names:**
- Symptoms: Some API responses return `_id` (e.g., `app/api/reports/route.ts` line 137, `app/api/users/me/route.ts` line 15), while others return `id` (e.g., `app/api/posts/route.ts` line 121, `app/api/feed/route.ts`). Client code must handle both.
- Files: `app/api/reports/route.ts`, `app/api/reports/[id]/route.ts`, `app/api/users/me/route.ts`, `app/api/voices/route.ts`
- Trigger: Compare JSON responses across different API endpoints.
- Workaround: None -- client code must handle both `_id` and `id`.

## Security Considerations

**XSS via dangerouslySetInnerHTML in Digest View:**
- Risk: The `DigestView` component renders AI-generated markdown as raw HTML via `dangerouslySetInnerHTML` using a custom `parseMarkdown()` function that performs no sanitization or escaping. If the AI model returns HTML/script tags, they execute in the user's browser.
- Files: `components/DigestView.tsx` (line 215), `parseMarkdown` function (lines 8-60)
- Current mitigation: The content comes from Gemini AI, not direct user input. CSP headers include `'unsafe-inline'` for scripts which weakens protection.
- Recommendations: Use a proper markdown library (e.g., `react-markdown`) or sanitize output with DOMPurify before rendering. Remove `'unsafe-inline'` from script-src CSP directive in production.

**innerHTML Usage in Map Components:**
- Risk: `FluidMap.tsx` and `Map3D.tsx` set `innerHTML` on DOM elements using data that may include user-generated content (labels, captions).
- Files: `components/FluidMap.tsx` (lines 53, 90), `components/Map3D.tsx` (line 148)
- Current mitigation: Map marker content appears to come from hardcoded labels, but the pattern is fragile.
- Recommendations: Use DOM API (`createElement`, `textContent`) instead of `innerHTML`. Or sanitize any interpolated data.

**CSP Allows unsafe-inline for Scripts:**
- Risk: The Content Security Policy in `proxy.ts` includes `'unsafe-inline'` for `script-src`, which significantly weakens XSS protection by allowing any inline script to execute.
- Files: `proxy.ts` (line 14)
- Current mitigation: A nonce is generated but the CSP directive uses `'unsafe-inline'` instead of `'nonce-{value}'`, making the nonce ineffective.
- Recommendations: Replace `'unsafe-inline'` with `'nonce-${nonce}'` in the CSP `script-src` directive. Update application code to use the nonce for any necessary inline scripts.

**Base64 Images Stored in Firestore (No Validation):**
- Risk: Users can upload arbitrary base64 data (up to 1MB) that is stored directly in Firestore documents and served back in API responses. The only validation checks the base64 character set, not the actual image content. Malformed or malicious data (e.g., SVG with embedded scripts) could be stored and served.
- Files: `app/api/reports/route.ts` (lines 63-69), `app/api/voices/route.ts` (lines 33-43), `app/api/posts/route.ts` (lines 29-43)
- Current mitigation: 1MB size limit. Base64 character validation in `lib/gemini.ts` for AI processing only.
- Recommendations: Validate MIME type by inspecting magic bytes. Move image storage to Cloud Storage with Content-Disposition headers. Consider virus/content scanning.

**No Authorization Check on Content Actions:**
- Risk: Any authenticated user can vote, flag, comment, or repost on any content regardless of neighborhood. There is no check that the user belongs to the same neighborhood as the content they are interacting with.
- Files: `lib/contentActions.ts`, `app/api/voices/[id]/vote/route.ts`, `app/api/voices/[id]/flag/route.ts`
- Current mitigation: Auth0 authentication ensures only logged-in users can act.
- Recommendations: Add neighborhood-scoped authorization if cross-neighborhood interaction is not intended.

**User Role Escalation Not Prevented:**
- Risk: The `PATCH /api/users/me` endpoint allows updating `neighborhood`, `displayName`, and `settings` but does not explicitly block `role` from being set. While the current allowlist approach (`if (body.role)...` is absent) appears safe, the `settings` field accepts any object without validation.
- Files: `app/api/users/me/route.ts` (lines 21-39)
- Current mitigation: The allowlist approach only copies `neighborhood`, `displayName`, and `settings`.
- Recommendations: Add explicit schema validation for the `settings` object. Add a test to verify `role` cannot be changed via this endpoint.

## Performance Bottlenecks

**Feed Endpoint Performs Client-Side Sorting and Pagination:**
- Problem: The feed endpoint fetches up to `limit` items from both `voices` and `reports` collections, then sorts them in JavaScript by `feedScore` and applies cursor-based pagination client-side. For large neighborhoods, this pulls more data than needed.
- Files: `app/api/feed/route.ts` (lines 85-163)
- Cause: Firestore cannot do cross-collection queries or sort by a computed score across collections. The `feedScore` is pre-computed but stored in separate collections.
- Improvement path: Pre-compute feedScore at write time (already done) and query with `orderBy('feedScore', 'desc')` per collection. Use Firestore composite indexes. Consider a denormalized `feed_items` collection that unifies all content types.

**N+1 User Lookups in Feed:**
- Problem: The feed endpoint collects all unique user IDs then performs batch lookups in chunks of 30 (Firestore `in` query limit). For feeds with many unique authors, this adds sequential roundtrips.
- Files: `app/api/feed/route.ts` (lines 64-78)
- Cause: User display names are not denormalized onto content documents.
- Improvement path: Denormalize `displayName` onto voice/report documents at creation time. Accept eventual consistency for name changes.

**Hotspots Endpoint Fetches All Documents in Time Window:**
- Problem: The hotspots endpoint fetches ALL voices and reports in the time window without limits, then aggregates them client-side into geohash buckets.
- Files: `app/api/hotspots/route.ts` (lines 15-27)
- Cause: Firestore lacks server-side aggregation by geohash prefix.
- Improvement path: Add `.limit(500)` or similar cap. Consider pre-aggregating hotspot data on write. Use Firestore count queries if only counts are needed.

**Base64 Images Inflate Firestore Document Size:**
- Problem: Images are stored as base64 strings directly in Firestore documents (up to 1MB). This inflates document reads, network transfer, and Firestore costs. Every feed fetch transfers all image data even before rendering.
- Files: `app/api/reports/route.ts` (line 68: `imageUrl = imageBase64`), `app/api/voices/route.ts` (line 41)
- Cause: No Cloud Storage integration was implemented.
- Improvement path: Store images in Firebase Cloud Storage or a CDN. Store only the URL reference in Firestore documents.

**Pattern Detection Sends Full Data to Gemini:**
- Problem: Pattern detection serializes up to 100 reports + 100 voices as JSON and sends the entire payload to the Gemini API in a single prompt.
- Files: `app/api/patterns/detect/route.ts` (lines 74-96)
- Cause: Gemini needs context to identify patterns. No incremental/streaming approach.
- Improvement path: Pre-aggregate data server-side (group by category, time window, geohash) before sending to Gemini. Send summaries rather than raw documents.

## Fragile Areas

**Voice Command Routing (Multi-Layer Fallback):**
- Files: `app/api/command/route.ts`, `components/VoiceListener.tsx`
- Why fragile: Voice commands go through three layers: (1) Web Speech API transcript -> (2) Gemini classification -> (3) Post-Gemini overrides and keyword fallback. The override on lines 164-175 patches Gemini misclassifications for "report" keywords. The fallback function (lines 17-137) duplicates the Gemini prompt's intent mapping. Changes to navigation routes require updates in three places.
- Safe modification: When adding a new voice command, update: the Gemini prompt in `lib/gemini.ts` (PROMPTS.voiceCommand), the keyword fallback in `app/api/command/route.ts` (applyKeywordFallback), and the client-side action handler in `components/VoiceListener.tsx`.
- Test coverage: None. No automated tests for voice command routing.

**Gemini JSON Parsing:**
- Files: `lib/gemini.ts` (lines 9-31, 104-173)
- Why fragile: All AI calls rely on Gemini returning valid JSON. The parsing has two fallback levels (raw parse, then strip-markdown-and-retry, then extract-json-boundaries). If Gemini changes its output format or adds preamble text, parsing may silently extract the wrong JSON object.
- Safe modification: Always test with the actual Gemini model. The `extractJsonFromResponse` function (lines 68-102) uses heuristic boundary detection that can fail on nested structures.
- Test coverage: None.

**Feed Score Computation Chain:**
- Files: `lib/feedScore.ts`, `lib/contentActions.ts`, `app/api/feed/route.ts`
- Why fragile: Feed scores are pre-computed at write time AND re-computed at read time. The write-time score uses the document's own data; the read-time score in the feed endpoint re-computes from the fetched data. If the formula changes, old documents have stale scores until they are updated.
- Safe modification: Any change to the scoring formula requires either a migration script or acceptance that old content scores will be stale until next interaction.
- Test coverage: None.

## Scaling Limits

**Firestore In-Query Limit (30 items):**
- Current capacity: User batch lookups in the feed endpoint chunk IDs into groups of 30.
- Limit: Neighborhoods with >30 unique content authors in a single feed page trigger multiple sequential Firestore queries.
- Scaling path: Denormalize display names onto content documents.

**In-Memory Rate Limiter:**
- Current capacity: Works for single-instance development.
- Limit: Completely ineffective with >1 server instance. Memory grows unbounded.
- Scaling path: Move to Redis or Firestore-based rate limiting.

**Base64 Image Storage:**
- Current capacity: Works for small communities (<100 images).
- Limit: Firestore has a 1MB document size limit. Feed queries transfer all image data. Network bandwidth becomes bottleneck with image-heavy feeds.
- Scaling path: Migrate to Cloud Storage with signed URLs.

## Dependencies at Risk

**No Test Framework:**
- Risk: Zero automated tests exist. No test runner is configured. Every code change relies entirely on manual testing.
- Impact: Regressions go undetected. Refactoring is high-risk. The triplicate collection issue likely persists because there are no integration tests to verify feed completeness.
- Migration plan: Add Vitest (already compatible with the Next.js/TypeScript stack). Start with API route tests for critical paths (feed, votes, reports).

**html2canvas + jsPDF:**
- Risk: `html2canvas` (`^1.4.1`) is effectively unmaintained (last release 2023). It has known issues with CSS features like `backdrop-filter` and `glassmorphism` effects used throughout this app.
- Impact: PDF generation for 311 reports may render incorrectly or fail silently.
- Migration plan: Consider `@react-pdf/renderer` for React-native PDF generation, or server-side PDF generation with Puppeteer.

## Missing Critical Features

**No Story Expiry Enforcement:**
- Problem: Stories have a 24h `expiresAt` field but no server-side cleanup. Expired stories persist in Firestore indefinitely, only filtered at read time.
- Blocks: Accurate storage cost projections. Correct story counts in neighborhood stats.

**No Undo for Votes/Flags:**
- Problem: Votes and flags are write-once with no undo mechanism. A user who accidentally upvotes or flags content cannot reverse it.
- Blocks: User trust in the flagging system. Content that is incorrectly flagged (3 flags = auto-hide) has no self-service recovery path.

**No Content Moderation Beyond Auto-Hide:**
- Problem: The only moderation is auto-hide at 3 flags. There is no admin review queue, no appeal mechanism, and no ability for leaders to un-hide content.
- Blocks: Handling of false-positive flags. Abuse of the flagging system to suppress legitimate content.

## Test Coverage Gaps

**Entire Codebase - Zero Tests:**
- What's not tested: Every API route, every library function, every component, every hook.
- Files: All files under `app/api/`, `lib/`, `components/`, `hooks/`
- Risk: Any change can introduce regressions without detection. The data collection split (voices vs posts vs stories) is likely a bug that would have been caught by a basic integration test.
- Priority: High -- this is the most impactful concern. Start with: (1) feed endpoint correctness, (2) vote dedup logic, (3) feedScore computation, (4) rate limiter behavior.

---

*Concerns audit: 2026-03-07*
