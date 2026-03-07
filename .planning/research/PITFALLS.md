# Pitfalls Research

**Domain:** UI redesign -- dark glassmorphism to light-mode brand palette (community safety platform)
**Researched:** 2026-03-07
**Confidence:** HIGH (based on codebase audit + WCAG contrast calculations + ecosystem research)

## Critical Pitfalls

### Pitfall 1: Hardcoded Dark-Assumption Colors Scattered Across 40+ Components

**What goes wrong:**
The codebase has **297 hardcoded hex values**, **202 raw `rgba()` calls**, and **55 `bg-white/[opacity]` Tailwind classes** spread across 43+ component files. These all assume a dark background. Changing `globals.css` variables alone will NOT fix the UI -- components like `SmartReportAgent.tsx` (31 instances of `bg-white/[opacity]`), `FluidMap.tsx` (inline CSS in a `<style jsx global>` block), and `DigestView.tsx` (hardcoded `#8b1a2b`, `#888`, `text-white`) will remain visually broken on a light background. `bg-white/[0.06]` on a cream background is invisible. `text-white/40` on cream is unreadable. These are not "small fixes" -- they are the majority of the visual surface area.

**Why it happens:**
The original design used `rgba(255, 255, 255, low-opacity)` as a deliberate dark-mode glassmorphism technique for subtle overlays. Developers naturally hardcoded these rather than using CSS variables because glass effects require specific alpha channel values that don't map to a simple token system. The same pattern exists in 20+ files using `backdrop-blur` alongside these semi-transparent whites.

**How to avoid:**
1. Before ANY visual work, audit and catalog every hardcoded color. Group into three buckets: (a) CSS variable values in `globals.css` (easy swap), (b) inline `style={}` props in components (medium -- 294 instances across 45 files), (c) Tailwind utility classes with hardcoded values (hard -- scattered through JSX).
2. Create the new CSS variable system in `globals.css` FIRST, then migrate components file-by-file to use variables instead of hardcoded values.
3. Establish a rule: ZERO hardcoded hex/rgba values in component files. Every color reference must use a CSS variable or Tailwind theme token.

**Warning signs:**
- Components render with invisible elements (white-on-cream)
- Text that was legible on dark backgrounds becomes unreadable
- Glass-effect containers that disappear entirely
- "It looked fine on that one page" but other pages are broken

**Phase to address:**
Phase 1 (Foundation). The CSS variable system and design token migration MUST happen before individual component restyling. Without this, every component touched will need to be revisited.

---

### Pitfall 2: Muted Rose (#A07070) Used as Text or Interactive Element Color

