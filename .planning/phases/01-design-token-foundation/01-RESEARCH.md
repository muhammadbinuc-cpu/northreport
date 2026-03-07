# Phase 1: Design Token Foundation - Research

**Researched:** 2026-03-07
**Domain:** CSS design token system migration (dark glassmorphism to light-mode NorthReport brand palette)
**Confidence:** HIGH

## Summary

Phase 1 requires restructuring `globals.css` to replace the current dark glassmorphism theme with the NorthReport brand palette through a three-layer CSS token system (primitive, semantic, `@theme inline`). The existing codebase already uses CSS custom properties extensively (280 `var(--*)` references across 18 component files) and has an `@theme inline` block, so the migration path is well-defined: update the `:root` values and expand the `@theme inline` block.

The core technical work is: (1) redefine all color variables to the brand palette, (2) expand the `@theme inline` block so Tailwind generates utilities for all semantic tokens, (3) update typography classes to use Outfit at 600 weight for headings and Inter at 400-500 for body, (4) recalibrate shadows from 0.3-0.5 opacity to 0.05-0.15, (5) redefine the `.glass-card` class as a solid light-surface card, and (6) adjust status/severity colors to darker variants that pass WCAG AA on light backgrounds.

**Primary recommendation:** Update `globals.css` in-place, keeping all existing variable names as legacy aliases pointing to new semantic tokens. This ensures the 294 inline `style={}` references across 45 components continue to work without JSX changes. The phase scope is CSS-only -- no component file modifications.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Page base canvas: Warm Cream (#F5F0E1) -- not Off-White
- Primary cards (feed items, main content): Pure White (#FFFFFF) with subtle shadow
- Secondary surfaces (sidebar panels, overlays, secondary cards): Warm Cream (#F5F0E1)
- Sidebar/navigation: Deep Maroon (#6B0F1A) background with white icons
- Deep Maroon #6B0F1A -> accent-primary, CTA buttons, links, active states, sidebar background
- Dark Charcoal #1E1E1E -> text-primary (main body text on light backgrounds)
- Warm Cream #F5F0E1 -> bg-base (page canvas), secondary surfaces
- Off-White #FAF7ED -> text areas, input backgrounds
- Pure White #FFFFFF -> card surfaces, elevated content
- Muted Rose #A07070 -> decorative elements only (never text)
- Dark Red Ring #4A0A12 -> deeper maroon for layered depth, hover states on maroon
- Slate Grey #555555 -> text-secondary, dividers, subtle UI lines

### Claude's Discretion
- CSS class strategy: whether to keep existing .paper-card, .btn-primary, .incident-card classes and update their variables, or replace with Tailwind utility classes -- Claude decides based on migration risk
- Typography weight updates: existing ty-* classes need Outfit updated to 600 weight -- Claude decides whether to update in-place or rebuild
- Shadow opacity calibration: current 0.3-0.5 needs reducing to 0.05-0.15 -- exact values at Claude's discretion
- Status/severity color adjustments for light backgrounds -- Claude ensures contrast compliance
- Legacy alias handling (--paper-*, --ink-*) -- Claude decides on backward-compatible migration approach

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DTKN-01 | CSS variables define full NorthReport brand palette | Three-layer token architecture: primitives (raw hex) -> semantics (purpose-driven) -> @theme inline (Tailwind utilities). All 8 brand colors mapped. |
| DTKN-02 | Tailwind CSS 4 @theme block generates utility classes from brand tokens | @theme inline directive maps semantic tokens to --color-*, --font-*, --shadow-* namespaces. Verified with official Tailwind CSS 4 docs. |
| DTKN-03 | Semantic tokens map brand colors to purposes | Semantic layer maps: surface-base, surface-elevated, surface-card, text-primary, text-secondary, accent-primary, accent-hover. Plus .dark-surface class for maroon sidebar scoping. |
| DTKN-04 | All hardcoded hex values replaced with CSS variable references | Phase 1 scope is globals.css only. Legacy aliases (--paper-*, --ink-*, --bg-*, --accent-*) point to new semantic tokens so 294 inline style references auto-inherit. Component hardcoded hex cleanup is Phase 3+. |
| DTKN-05 | Shadow system uses light-mode opacity (0.05-0.15 range) | Three shadow tiers: sm (0.05), md (0.08), lg (0.12). Replaces current 0.3-0.5 dark-mode values. |
| DTKN-06 | Backdrop-blur removed from card surfaces, reserved for floating overlays | Redefine .glass-card as solid surface card. backdrop-blur inline classes in components are Phase 3+ scope. |
| TYPO-01 | Type scale with Outfit 600 for headings (20-40px) and Inter 400-500 for body (10-16px) | Update ty-display-* to font-weight: 600. Outfit already loaded at 500/600/700 in layout.tsx. Inter at 400-700. |
| TYPO-02 | Consistent typographic hierarchy across all pages | ty-* classes already define full hierarchy (display-xl through overline). Update weights and sizes to match spec. |
| TYPO-03 | Vertical spacing follows 4px base grid | Existing spacing system (--space-1 through --space-16) already on 4px grid. Keep as-is. |
| TYPO-04 | Text containers constrain line length for readability | Add --prose-width: 65ch variable and .prose-width utility class. No component changes needed in Phase 1. |
| A11Y-01 | All text/background combinations pass WCAG AA | Verified: all primary pairings pass. Status colors need darker variants (see Pitfalls section). |
| A11Y-02 | Muted Rose used only for decorative elements | Rose variable annotated with DECORATIVE ONLY comment. No text-color semantic token maps to it. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | ^4 (CSS-first) | Utility class generation from @theme tokens | Already installed. CSS-first config via @theme directive, no JS config file |
| @tailwindcss/postcss | ^4 | PostCSS plugin for Tailwind processing | Already installed in devDependencies |
| Next.js Google Fonts | built-in | Font loading for Inter + Outfit | Already configured in layout.tsx with CSS variable binding |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| PostCSS | via @tailwindcss/postcss | CSS processing pipeline | Already configured in postcss.config.mjs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS custom properties | CSS-in-JS (styled-components) | Project already uses CSS vars extensively (280+ references). Switching would require rewriting every component. |
| @theme inline | Tailwind plugin JS | @theme inline is the Tailwind 4 standard. JS plugins are the v3 approach. |
| Manual contrast checking | Automated tool like axe-core | No test framework configured. Manual verification against computed ratios is sufficient for Phase 1 token definitions. |

**Installation:**
No new packages needed. All tools are already installed.

## Architecture Patterns

### Recommended File Structure
```
app/
  globals.css            # ALL token definitions + component classes (single source of truth)
  layout.tsx             # Font loading (already correct)
components/
  landing/
    animations.css       # .glass-card definition updated here too
```

### Pattern 1: Three-Layer Token System
**What:** Primitives -> Semantics -> @theme inline, all in one file (globals.css)
**When to use:** Always. This is the Phase 1 architecture.

**Layer 1 - Primitives (raw palette values, never used in components):**
```css
:root {
  /* Brand Palette -- from NorthReport_ColourScheme.pdf */
  --palette-maroon: #6B0F1A;
  --palette-maroon-deep: #4A0A12;
  --palette-charcoal: #1E1E1E;
  --palette-cream: #F5F0E1;
  --palette-ivory: #FAF7ED;
  --palette-white: #FFFFFF;
  --palette-rose: #A07070;       /* DECORATIVE ONLY -- 3.65:1 on cream, fails AA text */
  --palette-slate: #555555;
}
```

**Layer 2 - Semantic tokens (components consume these via var()):**
```css
:root {
  /* Surfaces */
  --bg-base: var(--palette-cream);           /* Page canvas */
  --bg-elevated: var(--palette-cream);       /* Secondary surfaces */
  --bg-card: var(--palette-white);           /* Primary cards */
  --bg-glass: var(--palette-white);          /* Legacy: was rgba dark, now solid white */
  --bg-hover: rgba(107, 15, 26, 0.05);      /* Subtle maroon tint on hover */
  --bg-input: var(--palette-ivory);          /* Input/text area backgrounds */

  /* Text */
  --text-primary: var(--palette-charcoal);   /* #1E1E1E -- 14.63:1 on cream */
  --text-secondary: var(--palette-slate);    /* #555555 -- 6.54:1 on cream */
  --text-muted: #777777;                     /* Lighter gray -- 4.03:1 on cream (large text only) */
  --text-faint: #999999;                     /* Non-text decorative -- 2.67:1 on cream */
  --text-inverse: var(--palette-white);      /* White text on dark surfaces */

  /* Accent (Deep Maroon) */
  --accent-primary: var(--palette-maroon);   /* #6B0F1A -- 10.79:1 on cream */
  --accent-hover: var(--palette-maroon-deep);/* #4A0A12 */
  --accent-muted: rgba(107, 15, 26, 0.10);
  --accent-glow: rgba(107, 15, 26, 0.15);

  /* Borders (dark-on-light) */
  --border-hairline: rgba(30, 30, 30, 0.06);
  --border-subtle: rgba(30, 30, 30, 0.10);
  --border-glass: rgba(30, 30, 30, 0.08);

  /* Shadows (light-mode calibrated) */
  --shadow-glass-sm: 0 1px 3px rgba(30, 30, 30, 0.05);
  --shadow-glass-md: 0 4px 12px rgba(30, 30, 30, 0.08);
  --shadow-glass-lg: 0 8px 24px rgba(30, 30, 30, 0.12);
  --shadow-glow-accent: 0 0 12px rgba(107, 15, 26, 0.15);
  --shadow-pressed: 0 1px 2px rgba(30, 30, 30, 0.10) inset;
}
```

**Layer 3 - @theme inline (generates Tailwind utilities):**
```css
@theme inline {
  /* Surfaces -> bg-surface-base, bg-surface-card, etc. */
  --color-surface-base: var(--bg-base);
  --color-surface-elevated: var(--bg-elevated);
  --color-surface-card: var(--bg-card);
  --color-surface-input: var(--bg-input);

  /* Text -> text-primary, text-secondary, etc. */
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-text-inverse: var(--text-inverse);

  /* Brand -> bg-brand, text-brand, border-brand, etc. */
  --color-brand: var(--accent-primary);
  --color-brand-hover: var(--accent-hover);
  --color-brand-muted: var(--accent-muted);

  /* Palette direct (for explicit color needs) */
  --color-maroon: var(--palette-maroon);
  --color-maroon-deep: var(--palette-maroon-deep);
  --color-cream: var(--palette-cream);
  --color-ivory: var(--palette-ivory);
  --color-charcoal: var(--palette-charcoal);
  --color-rose: var(--palette-rose);
  --color-slate: var(--palette-slate);

  /* Status */
  --color-status-critical: var(--status-critical);
  --color-status-warning: var(--status-warning);
  --color-status-caution: var(--status-caution);
  --color-status-info: var(--status-info);
  --color-status-success: var(--status-success);

  /* Borders -> border-border, border-border-subtle */
  --color-border: var(--border-subtle);
  --color-border-strong: var(--border-hairline);

  /* Typography */
  --font-sans: var(--font-utility);
  --font-display: var(--font-display);

  /* Shadows -> shadow-card, shadow-elevated */
  --shadow-card: var(--shadow-glass-md);
  --shadow-elevated: var(--shadow-glass-lg);

  /* Background/foreground (Tailwind defaults) */
  --color-background: var(--bg-base);
  --color-foreground: var(--text-primary);
}
```

### Pattern 2: Dark Surface Scoping for Maroon Sidebar
**What:** A `.dark-surface` CSS class that overrides semantic tokens for dark-background contexts
**When to use:** On the SideNav container (Deep Maroon background) and any other dark-on-light panels

```css
.dark-surface {
  --text-primary: var(--palette-white);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.45);
  --accent-primary: var(--palette-white);
  --border-hairline: rgba(255, 255, 255, 0.1);
  --border-subtle: rgba(255, 255, 255, 0.06);
  --bg-hover: rgba(255, 255, 255, 0.08);
}
```

This is NOT a dark mode toggle. It is a scoping class for the Deep Maroon sidebar decided in CONTEXT.md. Components inside `.dark-surface` automatically get inverted tokens via CSS cascade.

### Pattern 3: Legacy Alias Preservation
**What:** Keep all existing `--paper-*`, `--ink-*` variable names as aliases pointing to the new semantic values
**When to use:** Required to avoid breaking the 294 inline style references across 45 components

```css
:root {
  /* Legacy aliases -- backward compatibility */
  --paper-base: var(--bg-base);
  --paper-elevated: var(--bg-card);      /* Note: elevated now maps to white cards */
  --paper-warm: var(--bg-elevated);
  --ink-primary: var(--text-primary);
  --ink-secondary: var(--text-secondary);
  --ink-muted: var(--text-muted);
  --ink-faint: var(--text-faint);
  --shadow-paper-sm: var(--shadow-glass-sm);
  --shadow-paper-md: var(--shadow-glass-md);
  --shadow-paper-lg: var(--shadow-glass-lg);
}
```

### Anti-Patterns to Avoid
- **Creating a separate tokens.css file:** Keep everything in globals.css. The project uses a single-file approach already, and splitting creates import ordering issues with Tailwind CSS 4.
- **Using @layer for token definitions:** `:root` variables and `@theme` must be top-level, not inside `@layer`. Only component classes go in `@layer components`.
- **Removing existing CSS classes immediately:** Keep `.paper-card`, `.incident-card`, `.btn-primary` etc. and update their variable references. Removing them breaks 24 component references. Replacement with pure Tailwind utilities is Phase 3+ work.
- **Changing the Google Fonts import line:** The `@import url('https://fonts.googleapis.com/css2?...')` at the top of globals.css is a fallback. The primary font loading is via `next/font/google` in layout.tsx, which is already correct.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WCAG contrast ratio checking | Custom contrast calculation scripts | Pre-computed ratios in this research doc | All pairings already calculated below. Static palette = static ratios. |
| Tailwind utility generation | Manual CSS classes for every color | @theme inline directive | Tailwind CSS 4 natively generates bg-*, text-*, border-* from @theme tokens |
| Font loading optimization | Manual @font-face declarations | next/font/google (already configured) | Automatic font optimization, zero CLS, subsetting built in |
| CSS variable scoping for dark panels | JavaScript theme toggles | CSS cascade via .dark-surface class | Pure CSS, no runtime cost, no hydration issues |

**Key insight:** The entire Phase 1 is a globals.css refactor. No new libraries, no new tooling, no component JSX changes. The power of CSS custom properties means changing the definitions propagates everywhere automatically.

## Common Pitfalls

### Pitfall 1: Status/Severity Colors Fail WCAG AA on Light Backgrounds
**What goes wrong:** The current status colors (#EF4444 red, #F59E0B amber, #EAB308 yellow, #3B82F6 blue, #22C55E green) all fail WCAG AA for normal text on both Warm Cream and Pure White backgrounds. Amber and yellow fail even for large text.
**Why it happens:** These colors were chosen for dark backgrounds where they provide strong contrast against #121212. On light backgrounds, they are too bright/saturated.
**How to avoid:** Use these darker, verified alternatives:

| Status | Current (dark-mode) | New (light-mode) | Ratio on Cream | Ratio on White | WCAG AA |
|--------|---------------------|-------------------|----------------|----------------|---------|
| Critical | #EF4444 | #B91C1C | 5.68:1 | 6.47:1 | PASS |
| High/Warning | #F59E0B | #C2410C | 4.55:1 | 5.18:1 | PASS |
| Medium/Caution | #EAB308 | #92400E | 6.22:1 | 7.09:1 | PASS |
| Info | #3B82F6 | #2563EB | 4.54:1 | 5.17:1 | PASS |
| Success | #22C55E | #166534 | 6.26:1 | 7.13:1 | PASS |

All five pass AA (4.5:1) on BOTH Warm Cream and Pure White.

**Warning signs:** Running a contrast checker on any status chip and getting < 4.5:1.

### Pitfall 2: --shadow-pressed Is Referenced But Never Defined
**What goes wrong:** Four places in globals.css use `var(--shadow-pressed)` but it is never defined in `:root`. This is an existing bug that silently resolves to nothing.
**Why it happens:** Likely a variable that was planned but never added during original development.
**How to avoid:** Define it: `--shadow-pressed: 0 1px 2px rgba(30, 30, 30, 0.10) inset;`
**Warning signs:** Active/pressed states on cards and buttons having no visual pressed effect.

### Pitfall 3: .glass-card Defined in animations.css, Not globals.css
**What goes wrong:** The `.glass-card` class is defined in `components/landing/animations.css` (line 93) with hardcoded dark values (`rgba(18, 18, 18, 0.7)`, `backdrop-blur: 12px`). It is used in 30+ locations across the app. Updating only globals.css will miss it entirely.
**Why it happens:** It was originally a landing-page-only class that spread to general use.
**How to avoid:** Move the `.glass-card` definition to globals.css and redefine it as a solid light-surface card using semantic tokens. Keep the animations.css file for keyframes only.
**Warning signs:** Cards still appearing with dark semi-transparent backgrounds after the token migration.

### Pitfall 4: Warm Cream Background Makes White Cards Subtle
**What goes wrong:** #F5F0E1 (cream) and #FFFFFF (white) only differ by ~6% luminance. Without shadow and/or border, white cards will feel "flat" and barely distinguishable from the cream background.
**Why it happens:** Both colors are light. The contrast between them is low (~1.14:1).
**How to avoid:** White cards MUST have a subtle shadow (`0 4px 12px rgba(30,30,30,0.08)`) and optionally a hairline border (`1px solid rgba(30,30,30,0.06)`) to create the "Linear/Notion-like clean separation" the user wants.
**Warning signs:** Cards looking like they float on nothing, or the cream/white boundary being invisible.

### Pitfall 5: Google Fonts Import vs next/font/google Conflict
**What goes wrong:** globals.css line 1 has `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap')` which loads fonts via a render-blocking external request. Meanwhile, layout.tsx uses `next/font/google` which optimizes and self-hosts the fonts.
**Why it happens:** The CSS import was likely the original approach before switching to next/font/google.
**How to avoid:** Remove the Google Fonts `@import` from globals.css. The next/font/google setup in layout.tsx already sets `--font-utility` and `--font-display` CSS variables on the `<body>` element. The CSS can reference these variables without the import.
**Warning signs:** Duplicate font downloads in network tab, Flash of Unstyled Text (FOUT).

### Pitfall 6: @theme inline Variable Resolution
**What goes wrong:** Using `@theme` (without `inline`) when referencing CSS variables causes Tailwind to resolve the variable value at the definition site, not the usage site. This breaks CSS variable scoping (e.g., `.dark-surface` overrides would not propagate).
**Why it happens:** `@theme` bakes in the resolved value. `@theme inline` keeps the `var()` reference intact.
**How to avoid:** Always use `@theme inline` when values reference `var()`. Use plain `@theme` only for literal values (hex colors, pixel values).
**Warning signs:** Dark-surface scoped tokens not overriding theme values, Tailwind utilities rendering the wrong color.

## Code Examples

### Full Typography Class Update (ty-* classes)
```css
/* Source: CONTEXT.md decision + TYPO-01 requirement */
/* Outfit for display/headings at 600 weight, Inter for body at 400-500 */

.ty-display-xl {
  font-family: var(--font-display);
  font-size: 40px;       /* Was 32px -- expanded for display hierarchy */
  font-weight: 600;      /* Was 400 -- CONTEXT.md specifies 600 */
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.ty-display-lg {
  font-family: var(--font-display);
  font-size: 32px;       /* Was 24px */
  font-weight: 600;      /* Was 400 */
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.ty-display-md {
  font-family: var(--font-display);
  font-size: 24px;       /* Was 20px */
  font-weight: 600;      /* Was 400 */
  letter-spacing: -0.01em;
  line-height: 1.25;
}

.ty-heading-lg {
  font-family: var(--font-display);  /* Was --font-utility, now Outfit for heading hierarchy */
  font-size: 20px;       /* Was 16px */
  font-weight: 600;
  line-height: 1.3;
}

.ty-heading-md {
  font-family: var(--font-display);  /* Was --font-utility */
  font-size: 16px;       /* Was 14px */
  font-weight: 600;
  line-height: 1.4;
}

.ty-body-lg {
  font-family: var(--font-utility);
  font-size: 16px;       /* Was 15px */
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 1.55;
}

.ty-body-md {
  font-family: var(--font-utility);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 1.5;
}

.ty-body-sm {
  font-family: var(--font-utility);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 1.45;
}

.ty-caption {
  font-family: var(--font-utility);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.03em;
  line-height: 1.35;
}

.ty-overline {
  font-family: var(--font-utility);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}
```

### .glass-card Migration (from animations.css to globals.css)
```css
/* Source: DTKN-06 requirement + CONTEXT.md .glass-card discussion */
/* Move from components/landing/animations.css to globals.css */
/* Old: rgba(18, 18, 18, 0.7) + backdrop-blur: 12px */
/* New: solid white card surface for light mode */

.glass-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);  /* 16px -- same as before */
  box-shadow: var(--shadow-glass-md);
  transition: all var(--duration-fast) var(--ease-smooth);
  /* No backdrop-blur -- solid surface */
}

.glass-card:hover {
  box-shadow: var(--shadow-glass-lg);
}
```

### Status Chip Colors for Light Mode
```css
/* Source: WCAG AA contrast analysis in this research */
.status-chip--critical {
  background: rgba(185, 28, 28, 0.08);
  border-color: rgba(185, 28, 28, 0.25);
  color: var(--status-critical);             /* #B91C1C */
}

.status-chip--warning {
  background: rgba(194, 65, 12, 0.08);
  border-color: rgba(194, 65, 12, 0.25);
  color: var(--status-warning);              /* #C2410C */
}

.status-chip--caution {
  background: rgba(146, 64, 14, 0.08);
  border-color: rgba(146, 64, 14, 0.25);
  color: var(--status-caution);              /* #92400E */
}

.status-chip--info {
  background: rgba(37, 99, 235, 0.08);
  border-color: rgba(37, 99, 235, 0.25);
  color: var(--status-info);                 /* #2563EB */
}

.status-chip--success {
  background: rgba(22, 101, 52, 0.08);
  border-color: rgba(22, 101, 52, 0.25);
  color: var(--status-success);              /* #166534 */
}
```

### Body Styles Update
```css
body {
  background: var(--bg-base);            /* Warm Cream #F5F0E1 */
  color: var(--text-primary);            /* Dark Charcoal #1E1E1E */
  font-family: var(--font-utility);      /* Inter */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

## WCAG AA Contrast Analysis (Complete)

### Primary Text/Background Pairings (ALL PASS)

| Foreground | Background | Use Case | Ratio | AA Normal | AA Large |
|------------|------------|----------|------:|:---------:|:--------:|
| Dark Charcoal #1E1E1E | Warm Cream #F5F0E1 | Body text on page canvas | 14.63 | PASS | PASS |
| Dark Charcoal #1E1E1E | Off-White #FAF7ED | Body text on input bg | 15.55 | PASS | PASS |
| Dark Charcoal #1E1E1E | Pure White #FFFFFF | Body text on cards | 16.67 | PASS | PASS |
| Deep Maroon #6B0F1A | Warm Cream #F5F0E1 | Accent/links on canvas | 10.79 | PASS | PASS |
| Deep Maroon #6B0F1A | Off-White #FAF7ED | Accent on input bg | 11.47 | PASS | PASS |
| Deep Maroon #6B0F1A | Pure White #FFFFFF | Accent/links on cards | 12.29 | PASS | PASS |
| Slate Grey #555555 | Warm Cream #F5F0E1 | Secondary text on canvas | 6.54 | PASS | PASS |
| Slate Grey #555555 | Off-White #FAF7ED | Secondary text on input bg | 6.96 | PASS | PASS |
| Slate Grey #555555 | Pure White #FFFFFF | Secondary text on cards | 7.46 | PASS | PASS |
| Pure White #FFFFFF | Deep Maroon #6B0F1A | White on maroon sidebar/buttons | 12.29 | PASS | PASS |
| Pure White #FFFFFF | Dark Red Ring #4A0A12 | White on dark red hover | 15.63 | PASS | PASS |

### Muted Rose -- DECORATIVE ONLY (fails AA for normal text)

| Foreground | Background | Ratio | AA Normal | AA Large |
|------------|------------|------:|:---------:|:--------:|
| Muted Rose #A07070 | Warm Cream #F5F0E1 | 3.65 | FAIL | PASS |
| Muted Rose #A07070 | Pure White #FFFFFF | 4.16 | FAIL | PASS |

### Forbidden Pairings (DO NOT USE)

| Foreground | Background | Ratio | Issue |
|------------|------------|------:|-------|
| Dark Charcoal #1E1E1E | Deep Maroon #6B0F1A | 1.36 | Near-invisible |
| Slate Grey #555555 | Deep Maroon #6B0F1A | 1.65 | Unreadable |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js | @theme directive in CSS | Tailwind CSS 4 (Jan 2025) | All theming in CSS, no JS config |
| @apply for component styles | @layer components with @utility | Tailwind CSS 4 | Better specificity control |
| Dark-mode-first design | Light-mode-primary with scoped dark | 2024-2025 trend | Better readability, less eye strain, more professional |
| Glassmorphism surfaces | Solid surfaces + subtle shadows | 2025-2026 trend | Better performance, clearer visual hierarchy |
| Google Fonts @import | next/font/google | Next.js 13+ (2023) | Self-hosted, zero CLS, automatic optimization |

**Deprecated/outdated:**
- `@import url('https://fonts.googleapis.com/...')` in globals.css: Remove it. next/font/google handles this better.
- `backdrop-blur` on card surfaces: Replace with solid backgrounds + shadows. Keep only for true overlays.
- `rgba(26, 26, 26, 0.85)` dark-glass backgrounds: Replace with solid semantic surface tokens.

## Discretion Recommendations

Based on the "Claude's Discretion" items from CONTEXT.md:

### 1. CSS Class Strategy: Keep and Update In-Place
**Recommendation:** Keep all existing CSS classes (.paper-card, .btn-primary, .incident-card, etc.) and update their variable references to point to the new semantic tokens. Do NOT replace with Tailwind utilities in Phase 1.
**Rationale:** 24 component references use these classes. Removing them requires JSX changes across 6 files, which violates the "no component JSX changes" boundary. Replacement with Tailwind utilities belongs in Phase 3+ when components are individually restyled.

### 2. Typography Weight Updates: Update In-Place
**Recommendation:** Update the existing ty-* class definitions with new sizes and weights. Keep all class names identical.
**Rationale:** The ty-* classes are not currently used anywhere in component TSX files (0 references found). They exist as available utilities in globals.css. Updating them in-place prepares them for Phase 3+ component work without any breaking changes.

### 3. Shadow Opacity Calibration
**Recommendation:**
- `--shadow-glass-sm`: `0 1px 3px rgba(30, 30, 30, 0.05)` -- barely visible, for subtle depth
- `--shadow-glass-md`: `0 4px 12px rgba(30, 30, 30, 0.08)` -- card-level, the main workhorse
- `--shadow-glass-lg`: `0 8px 24px rgba(30, 30, 30, 0.12)` -- elevated/hover states
- `--shadow-glow-accent`: `0 0 12px rgba(107, 15, 26, 0.15)` -- maroon accent glow
- `--shadow-pressed` (NEW): `0 1px 2px rgba(30, 30, 30, 0.10) inset` -- fixes missing variable

### 4. Status/Severity Color Adjustments
**Recommendation:** Use these WCAG-AA-verified darker variants (all pass on both Cream and White):
- Critical: `#B91C1C` (was #EF4444)
- High/Warning: `#C2410C` (was #F59E0B)
- Medium/Caution: `#92400E` (was #EAB308)
- Info: `#2563EB` (was #3B82F6)
- Success: `#166534` (was #22C55E)
- Severity colors (used in chips): same mapping as status

### 5. Legacy Alias Handling
**Recommendation:** Preserve ALL legacy aliases pointing to new semantic values. Add a comment block marking them as deprecated.
**Rationale:** 280+ var() references in components use these names. Breaking them would require touching every component file. The aliases add ~15 lines of CSS with zero runtime cost.

## Open Questions

1. **--text-muted contrast on Warm Cream**
   - What we know: #777777 gives 4.03:1 on Warm Cream -- fails AA normal text (4.5:1), passes AA large text (3:1)
   - What's unclear: Is this used only for large text, captions, and labels? Or for normal body text?
   - Recommendation: Use #777777 as --text-muted ONLY for non-essential labels and large text. For any body-sized muted text, use --text-secondary (#555555, 6.54:1). Add a CSS comment documenting this constraint.

2. **Duplicate font loading**
   - What we know: Google Fonts @import in globals.css line 1 duplicates the next/font/google setup in layout.tsx
   - What's unclear: Whether removing the @import will cause FOUT on first load before next/font hydrates
   - Recommendation: Remove the @import. next/font/google self-hosts and preloads the fonts, providing faster initial render than the external @import.

3. **animations.css glass-card ownership**
   - What we know: .glass-card is defined in animations.css but used in 30+ locations across the app
   - What's unclear: Whether moving the definition to globals.css will cause CSS specificity issues
   - Recommendation: Define .glass-card in globals.css. Remove the duplicate from animations.css. Since both files are imported into the same cascade, there should be no specificity change. Test by visually inspecting any page that uses glass-card (dashboard, feed, forms).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None configured (per CLAUDE.md: "No test framework is configured") |
| Config file | none -- see Wave 0 |
| Quick run command | `npm run build` (type check + build validation) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DTKN-01 | Brand palette variables defined in globals.css | manual-only | Verify by reading globals.css | N/A (CSS file inspection) |
| DTKN-02 | @theme block generates Tailwind utilities | smoke | `npm run build` (build fails if @theme syntax invalid) | N/A |
| DTKN-03 | Semantic tokens map correctly | manual-only | DevTools inspection of computed styles | N/A |
| DTKN-04 | No hardcoded hex in globals.css classes | manual-only | Grep audit: `grep -c '#[0-9a-f]' app/globals.css` | N/A |
| DTKN-05 | Shadow opacity in 0.05-0.15 range | manual-only | Visual inspection in browser | N/A |
| DTKN-06 | glass-card has no backdrop-blur | manual-only | Grep: `grep 'backdrop' app/globals.css` | N/A |
| TYPO-01 | Outfit 600 for headings, Inter 400-500 for body | manual-only | DevTools font inspection | N/A |
| TYPO-02 | Type hierarchy applied | manual-only | Visual inspection across pages | N/A |
| TYPO-03 | 4px grid spacing | manual-only | Already verified (existing system unchanged) | N/A |
| TYPO-04 | Text containers constrain line length | manual-only | DevTools width inspection | N/A |
| A11Y-01 | WCAG AA contrast ratios | manual-only | Contrast ratios pre-computed in this research | N/A |
| A11Y-02 | Muted Rose decorative only | manual-only | Grep: `color.*rose\|color.*A07070` across files | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` (catches CSS syntax errors, TypeScript errors)
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** Full build + visual inspection of all pages before verification

### Wave 0 Gaps
- No test framework to install (visual CSS changes require manual inspection, not automated tests)
- Validation for this phase is primarily: (1) successful `npm run build`, (2) visual inspection confirming light backgrounds with correct brand colors, (3) DevTools verification of CSS variable values
- Grep-based audits can verify zero hardcoded hex values remain in globals.css class definitions

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS 4 @theme documentation](https://tailwindcss.com/docs/theme) - @theme and @theme inline syntax, namespaces, variable resolution behavior
- [NorthReport_ColourScheme.pdf](./NorthReport_ColourScheme.pdf) - Brand palette hex values, RGB values, usage guidelines
- `app/globals.css` (967 lines) - Current token architecture, all existing CSS classes and variables
- `app/layout.tsx` - Font loading configuration (next/font/google for Inter + Outfit)
- `components/landing/animations.css` - .glass-card definition location
- `.planning/phases/01-design-token-foundation/01-CONTEXT.md` - User decisions

### Secondary (MEDIUM confidence)
- [Tailwind CSS 4 release blog](https://tailwindcss.com/blog/tailwindcss-v4) - CSS-first configuration approach
- [Tailwind CSS functions and directives](https://tailwindcss.com/docs/functions-and-directives) - @theme, @layer, @utility syntax
- `.planning/research/ARCHITECTURE.md` - Three-layer token system design (project-specific prior research)
- `.planning/research/PITFALLS.md` - Hardcoded color audit, glassmorphism migration risks

### Tertiary (LOW confidence)
- WCAG contrast calculations: computed programmatically using the standard relative luminance formula. Results cross-checked against expected ranges but not verified with a third-party tool.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries needed. All tools verified in package.json.
- Architecture: HIGH - Three-layer token system validated against Tailwind CSS 4 official docs. Prior project research in ARCHITECTURE.md confirms approach.
- Pitfalls: HIGH - Based on direct codebase audit (grep counts verified). Contrast ratios computed mathematically. Glass-card location confirmed by file inspection.
- Typography: HIGH - Font loading verified in layout.tsx. Weight/size requirements explicit in CONTEXT.md and REQUIREMENTS.md.
- Status colors: HIGH - Contrast ratios computed with standard WCAG formula. Each recommended color verified on both cream and white backgrounds.

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (stable domain -- CSS tokens and Tailwind CSS 4 are not changing rapidly)
