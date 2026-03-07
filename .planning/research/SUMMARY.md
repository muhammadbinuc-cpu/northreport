# Project Research Summary

**Project:** NorthReport UI Redesign
**Domain:** Visual overhaul of a community safety platform -- dark glassmorphism to light-mode brand palette
**Researched:** 2026-03-07
**Confidence:** HIGH

## Executive Summary

NorthReport is an existing Next.js 16 / React 19 community safety platform with ~40 components, 8 page routes, and a fully dark glassmorphism theme. The redesign is a visual-only transformation to a light-mode-primary brand palette (maroon/cream/charcoal) with zero new backend features or dependencies. Research confirms that the entire existing stack (Tailwind CSS 4, Framer Motion 12, Mapbox GL JS 3, Lucide React) is sufficient -- no new npm packages are needed. The core architectural challenge is migrating a deeply embedded dark color system (297 hardcoded hex values, 294 inline `style={}` props, 202 raw `rgba()` calls across 45 files) to a structured three-layer design token system that leverages Tailwind CSS 4's `@theme` directive for utility class generation.

The recommended approach is a strict bottom-up migration: establish the CSS token foundation first, then restyle shell components (SideNav, TopBar), then leaf components (chips, gauges), then composite components (FeedCard, PatternCard, IssueDetailPanel), then page layouts, and finally rebuild the landing page. This ordering is driven by dependency analysis -- every component depends on the token layer, and composite components depend on their children being correctly styled. The landing page is architecturally independent and can proceed in parallel with app component restyling.

The top risks are: (1) hardcoded dark-assumption colors scattered across 40+ files that will not respond to CSS variable changes alone -- these require per-file migration; (2) glassmorphism patterns (`backdrop-blur` + semi-transparent whites) that produce washed-out, illegible results on light backgrounds; (3) Mapbox dark-v11 tile style hardcoded in 6 files creating a jarring dark-map-in-light-app disconnect; and (4) the shadow system using 0.3-0.5 opacity values that will appear brutally heavy on light backgrounds. All four are mitigated by addressing the foundation layer first and enforcing a "zero hardcoded colors" rule during component migration.

## Key Findings

### Recommended Stack

No new dependencies required. The redesign uses deeper adoption of existing tools, particularly Tailwind CSS 4's CSS-first `@theme` directive (replacing the current minimal `@theme inline` block) and Mapbox GL JS v3's Standard Style with `setConfigProperty()` for brand-matched map colors at runtime. The only structural change is moving from Google Fonts CSS `@import` to `next/font/google` for automatic font optimization and layout shift prevention.

**Core technologies (all already installed):**
- **Tailwind CSS 4** (`@theme` + `@theme inline`): Two-layer token system -- static palette in `@theme`, semantic tokens via `:root` CSS variables bridged through `@theme inline` for utility generation
- **Mapbox GL JS v3** (Standard Style): Runtime `setConfigProperty()` for brand colors (cream land, maroon motorways, warm-tinted buildings) replaces hardcoded `dark-v11` style
- **Framer Motion v12**: Existing animation patterns preserved; add centralized motion presets (`lib/motionPresets.ts`) for consistency
- **next/font/google**: Replace CSS `@import` for Inter + Outfit fonts with Next.js built-in font optimization
- **Lucide React**: Continue as sole icon system; replace all emoji-based UI icons with consistent SVG icons

### Expected Features

**Must have (table stakes):**
- Light-mode CSS variable overhaul -- the entire foundation; every component depends on this
- Responsive sidebar-to-bottom-tab-bar for mobile usability
- Clean card surfaces replacing glassmorphism (solid cream/white + subtle shadows)
- Skeleton loading states replacing spinners (feed and dashboard)
- Clear typographic hierarchy using Outfit (display) + Inter (body) with documented scale
- Consistent spacing system on 4px grid
- Brand-matched map tiles (light Mapbox style with warm color config)
- WCAG AA contrast compliance across all text/background combinations
- Landing page rebuild (remove 3D map/phone mockups, replace with clean light-mode hero)
- Styled form inputs and accessible focus indicators

**Should have (differentiators):**
- Vote button spring animation (satisfying micro-interaction)
- Card entrance stagger animation in feed
- Severity-colored left border on feed cards for visual scanning
- Warm cream gradient overlays at section boundaries
- Branded empty states with illustrations
- Notification toast with progress bar countdown
- Scroll-to-top floating button on feed

**Defer to v2+:**
- Dark mode toggle (doubles CSS surface area; brand palette is light-first)
- Sparkline charts in PatternCards (requires charting library)
- Collapsible sidebar expand-on-hover
- Pull-to-refresh gesture on mobile
- Map bottom sheet on mobile (high complexity)
- Parallax/scroll-driven effects on landing page

