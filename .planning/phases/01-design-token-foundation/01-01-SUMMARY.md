---
phase: 01-design-token-foundation
plan: 01
subsystem: ui
tags: [css, design-tokens, tailwind-css-4, wcag-aa, typography, brand-palette]

# Dependency graph
requires: []
provides:
  - Three-layer CSS token system (primitives, semantics, @theme inline) with NorthReport brand palette
  - WCAG AA verified status/severity colors for light backgrounds
  - .dark-surface scoping class for Deep Maroon sidebar context
  - .glass-card as solid white surface card (migrated from animations.css)
  - Typography hierarchy with Outfit 600 for display/headings, Inter 400-500 for body
  - Legacy aliases (--paper-*, --ink-*) preserved for 280+ var() references
  - Shadows calibrated to 0.05-0.15 opacity for light-mode
affects: [02-shell-layout, 03-component-reskin, 04-feed-interactions, 05-maps, 06-landing, 07-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [three-layer-token-architecture, dark-surface-scoping, semantic-token-naming]

key-files:
  created: []
  modified:
    - app/globals.css
    - components/landing/animations.css

key-decisions:
  - "Keep all legacy CSS class names (.paper-card, .btn-primary, etc.) and update their variable references -- avoids breaking 24 component references"
  - "Typography ty-* classes updated in-place with new Outfit 600 weights and expanded sizes"
  - "Shadow opacity calibrated to sm=0.05, md=0.08, lg=0.12 for subtle light-mode depth"
  - "Status chip backgrounds use rgba() tints of the new WCAG-AA status colors rather than token references, since tinted backgrounds require opacity variants"
  - ".glass-card migrated to globals.css as solid white surface -- no backdrop-blur"

patterns-established:
  - "Three-layer token architecture: primitives (--palette-*) -> semantics (--bg-*, --text-*, --accent-*) -> @theme inline (--color-*, --font-*, --shadow-*)"
  - "Dark surface scoping via .dark-surface CSS class that overrides semantic tokens for maroon sidebar"
  - "Legacy alias pattern: deprecated --paper-*/--ink-* point to new semantic tokens for backward compatibility"

requirements-completed: [DTKN-01, DTKN-02, DTKN-03, DTKN-04, DTKN-05, DTKN-06, TYPO-01, TYPO-02, TYPO-03, TYPO-04, A11Y-01, A11Y-02]

# Metrics
duration: 4min
completed: 2026-03-07
---

# Phase 1 Plan 1: Design Token Foundation Summary

**Three-layer CSS token system with NorthReport brand palette (maroon/cream/charcoal), WCAG AA verified status colors, Outfit 600 typography hierarchy, and .glass-card migrated to solid white surface**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-07T21:48:10Z
- **Completed:** 2026-03-07T21:52:16Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Rewrote globals.css :root with three-layer token system: 8 brand palette primitives, full semantic layer, and expanded @theme inline block generating Tailwind utilities
- Updated all status/severity colors to WCAG AA verified darker variants that pass 4.5:1 contrast on both Warm Cream and Pure White backgrounds
- Added .dark-surface scoping class, .prose-width utility, and --shadow-pressed (fixing existing missing variable bug)
- Updated typography classes to Outfit 600 for display/headings (20-40px), Inter 400-500 for body (10-16px)
- Migrated .glass-card from animations.css to globals.css as solid white surface with no backdrop-blur
- Replaced all hardcoded rgba/hex values in component classes with var() token references

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite :root token system, @theme inline, and body styles** - `5e22876` (feat)
2. **Task 2: Update typography classes, component CSS classes, and migrate .glass-card** - `6854e0d` (feat)

## Files Created/Modified
- `app/globals.css` - Complete token system rewrite: primitives, semantics, @theme inline, .dark-surface, .glass-card, updated typography/status chips/map overlays/user marker
- `components/landing/animations.css` - Removed .glass-card definition (keyframes only remain)

## Decisions Made
- Kept all legacy CSS class names (.paper-card, .btn-primary, .incident-card) and updated variable references in-place to avoid breaking 24 component references
- Updated ty-* typography classes in-place with new Outfit 600 weights and expanded size hierarchy
- Shadow opacity calibrated to three tiers: sm=0.05, md=0.08, lg=0.12 for subtle light-mode depth
- Status chip backgrounds kept as rgba() tints (0.08 opacity) of the WCAG-AA status colors since tinted backgrounds require opacity variants not available as tokens
- Removed Google Fonts @import (redundant with next/font/google in layout.tsx)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Token foundation complete: all 45+ components will inherit new brand palette values through existing var() references
- .dark-surface class ready for Phase 2 shell layout (Deep Maroon sidebar)
- @theme inline generates Tailwind utilities for all semantic tokens, ready for component reskin in Phase 3
- Legacy aliases preserve backward compatibility for 280+ inline style references

---
*Phase: 01-design-token-foundation*
*Completed: 2026-03-07*
