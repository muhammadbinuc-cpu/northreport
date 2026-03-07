# Technology Stack

**Project:** NorthReport UI Redesign
**Researched:** 2026-03-07
**Focus:** Brand-driven visual overhaul of an existing Next.js 16 / React 19 / Tailwind CSS 4 application

## Recommended Stack

No new frameworks or dependencies are needed. The redesign uses the existing stack with deeper adoption of Tailwind CSS 4's native theming capabilities and Mapbox Standard style's configuration API. The only "new" element is a restructured CSS architecture.

### Core Framework (Unchanged)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.1.6 | App Router, SSR, routing | Already installed; no version change needed for visual work |
| React | 19.2.3 | Component rendering | Already installed; concurrent rendering benefits animations |
| TypeScript | ^5 | Type safety | Already installed; strict mode stays |

### Styling System (Restructured)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | ^4 | Utility-first CSS with `@theme` directive | Already installed; v4's CSS-first `@theme` replaces JS config entirely -- use `@theme` for brand tokens, `:root` for non-utility CSS variables |
| `@tailwindcss/postcss` | ^4 | PostCSS integration | Already installed; no config changes needed |
| Framer Motion | ^12.33.0 | Layout animations, page transitions, micro-interactions | Already installed; v12 has optimized layout animations for React 19 |

### Map System (Reconfigured)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| mapbox-gl | ^3.18.1 | 3D maps, hotspot visualization | Already installed; v3 supports Mapbox Standard style with `setConfigProperty()` for brand-matched map colors |
| react-map-gl | ^8.1.0 | React wrapper for Mapbox | Already installed; optional use alongside direct mapbox-gl |
| Leaflet + react-leaflet | ^1.9.4 / ^5.0.0 | 2D interactive maps | Already installed; used for AmbientMap and CityMap components |

### Typography (Unchanged)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Inter (Google Fonts) | Variable | Body text, UI labels, captions | Already loaded; neutral geometry with tall x-height designed for screen legibility. Pairs naturally with warm palettes because of its slightly humanist proportions |
| Outfit (Google Fonts) | Variable | Display headings, hero text, section titles | Already loaded; soft, rounded geometric sans-serif that reads as warm and approachable -- matches the maroon/cream brand personality perfectly |

### Icons & Supporting (Unchanged)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Lucide React | ^0.563.0 | Icon system | Already installed; consistent stroke-based icons that work at any size |
| jsPDF + html2canvas | ^4.1.0 / ^1.4.1 | 311 report PDF generation | Already installed; untouched by visual redesign |

## Tailwind CSS 4 Theming Strategy

**Confidence: HIGH** -- Based on official Tailwind CSS v4 documentation for `@theme` directive.

### Architecture: Two-Layer Token System

The redesign uses a two-layer approach that separates **semantic tokens** (what colors mean) from **palette tokens** (what colors are):

**Layer 1: `@theme` block** -- Defines brand palette as Tailwind utility classes
**Layer 2: `:root` / `.dark` blocks** -- Maps semantic roles to palette tokens via CSS custom properties

This means components use semantic classes like `bg-[var(--bg-surface)]` or `text-[var(--text-primary)]` while also having access to direct palette utilities like `bg-maroon` or `text-cream`.

### Concrete `@theme` Configuration

Replace the current `@theme inline` block in `globals.css` with:

```css
@import "tailwindcss";

@theme {
  /* ── Brand Palette ── */
  --color-maroon: #6B0F1A;
  --color-maroon-deep: #4A0A12;
  --color-charcoal: #1E1E1E;
  --color-cream: #F5F0E1;
  --color-ivory: #FAF7ED;
  --color-white: #FFFFFF;
  --color-rose: #A07070;
  --color-slate: #555555;

  /* ── Maroon Scale (for hover/active/focus states) ── */
  --color-maroon-50: #fdf2f3;
  --color-maroon-100: #fbe6e8;
  --color-maroon-200: #f5c5ca;
  --color-maroon-300: #ee9aa3;
  --color-maroon-400: #e06472;
  --color-maroon-500: #d23a4b;
  --color-maroon-600: #b82435;
  --color-maroon-700: #9a1a2b;
  --color-maroon-800: #6B0F1A;
  --color-maroon-900: #4A0A12;
  --color-maroon-950: #2d0509;

  /* ── Typography ── */
  --font-display: 'Outfit', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-sans: 'Inter', system-ui, sans-serif;

  /* ── Border Radius ── */
  --radius-xs: 2px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* ── Shadows (light mode, warm tint) ── */
  --shadow-xs: 0 1px 2px rgba(30, 30, 30, 0.04);
  --shadow-sm: 0 2px 4px rgba(30, 30, 30, 0.06);
  --shadow-md: 0 4px 12px rgba(30, 30, 30, 0.08);
  --shadow-lg: 0 8px 24px rgba(30, 30, 30, 0.10);
  --shadow-xl: 0 16px 48px rgba(30, 30, 30, 0.12);

  /* ── Animations ── */
  --animate-fade-in: fade-in 0.2s ease-out;
  --animate-slide-up: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --animate-scale-in: scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  /* ── Easing ── */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
}
```

