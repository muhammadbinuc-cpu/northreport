# External Integrations

**Analysis Date:** 2026-03-07

## APIs & External Services

### Google Gemini AI (Primary AI Engine)
- **Purpose:** Content classification, hazard analysis, pattern detection, voice command routing, report generation, educational content, weekly digest generation
- **SDK:** `@google/generative-ai` `^0.24.1`
- **Model:** `gemini-2.0-flash` (hardcoded in `lib/gemini.ts`)
- **Auth:** `GEMINI_API_KEY` env var
- **Client:** `lib/gemini.ts` - Singleton `GoogleGenerativeAI` instance
- **Functions:**
  - `callGemini<T>(prompt, systemInstruction)` - Text-only, returns parsed JSON
  - `callGeminiMarkdown(prompt, systemInstruction)` - Text-only, returns raw markdown
  - `callGeminiWithImage<T>(prompt, imageBase64, systemInstruction)` - Multimodal (text + image), returns parsed JSON
- **JSON Parsing:** Two-pass strategy: first raw parse, then strip markdown fences and re-parse. `callGeminiWithImage` adds aggressive JSON extraction (`extractJsonFromResponse`)
- **Prompt Templates:** 12 pre-defined prompts in `PROMPTS` object (`lib/gemini.ts` lines 176-478):
  - `reportClassification` - Classify hazard reports by category/severity
  - `voiceClassification` - Classify voice post content
  - `voiceToReport` - Convert community voice into structured report
  - `explain` - Explain feed items with context
  - `voiceCommand` - Route spoken commands to app actions
  - `patternDetection` - Detect clusters/trends/anomalies in neighborhood data
  - `digest` - Generate weekly safety digest (markdown)
  - `hamiltonAgent` - City of Hamilton 311 intake agent (image analysis)
  - `agentIntent` - Classify voice commands during report flow
  - `educate` - Educational analysis of photographed subjects
  - `cameraCommand` - Classify voice commands in camera UI
  - `refineReport` - Rewrite report descriptions with new details
  - `agentConversation` - Conversational agent for report Q&A
- **API Routes Using Gemini:**
  - `app/api/gemini-analyze/route.ts` - Image analysis with `hamiltonAgent` prompt
  - `app/api/311-assist/route.ts` - 311 form generation
  - `app/api/explain/route.ts` - Feed item explanation
  - `app/api/command/route.ts` - Voice command routing
  - `app/api/educate/route.ts` - Image education
  - `app/api/educate-text/route.ts` - Text-based education
  - `app/api/patterns/detect/route.ts` - Pattern detection
  - `app/api/digest/route.ts` - Weekly digest
  - `app/api/agent-command/route.ts` - Agent intent classification
  - `app/api/camera-command/route.ts` - Camera voice commands
  - `app/api/generate-description/route.ts` - Report description generation

### ElevenLabs (Text-to-Speech)
- **Purpose:** High-quality voice responses for the AI agent
- **SDK:** Direct REST API via `fetch` (no SDK package)
- **Model:** `eleven_turbo_v2_5`
- **Auth:** `ELEVENLABS_API_KEY` env var, `ELEVENLABS_VOICE_ID` env var (default: `EXAVITQu4vr4xnSDxMaL`)
- **Server Client:** `lib/elevenlabs.ts` - `generateTTS(text)` returns `ArrayBuffer | null`
- **Client Wrapper:** `lib/tts.ts` - `speak(text)` calls `/api/tts`, plays audio, falls back to browser `SpeechSynthesis` on failure
- **API Route:** `app/api/tts/route.ts` - Proxies requests to ElevenLabs, returns `audio/mpeg`
- **Endpoint:** `https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}`
- **Voice Settings:** `stability: 0.5`, `similarity_boost: 0.8`
- **Fallback:** Browser SpeechSynthesis API when ElevenLabs fails or is not configured

### Mapbox GL (Maps)
- **Purpose:** Interactive 3D city maps with hotspot visualization
- **SDK:** `mapbox-gl` `^3.18.1` + `react-map-gl` `^8.1.0`
- **Auth:** `NEXT_PUBLIC_MAPBOX_TOKEN` env var (client-side)
- **Style:** `mapbox://styles/mapbox/dark-v11`
- **Components Using Mapbox:**
  - `components/FluidMap.tsx` - Primary feed map with issue markers, severity-colored pins, fly-to animations
  - `components/Map3D.tsx` - 3D hotspot map with heatmap visualization, user location tracking
  - `components/AmbientMap.tsx` - Background ambient map
  - `components/report-journey/ReportJourney.tsx` - Animated report journey visualization
  - `components/landing/HamiltonHero.tsx` - Landing page map
  - `components/landing/MapScene.tsx` - Landing page map scene

