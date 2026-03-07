# Architecture Patterns

**Domain:** UI Redesign of a Next.js 16 community safety platform (Tailwind CSS 4 design system)
**Researched:** 2026-03-07

---

## Current State Analysis

### What Exists Today

The codebase has ~40 components across `components/` and `components/landing/`, plus 8 page routes. The styling architecture is a hybrid of three approaches used inconsistently:

1. **CSS custom properties in `globals.css`** -- 100+ variables defined in `:root` for colors, spacing, radii, typography, layout dimensions, and motion. These drive the dark glassmorphism theme.
2. **`@theme inline` block** -- A small Tailwind CSS 4 `@theme inline` block maps ~7 values (background, foreground, crimson palette, cream, dark) so Tailwind generates utilities for them.
3. **Inline `style={}` props** -- 294 occurrences across 45 components. Most components reference CSS variables through inline styles (`style={{ color: 'var(--ink-primary)' }}`) rather than Tailwind classes. This is the dominant styling pattern.
4. **CSS component classes in `globals.css`** -- `.paper-card`, `.incident-card`, `.nav-rail`, `.top-bar`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.input-paper`, `.status-chip`, `.chip-severity` etc. are defined as plain CSS (not in `@layer components`).
5. **Tailwind utility classes** -- Used for layout (`flex`, `gap-4`, `px-6`, `rounded-lg`) but rarely for colors or theming.

### Key Problems to Solve

| Problem | Impact | Where |
|---------|--------|-------|
| 294 inline `style={}` with CSS vars | Cannot use Tailwind variants (hover:, dark:, responsive) | 45 components |
| CSS variables not in `@theme` | No Tailwind utilities generated for most tokens | `globals.css` :root |
| Dark-first color values | Every color value must change for light-mode-primary | :root, inline styles |
| Component CSS classes not in `@layer` | Cannot be overridden by Tailwind utilities properly | `globals.css` |
| Duplicate icon SVGs | Same icons defined inline in 5+ components | SideNav, TopBar, FeedPage, etc. |
| No semantic token layer | Raw color values used directly, no purpose-driven aliases | Throughout |
| Landing page animations CSS | Separate `animations.css` file with glass-card class | `components/landing/` |

---

## Recommended Architecture

### Three-Layer Token System

Structure the design system as three distinct layers in `globals.css`. This is the core architectural decision -- it determines how every component gets its colors.

```
Layer 1: Primitive Tokens (:root)        -- Raw palette values, never used directly in components
Layer 2: Semantic Tokens (:root)         -- Purpose-driven aliases that components consume
Layer 3: Tailwind Theme (@theme inline)  -- Maps semantic tokens to Tailwind utility generation
```

#### Layer 1: Primitive Tokens

Define raw brand palette values as CSS custom properties. These are the "paint cans" -- never referenced directly in component code.

```css
:root {
  /* ---- Brand Palette (from NorthReport_ColourScheme.pdf) ---- */
  --palette-maroon: #6B0F1A;
  --palette-maroon-deep: #4A0A12;
  --palette-charcoal: #1E1E1E;
  --palette-cream: #F5F0E1;
  --palette-ivory: #FAF7ED;
  --palette-white: #FFFFFF;
  --palette-rose: #A07070;
  --palette-slate: #555555;

  /* ---- Derived shades ---- */
  --palette-maroon-light: #8B1A2B;
  --palette-charcoal-light: #2A2A2A;
  --palette-cream-dark: #EBE5D3;
  --palette-slate-light: #777777;
  --palette-slate-dark: #3A3A3A;
}
```

#### Layer 2: Semantic Tokens

Map primitives to purpose-driven names. This is where the light/dark mode switch happens. Components ONLY reference semantic tokens.

```css
:root {
  /* ---- Surfaces ---- */
  --surface-base: var(--palette-ivory);
  --surface-elevated: var(--palette-cream);
  --surface-card: var(--palette-white);
  --surface-overlay: rgba(245, 240, 225, 0.85);
  --surface-hover: rgba(107, 15, 26, 0.05);

  /* ---- Text ---- */
  --text-primary: var(--palette-charcoal);
  --text-secondary: var(--palette-slate);
  --text-muted: var(--palette-slate-light);
  --text-inverse: var(--palette-white);

  /* ---- Brand ---- */
  --brand-primary: var(--palette-maroon);
  --brand-hover: var(--palette-maroon-deep);
  --brand-muted: rgba(107, 15, 26, 0.1);
  --brand-glow: rgba(107, 15, 26, 0.2);

  /* ---- Borders ---- */
  --border-default: rgba(30, 30, 30, 0.1);
  --border-subtle: rgba(30, 30, 30, 0.06);
  --border-strong: rgba(30, 30, 30, 0.2);

  /* ---- Shadows (light mode) ---- */
  --shadow-sm: 0 1px 3px rgba(30, 30, 30, 0.06);
  --shadow-md: 0 4px 12px rgba(30, 30, 30, 0.08);
  --shadow-lg: 0 8px 24px rgba(30, 30, 30, 0.12);

  /* ---- Status (unchanged across themes) ---- */
  --status-critical: #DC2626;
  --status-warning: #D97706;
  --status-caution: #CA8A04;
  --status-info: #2563EB;
  --status-success: #16A34A;
}
```

For dark mode contexts (nav rail, hero sections, charcoal panels):

```css
.dark-surface {
  --surface-base: var(--palette-charcoal);
  --surface-elevated: var(--palette-charcoal-light);
  --surface-card: rgba(30, 30, 30, 0.85);
  --text-primary: var(--palette-white);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.45);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-subtle: rgba(255, 255, 255, 0.06);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