### Architecture Approach

The architecture centers on a three-layer CSS token system in `globals.css`: Layer 1 (primitives) defines raw palette hex values never referenced directly by components; Layer 2 (semantic tokens) maps primitives to purpose-driven names (`--surface-base`, `--text-primary`, `--brand-primary`) and is where light/dark context switching happens; Layer 3 (`@theme inline`) bridges semantic tokens into Tailwind utility class generation. Components use Tailwind classes like `bg-surface-card`, `text-brand`, `border-border-subtle` instead of inline `style={}` props. A `.dark-surface` CSS class provides scoped dark contexts for the SideNav rail, map overlays, and camera UI without a site-wide dark mode toggle.

**Major architectural components:**
1. **globals.css token system** -- Primitives, semantic tokens, `@theme inline` bridge, `.dark-surface` scoping, `@layer components` for card/chip patterns, `@utility` for scrollbar/fade-bottom
2. **Component styling migration** -- Replace 294 inline `style={}` color props with Tailwind utilities; eliminate 15+ custom CSS classes in favor of direct utility composition
3. **Mapbox Standard Style integration** -- Centralize map style string in `lib/constants.ts`; use `setConfigProperty()` API for brand colors; restyle all HTML markers via CSS classes
4. **Motion preset system** -- New `lib/motionPresets.ts` centralizing Framer Motion transition/variant constants referenced by all animated components

### Critical Pitfalls

1. **Hardcoded dark-assumption colors (297 hex + 202 rgba + 55 bg-white/opacity):** Changing CSS variables alone fixes nothing -- the majority of visual surface area uses hardcoded values. Requires per-file migration with visual verification. Establish the token system first, then migrate file-by-file.

2. **Glassmorphism does not translate to light mode:** 49 instances of `backdrop-blur` and 20+ `glass-card` references produce washed-out, muddy results on cream backgrounds. Replace with solid elevated card surfaces (white/cream + subtle shadows). Reserve blur for overlays only.

3. **Map tile mismatch across 6 files:** Dark-v11 Mapbox style, inline marker CSS, and dark vignette overlays create a separate visual world. Cannot be fixed incrementally -- needs a dedicated pass to centralize the style string, switch to Standard style, and restyle all custom markers.

4. **Shadow system too heavy for light mode:** Current 0.3-0.5 opacity shadows (designed for dark backgrounds) will look brutalist on light. Recalibrate to 0.04-0.15 range with warm tint. Update in foundation phase.