### Leaflet (Legacy Maps)
- **Purpose:** Alternative map rendering (coexists with Mapbox)
- **SDK:** `leaflet` `^1.9.4` + `react-leaflet` `^5.0.0`
- **Auth:** None required (uses OpenStreetMap tiles)
- **Note:** Some components may still reference Leaflet; Mapbox is the primary map library

### Hamilton 311 Portal (Mock Integration)
- **Purpose:** Assisted filing of city service requests
- **Type:** Mock/simulated - no real API integration
- **Config:** `THREE11_URL` env var, `lib/hamilton311Config.ts` defines categories, form fields, submission steps
- **Real URL:** `https://www.hamilton.ca/home-neighbourhood/get-help-city-services/report-problem-311`
- **Mock Filing:** `app/api/auto-file/route.ts` simulates agent filing with `setTimeout` (generates fake confirmation numbers like `CITY-XXXXXX`)
- **Status Tracking:** `app/api/auto-file/[id]/status/route.ts` checks filing status in `filed_311` collection
- **Categories:** 7 pre-defined (road-hazard, traffic, streetlight, sidewalk, graffiti, litter, noise) in `lib/hamilton311Config.ts`
- **Mock 311 Page:** `app/mock-311/page.tsx` - Test page simulating the 311 portal

## Data Storage

