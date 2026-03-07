# NorthReport UI Redesign

## What This Is

NorthReport is a feed-first, AI-powered neighborhood safety platform for Hamilton, Ontario. Residents post stories, reports, and voice content about local hazards; community leaders use dashboards to detect patterns and file 311 reports. This milestone is a complete visual overhaul — applying the NorthReport brand identity across every page and component while preserving all backend logic, API routes, and data layer untouched.

## Core Value

The app must look and feel like a polished, social/app-like product using the NorthReport brand palette (deep maroon, dark charcoal, warm cream) in a light-mode-primary design — while every existing feature continues to work exactly as before.

## Requirements

### Validated

- Auth0 authentication with resident/leader roles — existing
- Community feed with stories, posts, and structured reports — existing
- Feed ranking by momentum + risk score — existing
- Voice command system (wake word, Gemini classification, TTS response) — existing
- Gemini AI integration (classification, summaries, pattern detection, explanations) — existing
- Camera-based hazard reporting with Gemini Vision — existing
- Leader dashboard with health gauges, pattern detection, digest, 311 filing — existing
- Interactive maps with geohash bucketing (Leaflet + Mapbox) — existing
- Content actions (upvote, comment, repost, flag) — existing
- ElevenLabs TTS for voice feedback — existing
- 311 assisted filing with PDF generation — existing

### Active

- [ ] Complete UI color scheme overhaul using NorthReport brand palette
- [ ] Light-mode-primary design with warm cream/ivory backgrounds
- [ ] Social/app-like feel — card-heavy, scrollable, mobile-first
- [ ] Rebuild landing page from scratch (remove 3D globe, phone mockups)
- [ ] Restyle all app components (feed, cards, navigation, drawers, forms)
- [ ] Restyle map UI chrome and apply brand-matched map tile theme
- [ ] Update typography and spacing for clean, modern look
- [ ] Refresh animations and transitions to match new design language
- [ ] Update all page layouts (feed, map, dashboard, report)
- [ ] Ensure WCAG AA accessibility with new color combinations

### Out of Scope

- Backend/API route changes — redesign is visual only
- New features or functionality — only restyle existing features
- Database schema changes — Firestore collections unchanged
- Authentication flow changes — Auth0 config unchanged
- AI prompt changes — Gemini prompts unchanged
- Mobile native app — web only

## Context

**Existing Codebase:**
- Next.js 16 App Router with React 19, TypeScript strict mode
- Tailwind CSS 4 with PostCSS, current theme is dark glassmorphism
- All pages use `'use client'` directive
- Framer Motion for animations
- Leaflet + Mapbox GL for maps
- Current fonts: Inter (utility) + Outfit (display) via next/font/google
- ~40 components in `components/`, 4 hooks in `hooks/`, 20+ API routes

**Brand Palette (from NorthReport_ColourScheme.pdf):**
- Deep Maroon: #6B0F1A — primary brand, hero blocks, accent fills, CTAs
- Dark Charcoal: #1E1E1E — dark panels, navigation
- Warm Cream: #F5F0E1 — content areas, cards, contrast panels
- Off-White/Ivory: #FAF7ED — page background, base canvas
- Pure White: #FFFFFF — high-contrast text on dark
- Muted Rose: #A07070 — subtle warm highlight (decorative only, not for text)
- Dark Red Ring: #4A0A12 — deeper maroon for layered depth
- Slate Grey: #555555 — secondary text, dividers, subtle UI lines

**Usage Guidelines:**
- Colour Proportions: Dominant (Dark Charcoal + Cream) 70%, Secondary (Deep Maroon) 20%, Accent (White, Muted Rose, Slate Grey) 10%
- Light mode primary: Warm Cream/Off-White backgrounds, Dark Charcoal text, Maroon accents/links/CTAs
- Dark mode contexts: Dark Charcoal background, Pure White text, Deep Maroon accents
- White text on Deep Maroon passes WCAG AA for large text only; use white for body text on maroon
- Muted Rose is decorative only — never use for text

**Hard Rules — DO NOT CHANGE:**
- Any environment variable names
- Any API route paths or endpoint URLs
- Any import statements from npm packages
- Any function names, variable names, or logic in API routes
- Anything inside node_modules or .next

## Constraints

- **Visual only**: All changes must be CSS, Tailwind classes, component JSX structure, and layout — no backend logic
- **Existing stack**: Must use Tailwind CSS 4, Framer Motion, existing font setup — no new CSS frameworks
- **Brand compliance**: All colors must come from the NorthReport brand palette PDF
- **Accessibility**: WCAG AA contrast ratios must be maintained with new palette
- **API preservation**: Every API route handler must remain functionally identical

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Light mode primary | Brand palette has warm cream/ivory designed for light backgrounds | -- Pending |
| Social/app-like feel | Card-heavy, scrollable, mobile-first matches community platform UX | -- Pending |
| Rebuild landing page | Current 3D globe/phone mockups are heavy and don't match new brand | -- Pending |
| Restyle maps + theme | Map chrome and tile styling should feel integrated with brand | -- Pending |
| Keep all backend unchanged | Redesign scope is strictly visual to minimize risk | -- Pending |

---
*Last updated: 2026-03-07 after initialization*