This `.dark-surface` class is NOT a site-wide dark mode toggle. It is a scoping mechanism for components that need dark backgrounds (the SideNav rail, map overlays, the landing page hero). The app is light-mode-primary. Dark panels are opt-in by applying `.dark-surface` to a container.

#### Layer 3: Tailwind @theme

Bridge semantic tokens into Tailwind's utility class generation. Use `@theme inline` because all values reference CSS variables.

```css
@theme inline {
  /* Surfaces */
  --color-surface-base: var(--surface-base);
  --color-surface-elevated: var(--surface-elevated);
  --color-surface-card: var(--surface-card);

  /* Text */
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-text-inverse: var(--text-inverse);

  /* Brand */
  --color-brand: var(--brand-primary);
  --color-brand-hover: var(--brand-hover);
  --color-brand-muted: var(--brand-muted);

  /* Borders */
  --color-border: var(--border-default);
  --color-border-subtle: var(--border-subtle);

  /* Status */
  --color-status-critical: var(--status-critical);
  --color-status-warning: var(--status-warning);
  --color-status-success: var(--status-success);
  --color-status-info: var(--status-info);

  /* Typography */
  --font-sans: var(--font-utility);
  --font-display: var(--font-display);

  /* Shadows */
  --shadow-card: var(--shadow-md);
  --shadow-elevated: var(--shadow-lg);
}
```

This generates utilities like `bg-surface-base`, `text-brand`, `border-border-subtle`, `shadow-card`, `font-display` -- eliminating the need for inline `style={}` props.

**Confidence: HIGH** -- This architecture is directly supported by Tailwind CSS 4's official documentation for `@theme`, `@theme inline`, and CSS-first configuration.

---

### Component Styling Architecture

**Decision: Utility-first with `@layer components` for complex patterns only.**

The current codebase has ~15 CSS component classes in `globals.css` (`.paper-card`, `.incident-card`, `.nav-rail`, `.btn-primary`, etc.). Most should be eliminated in favor of Tailwind utilities now that the `@theme` block generates proper utility classes.

#### What stays as `@layer components`

Keep CSS classes ONLY for patterns that:
- Have 5+ properties that always appear together
- Are used in 3+ locations
- Involve pseudo-elements (::after, ::before) that Tailwind cannot express

