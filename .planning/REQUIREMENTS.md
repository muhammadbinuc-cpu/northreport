# Requirements: NorthReport UI Redesign

**Defined:** 2026-03-07
**Core Value:** A polished, social/app-like UI using the NorthReport brand palette (maroon/cream/charcoal) in light-mode-primary design

## v1 Requirements

Requirements for the complete UI overhaul. Each maps to roadmap phases.

### Design Tokens

- [ ] **DTKN-01**: CSS variables in globals.css define the full NorthReport brand palette (Deep Maroon, Dark Charcoal, Warm Cream, Off-White, Muted Rose, Dark Red Ring, Slate Grey)
- [ ] **DTKN-02**: Tailwind CSS 4 `@theme` block generates utility classes from brand palette tokens (e.g., `bg-maroon`, `text-cream`)
- [ ] **DTKN-03**: Semantic tokens map brand colors to purposes (surface-base, surface-elevated, text-primary, text-secondary, accent, accent-hover)
- [ ] **DTKN-04**: All hardcoded hex values and rgba() calls in components replaced with CSS variable references or Tailwind utility classes
- [ ] **DTKN-05**: Shadow system uses light-mode-appropriate opacity (0.05-0.15 range instead of current 0.3-0.5)
- [ ] **DTKN-06**: Backdrop-blur effects removed from card surfaces and reserved for floating overlays only

### Typography

- [ ] **TYPO-01**: Type scale defined with Outfit for display/headings (600 weight, 20-40px) and Inter for body/caption (400-500 weight, 10-16px)
- [ ] **TYPO-02**: Consistent typographic hierarchy applied across all pages (display, h1, h2, body, caption, label sizes)
- [ ] **TYPO-03**: Vertical spacing follows 4px base grid with standard gaps (cards 12-16px, sections 24-32px, card padding 16-20px)
- [ ] **TYPO-04**: Text containers constrain line length for readability (max-w-prose or equivalent)

### Navigation

- [ ] **NAVG-01**: Sidebar restyled for light mode with brand colors (Off-White/Cream background, Deep Maroon active indicators)
- [ ] **NAVG-02**: Responsive bottom tab bar appears on mobile (< md breakpoint) replacing sidebar
- [ ] **NAVG-03**: Top bar restyled with light background, subtle bottom border, brand-colored elements
- [ ] **NAVG-04**: Active navigation state uses Deep Maroon indicator with existing Framer Motion layoutId animation
- [ ] **NAVG-05**: Consistent page max-width (max-w-2xl or max-w-3xl) with centered content across all pages
- [ ] **NAVG-06**: Scroll-to-top floating button appears on feed after scrolling past threshold

### Cards

- [ ] **CARD-01**: FeedCard uses solid Warm Cream or White background with consistent rounded-xl radius and subtle shadow
- [ ] **CARD-02**: Content type indicators use styled chips/badges with brand colors instead of emoji
- [ ] **CARD-03**: User avatar/identity restyled with brand colors (Maroon background, white text initial)
- [ ] **CARD-04**: Engagement action bar uses clean SVG icons with Maroon voted state and Slate Grey unvoted state
- [ ] **CARD-05**: SeverityChip restyled with brand-consistent severity colors (critical red, high orange, medium amber, low green)
- [ ] **CARD-06**: Severity-colored left border (3-4px) on feed cards for instant visual scanning
- [ ] **CARD-07**: Image cards use consistent aspect-ratio crop (16:9 or 4:3) with rounded top corners
- [ ] **CARD-08**: PatternCard restyled with light-mode brand treatment
- [ ] **CARD-09**: IssueDetailPanel restyled to match brand (inline styles replaced with Tailwind utilities)

### Loading States

- [ ] **LOAD-01**: Skeleton screen components for feed loading (matching FeedCard layout with pulse animation)
- [ ] **LOAD-02**: Skeleton screen components for dashboard loading (HealthGauge, PatternCard, draft list placeholders)
- [ ] **LOAD-03**: Button loading states with spinner/opacity during API calls
- [ ] **LOAD-04**: Page transitions use subtle opacity + y-translate animation (200-300ms max)

### Forms

- [ ] **FORM-01**: Form inputs restyled for light mode (Off-White/White background, Slate Grey border, Maroon focus ring)
- [ ] **FORM-02**: All interactive elements have visible Deep Maroon focus indicators for keyboard accessibility
- [ ] **FORM-03**: ContentComposer restyled with brand palette
- [ ] **FORM-04**: ReportForm and 311 forms restyled with brand palette

### Landing Page

- [ ] **LAND-01**: Hero section rebuilt with clean value proposition (Outfit headline, Inter subheadline, single Maroon CTA)
- [ ] **LAND-02**: Feature showcase sections showing Feed, Map, and AI features with clean layouts
- [ ] **LAND-03**: Clear CTA hierarchy (one primary Deep Maroon button, optional ghost secondary)
- [ ] **LAND-04**: Social proof / credibility signals (neighborhood count, report count, or Hamilton badge)
- [ ] **LAND-05**: All heavy landing components removed (3D globe, phone mockups, parallax scroll, 500vh sections)
- [ ] **LAND-06**: Landing page loads fast with no heavy WebGL/Mapbox dependencies

### Map UI

- [ ] **MAPX-01**: Mapbox tile style switched from dark-v11 to light/branded style matching warm palette
- [ ] **MAPX-02**: Map controls (zoom, attribution) restyled with brand colors, rounded corners, brand fonts
- [ ] **MAPX-03**: Map popups/tooltips styled with Warm Cream background, brand typography, card-like radius and shadow
- [ ] **MAPX-04**: Custom branded map markers with Deep Maroon fill and severity/count scaling
- [ ] **MAPX-05**: Map overlay panels and chrome restyled for light mode

