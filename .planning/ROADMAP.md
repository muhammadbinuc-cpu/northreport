# Roadmap: NorthReport UI Redesign

## Overview

Transform NorthReport from a dark glassmorphism theme to a polished, light-mode-primary brand identity (maroon/cream/charcoal). The roadmap moves bottom-up: establish the CSS token foundation that every component depends on, then restyle the navigation shell that wraps every page, then migrate the two primary surfaces (feed and dashboard) with their constituent components, then tackle the independent rendering contexts (maps, landing page), and finish with animation polish and accessibility hardening.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Design Token Foundation** - CSS variable system, Tailwind theme bridge, type scale, shadow recalibration, and accessibility baseline
- [ ] **Phase 2: Navigation Shell** - Sidebar, top bar, mobile bottom tabs, and page layout structure
- [ ] **Phase 3: Feed Components** - Feed cards, engagement UI, loading skeletons, form inputs, and content composer
- [ ] **Phase 4: Dashboard and Report Components** - Dashboard page, health gauges, pattern cards, issue detail, workflow pipeline, and 311 forms
- [ ] **Phase 5: Map Restyling** - Map tiles, controls, markers, popups, and overlay panels
- [ ] **Phase 6: Landing Page Rebuild** - Hero section, feature showcase, CTA hierarchy, and heavy component removal
- [ ] **Phase 7: Animation Polish and Accessibility** - Micro-interactions, entrance animations, empty states, reduced motion, and scroll-to-top

## Phase Details