### Semantic Token Layer (`:root` and `.dark`)

```css
/* ── Light Mode (Primary) ── */
:root {
  --bg-base: var(--color-ivory);
  --bg-surface: var(--color-cream);
  --bg-elevated: var(--color-white);
  --bg-inverted: var(--color-charcoal);

  --text-primary: var(--color-charcoal);
  --text-secondary: var(--color-slate);
  --text-muted: #888888;
  --text-inverted: var(--color-white);
  --text-accent: var(--color-maroon);

  --border-default: rgba(30, 30, 30, 0.08);
  --border-subtle: rgba(30, 30, 30, 0.05);
  --border-strong: rgba(30, 30, 30, 0.15);

  --accent-primary: var(--color-maroon);
  --accent-hover: var(--color-maroon-deep);
  --accent-muted: rgba(107, 15, 26, 0.08);
  --accent-ring: rgba(107, 15, 26, 0.2);
}

/* ── Dark Mode (for nav panels, dark sections) ── */
.dark {
  --bg-base: var(--color-charcoal);
  --bg-surface: #2a2a2a;
  --bg-elevated: #333333;
  --bg-inverted: var(--color-cream);

  --text-primary: var(--color-white);
  --text-secondary: #c4bfb5;
  --text-muted: #8a857d;
  --text-inverted: var(--color-charcoal);
  --text-accent: #d23a4b;

  --border-default: rgba(255, 255, 255, 0.08);
  --border-subtle: rgba(255, 255, 255, 0.04);
  --border-strong: rgba(255, 255, 255, 0.15);

  --accent-primary: #d23a4b;
  --accent-hover: var(--color-maroon);
  --accent-muted: rgba(210, 58, 75, 0.15);
  --accent-ring: rgba(210, 58, 75, 0.3);
}
```

### Why This Approach

1. **`@theme` generates utilities**: `bg-maroon`, `text-cream`, `border-charcoal` become first-class Tailwind utilities. No arbitrary value syntax needed for brand colors.
2. **`:root` variables enable contextual theming**: Navigation sidebar uses `.dark` class to flip all semantic tokens without changing component markup.
3. **`@theme inline` is NOT used for the palette** because palette tokens are static hex values (no variable indirection needed). `inline` is only needed when `@theme` values reference other CSS variables that resolve at different DOM positions.
4. **Maroon scale enables interactive states**: `hover:bg-maroon-700`, `active:bg-maroon-900`, `focus:ring-maroon-300` -- all generated automatically by the `--color-maroon-*` namespace.

### What to Remove from Current `globals.css`

The current file has ~966 lines of custom CSS classes (`.paper-card`, `.nav-item`, `.btn-primary`, `.incident-card`, etc.) that replicate what Tailwind utilities handle natively. The redesign should:

1. **Keep**: `:root` CSS variables for semantic tokens, `@theme` block, `@keyframes`, scrollbar styles, Mapbox overrides
2. **Remove**: All `.paper-card`, `.nav-item`, `.btn-*`, `.incident-card`, `.chip-*` classes -- replace with Tailwind utility classes directly in component JSX
3. **Keep but update**: Typography utility classes (`.ty-display-xl`, etc.) -- but consider replacing with Tailwind's `text-*` + `font-display`/`font-body` utilities

## Map Tile Customization Strategy

**Confidence: HIGH** -- Based on official Mapbox Standard Style API reference and GL JS v3 documentation.

### Approach: Mapbox Standard Style with `setConfigProperty()`

The current codebase uses `mapbox://styles/mapbox/dark-v11` (a classic style). Switch to `mapbox://styles/mapbox/standard` which supports runtime configuration of colors, lighting, and features via `setConfigProperty()`.

### Implementation