**What goes wrong:**
Muted Rose (#A07070) only achieves a **3.65:1 contrast ratio on Warm Cream** and **3.88:1 on Off-White** -- both FAIL WCAG AA for normal text (requires 4.5:1). It barely passes AA for large text (3:1). The brand guidelines explicitly say "decorative only, not for text," but during implementation, developers will inevitably use it for secondary text, placeholder text, links, or icon labels because it "looks right" as a warm muted accent. On Dark Charcoal, it only achieves **4.01:1** -- also fails AA normal text.

**Why it happens:**
Muted Rose is visually appealing and feels like a natural "light accent" in the warm palette. Designers and developers intuitively reach for it as a softer alternative to maroon for less-important text. Without explicit tooling to prevent it, it will creep into secondary text, captions, and disabled states.

**How to avoid:**
1. Use Slate Grey (#555555) for secondary text on light backgrounds -- it achieves **6.54:1** on Warm Cream (passes AA).
2. Use Deep Maroon (#6B0F1A) for accent text/links -- it achieves **10.79:1** on Warm Cream (passes AAA).
3. Restrict Muted Rose to: borders, decorative dividers, background tints (e.g., `rgba(160, 112, 112, 0.1)`), and hover states on non-text elements only.
4. Add a comment in globals.css next to the Muted Rose variable: `/* DECORATIVE ONLY -- fails WCAG AA for text on all backgrounds */`

**Warning signs:**
- Any text using `color: var(--muted-rose)` or `text-[#A07070]`
- Caption, label, or placeholder text in Muted Rose
- Interactive elements (links, buttons) using Muted Rose as their color
- Automated accessibility audits flagging contrast failures

**Phase to address:**
Phase 1 (Foundation). Define the accessible color usage rules in the design token system before any component work begins. Include contrast ratio notes as comments alongside each variable.

---

### Pitfall 3: Map Tile Style Mismatch -- 6 Files Hardcode `dark-v11`

**What goes wrong:**
Six files (`FluidMap.tsx`, `HamiltonHero.tsx`, `Map3D.tsx`, `ReportJourney.tsx`, `MapScene.tsx`, `app/page.tsx`) hardcode `mapbox://styles/mapbox/dark-v11` as the map tile style. Switching app chrome to a light palette while leaving maps in dark mode creates a jarring visual disconnect. But simply swapping to `light-v11` breaks the existing 3D building layer (currently white buildings on dark = dramatic; white buildings on light = invisible). The FluidMap also uses inline CSS (`<style jsx global>`) with hardcoded dark colors for map markers (`.snap-marker-label { background: rgba(0,0,0,0.85) }`, `.snap-marker-photo { background: #1a1a2e }`). The vignette overlay in FluidMap assumes a dark palette (`rgba(10,20,35,0.6)`).

**Why it happens:**
Maps are a separate rendering context from the app UI. Their tile styles, marker DOM elements, and overlay gradients all use their own color systems. A theme change to the app does not cascade into Mapbox GL layers, custom HTML markers, or SVG overlays.

**How to avoid:**
1. Choose a light Mapbox style that complements the brand: `mapbox://styles/mapbox/light-v11` as baseline, then customize 3D building colors to use a warm-tinted alternative (e.g., a light gray or cream tone instead of pure white).
2. Centralize the map style string in `lib/constants.ts` so all 6 files reference one value.
3. Restyle ALL custom map markers in FluidMap to use brand-palette variables, not hardcoded dark colors. The marker labels, pointer arrows, and photo borders all need updating.
4. Adjust the vignette overlay gradient to match the new light palette or remove it entirely.
5. Update the `you-dot` and `you-label` styles to use brand variables instead of hardcoded `#8b1a2b`.

**Warning signs:**
- Maps appear as dark rectangles in an otherwise light UI
- 3D buildings become invisible against light map tiles
- Map markers look like they belong to a different app
- Vignette overlay creates a dark smudge over light maps

**Phase to address:**
Dedicated map phase (should be its own phase or clearly sequenced after the core design token phase). Map restyling is substantial and distinct from general component restyling.

---

### Pitfall 4: Glassmorphism Patterns That Do Not Translate to Light Mode

**What goes wrong:**
The codebase uses 49 instances of `backdrop-blur` / `backdrop-filter` and 20+ `glass-card` class references. Glassmorphism (frosted glass effect) works because semi-transparent light surfaces over a dark background create a subtle, elegant contrast. On a light background, the same technique produces a **washed-out, muddy appearance** -- the frosted effect becomes barely visible or creates an ugly gray smear. The existing `--bg-glass: rgba(26, 26, 26, 0.6)` CSS variable specifically creates a dark frosted overlay; on a cream background this will appear as a dirty gray rectangle.

**Why it happens:**
Glassmorphism inherently depends on background luminosity contrast. Dark glass on dark = elegant. Light glass on light = indistinguishable. The technique needs to be fundamentally rethought, not just recolored.

**How to avoid:**
1. Replace glassmorphism with **elevated card patterns** for light mode: solid or near-solid cream/white backgrounds with subtle shadows (`box-shadow`) for depth.
2. Where glass effects are still desired (e.g., map overlays, floating panels), use `rgba(255, 255, 255, 0.85)` or `rgba(245, 240, 225, 0.9)` with a subtle shadow -- not just inverting the existing dark glass colors.
3. Audit all 20+ files using `glass-card` and replace with the new card system.
4. The `paper-card` / `paper-texture` system already exists in globals.css and is a better starting point for light mode than the glass system.

**Warning signs:**
- Cards that blend into the background and become invisible
- Floating panels with no visible edges
- Content that looks like it has a dirty overlay
- Users unable to distinguish interactive card regions from background

**Phase to address:**
Phase 1 (Foundation). Define the new card/surface elevation system as part of the design tokens before restyling components. The existing `paper-card` CSS class can be evolved rather than creating a new system.

---

### Pitfall 5: Inline `style={}` Props Create Unmaintainable Color Overrides

**What goes wrong:**
There are **294 inline `style={}` props** across 45 component files. Many of these set colors directly: `style={{ color: 'var(--ink-primary)' }}`, `style={{ background: 'var(--accent-muted)' }}`, and worse, `style={{ borderColor: 'rgba(196, 90, 59, 0.2)' }}`. While those using CSS variables will automatically update when variables change, the ones with hardcoded values will not. More critically, inline styles have the highest CSS specificity -- they override Tailwind classes and CSS custom properties. This creates a two-tier system where some elements respond to theme changes and others stubbornly retain old colors.

**Why it happens:**
Components like `FeedCard.tsx` (14 inline style props) and `CaptureCamera.tsx` (34 inline style props) were built by setting visual properties directly on elements rather than through Tailwind classes. This is common in rapid prototyping but creates a maintenance nightmare during redesign.

**How to avoid:**
1. During each component's restyling, migrate ALL inline `style={}` color/background/border properties to Tailwind classes or CSS variables applied through `className`.
2. Prioritize the heaviest offenders first: `CaptureCamera.tsx` (34), `PhoneDemo.tsx` (18), `IssueDetailPanel.tsx` (17), `Phone3D.tsx` (17), `ReportJourney.tsx` (16), `FeedCard.tsx` (14), `TopBar.tsx` (13), `GeminiScanner.tsx` (12).
3. Inline styles are acceptable ONLY for dynamic values (e.g., `style={{ left: \`\${percent}%\` }}`), not for static colors.

**Warning signs:**
- Components where changing CSS variables has no visible effect
- Colors that "stick" to old values after theme update
- Needing to grep through JSX to find where a color is coming from
- Different instances of the same component having different colors

**Phase to address:**
Each component-restyling phase. Not a standalone phase, but a strict rule within every component touch: "zero hardcoded inline colors when you leave the file."

---

### Pitfall 6: Shadow System Inversion Oversight

**What goes wrong:**
The existing shadow system uses `rgba(0, 0, 0, 0.3-0.5)` values (`--shadow-glass-sm/md/lg`) designed for dark backgrounds. On dark backgrounds, black shadows are subtle and natural. On light backgrounds, these same shadows will be **dramatically too heavy** -- creating harsh, brutalist drop-shadows that make the UI look dated and heavy. The `--shadow-glow-accent` (`0 0 20px rgba(139, 26, 43, 0.3)`) will also look harsh and neon-like on light backgrounds where it was previously a subtle halo.

**Why it happens:**
Shadows are one of the most overlooked elements in dark-to-light migrations. They "work" technically (they still cast) but the visual weight completely changes. Developers focus on foreground/background colors and forget that elevation/depth system needs recalibrating.

**How to avoid:**
1. Reduce shadow opacity to 0.05-0.15 range for light mode (vs. current 0.3-0.5).
2. Add a subtle warm tint to shadows: use `rgba(30, 30, 30, 0.08)` or `rgba(107, 15, 26, 0.06)` instead of pure black.
3. Remove or dramatically reduce `--shadow-glow-accent` -- accent glows are a dark-mode technique. On light mode, use a subtle border or outline instead.
4. Update all shadow variables in the `:root` block of `globals.css` during the foundation phase.

**Warning signs:**
- Cards that look like they're floating with heavy dark outlines
- Buttons with shadows that appear "stamped on" rather than elevated
- Glow effects that look neon or garish on light backgrounds
- Overall UI feeling heavy or oppressive despite light colors

**Phase to address:**
Phase 1 (Foundation). Shadow system update is part of the design token overhaul -- same pass as color variables.

---

### Pitfall 7: Status/Severity Colors Losing Readability on Light Backgrounds

**What goes wrong:**
The current status and severity colors (red `#EF4444`, orange `#F97316`, yellow `#EAB308`, green `#22C55E`, blue `#3B82F6`) were chosen for readability on dark backgrounds. On light backgrounds, particularly on Warm Cream (#F5F0E1):
- Yellow (`#EAB308`) becomes nearly invisible -- yellow text on cream is notoriously unreadable.
- Light green (`#22C55E`) loses contrast significantly.
- The status chip backgrounds use `rgba(color, 0.1)` which assumes a dark base -- on cream, these will be nearly invisible or create muddy undertones.

**Why it happens:**
Status colors are often treated as "universal" -- red is red regardless of background. But the perceived contrast and readability of saturated colors changes dramatically between dark and light contexts. Yellow and green are particularly problematic.

**How to avoid:**
1. Darken all status colors by 1-2 stops for light mode: use `#B91C1C` instead of `#EF4444` for critical, `#A16207` instead of `#EAB308` for caution, `#15803D` instead of `#22C55E` for success.
2. Replace the `rgba(color, 0.1)` chip backgrounds with `rgba(color, 0.08)` on light backgrounds and add a solid border at `rgba(color, 0.25)`.
3. Test every severity chip against Warm Cream, Off-White, AND Pure White backgrounds -- each has different contrast characteristics.
4. Never use yellow/amber text without a contrasting background pill/chip.

**Warning signs:**
- Yellow "medium" severity chips that vanish on cream backgrounds
- Green "success" indicators that look washed out
- Severity badges that all look similar because contrast differentiation is lost
- Status chips where the colored background is invisible, leaving only text

**Phase to address:**
Phase 1 (Foundation) for the variable definitions, then verified during the component restyling phases.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Batch find-and-replace hex values | Fast color swaps across many files | Misses context-dependent colors (a shadow hex is not the same as a text hex); creates subtle visual bugs | Never for a production redesign -- each file needs visual review |
| Keeping inline `style={}` props and just updating values | Faster than migrating to Tailwind classes | Perpetuates the specificity problem; makes future theme changes equally painful | Only acceptable for the CaptureCamera overlay (needs dynamic opacity for viewfinder) |
| Leaving `dark-v11` Mapbox style and "fixing it later" | Ship faster, maps still "work" | Jarring UX disconnect; users perceive the app as half-finished | Never -- maps are a primary surface; inconsistency here undermines trust |
| Using Tailwind `dark:` prefix for dual-mode support | Enables light/dark toggle | Doubles class count; Tailwind v4 default dark mode strategy conflicts; adds complexity | Only if dark mode toggle is a requirement (currently NOT in scope) |
| Skipping reduced-motion queries for animations | Less code to write | Accessibility violation (WCAG 2.1 SC 2.3.3); motion-sensitive users get overwhelmed | Never -- add `prefers-reduced-motion` media query to globals.css at minimum |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Mapbox GL JS | Swapping tile style but forgetting custom layers (3D buildings, circle markers, sky layer) reference dark-mode colors | After calling `setStyle()` or changing the style prop, re-add all custom layers with updated paint properties. Centralize layer configs in a shared module. |
| Mapbox HTML Markers | Marker DOM elements use inline CSS from JavaScript (`createElement` in `FluidMap.tsx`) that bypass React and CSS variable systems | Rewrite `createPhotoMarker()` and `createYouMarker()` functions to reference CSS classes defined in globals.css rather than hardcoded inline styles |
| Leaflet (react-leaflet) | Leaflet tile layer uses its own URL/style separate from Mapbox; easy to forget when updating Mapbox | Verify `CityMap.tsx` / any Leaflet-based maps also use light tiles (e.g., CartoDB Positron or Stamen Toner Lite) |
| Framer Motion | Animation values like `boxShadow: 'var(--shadow-paper-lg)'` in motion variants reference CSS variables at definition time, not animation time | Test that motion variant shadow/color animations read updated CSS variable values; if not, move to runtime-computed values |
| `prose-invert` (Tailwind Typography) | `DigestView.tsx` uses `prose prose-invert` for markdown rendering -- `prose-invert` forces white text, which will be invisible on light backgrounds | Change to `prose` (without `-invert`) and ensure heading/link colors use brand palette via `prose-headings:text-maroon` etc. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Landing page rebuild creates large JS bundle | Slow initial load, poor Lighthouse score | The current landing has 24 component files including heavy 3D/animation components (Phone3D, HeroGlobe, CitySkyline). If rebuilding, use code-splitting and `next/dynamic` for below-fold sections. | Immediate -- landing is first page users see |
| CSS variable cascade through 960+ lines of globals.css | Specificity conflicts, unexpected inheritance, hard to debug | Organize variables into clear sections (surfaces, text, borders, accents, status). Remove the "Legacy aliases" that create double-indirection (`--paper-base: var(--bg-base)` then `var(--paper-base)`) | During development -- cascading variable references make debugging painful |
| `backdrop-blur` performance on mobile | Janky scrolling, dropped frames on mid-range phones | Light mode replacement (solid backgrounds + shadows) will actually IMPROVE performance. If keeping any blur effects, limit to max 2-3 elements visible simultaneously. | On lower-end Android devices, immediately |
| Base64 images in Firestore displayed in feed cards | Large DOM, slow rendering when many cards visible | Not directly a redesign issue, but card redesign is an opportunity to add lazy loading (`loading="lazy"`) to card images | At 20+ visible cards |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Dark navigation sidebar (#1E1E1E) next to light content area (#F5F0E1) creates extreme contrast boundary | Eye strain from constant luminance jumps as users scan left-to-right; "split personality" feel | Either lighten the nav to match the content (e.g., white/cream with maroon accents) OR use a warm dark (not pure dark charcoal) with a smooth gradient transition zone |
| Warm cream (#F5F0E1) page background feels "yellowed" or "aged" on some monitors | Users perceive the app as old-fashioned or "broken" (especially on uncalibrated displays) | Use Off-White (#FAF7ED) as the primary page background and reserve Warm Cream for card/panel backgrounds -- this creates depth while avoiding the "yellowed paper" perception |
| Removing dark mode entirely alienates users who prefer it | User complaints, reduced usage in low-light environments | Even without a toggle, ensure the current redesign does not prevent future dark mode addition. Use CSS variables throughout (not hardcoded light colors) so a dark theme can be layered later via a class or media query |
| Maroon CTAs on cream background look like "warning" buttons | Users hesitate to click because deep red signals "danger" or "error" in Western UI conventions | Pair maroon CTAs with positive microcopy, add gentle hover transitions (lighten on hover), and reserve pure red for actual error/danger states. Consider using maroon for branding elements and a slightly different shade or treatment for CTAs. |

## "Looks Done But Isn't" Checklist

- [ ] **Status chips:** Yellow/amber severity text visible on cream backgrounds -- verify with WebAIM contrast checker, not just visual inspection
- [ ] **Map markers:** FluidMap marker labels and pointer arrows updated from dark-mode hardcoded CSS in `<style jsx global>` block -- this is in JavaScript-generated DOM, not in component JSX
- [ ] **Markdown rendering:** `DigestView.tsx` uses `prose-invert` -- generated HTML content (markdown) will be white text on light background until class is changed
- [ ] **Form inputs:** Focus states (`focus:border-crimson/40`, `focus:bg-white/[0.06]`) in SmartReportAgent and CaptureCamera assume dark backgrounds -- focus rings may be invisible on light
- [ ] **Scrollbar styling:** Custom scrollbar colors in globals.css use `var(--ink-faint)` and `var(--paper-warm)` -- verify these resolve to appropriate light-mode colors
- [ ] **Loading spinners:** Multiple components use `border-[var(--accent-primary)] border-t-transparent` -- verify spinner is visible on light backgrounds
- [ ] **Error states:** Red error text (`text-red-400`) may lack contrast on warm cream backgrounds -- darker red needed
- [ ] **Empty states:** DigestView empty state uses `bg-white/[0.03]`, `border border-white/10`, `text-white` -- all invisible on light mode
- [ ] **Voice overlay:** VoiceOverlay uses `glass-card`, `bg-white/5`, hardcoded `#888` and `#666` grays -- needs complete restyle
- [ ] **Emoji rendering:** Emoji icons (used as type indicators in FeedCard) render differently on light vs dark backgrounds -- some may need background pills for visibility
- [ ] **CaptureCamera viewfinder:** 34 inline style props with dark-mode-specific rgba values for camera overlay, scan lines, and UI chrome -- nearly every visual element needs updating
- [ ] **3D buildings on map:** White `fill-extrusion-color: '#FFFFFF'` buildings disappear on light-v11 map tiles -- change to a warm gray or cream tone

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Hardcoded colors missed in migration | MEDIUM | Run grep for remaining hex codes + `rgba(` + `bg-white/` patterns after each phase. Automated linting rule can catch future regressions. |
| Muted Rose used for text | LOW | Search-and-replace instances. Change to Slate Grey for secondary text or Deep Maroon for accent text. |
| Map style mismatch | HIGH | Requires touching 6 files, rewriting marker creation functions, updating 3D layer configs, and adjusting overlay gradients. Cannot be done incrementally. |
| Glassmorphism not translating | MEDIUM | Replace glass-card class definition in globals.css. Components using it will inherit the new style, but backdrop-blur inline props need per-file fixes. |
| Shadows too heavy | LOW | Update 4 CSS variables in globals.css. All components using variables will update immediately. |
| Status colors unreadable | LOW | Update 8 CSS variables in globals.css. Test each chip variant visually. |
| Accessibility contrast failures | MEDIUM | Requires per-component audit with automated tools (axe-core, Lighthouse). Fix each instance individually. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Hardcoded dark-assumption colors | Phase 1 (Foundation/Tokens) | `grep -r "rgba\|#[0-9a-f]" components/` returns zero matches outside CSS variable references |
| Muted Rose text accessibility | Phase 1 (Foundation/Tokens) | All text color variables pass 4.5:1 contrast on their intended backgrounds |
| Map tile style mismatch | Map restyling phase | All 6 files reference a single constant; map markers use CSS classes not inline colors |
| Glassmorphism to elevation | Phase 1 (Foundation/Tokens) | `glass-card` class redefined; `backdrop-blur` count reduced from 49 to <5 (only for map overlays) |
| Inline style migration | Each component phase | `style={}` count per file <= 3 (only for truly dynamic values like positions) |
| Shadow system recalibration | Phase 1 (Foundation/Tokens) | Shadow opacity values between 0.04 and 0.15; no `glow` shadows on standard components |
| Status/severity readability | Phase 1 (Foundation/Tokens), verified in component phases | Every status chip passes WCAG AA (4.5:1) on Warm Cream AND Off-White |
| `prose-invert` in markdown | Component restyling (DigestView) | Rendered markdown has dark text on light background |
| Landing page performance | Landing page rebuild phase | Lighthouse Performance score >= 90; no 3D/heavy components loaded synchronously |
| Reduced motion support | Phase 1 (Foundation) | `@media (prefers-reduced-motion: reduce)` block in globals.css disabling all custom animations |

## NorthReport Palette -- Contrast Ratio Reference

Calculated WCAG contrast ratios for all critical palette combinations:

| Foreground | Background | Ratio | WCAG Level | Safe For |
|------------|------------|-------|------------|----------|
| Dark Charcoal (#1E1E1E) | Warm Cream (#F5F0E1) | 14.63:1 | AAA | All text |
| Dark Charcoal (#1E1E1E) | Off-White (#FAF7ED) | 15.55:1 | AAA | All text |
| Deep Maroon (#6B0F1A) | Warm Cream (#F5F0E1) | 10.79:1 | AAA | All text, links, accents |
| Deep Maroon (#6B0F1A) | Off-White (#FAF7ED) | 11.47:1 | AAA | All text, links, accents |
| Pure White (#FFFFFF) | Deep Maroon (#6B0F1A) | 12.29:1 | AAA | Button text, hero text |
| Pure White (#FFFFFF) | Dark Charcoal (#1E1E1E) | 16.67:1 | AAA | Nav text, footer text |
| Slate Grey (#555555) | Warm Cream (#F5F0E1) | 6.54:1 | AA | Secondary text, captions |
| Slate Grey (#555555) | Off-White (#FAF7ED) | 6.96:1 | AA | Secondary text, captions |
| **Muted Rose (#A07070)** | **Warm Cream (#F5F0E1)** | **3.65:1** | **Large only** | **DECORATIVE ONLY** |
| **Muted Rose (#A07070)** | **Off-White (#FAF7ED)** | **3.88:1** | **Large only** | **DECORATIVE ONLY** |
| **Deep Maroon (#6B0F1A)** | **Dark Charcoal (#1E1E1E)** | **1.36:1** | **FAIL** | **Never use together** |
| **Warm Cream (#F5F0E1)** | **Off-White (#FAF7ED)** | **1.06:1** | **FAIL** | **No contrast -- same zone** |

Key takeaway: The primary text combinations (Dark Charcoal on Cream, Maroon on Cream, White on Maroon) all pass AAA. The danger zones are Muted Rose for text and using Warm Cream/Off-White as differentiated surfaces without a border.

## Sources

- Codebase audit: direct grep analysis of /Users/muaaz/northreport/components/ and /Users/muaaz/northreport/app/globals.css
- WCAG contrast ratios: calculated using W3C relative luminance formula per [WCAG 2.1 SC 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) (methodology reference)
- [Tailwind CSS v4 Dark Mode Docs](https://tailwindcss.com/docs/dark-mode) -- dark mode configuration changes in v4
- [Mapbox GL JS Style Switching](https://docs.mapbox.com/mapbox-gl-js/example/style-switch/) -- map style change documentation
- [Framer Motion Accessibility](https://motion.dev/docs/react-accessibility) -- reduced motion support
- [Dark Mode Design: Trends, Myths, and Common Mistakes](https://webwave.me/blog/dark-mode-design-trends) -- dark/light transition pitfalls
- [Dark Mode vs Light Mode UX Guide 2025](https://altersquare.io/dark-mode-vs-light-mode-the-complete-ux-guide-for-2025/) -- shadow and elevation differences
- [Basedash: Light Mode Without dark: Class](https://www.basedash.com/blog/how-we-built-light-mode-without-tailwind-s-dark-class) -- CSS variable approach for theme switching

---
*Pitfalls research for: NorthReport UI Redesign (dark glassmorphism to light brand palette)*
*Researched: 2026-03-07*