### Dashboard

- [ ] **DASH-01**: Dashboard page restyled with light-mode brand palette
- [ ] **DASH-02**: HealthGauge redesigned as animated SVG ring chart with brand severity colors
- [ ] **DASH-03**: Workflow pipeline section uses connected stepper visual instead of separate arrow-linked cards
- [ ] **DASH-04**: Dashboard cards, stats, and sections use consistent brand styling

### Accessibility

- [ ] **A11Y-01**: All text/background combinations pass WCAG AA contrast ratios
- [ ] **A11Y-02**: Muted Rose (#A07070) used only for decorative elements, never for text
- [ ] **A11Y-03**: prefers-reduced-motion media query respected for all animations

### Polish

- [ ] **PLSH-01**: Vote button spring animation (scale bounce + color transition on upvote)
- [ ] **PLSH-02**: Card entrance stagger animation on feed (Framer Motion staggerChildren)
- [ ] **PLSH-03**: Notification toast progress bar showing auto-dismiss countdown
- [ ] **PLSH-04**: Warm cream gradient overlays at section boundaries replacing dark gradients
- [ ] **PLSH-05**: Branded empty states with illustrations for empty feed, empty patterns, empty drafts
- [ ] **PLSH-06**: Glassmorphism effects reserved for floating overlays only (FAB, dropdowns, toasts)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Interactions

- **ADV-01**: Pull-to-refresh gesture on mobile feed
- **ADV-02**: Smooth animated number transitions on counters (vote counts, health scores)
- **ADV-03**: Collapsible sidebar with hover-expand to show labels
- **ADV-04**: Map bottom sheet drawer on mobile (draggable three-snap-point sheet)
- **ADV-05**: Sparkline charts in PatternCards showing report frequency over time
- **ADV-06**: Breadcrumb navigation on detail pages

### Dark Mode

- **DARK-01**: Full dark mode toggle with brand palette adapted for dark contexts
- **DARK-02**: System preference detection for automatic light/dark switching

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend/API route changes | Redesign is visual only |
| New features or functionality | Only restyle existing features |
| Database schema changes | Firestore collections unchanged |
| Authentication flow changes | Auth0 config unchanged |
| AI prompt modifications | Gemini prompts unchanged |
| Custom scrollbar styling | Fragile cross-browser, marginal gain |
| Notification sounds/push | Requires service worker, out of visual scope |
| Mobile native app | Web only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DTKN-01 | Phase 1 | Pending |
| DTKN-02 | Phase 1 | Pending |
| DTKN-03 | Phase 1 | Pending |
| DTKN-04 | Phase 1 | Pending |
| DTKN-05 | Phase 1 | Pending |
| DTKN-06 | Phase 1 | Pending |
| TYPO-01 | Phase 1 | Pending |
| TYPO-02 | Phase 1 | Pending |
| TYPO-03 | Phase 1 | Pending |
| TYPO-04 | Phase 1 | Pending |
| NAVG-01 | Phase 2 | Pending |
| NAVG-02 | Phase 2 | Pending |
| NAVG-03 | Phase 2 | Pending |
| NAVG-04 | Phase 2 | Pending |
| NAVG-05 | Phase 2 | Pending |
| NAVG-06 | Phase 7 | Pending |
| CARD-01 | Phase 3 | Pending |
| CARD-02 | Phase 3 | Pending |
| CARD-03 | Phase 3 | Pending |
| CARD-04 | Phase 3 | Pending |
| CARD-05 | Phase 3 | Pending |
| CARD-06 | Phase 3 | Pending |
| CARD-07 | Phase 3 | Pending |
| CARD-08 | Phase 4 | Pending |
| CARD-09 | Phase 4 | Pending |
| LOAD-01 | Phase 3 | Pending |
| LOAD-02 | Phase 4 | Pending |
| LOAD-03 | Phase 3 | Pending |
| LOAD-04 | Phase 3 | Pending |
| FORM-01 | Phase 3 | Pending |
| FORM-02 | Phase 3 | Pending |
| FORM-03 | Phase 3 | Pending |
| FORM-04 | Phase 4 | Pending |
| LAND-01 | Phase 6 | Pending |
| LAND-02 | Phase 6 | Pending |
| LAND-03 | Phase 6 | Pending |
| LAND-04 | Phase 6 | Pending |
| LAND-05 | Phase 6 | Pending |
| LAND-06 | Phase 6 | Pending |
| MAPX-01 | Phase 5 | Pending |
| MAPX-02 | Phase 5 | Pending |
| MAPX-03 | Phase 5 | Pending |
| MAPX-04 | Phase 5 | Pending |
| MAPX-05 | Phase 5 | Pending |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |
| DASH-04 | Phase 4 | Pending |
| A11Y-01 | Phase 1 | Pending |
| A11Y-02 | Phase 1 | Pending |
| A11Y-03 | Phase 7 | Pending |
| PLSH-01 | Phase 7 | Pending |
| PLSH-02 | Phase 7 | Pending |
| PLSH-03 | Phase 7 | Pending |
| PLSH-04 | Phase 7 | Pending |
| PLSH-05 | Phase 7 | Pending |
| PLSH-06 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 57 total
- Mapped to phases: 57
- Unmapped: 0

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after roadmap creation*