```css
@layer components {
  .card {
    background: var(--surface-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: var(--radius-sm);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border: 1px solid;
  }
}
```

#### What becomes pure Tailwind utilities

Most existing CSS classes should be replaced with Tailwind class strings in components:

| Old CSS class | New Tailwind approach |
|---|---|
| `.btn-primary` | `bg-brand text-white font-semibold px-6 py-3 rounded-lg shadow-card hover:bg-brand-hover hover:shadow-elevated transition-all` |
| `.btn-secondary` | `bg-surface-elevated text-text-primary font-medium px-6 py-3 rounded-lg border border-border shadow-card hover:bg-surface-base transition-all` |
| `.btn-ghost` | `bg-transparent text-text-secondary font-medium px-4 py-2 rounded-lg hover:bg-surface-elevated hover:text-text-primary transition-colors` |
| `.input-paper` | `bg-surface-elevated border border-border-subtle rounded-lg px-4 py-3 text-text-primary text-sm focus:border-brand focus:ring-2 focus:ring-brand-muted outline-none transition-all` |
| `.incident-card__title` | `text-[15px] font-semibold text-text-primary leading-snug` |
| `.nav-rail` | Inline Tailwind on `<nav>` element |
| `.top-bar` | Inline Tailwind on `<header>` element |

#### Custom utilities via `@utility`

For single-property patterns that need variant support:

```css
@utility scrollbar-thin {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: var(--surface-base);
    border-radius: 9999px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--text-muted);
    border-radius: 9999px;
  }
}

@utility fade-bottom {
  mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
}
```

**Confidence: HIGH** -- Tailwind's own docs recommend `@layer components` for multi-property reusable patterns and `@utility` for single-property utilities with variant support.

---

### Component Boundaries

| Component | Responsibility | Communicates With | Styling Scope |
|-----------|---------------|-------------------|---------------|
| **AppShell** | Layout shell -- side nav + main content area | SideNav, VoiceListener, page content | Layout grid, dark-surface on nav area |
| **SideNav** | Fixed left rail navigation | AppShell (parent), route links | Self-contained dark panel (.dark-surface) |
| **TopBar** | Page header with title, neighborhood selector, search | Page components (parent) | Receives light surface from page context |
| **FeedCard** | Individual feed item (story/post/report) | PulseFeed (parent), SeverityChip, vote/comment APIs | Card pattern, status chips |
| **SeverityChip** | Severity badge (critical/high/medium/low) | FeedCard, PatternCard, issue pages | Chip pattern with status color variants |
| **DetailDrawer** | Right-side sliding panel | Various pages (parent) | Overlay + card surface, z-index management |
| **HealthGauge** | Circular SVG progress indicator | Dashboard page | SVG with brand-primary stroke, self-contained |
| **FluidMap** | Full-screen Mapbox GL map | Feed page (parent), IssueDetailPanel | Map chrome, marker styling, z-index base layer |
| **IssueDetailPanel** | Side panel for issue details + comments | Feed page, FluidMap | Card surface, scrollable content area |
| **ScanButton** | Floating action button for camera | CaptureCamera (child) | Floating positioning, brand-primary accent |
| **CaptureCamera** | Camera capture + Gemini analysis overlay | ScanButton (parent), Gemini API | Full-screen overlay, dark context |
| **Landing page group** | ~24 components for marketing page | Each other, scroll-linked animations | Fully rebuilt -- new brand layout |
| **Report journey group** | Animated 311 filing flow visualization | ReviewDraftDrawer | Self-contained animation block |

---

### Data Flow for Theming

```
globals.css
  :root (primitives)
    -> :root (semantic tokens)
      -> @theme inline (Tailwind utility generation)
        -> Component JSX (Tailwind classes: bg-surface-base, text-brand, etc.)

  .dark-surface (semantic overrides)
    -> Applied to <nav>, hero sections, map overlays
      -> Same utility classes automatically resolve to dark values
```

