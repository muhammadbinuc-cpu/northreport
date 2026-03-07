# Codebase Structure

**Analysis Date:** 2026-03-07

## Directory Layout

```
northreport/
├── app/                        # Next.js App Router (pages + API routes)
│   ├── api/                    # API route handlers (RESTful)
│   │   ├── 311-assist/         # Assisted 311 form generation
│   │   ├── agent-command/      # Agent voice command processing
│   │   ├── auto-file/          # Automated 311 filing (leader-only)
│   │   │   └── [id]/status/    # Filing status polling
│   │   ├── camera-command/     # Camera-specific voice commands
│   │   ├── command/            # Global voice command classification
│   │   ├── digest/             # Weekly safety digest (Gemini markdown)
│   │   ├── educate/            # Image education (Gemini Vision)
│   │   ├── educate-text/       # Text-only education
│   │   ├── explain/            # AI explanation of feed items
│   │   ├── feed/               # Unified feed (voices + reports, ranked)
│   │   ├── gemini-analyze/     # Hamilton 311 agent image analysis
│   │   ├── generate-description/ # AI description generation
│   │   ├── health/             # Neighborhood health score
│   │   ├── hotspots/           # Geohash-bucketed activity hotspots
│   │   ├── patterns/           # Pattern listing
│   │   │   └── detect/         # Pattern detection trigger (Gemini)
│   │   ├── posts/              # Post CRUD
│   │   │   └── [id]/           # Single post operations
│   │   │       ├── comment/    # Add comment
│   │   │       ├── comments/   # List comments
│   │   │       ├── convert/    # Convert to report
│   │   │       ├── flag/       # Flag content
│   │   │       ├── repost/     # Repost
│   │   │       └── vote/       # Upvote
│   │   ├── reports/            # Report CRUD
│   │   │   └── [id]/           # Single report operations
│   │   │       └── vote/       # Upvote report
│   │   ├── stories/            # Story CRUD (same sub-routes as posts)
│   │   │   └── [id]/           # Single story operations
│   │   ├── tts/                # Text-to-speech (ElevenLabs proxy)
│   │   ├── users/me/           # Current user profile
│   │   ├── voice-confirm/      # Voice confirmation handler
│   │   └── voices/             # Voice CRUD (legacy/unified)
│   │       └── [id]/           # Single voice operations
│   ├── dashboard/              # Leader dashboard pages
│   │   ├── auto-file/          # 311 filing interface
│   │   ├── digest/             # Weekly digest viewer
│   │   ├── issue/[id]/         # Individual issue detail
│   │   └── patterns/           # Pattern detection page
│   ├── feed/                   # Main feed page
│   ├── map/                    # City map page
│   ├── mock-311/               # Mock 311 portal (development)
│   ├── report/                 # Report creation page (camera agent)
│   ├── globals.css             # Global styles (Tailwind + CSS custom properties)
│   ├── layout.tsx              # Root layout (Auth0Provider, fonts)
│   ├── page.tsx                # Landing page (scroll-driven, Mapbox)
│   └── favicon.ico
├── components/                 # Shared React components
│   ├── landing/                # Landing page visual components
│   │   ├── index.ts            # Barrel file with all exports
│   │   ├── animations.css      # Landing-specific CSS animations
│   │   ├── SafePulseLogo.tsx   # Logo component
│   │   ├── PhoneFrame.tsx      # Phone mockup frame
│   │   ├── PhoneScreens.tsx    # Demo screen content
│   │   ├── HeroGlobe.tsx       # Cobe globe animation
│   │   ├── CityScene.tsx       # City visualization
│   │   ├── CitySkyline.tsx     # Skyline background
│   │   ├── MapGrid.tsx         # Map grid overlay
│   │   ├── MapScene.tsx        # Map scene component
│   │   ├── SceneMarkers.tsx    # Map markers
│   │   └── ...                 # Other landing sections
│   ├── report-journey/         # Report lifecycle visualization
│   │   ├── index.ts            # Barrel file
│   │   ├── ReportJourney.tsx   # Journey tracker
│   │   ├── EnvelopeMarker.tsx  # Map marker for filed reports
│   │   └── MilestonePopup.tsx  # Progress milestone popup
│   ├── AppShell.tsx            # App layout shell (SideNav + VoiceListener + page transitions)
│   ├── SideNav.tsx             # Left-rail navigation (fixed, 72px width)
│   ├── TopBar.tsx              # Top bar with title, neighborhood selector, search
│   ├── PulseFeed.tsx           # Feed list component (filter tabs, cards, pagination)
│   ├── FeedCard.tsx            # Individual feed item card
│   ├── DetailDrawer.tsx        # Slide-in detail panel
│   ├── AskSafePulse.tsx        # AI explanation modal
│   ├── VoiceListener.tsx       # Wake-word detection + voice command processing
│   ├── VoiceOverlay.tsx        # Voice UI overlay (transcript, status)
│   ├── FluidMap.tsx            # Mapbox GL map with issue markers
│   ├── Map3D.tsx               # 3D map component (dynamic import, no SSR)
│   ├── AmbientMap.tsx          # Background ambient map
│   ├── CaptureCamera.tsx       # Camera capture component
│   ├── GeminiScanner.tsx       # Gemini Vision scanner overlay
│   ├── SmartReportAgent.tsx    # Full camera-to-311 agent workflow
│   ├── ContentComposer.tsx     # Post/story creation form
│   ├── ReportForm.tsx          # Manual report form
│   ├── ScanButton.tsx          # Floating scan action button
│   ├── HealthGauge.tsx         # Circular health score gauge
│   ├── PatternCard.tsx         # Pattern display card
│   ├── SeverityChip.tsx        # Severity badge component
│   ├── ConfirmChip.tsx         # Confirmation action chip
│   ├── DigestView.tsx          # Weekly digest markdown renderer
│   ├── IssueDetailPanel.tsx    # Full issue detail with comments
│   ├── NewsTicker.tsx          # Bottom news ticker bar
│   ├── NotificationQueue.tsx   # Social notification queue
│   ├── ProblemStream.tsx       # Problem visualization stream
│   ├── AudioPlayer.tsx         # Audio playback component
│   ├── AutoFileViewer.tsx      # 311 filing status viewer
│   ├── Form311Document.tsx     # 311 form document display
│   ├── Form311Preview.tsx      # 311 form preview
│   └── ReviewDraftDrawer.tsx   # Draft review slide-in drawer
├── hooks/                      # Custom React hooks
│   ├── useLiveIssues.ts        # API polling for live issues (maps API data to UI format)
│   ├── useLivingCity.tsx       # City simulation (new comments, duplicate reports)
│   ├── useAgentVoice.ts        # Agent voice interaction hook
│   └── useCameraVoice.ts       # Camera-specific voice hook
├── lib/                        # Shared utilities and configuration
│   ├── auth.ts                 # Auth helpers (requireAuth, requireLeader, handleApiError, ApiError)
│   ├── auth0.ts                # Auth0 client singleton
│   ├── firebase.ts             # Firebase Admin SDK init (getDb, generateId, createBatch, FieldValue)
│   ├── gemini.ts               # Gemini AI client (callGemini, callGeminiWithImage, PROMPTS)
│   ├── feedScore.ts            # Feed ranking algorithm (momentum + risk scoring)
│   ├── geohash.ts              # Location privacy (6-char geohash encoding, approx labels)
│   ├── rateLimiter.ts          # In-memory rate limiter (sliding window per user)
│   ├── types.ts                # TypeScript interfaces (Post, Story, ContentItem, FeedItemData)
│   ├── constants.ts            # App constants (severities, categories, neighborhoods, Hamilton center)
│   ├── contentActions.ts       # Shared content operations (vote, comment, flag, repost)
│   ├── mergePatterns.ts        # Pattern deduplication/merging by category
│   ├── hamilton311Config.ts    # Hamilton 311 categories, form fields, submission steps
│   ├── mockIssues.ts           # Mock issue types and generators (used by feed page)
│   ├── voiceContext.tsx        # VoiceControlContext (pause/resume voice listener)
│   ├── voicePatterns.ts        # Voice pattern matching utilities
│   ├── tts.ts                  # Client-side TTS (ElevenLabs via /api/tts with browser fallback)
│   └── elevenlabs.ts           # Server-side ElevenLabs TTS helper
├── scripts/                    # Development scripts
│   └── seed.ts                 # Firestore seed data (run via `npx tsx scripts/seed.ts`)
├── public/                     # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── proxy.ts                    # Next.js 16 middleware (Auth0 + CSP + security headers)
├── next.config.ts              # Next.js configuration (security headers)
├── tsconfig.json               # TypeScript config (strict, @/* path alias)
├── postcss.config.mjs          # PostCSS configuration
├── eslint.config.mjs           # ESLint configuration
├── firebase.json               # Firebase project configuration
├── firestore.indexes.json      # Firestore composite index definitions
├── package.json                # Dependencies and scripts
├── CLAUDE.md                   # Claude Code instructions
└── README.md                   # Project README
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js App Router -- all pages and API routes
- Contains: Page components (`page.tsx`), API route handlers (`route.ts`), root layout, global CSS
- Key files: `app/layout.tsx` (root layout with Auth0Provider), `app/page.tsx` (landing page), `app/globals.css`

**`app/api/`:**
- Purpose: Server-side API route handlers
- Contains: RESTful route files, each exporting `GET`/`POST`/etc. async functions
- Pattern: Each route directory contains a single `route.ts` file
- Sub-resources use `[id]` dynamic segments (e.g., `app/api/voices/[id]/vote/route.ts`)

**`app/dashboard/`:**
- Purpose: Leader-only dashboard pages
- Contains: Command center, pattern detection, digest viewer, auto-file, issue detail
- Access: Protected by `requireLeader()` in API routes (client routes visible but API calls fail for non-leaders)

**`components/`:**
- Purpose: Reusable React components shared across pages
- Contains: UI components, each as a single `.tsx` file
- Key files: `AppShell.tsx` (main app wrapper), `PulseFeed.tsx` (feed rendering), `VoiceListener.tsx` (voice commands), `SmartReportAgent.tsx` (camera reporting)

**`components/landing/`:**
- Purpose: Landing page visual components (scroll-driven sections, phone mockups, globe)
- Contains: Cinematic scrollytelling components
- Key files: `index.ts` (barrel exports), `PhoneFrame.tsx`, `PhoneScreens.tsx`, `SafePulseLogo.tsx`

**`components/report-journey/`:**
- Purpose: Report lifecycle visualization components
- Contains: Journey tracker, map markers, milestone popups
- Key files: `index.ts` (barrel exports), `ReportJourney.tsx`

**`hooks/`:**
- Purpose: Custom React hooks for complex client-side logic
- Contains: Data fetching hooks, simulation hooks, voice interaction hooks
- Key files: `useLiveIssues.ts` (feed polling), `useLivingCity.tsx` (simulation events)

**`lib/`:**
- Purpose: Shared utilities, configuration, type definitions
- Contains: Server-side clients (Firebase, Gemini, Auth0), algorithms (feed scoring, geohashing), configuration (Hamilton 311, constants), and one React context
- Key files: `auth.ts`, `firebase.ts`, `gemini.ts`, `types.ts`, `feedScore.ts`, `rateLimiter.ts`

**`scripts/`:**
- Purpose: Development and maintenance scripts
- Contains: Database seeding script
- Key files: `seed.ts` (run via `npx tsx scripts/seed.ts`)

**`public/`:**
- Purpose: Static assets served at `/`
- Contains: SVG icons (default Next.js assets)

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout -- Auth0Provider, font loading, metadata
- `app/page.tsx`: Landing page (unauthenticated users)
- `app/feed/page.tsx`: Main app page (authenticated users)
- `proxy.ts`: Middleware entry point (auth + security)

**Configuration:**
- `tsconfig.json`: TypeScript config (`@/*` path alias to project root)
- `next.config.ts`: Next.js config (security headers)
- `postcss.config.mjs`: PostCSS/Tailwind config
- `eslint.config.mjs`: ESLint config
- `firebase.json`: Firebase project config
- `firestore.indexes.json`: Firestore indexes
- `.env` (exists, never read): Environment variables

**Core Logic:**
- `lib/gemini.ts`: All AI integration (prompts, API calls, JSON extraction)
- `lib/auth.ts`: Authentication/authorization helpers
- `lib/firebase.ts`: Database client initialization
- `lib/feedScore.ts`: Feed ranking algorithm
- `lib/contentActions.ts`: Shared vote/comment/flag/repost logic
- `lib/mergePatterns.ts`: Pattern deduplication algorithm
- `lib/hamilton311Config.ts`: 311 filing category configuration

**Type Definitions:**
- `lib/types.ts`: Core data types (`Post`, `Story`, `ContentItem`, `FeedItemData`)
- `lib/mockIssues.ts`: `MockIssue` and `MockComment` interfaces
- `lib/mergePatterns.ts`: `Pattern` interface
- `lib/hamilton311Config.ts`: `Category311`, `FormField`, `GeneratedForm` interfaces

**UI Shell:**
- `components/AppShell.tsx`: Main app wrapper (SideNav + VoiceListener + Framer Motion page transitions)
- `components/SideNav.tsx`: Fixed left-rail navigation (72px wide)
- `components/TopBar.tsx`: Top bar with title and neighborhood selector

## Naming Conventions

**Files:**
- Components: PascalCase single file (e.g., `FeedCard.tsx`, `PulseFeed.tsx`, `SmartReportAgent.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useLiveIssues.ts`, `useLivingCity.tsx`)
- Library modules: camelCase (e.g., `feedScore.ts`, `rateLimiter.ts`, `contentActions.ts`)
- API routes: always `route.ts` inside descriptive directory
- Config files: standard names (`tsconfig.json`, `next.config.ts`)

**Directories:**
- API routes: kebab-case (e.g., `auto-file/`, `gemini-analyze/`, `agent-command/`)
- Component groups: kebab-case (e.g., `landing/`, `report-journey/`)
- Dynamic segments: `[param]` (e.g., `[id]/`)
- Top-level: lowercase single words (`app/`, `lib/`, `hooks/`, `components/`, `scripts/`, `public/`)

**Exports:**
- Components: default export, PascalCase function name matching file name
- Hooks: named export, camelCase (e.g., `export function useLiveIssues()`)
- Library functions: named exports, camelCase (e.g., `export function computeFeedScore()`)
- Types/interfaces: named exports, PascalCase (e.g., `export interface FeedItemData`)

## Where to Add New Code

**New Page:**
- Create directory under `app/` following existing naming conventions
- Add `page.tsx` with `'use client'` directive
- Wrap content in `<AppShell>` for consistent navigation
- Use `<TopBar>` for header with neighborhood selector
- Protected routes: middleware in `proxy.ts` already covers `/feed/*`, `/map/*`, `/dashboard/*`, `/report/*`
- For new top-level routes requiring auth, add to matcher in `proxy.ts`

**New API Route:**
- Create directory under `app/api/` with kebab-case name
- Add `route.ts` exporting `GET`, `POST`, etc. async functions
- Start with `const auth = await requireAuth()` (or `requireLeader()`)
- Add rate limiting: `if (!checkRateLimit(auth.userId, 'action-name')) return rateLimitError();`
- Add rate limit config to `lib/rateLimiter.ts` `limits` object
- Wrap in try-catch: `catch (error) { return handleApiError(error); }`
- Return `Response.json()` for all responses

**New Component:**
- Add `.tsx` file to `components/` with PascalCase name
- Use `'use client'` directive at top
- Import from `@/lib/*` for shared utilities, `@/components/*` for other components
- For component groups, create a subdirectory with `index.ts` barrel file

**New Hook:**
- Add `.ts` (or `.tsx` if using JSX) file to `hooks/` with `use` prefix
- Export as named export
- Follow existing patterns: `useState`/`useEffect`/`useCallback`, fetch from `/api/*`

**New Library Module:**
- Add `.ts` file to `lib/` with camelCase name
- Export functions as named exports
- For types shared across files, add to `lib/types.ts` or co-locate with the module

**New AI Prompt:**
- Add to `PROMPTS` object in `lib/gemini.ts`
- Follow existing format: system instruction string with OUTPUT SCHEMA in JSON
- Use `callGemini<T>()` for text, `callGeminiWithImage<T>()` for multimodal
- Always define the response interface at the call site

**New Firestore Collection:**
- No schema definition required (Firestore is schemaless)
- Add collection name to seed script's cleanup list in `scripts/seed.ts`
- Add sample documents to seed function if needed
- Update `firestore.indexes.json` if composite queries are needed
- Use `generateId(collectionName)` from `lib/firebase.ts` for new document IDs

## Special Directories

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes (by `next dev` and `next build`)
- Committed: No (gitignored)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (gitignored)

**`.planning/`:**
- Purpose: GSD planning and analysis documents
- Generated: By planning tools
- Committed: Yes

**`.claude/`:**
- Purpose: Claude Code local settings
- Contains: `settings.local.json`
- Committed: Varies

**`public/`:**
- Purpose: Static files served at root URL
- Generated: No
- Committed: Yes
- Note: Only contains default Next.js SVG icons -- no app-specific static assets

---

*Structure analysis: 2026-03-07*