```typescript
// In FluidMap.tsx and Map3D.tsx
const map = new mapboxgl.Map({
  container: mapContainer.current,
  style: 'mapbox://styles/mapbox/standard',
  center: userLoc,
  zoom: 15,
  pitch: 45,
  bearing: 0,
  antialias: true,
  config: {
    basemap: {
      // Light warm preset matching brand
      lightPreset: 'day',

      // Brand-matched land and infrastructure colors
      colorLand: '#F5F0E1',           // Warm Cream -- matches page background
      colorBuildings: '#E8E0D0',      // Slightly darker cream for depth
      colorRoads: '#D9D2C4',          // Muted warm grey roads
      colorMotorways: '#6B0F1A',      // Deep Maroon for major routes (brand accent)
      colorTrunks: '#9A1A2B',         // Lighter maroon for trunk roads
      colorGreenspace: '#C5D4A8',     // Muted sage green (warm-toned, not cold)
      colorWater: '#B8C8D8',          // Soft blue-grey (not electric blue)

      // Labels
      colorPlaceLabels: '#1E1E1E',    // Dark Charcoal for readability
      colorRoadLabels: '#555555',     // Slate Grey
      colorPointOfInterestLabels: '#555555',

      // Feature visibility
      showPointOfInterestLabels: true,
      showRoadLabels: true,
      show3dBuildings: true,
      showPedestrianRoads: false,     // Reduce clutter

      // Font (Mapbox Standard supports Inter)
      font: 'Inter',

      // Theme preset
      theme: 'faded',                 // Faded preset desaturates, then our color overrides add brand warmth
    }
  }
});
```

### Why Mapbox Standard over Classic Styles

1. **Runtime color customization**: Classic styles like `dark-v11` require Mapbox Studio to change colors. Standard lets you set `colorLand`, `colorBuildings`, etc. via JavaScript at map creation or runtime.
2. **Light presets**: `day` preset gives warm directional lighting that complements cream/ivory backgrounds without custom light configuration.
3. **3D buildings out of the box**: Standard includes 3D buildings, trees, and landmarks without manual layer addition. The current code manually adds `fill-extrusion` layers -- Standard handles this natively.
4. **Font matching**: Standard supports `font: 'Inter'` to match the app's typography.

### Fallback for Advanced Customization

If `setConfigProperty` color options are insufficient for exact brand matching, use a custom LUT (Look-Up Table):

1. Create a 64x64 color lookup table image in Photoshop/GIMP that maps Standard's default colors to brand palette
2. Base64-encode the LUT image
3. Apply via: `map.setConfigProperty('basemap', 'theme', 'custom')` + `map.setConfigProperty('basemap', 'theme-data', base64LutString)`

This is a fallback -- the direct color properties should handle 90% of brand matching needs.

### 3D Building Styling

With Standard style, buildings are automatically 3D. To tint them with the brand:

```typescript
map.on('style.load', () => {
  // Standard handles 3D buildings natively
  // Customize building colors via config
  map.setConfigProperty('basemap', 'colorBuildings', '#E8E0D0');
  // Highlight/select colors for interactive buildings
  map.setConfigProperty('basemap', 'colorBuildingHighlight', '#6B0F1A');
  map.setConfigProperty('basemap', 'colorBuildingSelect', '#4A0A12');
});
```

### Map Marker Styling Updates

The current marker styles (`.snap-marker`, `.you-marker`) use hardcoded `#8b1a2b`. Update to use the brand palette:

- YOU marker dot: `#6B0F1A` (Deep Maroon) instead of `#8b1a2b`
- YOU marker label: `#6B0F1A` background
- Snap marker photo border: `var(--color-cream)` on light backgrounds
- Snap marker label: `rgba(245, 240, 225, 0.95)` (semi-transparent Warm Cream) instead of `rgba(0,0,0,0.85)`
- Pointer arrow: `var(--color-cream)` fill

## Animation Strategy

**Confidence: HIGH** -- Based on Framer Motion v12 documentation and existing codebase patterns.

### Principles

1. **Transform and opacity only** -- never animate width, height, left, top (causes layout thrashing)
2. **Motion components only where needed** -- not every `div` needs to be a `motion.div`
3. **`AnimatePresence` for exits** -- already used in the codebase; continue this pattern
4. **Layout animations for reflows** -- use `layout` prop when cards reorder in the feed
5. **CSS for simple states** -- hover/focus transitions stay in CSS (`transition-*` utilities), Framer Motion reserved for enter/exit/layout

### Recommended Animation Patterns