The critical insight: Because semantic tokens are CSS custom properties, a component using `bg-surface-base` automatically gets `#FAF7ED` (ivory) in light context and `#1E1E1E` (charcoal) when wrapped in `.dark-surface`. No conditional className logic needed.

---

## Patterns to Follow

### Pattern 1: Semantic Class Composition in JSX

**What:** Build component styles from Tailwind utilities that reference semantic token names.
**When:** Every component -- this is the primary styling pattern.

```tsx
// GOOD: Tailwind utilities with semantic tokens
<div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-card hover:shadow-elevated transition-all">
  <h3 className="text-text-primary font-semibold text-[15px] mb-1">
    {title}
  </h3>
  <p className="text-text-secondary text-sm leading-relaxed">
    {description}
  </p>
</div>
```

### Pattern 2: Dark Context Scoping

**What:** Use `.dark-surface` CSS class on container elements that need dark backgrounds.
**When:** SideNav, landing page hero, map overlays, camera overlay, any charcoal panel.

```tsx
// The nav rail lives on a dark surface
<nav className="dark-surface fixed left-0 top-0 bottom-0 w-[72px] bg-surface-base border-r border-border">
  {/* Child components using text-text-primary automatically get white text */}
  <span className="text-text-primary">Activity</span>
</nav>
```

### Pattern 3: Status Color Mapping via Data Attributes

**What:** Map severity/status to colors using data attributes instead of dynamic classNames.
**When:** SeverityChip, status badges, any component with enumerated color states.

```css
@layer components {
  .chip {
    /* base chip styles */
  }
  .chip[data-severity="critical"] {
    background: rgba(220, 38, 38, 0.1);
    border-color: rgba(220, 38, 38, 0.3);
    color: var(--status-critical);
  }
  .chip[data-severity="high"] {
    background: rgba(217, 119, 6, 0.1);
    border-color: rgba(217, 119, 6, 0.3);
    color: var(--status-warning);
  }
  /* ... */
}
```

```tsx
<span className="chip" data-severity={severity}>{severity}</span>
```

### Pattern 4: Motion Token Consistency

**What:** Define Framer Motion transition presets as constants, referencing CSS variable duration values where possible.

```tsx
// lib/motionPresets.ts
export const cardTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1],
};

export const cardVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -2 },
};

export const drawerTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};
```

**Confidence: HIGH** -- This follows Tailwind CSS 4 official patterns and Framer Motion best practices.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Inline style={} for Themed Colors

**What:** Using `style={{ color: 'var(--text-primary)' }}` instead of Tailwind classes.
**Why bad:** Cannot use Tailwind variants (hover:, responsive breakpoints, dark:). Cannot be statically analyzed. Harder to maintain. The current codebase has 294 of these across 45 files.
**Instead:** Use Tailwind utility classes: `className="text-text-primary"` after the `@theme` block generates the utility.

### Anti-Pattern 2: Mixing Token Layers

**What:** Referencing primitive palette tokens directly in components (e.g., `var(--palette-maroon)`).
**Why bad:** Breaks the abstraction boundary. If the brand palette changes, every reference must be found and updated.
**Instead:** Always reference semantic tokens in components. Primitives are only consumed by the semantic layer.

### Anti-Pattern 3: Component-Scoped CSS Files

**What:** Creating separate `.css` files per component (e.g., `FeedCard.module.css`).
**Why bad:** Fragments the design system. Creates specificity battles. Harder to see where styles come from. Increases bundle size with duplicated properties.
**Instead:** Keep all design tokens and shared patterns in `globals.css`. Component-specific styling goes directly in JSX as Tailwind classes.

### Anti-Pattern 4: Recreating Tailwind Utilities as CSS Classes

**What:** Defining custom CSS classes like `.text-ink-primary { color: var(--ink-primary); }` when `@theme` could generate `text-text-primary` automatically.
**Why bad:** Duplicates Tailwind's utility generation. No variant support. The current `globals.css` has ~12 of these (`.text-ink-primary`, `.bg-paper-base`, etc.).
**Instead:** Put the token in `@theme inline` and let Tailwind generate the utility class.