### Phase 1: Design Token Foundation
**Goal**: Every page renders with the NorthReport brand palette through a structured CSS token system, correct typography, and accessible color combinations -- without breaking any existing component
**Depends on**: Nothing (first phase)
**Requirements**: DTKN-01, DTKN-02, DTKN-03, DTKN-04, DTKN-05, DTKN-06, TYPO-01, TYPO-02, TYPO-03, TYPO-04, A11Y-01, A11Y-02
**Success Criteria** (what must be TRUE):
  1. Opening any page in the browser shows Off-White/Warm Cream backgrounds instead of dark backgrounds, with Dark Charcoal text and Deep Maroon accents
  2. Inspecting any component in DevTools shows CSS variable references or Tailwind utility classes -- zero hardcoded hex values or rgba() color calls remain in component files
  3. Card shadows appear subtle and appropriate on light backgrounds (not the heavy dark-mode shadows)
  4. Headings render in Outfit font and body text renders in Inter font with visually distinct size hierarchy across all pages
  5. Running a contrast checker on any text/background combination on any page passes WCAG AA (4.5:1 for body text, 3:1 for large text), and Muted Rose (#A07070) appears only on decorative non-text elements
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md -- Rewrite globals.css token system (primitives, semantics, @theme inline), update typography classes, component CSS classes, shadow system, status colors, and migrate .glass-card
- [ ] 01-02-PLAN.md -- Automated CSS audits and visual verification checkpoint

### Phase 2: Navigation Shell
**Goal**: Users navigate between all sections of the app through a brand-consistent sidebar on desktop and bottom tab bar on mobile, with clear visual indication of where they are
**Depends on**: Phase 1
**Requirements**: NAVG-01, NAVG-02, NAVG-03, NAVG-04, NAVG-05
**Success Criteria** (what must be TRUE):
  1. On desktop (>= md breakpoint), a sidebar with Off-White/Cream background and Deep Maroon active indicators is visible, and clicking any nav item highlights it with an animated Maroon indicator
  2. On mobile (< md breakpoint), a bottom tab bar replaces the sidebar with the same navigation items and brand-colored active state
  3. The top bar has a light background with a subtle bottom border and brand-colored elements (logo, user menu)
  4. Every page's content area is centered at a consistent max-width (max-w-2xl or max-w-3xl) with uniform horizontal padding
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Feed Components
**Goal**: The community feed -- NorthReport's primary surface -- presents cards, engagement actions, forms, and loading states in the polished light-mode brand style
**Depends on**: Phase 2
**Requirements**: CARD-01, CARD-02, CARD-03, CARD-04, CARD-05, CARD-06, CARD-07, LOAD-01, LOAD-03, LOAD-04, FORM-01, FORM-02, FORM-03
**Success Criteria** (what must be TRUE):
  1. Feed cards display on solid Warm Cream or White backgrounds with rounded corners, subtle shadows, and a severity-colored left border (3-4px) for instant visual scanning
  2. Content type indicators use styled chips/badges (not emoji), user avatars show Maroon background with white initials, and images display in consistent aspect-ratio crops with rounded top corners
  3. The engagement action bar (upvote, comment, repost) uses clean SVG icons with Maroon for voted state and Slate Grey for unvoted state
  4. While the feed loads, skeleton placeholders matching the FeedCard layout pulse in place; buttons show a spinner/opacity state during API calls; page transitions use a subtle opacity+translate animation
  5. Form inputs (ContentComposer and general inputs) have Off-White/White backgrounds, Slate Grey borders, and a visible Deep Maroon focus ring for keyboard accessibility
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Dashboard and Report Components
**Goal**: Community leaders see a fully branded dashboard with restyled health gauges, pattern cards, issue detail panels, workflow pipeline, and 311 filing forms
**Depends on**: Phase 3
**Requirements**: CARD-08, CARD-09, LOAD-02, FORM-04, DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. The dashboard page renders entirely in the light-mode brand palette with no remnants of dark glassmorphism styling
  2. HealthGauge displays as an animated SVG ring chart using brand severity colors (critical red, high orange, medium amber, low green) instead of the previous dark-themed gauge
  3. PatternCard and IssueDetailPanel use consistent brand styling (Warm Cream/White backgrounds, brand typography, proper shadows) with all inline styles replaced by Tailwind utilities
  4. The workflow pipeline section displays as a connected stepper visual (not separate arrow-linked cards), and skeleton placeholders appear while dashboard data loads
  5. The 311 report form and Form311Preview/Form311Document are restyled with brand palette colors, proper input styling, and accessible focus indicators
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Map Restyling
**Goal**: The map view feels visually integrated with the rest of the app -- warm-toned tiles, branded markers, and styled overlays replace the dark Mapbox theme
**Depends on**: Phase 2
**Requirements**: MAPX-01, MAPX-02, MAPX-03, MAPX-04, MAPX-05
**Success Criteria** (what must be TRUE):
  1. The map displays light/warm-toned tiles instead of dark-v11 -- land areas, roads, and buildings use colors that complement the brand palette
  2. Map controls (zoom, attribution) are restyled with brand colors, rounded corners, and brand fonts
  3. Map popups and tooltips display with Warm Cream backgrounds, brand typography, and card-like rounded corners with subtle shadows
  4. Custom markers use Deep Maroon fill with severity/count-based scaling, and all overlay panels and chrome use light-mode styling
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Landing Page Rebuild
**Goal**: A new visitor to NorthReport sees a clean, fast-loading landing page that communicates the product value and drives sign-up -- with zero heavy 3D/WebGL dependencies
**Depends on**: Phase 1
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06
**Success Criteria** (what must be TRUE):
  1. The hero section shows a clear value proposition with an Outfit headline, Inter subheadline, and a single prominent Deep Maroon CTA button
  2. Feature showcase sections present Feed, Map, and AI capabilities with clean layouts (no 3D renders or phone mockups)
  3. A clear CTA hierarchy exists (one primary Maroon button, optional ghost secondary) and social proof/credibility signals are visible (neighborhood count, report count, or Hamilton badge)
  4. The 3D globe, phone mockups, parallax scroll, and all heavy WebGL/Mapbox landing components are completely removed, and the landing page loads without any heavy dependencies
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Animation Polish and Accessibility
**Goal**: The app feels alive with purposeful micro-interactions and respects all users' accessibility preferences
**Depends on**: Phase 3, Phase 4
**Requirements**: NAVG-06, A11Y-03, PLSH-01, PLSH-02, PLSH-03, PLSH-04, PLSH-05, PLSH-06
**Success Criteria** (what must be TRUE):
  1. Upvoting a post triggers a satisfying spring animation (scale bounce + color transition) on the vote button
  2. Feed cards enter with a staggered animation (Framer Motion staggerChildren) when the feed loads or scrolls into view
  3. Notification toasts display a progress bar showing auto-dismiss countdown, and glassmorphism effects (backdrop-blur) appear only on floating overlays (FABs, dropdowns, toasts) -- not on card surfaces
  4. After scrolling past a threshold on the feed, a scroll-to-top floating button appears; warm cream gradient overlays replace dark gradients at section boundaries; empty states for feed, patterns, and drafts show branded illustrations
  5. Users with prefers-reduced-motion enabled see no animations -- all Framer Motion and CSS transitions respect the media query
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7
Note: Phase 5 (Maps) and Phase 6 (Landing) depend only on Phases 1-2 and Phase 1 respectively, so they could run in parallel with Phases 3-4 if inserting phases.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design Token Foundation | 0/2 | Planning complete | - |
| 2. Navigation Shell | 0/1 | Not started | - |
| 3. Feed Components | 0/2 | Not started | - |
| 4. Dashboard and Report Components | 0/2 | Not started | - |
| 5. Map Restyling | 0/1 | Not started | - |
| 6. Landing Page Rebuild | 0/1 | Not started | - |
| 7. Animation Polish and Accessibility | 0/2 | Not started | - |
