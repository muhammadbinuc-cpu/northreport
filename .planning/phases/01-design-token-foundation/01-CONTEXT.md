# Phase 1: Design Token Foundation - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Restructure globals.css to replace the dark glassmorphism theme with the NorthReport brand palette as a three-layer CSS token system (primitive → semantic → @theme inline). Update typography weights, recalibrate shadows for light backgrounds, and ensure WCAG AA compliance. No component JSX changes — only CSS variables, @theme block, and global styles.

</domain>

<decisions>
## Implementation Decisions

### Background Surfaces
- Page base canvas: Warm Cream (#F5F0E1) — not Off-White
- Primary cards (feed items, main content): Pure White (#FFFFFF) with subtle shadow — clean separation like Linear/Notion
- Secondary surfaces (sidebar panels, overlays, secondary cards): Warm Cream (#F5F0E1)
- Sidebar/navigation: Deep Maroon (#6B0F1A) background with white icons — bold brand statement, strong contrast against light content

### Brand Palette Mapping
- Deep Maroon #6B0F1A → accent-primary, CTA buttons, links, active states, sidebar background
- Dark Charcoal #1E1E1E → text-primary (main body text on light backgrounds)
- Warm Cream #F5F0E1 → bg-base (page canvas), secondary surfaces
- Off-White #FAF7ED → text areas, input backgrounds
- Pure White #FFFFFF → card surfaces, elevated content
- Muted Rose #A07070 → decorative elements only (never text)
- Dark Red Ring #4A0A12 → deeper maroon for layered depth, hover states on maroon
- Slate Grey #555555 → text-secondary, dividers, subtle UI lines

### Claude's Discretion
- CSS class strategy: whether to keep existing .paper-card, .btn-primary, .incident-card classes and update their variables, or replace with Tailwind utility classes — Claude decides based on migration risk
- Typography weight updates: existing ty-* classes need Outfit updated to 600 weight — Claude decides whether to update in-place or rebuild
- Shadow opacity calibration: current 0.3-0.5 needs reducing to 0.05-0.15 — exact values at Claude's discretion
- Status/severity color adjustments for light backgrounds — Claude ensures contrast compliance
- Legacy alias handling (--paper-*, --ink-*) — Claude decides on backward-compatible migration approach

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- globals.css already has @theme inline block (lines 103-113) — extend it with full brand palette
- Complete spacing system on 4px grid (--space-1 through --space-16) — keep as-is
- Typography classes (ty-display-xl through ty-overline) — update values, keep class names
- Motion variables (--duration-*, --ease-*) — keep as-is
- Layout variables (--nav-width, --topbar-height, etc.) — keep as-is
- Radius system (--radius-xs through --radius-full) — keep as-is

### Established Patterns
- CSS custom properties in :root define all design tokens
- Components reference tokens via style={{ color: 'var(--text-primary)' }} inline props (294 instances)
- Custom CSS classes in globals.css provide component-level styles (.paper-card, .btn-primary, etc.)
- @theme inline bridges CSS vars to Tailwind utility classes

### Integration Points
- body element gets background/color from :root variables — single point of change
- All 45+ component files reference CSS variables — will inherit new values automatically when :root changes
- Mapbox popup overrides in globals.css reference design tokens — will update with token changes

</code_context>

<specifics>
## Specific Ideas

- Deep Maroon sidebar is a strong brand element — creates the signature contrast between navigation and content
- White cards on cream creates the Linear/Notion-like clean separation the user wants
- Mix approach: white for primary content cards, cream for secondary/ambient surfaces

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-design-token-foundation*
*Context gathered: 2026-03-07*