5. **Muted Rose (#A07070) accessibility trap:** 3.65:1 contrast ratio on cream FAILS WCAG AA for text. Developers will instinctively use it for secondary text. Restrict to decorative-only with explicit code comments.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Design Token Foundation
**Rationale:** Every component depends on the token layer. If tokens are wrong, all subsequent work is wasted. This phase is additive -- old variable names kept as aliases ensure zero visual breakage until components are individually migrated.
**Delivers:** Three-layer token system (primitives, semantic, @theme inline), `.dark-surface` class, recalibrated shadow system, `@layer components` for card/chip patterns, `@media (prefers-reduced-motion)` base rule, status color adjustments for light backgrounds
**Addresses:** Light mode CSS variable overhaul (table stakes), WCAG AA compliance (table stakes), consistent accent usage (table stakes)
**Avoids:** Hardcoded color pitfall, shadow inversion pitfall, Muted Rose accessibility pitfall, glassmorphism translation pitfall, status color readability pitfall

### Phase 2: Shell Components (SideNav, TopBar, AppShell)
**Rationale:** These 3 components wrap every page. Styling them validates the token system across the entire app and gives immediate visual feedback that the new theme works.
**Delivers:** Brand-consistent navigation, responsive sidebar + mobile bottom tab bar, light-mode top bar, layout grid updates
**Addresses:** Responsive sidebar-to-bottom-tab-bar (table stakes), sticky top bar (table stakes), active state indicators (table stakes), consistent page max-width (table stakes)
**Avoids:** Dark nav / light content contrast boundary (UX pitfall -- consider warm dark or gradient transition)

### Phase 3: Leaf Components
**Rationale:** Small, reusable components with no child-component dependencies. Can be done in any order within the phase. Fast wins that build momentum.
**Delivers:** Restyled SeverityChip (data-attribute pattern), HealthGauge, ConfirmChip, AudioPlayer, NotificationQueue (toast with progress bar), button/input primitives
**Addresses:** Severity badges (table stakes), button loading states (table stakes), form input styling (table stakes), accessible focus indicators (table stakes), notification toast progress bar (differentiator)
**Avoids:** Status color readability pitfall (verify chips against cream/off-white/white)

### Phase 4: Composite Components
**Rationale:** These compose leaf components and are the primary visual surfaces users interact with. Depends on Phase 3 being complete. This is the largest single phase by effort.
**Delivers:** Restyled FeedCard (with severity left-border), IssueDetailPanel (38 var refs -- biggest file), PatternCard (44 var refs), PulseFeed, ReviewDraftDrawer, DetailDrawer, AskNorthReport, ContentComposer, DigestView (fix prose-invert), GeminiScanner, SmartReportAgent
**Addresses:** Card design system (table stakes), engagement action bar (table stakes), avatar styling (table stakes), typography hierarchy (table stakes), skeleton loading states (table stakes), card entrance stagger (differentiator), vote spring animation (differentiator), branded empty states (differentiator)
**Avoids:** Inline style migration pitfall (enforce "zero hardcoded inline colors" per file), prose-invert gotcha in DigestView

### Phase 5: Page Layouts
**Rationale:** Pages compose everything. Doing them after child components means all building blocks are already styled. Minimal new styling work -- mostly layout adjustments and removing page-level dark assumptions.
**Delivers:** Feed page, dashboard page, map page chrome, report page, dashboard sub-pages -- all on light backgrounds with consistent spacing
**Addresses:** Consistent vertical rhythm (table stakes), readable line lengths (table stakes), page transition animations (table stakes)
**Avoids:** Empty state visibility (several pages have dark-mode empty states that will be invisible)

### Phase 6: Map Restyling
**Rationale:** Maps are a separate rendering context from the app UI. Tile styles, HTML markers, and overlay gradients all bypass the CSS variable system. Requires a dedicated focused pass across 6 files. Sequenced after page layouts so the surrounding chrome is finalized.
**Delivers:** Mapbox Standard style with brand colors (cream land, maroon motorways, warm buildings), restyled HTML markers using CSS classes, updated vignette/overlay gradients, centralized style string in lib/constants.ts, 3D building color adjustment
**Addresses:** Brand-matched map tiles (table stakes), map control styling (table stakes), popup/tooltip styling (table stakes), custom branded markers (differentiator)
**Avoids:** Map tile mismatch pitfall, 3D building invisibility pitfall, marker DOM bypass pitfall

### Phase 7: Landing Page Rebuild
**Rationale:** Architecturally independent from app pages -- shares only the token system. Can actually start in parallel with Phases 4-5 if resources allow. Placed last in sequence because app functionality is more critical than marketing.
**Delivers:** Clean light-mode hero with Outfit headline + Inter subheadline + single maroon CTA, 2-3 feature showcase sections, social proof, removal of HeroGlobe/Phone3D/MapScene/CitySkyline/PhoneDemo (heavy 3D components), removal of animations.css glass-card
**Addresses:** Clear hero with value proposition (table stakes), feature showcase (table stakes), CTA hierarchy (table stakes), social proof (table stakes)
**Avoids:** Landing page performance trap (code-split below-fold sections with next/dynamic), parallax anti-feature

### Phase 8: Cleanup and QA
**Rationale:** Final pass to remove technical debt created during migration (legacy CSS aliases, orphaned components, unused classes).
**Delivers:** Removal of all legacy CSS variable aliases from Phase 1, removal of unused CSS component classes, removal of orphaned landing page components, WCAG AA contrast audit with automated tools, final build verification, grep audit for remaining hardcoded colors
**Addresses:** All remaining "looks done but isn't" checklist items from PITFALLS.md
**Avoids:** Shipping with invisible legacy references that create future confusion

### Phase Ordering Rationale

- **Foundation first** because 100% of components depend on the token layer. Architecture research confirms this is LOW risk (additive with backward-compatible aliases).
- **Shell before content** because shell components wrap every page -- getting them right validates the token system end-to-end before investing in 30+ component files.
- **Leaf before composite** because composite components (FeedCard, PatternCard) compose leaf components (SeverityChip, HealthGauge). Styling bottom-up prevents rework.
- **Pages after components** because pages are thin wrappers that compose already-styled components. Most page-level work is layout, not styling.
- **Maps as dedicated phase** because Mapbox is a separate rendering context that does not inherit CSS variables. It requires touching 6 files with marker creation functions, style configs, and overlay gradients -- a distinct workstream.
- **Landing page last (or parallel)** because it has no dependencies on app components and is being rebuilt from scratch. It only needs the Phase 1 tokens.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 6 (Map Restyling):** Mapbox Standard Style `setConfigProperty()` color options may not cover all brand-matching needs. The LUT fallback approach needs validation. Custom HTML marker restyling in `createPhotoMarker()` / `createYouMarker()` involves JavaScript-generated DOM outside React.
- **Phase 7 (Landing Page):** Complete rebuild from scratch -- needs design decisions on hero layout, feature showcase format, and whether to include any map imagery (static screenshot vs. illustration).

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Well-documented Tailwind CSS 4 `@theme` patterns. All research sources are HIGH confidence official docs.
- **Phase 2 (Shell):** Standard responsive sidebar/bottom-bar pattern. Extensively documented across UI design resources.
- **Phase 3 (Leaf Components):** Straightforward token replacement. No architectural decisions needed.
- **Phase 4 (Composite Components):** Mechanical migration of inline styles to Tailwind utilities. Pattern established in Phase 3.
- **Phase 5 (Page Layouts):** Minimal new work once components are styled.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Zero new dependencies. All recommendations based on official Tailwind CSS 4, Mapbox GL JS v3, and Framer Motion v12 documentation. |
| Features | HIGH | Feature landscape based on established 2026 UI/UX patterns from multiple design sources. Clear separation of table stakes vs. differentiators. |
| Architecture | HIGH | Three-layer token system directly supported by Tailwind CSS 4 official docs. Component dependency graph derived from codebase audit. |
| Pitfalls | HIGH | All pitfalls identified from direct codebase analysis (grep counts of hardcoded values). Contrast ratios calculated from actual hex values using WCAG formula. |

**Overall confidence:** HIGH

### Gaps to Address

- **Mapbox Standard Style color completeness:** Research could not fully verify that all desired brand colors are configurable via `setConfigProperty()`. The custom LUT tutorial page did not fully load during research. Validate during Phase 6 planning by testing the config API against actual map rendering.
- **Warm Cream vs. Off-White as primary background:** UX research flags that cream can look "yellowed" on uncalibrated monitors. Recommend Off-White (#FAF7ED) as page base and Warm Cream (#F5F0E1) for elevated surfaces, but this needs visual validation on multiple displays during Phase 1.
- **Dark SideNav contrast boundary:** Research identifies that dark charcoal nav (#1E1E1E) next to light content (#FAF7ED) creates eye strain. Decision needed: warm dark nav, light nav, or gradient transition zone. This design decision should be resolved before Phase 2.
- **CaptureCamera overlay (34 inline style props):** This component has the highest density of dark-mode-specific inline styles and uses dynamic opacity for viewfinder functionality. Some inline styles may need to remain. Requires per-prop analysis during Phase 4.
- **Reduced motion support:** Not currently implemented. Must be added in Phase 1 foundation (`@media (prefers-reduced-motion: reduce)`) but specific animation inventory needed during Phase 4 planning.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) -- `@theme` directive, namespaces, `inline` modifier
- [Tailwind CSS v4 Adding Custom Styles](https://tailwindcss.com/docs/adding-custom-styles) -- `:root` vs `@theme` usage
- [Tailwind CSS v4 Dark Mode](https://tailwindcss.com/docs/dark-mode) -- dark mode configuration
- [Mapbox Standard Style Guide](https://docs.mapbox.com/map-styles/standard/guides/) -- configuration properties, color theming
- [Mapbox Standard API Reference](https://docs.mapbox.com/map-styles/standard/api/) -- `setConfigProperty` options
- [Framer Motion docs](https://motion.dev/docs/react-motion-component) -- motion component, layout prop, AnimatePresence
- [WCAG 2.1 SC 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) -- contrast ratio requirements

### Secondary (MEDIUM confidence)
- [Design Tokens That Scale in 2026 (Tailwind v4 + CSS Variables)](https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026) -- token architecture patterns
- [Tailwind CSS Best Practices 2025-2026](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) -- design system patterns
- [9 Mobile App Design Trends for 2026 - UXPilot](https://uxpilot.ai/blogs/mobile-app-design-trends) -- UI/UX expectations
- [Dark Mode vs Light Mode UX Guide 2025](https://altersquare.medium.com/dark-mode-vs-light-mode-the-complete-ux-guide-for-2025-5cbdaf4e5366) -- theme transition best practices
- [Mapbox Custom Color Theme LUT Tutorial](https://docs.mapbox.com/help/tutorials/create-a-custom-color-theme/) -- fallback approach (partial load)

### Tertiary (LOW confidence)
- None -- all research areas had multiple corroborating sources

---
*Research completed: 2026-03-07*
*Ready for roadmap: yes*
