# Technology Stack

**Analysis Date:** 2026-03-07

## Languages

**Primary:**
- TypeScript 5.x (strict mode) - All application code, API routes, components, utilities
- CSS - Tailwind CSS 4 with custom CSS variables in `app/globals.css`

**Secondary:**
- JSON - Configuration (`package.json`, `tsconfig.json`, `firebase.json`, `firestore.indexes.json`)

## Runtime

**Environment:**
- Node.js (no `.nvmrc` or `.node-version` detected; inferred from Next.js 16 compatibility)
- Browser: Modern browsers with Web Speech API support required for voice features

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js `16.1.6` - App Router with `proxy.ts` middleware (Next.js 16 pattern replaces `middleware.ts`)
- React `19.2.3` - Client components with `'use client'` directives
- React DOM `19.2.3` - DOM rendering

**Styling:**
- Tailwind CSS `^4` - Utility-first CSS via PostCSS plugin (`@tailwindcss/postcss`)
- PostCSS - Configured in `postcss.config.mjs`
- Custom design system in `app/globals.css` with CSS variables (dark glassmorphism theme)
- Google Fonts: Inter (utility), Outfit (display) - loaded via `next/font/google` in `app/layout.tsx`

**Build/Dev:**
- ESLint `^9` with `eslint-config-next` (core-web-vitals + typescript presets) - Config: `eslint.config.mjs`
- tsx `^4.21.0` - TypeScript execution for scripts (seed)

**Testing:**
- No test framework configured

## Key Dependencies

**Critical (core functionality):**
- `@auth0/nextjs-auth0` `^4.14.1` - Authentication (Auth0 v4 SDK with server-side `Auth0Client`)
- `firebase-admin` `^13.6.1` - Firestore database access (server-side only)
- `@google/generative-ai` `^0.24.1` - Google Gemini AI SDK for content classification, summaries, pattern detection
- `mapbox-gl` `^3.18.1` - Interactive 3D maps with dark style (`mapbox://styles/mapbox/dark-v11`)
- `react-map-gl` `^8.1.0` - React wrapper for Mapbox GL (used in landing page components)

**UI/Animation:**
- `framer-motion` `^12.33.0` - Page transitions, component animations, scroll-driven effects
- `lucide-react` `^0.563.0` - Icon library
- `cobe` `^0.6.5` - WebGL globe visualization on landing page (`components/landing/HeroGlobe.tsx`)

**Geospatial:**
- `ngeohash` `^0.6.3` - Geohash encoding/decoding for location privacy (~0.6km precision)
- `leaflet` `^1.9.4` + `react-leaflet` `^5.0.0` - Alternative map rendering (legacy, some components)
- `@turf/along` `^7.3.4`, `@turf/bearing` `^7.3.4`, `@turf/helpers` `^7.3.4`, `@turf/length` `^7.3.4` - Geospatial calculations for report journey animation (`components/report-journey/ReportJourney.tsx`)

**Document Generation:**
- `html2canvas` `^1.4.1` - Screenshot capture for PDF generation
- `jspdf` `^4.1.0` - PDF generation for 311 forms (`components/ReviewDraftDrawer.tsx`)

## Configuration

**TypeScript (`tsconfig.json`):**
- Target: ES2017
- Module: ESNext with bundler resolution
- Strict mode: enabled
- Path alias: `@/*` maps to project root
- JSX: react-jsx
- Incremental compilation: enabled

**Next.js (`next.config.ts`):**
- Security headers: X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy, X-XSS-Protection
- No custom webpack config, no image domains, no redirects

**ESLint (`eslint.config.mjs`):**
- Uses flat config format (ESLint 9)
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Global ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

**PostCSS (`postcss.config.mjs`):**
- Single plugin: `@tailwindcss/postcss`

**Firebase (`firebase.json`):**
- Firestore indexes defined in `firestore.indexes.json`
- Composite indexes on `voices` (neighborhood + createdAt, neighborhood + type + createdAt) and `reports` (neighborhood + createdAt)

**Environment Variables:**
- `.env` file present (not committed - contains secrets)
- Server-side: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `APP_BASE_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `THREE11_URL`
- Client-side: `NEXT_PUBLIC_MAPBOX_TOKEN`

## Platform Requirements

**Development:**
- Node.js compatible with Next.js 16
- npm for package management
- `.env` file with all required environment variables
- Firebase project with Firestore enabled
- Auth0 tenant configured
- Mapbox access token
- Google AI API key (Gemini)

**Production:**
- Next.js-compatible hosting (Vercel recommended for App Router + proxy.ts support)
- Firebase Firestore (Google Cloud)
- Auth0 cloud tenant
- External API keys: Gemini, ElevenLabs, Mapbox

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed Firestore via `npx tsx scripts/seed.ts` |

---

*Stack analysis: 2026-03-07*