| Interaction | Technique | Duration |
|-------------|-----------|----------|
| Card appearing in feed | `motion.div` with `initial={{ opacity: 0, y: 12 }}` `animate={{ opacity: 1, y: 0 }}` | 200-300ms |
| Card reorder in feed | `layout` prop on `motion.div` + `layoutId` | 300ms |
| Drawer/sheet open | `motion.div` with `initial={{ y: '100%' }}` `animate={{ y: 0 }}` | 300ms, ease-smooth |
| Modal/overlay | `AnimatePresence` + backdrop fade + content scale | 200ms |
| Button hover | CSS `transition: all 150ms` | 150ms |
| Tab switch content | `AnimatePresence mode="wait"` with fade | 150ms |
| Page navigation | `AnimatePresence` wrapper in layout | 200-300ms |
| Toast/notification | `motion.div` slide from top + `exit={{ y: -20, opacity: 0 }}` | 250ms |

### Easing Functions

Keep the existing CSS custom properties and use them consistently:

- `--ease-smooth` (`cubic-bezier(0.4, 0, 0.2, 1)`) -- Default for most transitions
- `--ease-bounce` (`cubic-bezier(0.34, 1.56, 0.64, 1)`) -- Success states, confirmations, new items appearing
- `--ease-snappy` (`cubic-bezier(0.2, 0, 0, 1)`) -- Quick UI responses (dropdowns, tooltips)

### Framer Motion with CSS Variables

Framer Motion supports CSS variable values in `animate` props:

```tsx
<motion.div
  animate={{ backgroundColor: 'var(--color-maroon)' }}
  whileHover={{ backgroundColor: 'var(--color-maroon-deep)' }}
/>
```

This keeps animations in sync with the theme without hardcoded hex values.

## Font Pairing Validation

**Confidence: HIGH** -- Inter + Outfit is already in use; research confirms it is a strong pairing for this brand.

### Why Inter + Outfit Works for This Palette

- **Outfit** (display/headings): Soft, rounded geometric sans-serif with warmth. Its friendly curves complement the maroon/cream palette -- it reads as approachable and community-oriented, which matches a neighborhood safety platform. Use at 500-700 weight for headings.
- **Inter** (body/UI): Neutral with slightly humanist proportions and tall x-height. Exceptional screen legibility at small sizes. Perfect for data-dense dashboards, feed cards, and form labels. Use at 400-600 weight.

### Font Weight Strategy

| Element | Font | Weight | Size Range |
|---------|------|--------|------------|
| Hero titles | Outfit | 700 | 32-48px |
| Section headings | Outfit | 600 | 20-28px |
| Card titles | Inter | 600 | 15-18px |
| Body text | Inter | 400 | 14-16px |
| Captions, metadata | Inter | 500 | 11-13px |
| Overlines, labels | Inter | 600 | 10-12px, uppercase, tracking-wide |
| Buttons | Inter | 600 | 14-15px |

### Loading Strategy

The current codebase loads fonts via Google Fonts CSS import in `globals.css`. This is acceptable but consider switching to `next/font/google` for better performance (automatic font optimization, no layout shift):

```tsx
// app/layout.tsx
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

// Apply: <body className={`${inter.variable} ${outfit.variable}`}>
```

Then reference in `@theme`:

```css
@theme {
  --font-display: var(--font-outfit), system-ui, sans-serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
}
```

**Note**: When `@theme` references CSS variables from the DOM (like `var(--font-outfit)`), use `@theme inline` for that specific declaration to ensure correct resolution:

```css
@theme inline {
  --font-display: var(--font-outfit), system-ui, sans-serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
  --font-sans: var(--font-inter), system-ui, sans-serif;
}
```

## Accessibility: WCAG AA Compliance

**Confidence: HIGH** -- Calculated from actual hex values using relative luminance formula.

### Contrast Ratio Results

| Combination | Ratio | AA Normal | AA Large | Use Case |
|-------------|-------|-----------|----------|----------|
| Dark Charcoal on Warm Cream | 14.63:1 | PASS | PASS | Primary body text |
| Dark Charcoal on Off-White | 15.55:1 | PASS | PASS | Body text on page background |
| Dark Charcoal on Pure White | 16.67:1 | PASS | PASS | Text on white cards |
| Deep Maroon on Warm Cream | 10.79:1 | PASS | PASS | Accent text, links, CTAs |
| Deep Maroon on Off-White | 11.47:1 | PASS | PASS | Accent text on page bg |
| Pure White on Deep Maroon | 12.29:1 | PASS | PASS | Button text, hero text on maroon |
| Slate Grey on Warm Cream | 6.54:1 | PASS | PASS | Secondary/muted text |
| Dark Red Ring on Warm Cream | 13.72:1 | PASS | PASS | Deep accent text |
| **Muted Rose on Warm Cream** | **3.65:1** | **FAIL** | PASS | **Decorative only -- never for text** |

### Key Accessibility Rules