---

## Recommended Build Order (Redesign Phasing)

This ordering is based on dependency analysis and minimizing breakage. Each layer builds on the previous.

### Phase 1: Foundation Layer (do this FIRST)

**Scope:** `globals.css` + `app/layout.tsx` only. Zero component changes.

1. **Rewrite `globals.css` token system** -- Replace all `:root` variables with the three-layer architecture (primitives, semantic, `@theme inline`). Keep the OLD variable names as aliases pointing to new semantic tokens so nothing breaks.
2. **Add `.dark-surface` class** with semantic overrides.
3. **Move component CSS classes into `@layer components`** to fix cascade ordering.
4. **Verify build** -- `npm run build` should pass with zero visual changes because old variable names still resolve.

**Why first:** Everything depends on the token layer. If tokens are wrong, every subsequent component change is wasted work.

**Risk:** LOW -- this is additive. Old aliases ensure backward compatibility.

### Phase 2: Shell Components

**Scope:** AppShell, SideNav, TopBar -- the 3 components that wrap every page.

1. **SideNav** -- Apply `.dark-surface`, replace inline styles with Tailwind utilities (`bg-surface-base`, `border-border`, `text-text-primary`, etc.). This component has 14 `var(--` references.
2. **TopBar** -- Convert 20 `var(--` references to Tailwind classes. Switch from dark glass to light surface.
3. **AppShell** -- Update layout wrapper, remove `bg-paper-base` inline style.

**Why second:** Shell components appear on every page. Getting them right validates the token system across the entire app.

**Dependency:** Requires Phase 1 tokens.

### Phase 3: Primitive UI Components

**Scope:** Small, reusable components with no children-component dependencies.

1. **SeverityChip** -- Convert to data-attribute pattern (5 min).
2. **HealthGauge** -- Update stroke/text colors to brand tokens (5 min).
3. **ConfirmChip** -- Light theme button styles (5 min).
4. **AudioPlayer** -- Minor color updates (5 min).
5. **NotificationQueue** -- Card + toast styling (10 min).
6. **NewsTicker** -- Bottom bar restyling (10 min).

**Why third:** These are leaf components with no downstream dependencies. Can be done in any order within the phase.

**Dependency:** Requires Phase 1 tokens.

### Phase 4: Composite Components

**Scope:** Components that compose primitive components.

1. **FeedCard** -- The most complex card component (16 `var(--` refs, uses SeverityChip). Convert to Tailwind utilities, update card surface to light.
2. **DetailDrawer** -- Sliding panel, update glass effect to light card surface.
3. **IssueDetailPanel** -- Side panel (38 `var(--` refs -- highest in codebase). This is the biggest single-component effort.
4. **PatternCard** -- Dashboard card (44 `var(--` refs). Second biggest.
5. **PulseFeed** -- Feed container, uses FeedCard + AskNorthReport + DetailDrawer.
6. **ReviewDraftDrawer** -- Filing review panel.
7. **ProblemStream** -- Issue list component.
8. **AskNorthReport** -- AI assistant drawer.

**Why fourth:** These depend on primitive components being styled correctly.

**Dependency:** Requires Phase 3 (SeverityChip, HealthGauge, etc.).

### Phase 5: Page-Level Layouts

**Scope:** The actual page files in `app/`.

1. **Feed page** (`app/feed/page.tsx`) -- Heaviest page, uses FluidMap + IssueDetailPanel + ScanButton + NewsTicker + NotificationQueue. Update hero section, stats cards, issue marquee.
2. **Dashboard page** (`app/dashboard/page.tsx`) -- Uses TopBar + HealthGauge + PatternCard + ReviewDraftDrawer. Update card grid layout.
3. **Map page** (`app/map/page.tsx`) -- Map chrome + TopBar. Mostly map, minimal UI.
4. **Report page** (`app/report/page.tsx`) -- SmartReportAgent form.
5. **Dashboard sub-pages** (digest, patterns, auto-file, issue detail) -- Follow patterns established in main dashboard.