### Firebase Firestore (Primary Database)
- **Type:** NoSQL document database (Google Cloud Firestore)
- **SDK:** `firebase-admin` `^13.6.1` (server-side Admin SDK only)
- **Client:** `lib/firebase.ts` - Singleton pattern with `getDb()`, `generateId()`, `createBatch()`
- **Auth:** Service account credentials via `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- **Collections:**

| Collection | Purpose | Key Fields |
|---|---|---|
| `users` | User profiles | `role`, `neighborhood`, `displayName`, `email`, `avatarUrl`, `settings` |
| `voices` | Community posts & stories | `type` (post/story), `caption`, `mediaUrl`, `location`, `severity`, `feedScore`, `expiresAt` |
| `reports` | Structured hazard reports | `category`, `subcategory`, `severity`, `status`, `aiSummary`, `imageUrl` |
| `neighborhoods` | Neighborhood metadata | `slug`, `name`, `bounds`, `healthScore` |
| `patterns` | AI-detected patterns | `type` (cluster/trend/anomaly), `severity`, `w0Count`, `w1Count` |
| `filed_311` | 311 filing records | `reportId`, `status`, `confirmationNumber`, `agentLog` |
| `voice_comments` | Comments on voices | `voiceId`, `userId`, `text` |
| `voice_votes` | Votes on voices | `voiceId`, `userId`, `value` |
| `voice_reposts` | Reposts of voices | `voiceId`, `userId` |
| `content_votes` | Votes on posts/stories | `contentId`, `collection`, `userId`, `value` |
| `content_comments` | Comments on posts/stories | `contentId`, `collection`, `userId`, `text` |
| `content_reposts` | Reposts of posts/stories | `contentId`, `collection`, `userId` |

- **Indexes:** Defined in `firestore.indexes.json` - composite indexes on `voices` and `reports` for neighborhood + time queries
- **Image Storage:** Base64 strings stored directly in Firestore documents (no Cloud Storage)

### File Storage
- No dedicated file/object storage (Cloud Storage, S3, etc.)
- Images stored as base64 data URIs in Firestore document fields (`mediaUrl`, `imageUrl`)

### Caching
- In-memory rate limiting only (`lib/rateLimiter.ts`) - `Map<string, number[]>` in process memory
- No Redis, Memcached, or persistent cache layer

## Authentication & Identity

### Auth0 (Primary Auth Provider)
- **SDK:** `@auth0/nextjs-auth0` `^4.14.1` (v4 server SDK)
- **Client:** `lib/auth0.ts` - `Auth0Client` singleton
- **Middleware:** `proxy.ts` - Next.js 16 proxy handler that delegates `/auth/*` routes to Auth0
- **Auth Helpers:** `lib/auth.ts`:
  - `requireAuth()` - Validates session, auto-creates user in Firestore on first login (defaults to `resident` role, `downtown-hamilton` neighborhood)
  - `requireLeader()` - Validates session + `leader` role
  - `handleApiError()` - Standardized error response handler
- **Provider Component:** `<Auth0Provider>` wraps app in `app/layout.tsx`
- **Protected Routes:** `/feed/*`, `/map/*`, `/dashboard/*`, `/report/*`, `/auth/*` (via `proxy.ts` matcher)
- **Roles:** `resident` (default), `leader` (access to `/dashboard/*`, can file 311 reports)
- **Env Vars:** `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `APP_BASE_URL`

## Browser APIs

### Web Speech API
- **Purpose:** Voice command input ("Hey SafePulse" wake word detection)
- **Usage:** `SpeechRecognition` / `webkitSpeechRecognition` in:
  - `components/VoiceListener.tsx` - Main voice listener with wake word detection
  - `hooks/useAgentVoice.ts` - Agent conversation voice input
  - `hooks/useCameraVoice.ts` - Camera mode voice commands
- **SpeechSynthesis:** Fallback TTS when ElevenLabs is unavailable (`lib/tts.ts`)

### Geolocation API
- **Purpose:** User location for map centering and report location
- **Usage:** `navigator.geolocation` in map components

### MediaDevices API
- **Purpose:** Camera capture for hazard photos
- **Usage:** `components/CaptureCamera.tsx`

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, DataDog, etc.)

**Logging:**
- `console.log` / `console.error` / `console.warn` throughout
- Prefixed log tags: `[GEMINI]`, `[TTS]`, `[TTS Client]`, `[API]`, `[AGENT_VOICE]`

## CI/CD & Deployment

**Hosting:**
- Not configured in repo (no `vercel.json`, no Dockerfile, no deployment config)
- Designed for Vercel (Next.js 16 with `proxy.ts`)

**CI Pipeline:**
- None detected (no `.github/workflows/`, no CI config files)

## Rate Limiting

**Implementation:** In-memory (`lib/rateLimiter.ts`)
- Per-user, per-action tracking with sliding window
- Limits (all 50 requests per window):

| Action | Max | Window |
|---|---|---|
| `voices:create` | 50 | 1 hour |
| `reports:create` | 50 | 1 hour |
| `votes` | 50 | 1 minute |
| `explain` | 50 | 1 minute |
| `tts` | 50 | 1 minute |
| `command` | 50 | 1 minute |
| `gemini-analyze` | 50 | 1 minute |
| `educate` | 50 | 1 minute |

**Limitation:** Resets on server restart; not shared across instances

## Security Headers

**CSP (Content-Security-Policy):** Configured in `proxy.ts`
- `connect-src`: Auth0, Gemini API, Mapbox, ElevenLabs
- `script-src`: Self + unsafe-inline (+ unsafe-eval in dev)
- `frame-src`: Auth0
- `frame-ancestors`: none
- `object-src`: none

**Additional Headers (in both `proxy.ts` and `next.config.ts`):**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`

## Environment Configuration

**Required env vars (server-side):**
- `AUTH0_DOMAIN` - Auth0 tenant domain
- `AUTH0_CLIENT_ID` - Auth0 application client ID
- `AUTH0_CLIENT_SECRET` - Auth0 application client secret
- `AUTH0_SECRET` - Session encryption secret
- `APP_BASE_URL` - Application base URL
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `FIREBASE_PRIVATE_KEY` - Firebase service account private key (with escaped newlines)
- `GEMINI_API_KEY` - Google AI API key
- `ELEVENLABS_API_KEY` - ElevenLabs API key (optional, degrades gracefully)
- `ELEVENLABS_VOICE_ID` - ElevenLabs voice ID (optional, has default)
- `THREE11_URL` - Mock 311 portal URL

**Required env vars (client-side):**
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox GL access token

**Secrets location:**
- `.env` file in project root (gitignored)

## Webhooks & Callbacks

**Incoming:**
- `/auth/callback` - Auth0 authentication callback (handled by Auth0 SDK middleware in `proxy.ts`)

**Outgoing:**
- None

---

*Integration audit: 2026-03-07*