1. **Muted Rose (#A07070) is decorative only** -- fails AA for normal text on cream backgrounds. Use only for borders, dividers, background tints, and icons where meaning is also conveyed by shape/label.
2. **Slate Grey (#555555) passes AA** on all light backgrounds -- safe for secondary text.
3. **Deep Maroon passes AAA** on cream -- the accent color is one of the most accessible combinations in the palette.
4. **Focus rings**: Use `ring-maroon-300` (from the generated scale) with `ring-offset-2` for visible keyboard focus indicators.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| CSS theming | Tailwind CSS 4 `@theme` + CSS variables | CSS-in-JS (styled-components) | Adding a new styling paradigm to an existing Tailwind codebase creates inconsistency and bundle size overhead |
| Component library | No library -- utility classes | shadcn/ui | The redesign is brand-specific; shadcn's default aesthetic would need extensive overriding, adding complexity without value |
| Map styling | Mapbox Standard `setConfigProperty()` | Mapbox Studio custom style | Studio requires maintaining a separate style asset; `setConfigProperty()` keeps everything in code and version-controlled |
| Map styling | Mapbox Standard `setConfigProperty()` | Custom LUT | LUTs require image editing tools and are harder to iterate on; direct color properties are simpler for this scope |
| Animation | Framer Motion (existing) | CSS-only animations | CSS handles hover/focus well but cannot do layout animations, exit animations, or gesture-driven animations that the app already uses |
| Font loading | `next/font/google` | Google Fonts CSS `@import` | `next/font` eliminates layout shift, self-hosts fonts, and is the Next.js recommended approach |

## No New Dependencies Required

The redesign requires **zero new npm packages**. Everything needed is already installed:

- `tailwindcss` ^4 -- CSS theming via `@theme`
- `@tailwindcss/postcss` ^4 -- Build integration
- `framer-motion` ^12.33.0 -- Animations
- `mapbox-gl` ^3.18.1 -- Map styling via Standard style config
- `lucide-react` ^0.563.0 -- Icons
- `next` 16.1.6 -- Font optimization via `next/font/google`

```bash
# No installation needed -- all dependencies are present
npm run dev
```

## Sources

### Tailwind CSS 4
- [Theme variables documentation](https://tailwindcss.com/docs/theme) -- Official Tailwind CSS v4 docs on `@theme` directive, namespaces, `inline` modifier (HIGH confidence)
- [Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles) -- Official docs on `:root` vs `@theme` usage patterns (HIGH confidence)
- [Tailwind CSS v4.0 release blog](https://tailwindcss.com/blog/tailwindcss-v4) -- Architecture overview of CSS-first approach (HIGH confidence)
- [Customizing Colors](https://tailwindcss.com/docs/customizing-colors) -- Color namespace patterns, `--color-*: initial` override (HIGH confidence)
- [Dark mode docs](https://tailwindcss.com/docs/dark-mode) -- `@custom-variant dark` pattern for v4 (HIGH confidence)

### Mapbox GL JS
- [Mapbox Standard Style Guide](https://docs.mapbox.com/map-styles/standard/guides/) -- Configuration properties, light presets, color theming (HIGH confidence)
- [Mapbox Standard API Reference](https://docs.mapbox.com/map-styles/standard/api/) -- Complete list of `setConfigProperty` options including all color properties (HIGH confidence)
- [Set a style guide](https://docs.mapbox.com/mapbox-gl-js/guides/styles/set-a-style/) -- `config` parameter at init vs `setConfigProperty` at runtime (HIGH confidence)
- [Custom color theme LUT tutorial](https://docs.mapbox.com/help/tutorials/create-a-custom-color-theme/) -- Fallback LUT approach (MEDIUM confidence -- tutorial page didn't fully load)
- [Mapbox Light style](https://www.mapbox.com/maps/light) -- Light map baseline reference (MEDIUM confidence)

### Framer Motion
- [Motion (Framer Motion) docs](https://motion.dev/docs/react-motion-component) -- `motion` component, `layout` prop, `AnimatePresence` (HIGH confidence)
- [React transitions](https://motion.dev/docs/react-transitions) -- Transition configuration patterns (HIGH confidence)

### Typography
- [Inter typeface](https://rsms.me/inter/) -- Design rationale, screen optimization details (HIGH confidence)
- [Outfit on Google Fonts](https://fonts.google.com/specimen/Outfit) -- Geometric warmth characteristics (HIGH confidence)

### Accessibility
- WCAG contrast ratios calculated locally from hex values using relative luminance formula per [WCAG 2.1 Success Criterion 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) (HIGH confidence)