**Why fifth:** Pages compose everything. Doing them last means all child components are already styled.

**Dependency:** Requires Phase 4 complete.

### Phase 6: Landing Page Rebuild

**Scope:** `app/page.tsx` + all `components/landing/*` (24 files).

This is an independent workstream. The landing page is being rebuilt from scratch per PROJECT.md ("remove 3D globe, phone mockups"). It shares the token system but has no component dependencies on the app pages.

1. Remove HeroGlobe, Phone3D, PhoneDemo, MapScene, CityScene, CitySkyline, SceneMarkers.
2. Rebuild HamiltonHero as a light-mode brand hero (no 3D map).
3. Restyle HowItWorks, FinalCTA, ImpactSection, LandingNav with brand palette.
4. Update PhoneFrame/PhoneScreens for feature showcase.
5. Remove `animations.css` glass-card class, replace with Tailwind.

**Why last:** Landing page is isolated from app pages. Can actually be done in parallel with Phases 4-5 by a different developer. Placed last because app functionality is more critical than marketing.

**Dependency:** Requires Phase 1 tokens only.

### Phase 7: Cleanup

1. Remove all legacy CSS variable aliases added in Phase 1.
2. Remove unused CSS component classes from `globals.css`.
3. Remove orphaned landing page components.
4. Verify WCAG AA contrast ratios with new palette.
5. Final `npm run build` + visual QA.

---

## Component Dependency Graph

```
app/layout.tsx
  -> globals.css (tokens, @theme, @layer components)

app/feed/page.tsx
  -> AppShell
       -> SideNav
       -> VoiceListener -> VoiceOverlay -> ConfirmChip
  -> FluidMap
  -> IssueDetailPanel
  -> ScanButton -> CaptureCamera -> GeminiScanner
  -> NewsTicker
  -> NotificationQueue

app/dashboard/page.tsx
  -> AppShell (SideNav, VoiceListener)
  -> TopBar
  -> HealthGauge
  -> PatternCard -> SeverityChip
  -> ReviewDraftDrawer -> ReportJourney, Form311Document

app/map/page.tsx
  -> AppShell (SideNav, VoiceListener)
  -> TopBar
  -> Map3D / AmbientMap

app/report/page.tsx
  -> AppShell (SideNav, VoiceListener)
  -> TopBar
  -> SmartReportAgent -> ContentComposer, ReportForm

app/page.tsx (landing)
  -> NorthReportLogo
  -> PhoneFrame -> PhoneScreens
  -> HamiltonHero
  -> HowItWorks
  -> ImpactSection
  -> FinalCTA
  -> LandingNav
```

---

## File Organization

### globals.css Structure (after redesign)

```css
/* 1. Imports */
@import url('https://fonts.googleapis.com/css2?...');
@import "tailwindcss";

/* 2. Primitive Tokens */
:root {
  --palette-*: ...;    /* Raw brand colors */
  --font-display: ...;
  --font-utility: ...;
}

/* 3. Semantic Tokens */
:root {
  --surface-*: ...;    /* Surfaces */
  --text-*: ...;       /* Text colors */
  --brand-*: ...;      /* Brand accents */
  --border-*: ...;     /* Borders */
  --shadow-*: ...;     /* Shadows */
  --status-*: ...;     /* Status colors */
  --radius-*: ...;     /* Border radii */
  --space-*: ...;      /* Spacing scale (if needed beyond Tailwind defaults) */
  --nav-width: 72px;   /* Layout constants */
  --topbar-height: 56px;
  --duration-*: ...;   /* Motion durations */
  --ease-*: ...;       /* Easing curves */
}

/* 4. Dark Surface Context */
.dark-surface {
  --surface-*: ...;
  --text-*: ...;
  --border-*: ...;
  --shadow-*: ...;
}

/* 5. Tailwind Theme Bridge */
@theme inline {
  --color-*: ...;
  --font-*: ...;
  --shadow-*: ...;
}

/* 6. Base Styles */
body { ... }

/* 7. Component Classes */
@layer components {
  .card { ... }
  .chip { ... }
  .chip[data-severity="critical"] { ... }
  /* Only patterns with 5+ properties used 3+ times */
}

/* 8. Custom Utilities */
@utility scrollbar-thin { ... }
@utility fade-bottom { ... }

/* 9. Keyframe Animations */
@keyframes pulse-live { ... }
@keyframes user-ping { ... }

/* 10. Third-party Overrides */
.mapboxgl-popup-content { ... }
.leaflet-container { ... }
```

### Motion Presets File

Create `lib/motionPresets.ts` to centralize Framer Motion constants:

```typescript
export const transitions = {
  fast: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  normal: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  slow: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  bounce: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] },
  spring: { type: 'spring', stiffness: 500, damping: 30 },
};

export const cardVariants = { ... };
export const drawerVariants = { ... };
export const pageVariants = { ... };
```

---

## Inline Style Elimination Strategy

The 294 `style={}` props are the largest mechanical task. Here is the translation pattern:

| Inline Style | Tailwind Class |
|---|---|
| `style={{ color: 'var(--text-primary)' }}` | `className="text-text-primary"` |
| `style={{ color: 'var(--accent-primary)' }}` | `className="text-brand"` |
| `style={{ background: 'var(--bg-glass)' }}` | `className="bg-surface-overlay"` |
| `style={{ border: '1px solid var(--border-glass)' }}` | `className="border border-border"` |
| `style={{ fontFamily: 'var(--font-display)' }}` | `className="font-display"` |
| `style={{ boxShadow: 'var(--shadow-glass-md)' }}` | `className="shadow-card"` |

Styles that must remain as `style={}`:
- Dynamic values computed from props (e.g., `strokeDashoffset` in HealthGauge)
- Mapbox GL paint properties (object format required)
- Complex gradients with dynamic stops

---

## Scalability Considerations

| Concern | At Current Scale (~40 components) | At 100+ Components | At Multi-App |
|---------|-----------------------------------|---------------------|--------------|
| Token management | Single `globals.css` | Single `globals.css` -- still manageable | Extract `packages/brand/theme.css`, import via `@import` |
| Component consistency | Tailwind utilities ensure consistency | Consider extracting common patterns to shared component library | Shared component package with Tailwind preset |
| Build performance | Tailwind 4 Oxide engine: <200ms | Still fast -- Oxide handles large projects | Per-app builds, shared tokens via CSS import |
| Dark surface scoping | `.dark-surface` class on ~5 containers | Same pattern scales | Same pattern scales |

---

## Sources

- [Tailwind CSS v4 Theme Variables (official docs)](https://tailwindcss.com/docs/theme) -- HIGH confidence
- [Tailwind CSS v4 Adding Custom Styles (official docs)](https://tailwindcss.com/docs/adding-custom-styles) -- HIGH confidence
- [Tailwind CSS v4 Dark Mode (official docs)](https://tailwindcss.com/docs/dark-mode) -- HIGH confidence
- [Tailwind CSS v4 Announcement](https://tailwindcss.com/blog/tailwindcss-v4) -- HIGH confidence
- [Implementing Dark Mode with Tailwind v4 and Next.js](https://www.thingsaboutweb.dev/en/posts/dark-mode-with-tailwind-v4-nextjs) -- MEDIUM confidence
- [Design Tokens That Scale in 2026 (Tailwind v4 + CSS Variables)](https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026) -- MEDIUM confidence
- [Tailwind CSS Best Practices 2025-2026: Design Tokens](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) -- MEDIUM confidence
- [Tailwind CSS v4: The Complete Guide for 2026](https://devtoolbox.dedyn.io/blog/tailwind-css-v4-complete-guide) -- MEDIUM confidence
