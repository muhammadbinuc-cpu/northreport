# Feature Landscape: UI/UX Redesign

**Domain:** Community safety platform visual redesign (social/feed-first app)
**Researched:** 2026-03-07
**Scope:** UI/UX features for a complete visual overhaul -- no new backend features, only restyling existing functionality

---

## Table Stakes

Features users expect from any modern social/community app in 2026. Missing any of these makes the app feel unfinished or amateur.

### Navigation & Layout

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Responsive sidebar-to-bottom-tab-bar | Every modern web app (Twitter/X, Discord, Instagram web) uses sidebar on desktop and bottom tab bar on mobile. Current fixed 72px sidebar with no mobile adaptation leaves the app broken on phones. | Medium | Use Tailwind `hidden md:flex` for sidebar, `flex md:hidden` for bottom bar. 3-5 items max in bottom bar. Sidebar on desktop already exists, just needs responsive counterpart. |
| Sticky top bar / header with context | Users expect persistent navigation context (page title, neighborhood selector, back button). Current TopBar exists but styling is dark-theme glass. | Low | Restyle existing TopBar component. Light mode: Off-White background, subtle bottom border in Slate Grey, Maroon active indicators. |
| Active state indicators on navigation | Users need to know where they are. Current has animated bar via `layoutId` -- this is good but needs light-mode color treatment. | Low | Keep Framer Motion `layoutId` animation. Change colors from crimson-on-dark to Deep Maroon on Warm Cream. |
| Consistent page max-width and gutters | Content should not stretch to full viewport on ultrawide screens. Current dashboard uses `max-w-3xl`; feed does not constrain. | Low | Establish consistent `max-w-2xl` or `max-w-3xl` content column across all pages. Center with `mx-auto`. |

### Card Design

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clean card surfaces with consistent radius and shadow | Every social app (Reddit, Nextdoor, LinkedIn) uses consistent card containers for feed items. Current cards use glass-morphism (`bg-glass`, `backdrop-blur-xl`) which is heavy and dark-mode-only. | Medium | Replace glass cards with solid Warm Cream (#F5F0E1) or Pure White (#FFFFFF) backgrounds. Consistent `rounded-xl` (16px). Subtle shadow: `0 1px 3px rgba(0,0,0,0.08)`. 1px border in `rgba(85,85,85,0.12)`. |
| Visual content type indicators | Users need to distinguish Stories vs Posts vs Reports at a glance. Current uses emoji icons (book, clipboard, speech). | Low | Replace emoji with styled chips/badges using brand colors. Story = ephemeral indicator (Muted Rose ring or timer icon), Post = standard, Report = Deep Maroon accent badge. |
| Avatar / user identity on cards | Social platforms always show user identity prominently. Current has initial-letter avatar. | Low | Keep letter-avatar pattern but restyle: Deep Maroon background with white text for the initial, or Warm Cream background with Dark Charcoal text. Consistent 36-40px size. |
| Engagement action bar (vote, comment, share) | Universal on every social platform. Current exists with text+emoji buttons. | Medium | Replace emoji-based actions with clean SVG icon buttons. Consistent hit targets (44px min). Voted state = Deep Maroon fill. Uninvoted = Slate Grey outline. Add hover states with Muted Rose background. |
| Severity/status badges | Safety apps need clear severity indication. Current `SeverityChip` exists. | Low | Restyle with brand-consistent colors. Critical = solid red chip. High = orange. Medium = amber. Low = muted green. Use rounded-full pills with 10px font-weight-bold uppercase text. |

### Loading States

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Skeleton screens for feed loading | Skeleton loaders are table stakes in 2026. LinkedIn, Twitter, Reddit all use them. Current app shows a single spinner (`animate-spin` border circle). | Medium | Create skeleton card components matching FeedCard layout: gray rounded rectangles for avatar, title lines, action bar. Use `animate-pulse` on Tailwind or a shimmer CSS animation. Show skeleton only for loads >200ms. |
| Skeleton screens for dashboard loading | Dashboard currently shows the same spinner. | Medium | Create skeleton versions of HealthGauge (circular outline shimmer), PatternCard (rectangular placeholders), and draft list items. |
| Page transition animations | Current uses Framer Motion fade (opacity 0 to 1). This is minimum viable. | Low | Keep existing AnimatePresence pattern. Consider adding subtle `y: 8` slide-up for content entering. Keep transitions under 300ms. |
| Button loading states | When submitting forms, voting, or filing 311 reports, users need feedback that the action is processing. | Low | Add spinner or opacity reduction to buttons during API calls. Disable button during loading. Use existing `animate-spin` pattern inline. |

### Typography & Spacing

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear typographic hierarchy | Every polished app has distinct heading, body, caption, and label sizes. Current uses inline font-size classes inconsistently. | Medium | Establish type scale: Display (Outfit 600, 32-40px), H1 (Outfit 600, 24-28px), H2 (Outfit 600, 18-20px), Body (Inter 400, 14-16px), Caption (Inter 400, 12px), Label (Inter 500, 10-11px uppercase tracking-wider). Apply consistently across all pages. |
| Consistent vertical rhythm / spacing | Cards, sections, and page areas need predictable spacing. Current mixes `space-y-6`, `mb-3`, `mb-4`, `gap-4` without clear system. | Medium | Use 4px base grid. Standard gaps: between cards = 12-16px, between sections = 24-32px, card internal padding = 16-20px. Document and enforce. |
| Readable line lengths | Long lines of text are hard to read. Caption text should cap at ~65 characters per line. | Low | Use `max-w-prose` or explicit max-widths on text containers within cards. |

### Color & Theme

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Light-mode-primary design | The brand palette (Warm Cream, Off-White, Maroon) is designed for light mode. Current is entirely dark glassmorphism. This is the core of the redesign. | High | Full CSS variable overhaul in globals.css. Replace all `--bg-base: #121212` style dark values with light equivalents. Off-White (#FAF7ED) as page base. Warm Cream (#F5F0E1) as card/elevated surfaces. Dark Charcoal (#1E1E1E) as primary text. Deep Maroon (#6B0F1A) as accent/CTA. Slate Grey (#555555) as secondary text. |
| WCAG AA contrast compliance | Accessibility is non-negotiable. Brand guideline notes white-on-maroon only passes AA for large text. | Medium | Verify all text/background combinations. Dark Charcoal (#1E1E1E) on Off-White (#FAF7ED) = 15.3:1 (passes). White (#FFFFFF) on Deep Maroon (#6B0F1A) = 8.5:1 (passes). Slate Grey (#555555) on Off-White (#FAF7ED) = 5.7:1 (passes AA). Muted Rose (#A07070) must never be used for text. |
| Consistent accent usage | Primary CTA buttons, links, and active states should all use Deep Maroon. Secondary actions use Slate Grey or outlined styles. | Low | Audit every component for accent color usage. Primary = solid Deep Maroon with white text. Secondary = outlined with Maroon border. Ghost = text-only Maroon. |

### Map UI

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Brand-matched map tile theme | Map tiles should not clash with the app's light warm palette. Current uses `dark-v11` Mapbox style. | Medium | Switch to a light Mapbox style (`light-v11` or custom). Desaturate slightly. Match map chrome (controls, popups) to brand palette. |
| Map control styling consistent with app | Map zoom buttons, attribution, and floating controls should match the brand, not default Mapbox/Leaflet styles. | Low | Override default Leaflet/Mapbox control CSS. Use rounded corners, brand colors for buttons, brand fonts. |
| Popup/tooltip styling on map markers | When tapping hotspots or markers, popups should match card styling (Warm Cream background, brand typography). | Low | Style Leaflet/Mapbox popups with custom CSS class. Match card radius, shadow, and typography. |

### Landing Page

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear hero with value proposition | Every SaaS/app landing page needs a hero that explains what the product does in 5 seconds. Current hero is on a dark 3D map background with scroll-based sections -- visually heavy and slow to load. | High | Replace 3D map + 500vh scroll with a clean, fast-loading hero. Large headline in Outfit bold. Subheadline in Inter. Single primary CTA button (Deep Maroon). Optional hero illustration or screenshot. Off-White or Warm Cream background. |
| Social proof or credibility signals | Users expect trust indicators. Current has none beyond "Built for Waterloo." | Low | Add neighborhood count, report count, or "Built for Hamilton" badge. Even simple stats build trust. |
| Feature showcase sections | Users need to understand what the app does before signing up. Current uses phone mockup frames with scroll-reveal. | Medium | Replace with 2-3 clean sections showing key features: Feed, Map, AI analysis. Use actual screenshots or stylized illustrations. Light backgrounds. Clean grid layout. |
| Clear CTA hierarchy | Single primary action reduces cognitive load. Multiple CTAs reduce conversion by up to 266%. | Low | One primary CTA ("Get Started" or "Sign In") in Deep Maroon. Optionally one ghost/outlined secondary CTA ("Learn More"). Remove competing links. |

### Form & Input Styling

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Styled form inputs matching brand | Current inputs use `input-paper` class with dark theme styling. | Medium | Light inputs: Off-White or White background, 1px Slate Grey border, Dark Charcoal text, Deep Maroon focus ring. Rounded-lg (8px). Consistent height (40-44px). |
| Accessible focus indicators | Keyboard users need visible focus rings. | Low | Use Deep Maroon `ring-2` on focus for all interactive elements. Remove outline-none without replacement. |

---

## Differentiators

Features that are not expected but make the app feel premium, polished, and distinctive. These create the "wow" factor in a redesign.

### Micro-Interactions & Motion

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Vote button spring animation | Satisfying haptic-feeling feedback when upvoting, like Twitter's heart burst. Creates emotional engagement. | Low | Use Framer Motion `scale: [1, 1.3, 1]` with `type: "spring"` on vote. Add subtle color transition from grey to Maroon. 200ms duration. |
| Card entrance stagger | Cards appearing one-by-one with slight delay creates a sense of live data flowing in. Reddit and Twitter do this subtly. | Low | Use Framer Motion `variants` with `staggerChildren: 0.05` on feed container. Keep individual card animation under 300ms. Already partially implemented via `cardVariants`. |
| Smooth number transitions | Counters (upvotes, issue counts, health scores) that animate between values feel alive. | Medium | Use Framer Motion `useMotionValue` + `useTransform` for counter animations. Or CSS `counter-set` with transitions. Apply to vote counts, health gauges, dashboard stats. |
| Pull-to-refresh gesture on mobile feed | Native app feeling on the web. Creates sense of real-time updates. | Medium | Implement via touch events or `overscroll-behavior`. Show a branded spinner (maroon circular indicator) when pulling down. Trigger feed refresh API call. |
| Notification toast slide-in with progress bar | Current notifications auto-dismiss after 5s but give no visual countdown. A progress bar shows when it will disappear. | Low | Add a thin Deep Maroon progress bar at bottom of toast that shrinks over 5s. Use CSS `animation: shrink 5s linear`. |

### Visual Polish

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Warm cream gradient overlays | Subtle warm-to-transparent gradients at section boundaries create depth without glass-morphism heaviness. Feels premium on light backgrounds. | Low | Use `linear-gradient(to bottom, #FAF7ED 0%, transparent 100%)` at top/bottom of scrollable sections. Replaces current dark gradient masks. |
| Branded empty states with illustrations | When feed is empty, dashboard has no patterns, or 311 drafts list is clear -- show a warm, branded illustration with action-oriented copy. | Medium | Create or source simple monochrome illustrations in Deep Maroon/Slate Grey. Add encouraging copy: "Your neighborhood is quiet. That's a good thing." with CTA to report or explore. Apply to: empty feed, empty drafts, empty patterns, no search results. |
| Image cards with aspect-ratio crop | Feed items with photos should show them consistently cropped. Current uses `max-h-48 object-cover` which is functional but can feel inconsistent. | Low | Use `aspect-[16/9]` or `aspect-[4/3]` on image containers for consistent visual rhythm in the feed. Rounded top corners integrated with card. |
| Severity-colored left border on cards | A thin 3-4px left border on feed cards colored by severity (red/orange/amber/green) gives instant visual scanning ability without reading text. Similar to Jira ticket cards. | Low | Add `border-l-4` with severity color to FeedCard. This is a simple CSS addition that dramatically improves scanability. Already used on dashboard draft cards (`border-l-4 border-l-amber-500`). |
| Glassmorphism for overlays only | Glass-morphism is still trendy in 2026 but should be used sparingly -- only for floating overlays, not as the primary surface treatment. | Low | Reserve `backdrop-blur` for: floating action buttons, dropdown menus, mobile bottom sheet, and notification toasts. Never for primary card surfaces or backgrounds. |

### Navigation Refinements

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Collapsible sidebar with icon-only mode | On desktop, users can collapse sidebar to icon-only (current 72px width is already icon-only). But expanding to show labels on hover adds discoverability. | Medium | Add hover-expand behavior: sidebar goes from 72px (icons only) to ~200px (icons + labels) on hover. Use Framer Motion `animate` with `width`. Content area adjusts with `ml-[72px]` to `ml-[200px]` transition. |
| Breadcrumb trail on detail pages | When drilling into `/dashboard/issue/[id]`, users lose context. A breadcrumb (Dashboard > Issue > Pothole Cluster) maintains wayfinding. | Low | Add simple text breadcrumb below TopBar on detail pages. Use Slate Grey text with Maroon active/current link. |
| Scroll-to-top floating button on feed | Long feeds need a quick way to return to top. Instagram and Reddit have this. | Low | Show a small circular Deep Maroon button with up-arrow when scroll position > 500px. Fade in with Framer Motion. Smooth-scroll to top on click. |

### Dashboard Enhancements

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Health gauge redesign with ring charts | Current HealthGauge likely uses a basic circular indicator. Modern dashboards use animated SVG ring/donut charts with percentage text in center. | Medium | SVG circle with `stroke-dasharray` animation. Background ring in light grey, foreground ring in brand color. Animate on mount. Center text shows percentage. Use brand severity colors per metric. |
| Workflow pipeline visual | Current workflow tools section uses 3 equal cards with arrow icons between. A connected pipeline visual (steps connected by lines/arrows) better communicates the sequential flow. | Medium | Replace arrow-separated cards with a horizontal stepper/pipeline. Connected dots or lines between steps. Active step highlighted in Deep Maroon. Completed steps show checkmark. |
| Pattern card with sparkline | Pattern detection results could show a small inline sparkline chart showing report frequency over time. Communicates urgency visually. | High | Requires a lightweight chart library (recharts, or raw SVG). Show 7-day mini bar chart or line chart within each PatternCard. Brand-colored (Maroon for current, Slate Grey for historical). |

### Map Enhancements

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Custom branded map markers | Default Leaflet/Mapbox markers look generic. Custom markers with brand colors and severity indication feel integrated. | Medium | SVG markers with Deep Maroon fill, white icon center. Size scaled by severity or report count. Pulse animation on new/trending markers (subtle ring expansion). |
| Map detail sheet (bottom drawer on mobile) | When tapping a map marker on mobile, a bottom sheet sliding up with issue details is the standard pattern (Google Maps, Apple Maps, Citizen app). | High | Implement draggable bottom sheet with Framer Motion `drag="y"` and `dragConstraints`. Three snap points: peek (shows title), half, full. Warm Cream background. Brand-styled content. On desktop, keep the current right-side panel. |

---

## Anti-Features

Features to deliberately NOT build during this redesign. These are common mistakes or scope-creep traps.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Dark mode toggle | Scope explicitly says light-mode-primary redesign. Adding a toggle doubles the CSS surface area and testing burden. The brand palette is designed for light mode. | Commit fully to the light mode palette. If dark mode is ever needed, it should be a separate milestone after the light mode design is validated. |
| 3D map background on landing page | Current landing uses Mapbox 3D buildings as background with 500vh scroll. This is heavy (Mapbox GL JS is ~200KB), slow to load, and doesn't match the new clean/warm brand direction. | Replace with a clean, fast-loading static hero. If map imagery is desired, use a static screenshot or stylized SVG illustration of Hamilton's map. |
| Glassmorphism as primary surface treatment | The current dark glass-morphism (`backdrop-blur-xl`, `rgba(26,26,26,0.6)`) is a specific dark-mode aesthetic. On light backgrounds, frosted glass looks washed out and reduces readability. | Use solid card surfaces (White or Warm Cream) with subtle shadows. Reserve blur effects for floating overlays only. |
| Parallax scroll effects on the landing page | Current 500vh scroll-driven sections with fixed positioning and scroll transforms are heavy, difficult to maintain, and perform poorly on mobile. | Use standard vertical scroll with fade-in-on-scroll sections using Intersection Observer. Simpler, more performant, and easier to maintain. |
| Animated phone mockup frames | Current landing has PhoneFrame, PhoneScreens, Phone3D components. These are heavyweight and redundant in a light-mode redesign. | Show features via actual screenshots, stylized cards, or clean section layouts without device frames. |
| Emoji as UI icons | Current uses emoji for type indicators (book, clipboard, speech), actions, and labels. Emoji render differently across OS/browser and look unprofessional. | Replace all functional emoji with consistent SVG icons from a single icon set (Lucide, Heroicons, or custom). Keep emoji only in user-generated content. |
| News ticker / marquee auto-scroll on feed | Current feed page has a horizontal auto-scrolling marquee of issue cards. Marquees are a 1990s web pattern that create accessibility issues (no pause control, motion sickness risk, unreadable on mobile). WCAG 2.2.2 requires pause/stop/hide for auto-moving content. | Replace with a standard vertical feed or a horizontally scrollable card row with manual scroll (no auto-play). Or remove in favor of the primary vertical feed. |
| Over-animating page transitions | Heavy page transitions (scale, slide, rotate) slow down perceived navigation speed. Users want instant page changes. | Keep transitions to 200-300ms max. Prefer simple opacity + subtle y-translate. Never animate scale on page-level transitions. |
| Notification sound effects or browser push | Out of scope for a visual redesign. Would require service worker changes and permission flows. | Keep current in-app toast notifications. Restyle them to match brand palette. |
| Custom scrollbar styling | Cross-browser scrollbar CSS is fragile and can break on Firefox. Not worth the effort for marginal visual gain. | Leave default scrollbars. Focus effort on content within the scroll area. |

---

## Feature Dependencies

```
Light Mode CSS Variables ──> All Component Restyling
                         ├──> Card Design
                         ├──> Navigation Restyling
                         ├──> Form Input Restyling
                         ├──> Map UI Chrome
                         └──> Landing Page Rebuild

Typography Scale ──> Card Design
               └──> Dashboard Layout
               └──> Landing Page

Responsive Navigation (sidebar + bottom bar) ──> All Page Layouts
                                             └──> Map Page (full-bleed vs padded)

Skeleton Components ──> Feed Page
                   └──> Dashboard Page

Card Design System ──> FeedCard Restyle
                  └──> PatternCard Restyle
                  └──> Draft List Items
                  └──> Issue Detail Panel

Empty State Components ──> Feed (no items)
                      └──> Dashboard (no patterns)
                      └──> Dashboard (no drafts)

Map Tile Theme ──> Map Page
              └──> Landing Page (if map imagery used)

Landing Page Rebuild ──> independent (can be done in parallel with app restyling)
```

---

## MVP Recommendation

Prioritize in this order for maximum visual impact with minimum risk:

1. **Light mode CSS variable overhaul** (Table Stakes - Color & Theme) -- This is the foundation. Every other change depends on the CSS variables being correct. Change globals.css root variables first.

2. **Typography scale and spacing system** (Table Stakes) -- Establish the type hierarchy and spacing constants before touching individual components. This prevents inconsistency.

3. **Card design system** (Table Stakes) -- Restyle FeedCard, PatternCard, and all card-like containers. This single change transforms the most-viewed surfaces in the app.

4. **Navigation restyling + responsive bottom bar** (Table Stakes) -- Make the sidebar brand-consistent and add mobile bottom tab bar. Without this, the app is unusable on mobile.

5. **Skeleton loading states** (Table Stakes) -- Replace spinners with skeletons. Fast win, high perceived quality improvement.

6. **Landing page rebuild** (Table Stakes) -- Can be done in parallel with steps 3-5. Remove 3D map, replace with clean light-mode hero and feature sections.

7. **Map UI theming** (Table Stakes) -- Switch to light map tiles, brand-style popups and controls.

8. **Micro-interactions and polish** (Differentiators) -- Vote animations, card stagger, empty states. Do last when the foundation is solid.

**Defer:** Sparkline charts in PatternCards, collapsible sidebar expand-on-hover, pull-to-refresh gesture, map bottom sheet on mobile. These are genuine differentiators but add complexity that should wait until the base redesign is validated.

---

## Sources

- [9 Mobile App Design Trends for 2026 - UXPilot](https://uxpilot.ai/blogs/mobile-app-design-trends)
- [12 Mobile App UI/UX Design Trends for 2026 - Design Studio](https://www.designstudiouiux.com/blog/mobile-app-ui-ux-design-trends/)
- [12 UI/UX Design Trends That Will Dominate 2026 - Index.dev](https://www.index.dev/blog/ui-ux-design-trends)
- [Bottom Navigation Bar in Mobile Apps - AppMySite](https://blog.appmysite.com/bottom-navigation-bar-in-mobile-apps-heres-all-you-need-to-know/)
- [5 Map UI Design Patterns That Elevate UX - BricxLabs](https://bricxlabs.com/blogs/map-ui-design-patterns-examples)
- [Map UI Design Best Practices - Eleken](https://www.eleken.co/blog-posts/map-ui-design)
- [Dashboard Design UX Patterns - Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)
- [Admin Dashboard UI/UX Best Practices for 2025 - Medium](https://medium.com/@CarlosSmith24/admin-dashboard-ui-ux-best-practices-for-2025-8bdc6090c57d)
- [Empty State UX Examples - Eleken](https://www.eleken.co/blog-posts/empty-state-ux)
- [Empty State UI Design - SetProduct](https://www.setproduct.com/blog/empty-state-ui-design)
- [Toast UI Design Best Practices - Mobbin](https://mobbin.com/glossary/toast)
- [Toast Notification Best Practices - LogRocket](https://blog.logrocket.com/ux-design/toast-notifications/)
- [Skeleton Screens in React - Smashing Magazine](https://www.smashingmagazine.com/2020/04/skeleton-screens-react/)
- [Skeleton Loading States - Whitespectre](https://www.whitespectre.com/ideas/skeleton-screens-for-a-better-loading-experience-in-react/)
- [12 Micro Animation Examples 2025 - BricxLabs](https://bricxlabs.com/blogs/micro-interactions-2025-examples)
- [Tailwind CSS Best Practices 2025-2026 - FrontendTools](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns)
- [51 High-Converting SaaS Landing Pages 2025 - KlientBoost](https://www.klientboost.com/landing-pages/saas-landing-page/)
- [Dark Mode vs Light Mode UX Guide 2025 - AlterSquare](https://altersquare.medium.com/dark-mode-vs-light-mode-the-complete-ux-guide-for-2025-5cbdaf4e5366)
- [Framer Motion Page Transitions Next.js - Olivier Larose](https://blog.olivierlarose.com/articles/nextjs-page-transition-guide)
- [10 Best Neighborhood Apps Like Nextdoor 2025](https://companies.makeanapplike.com/apps/business/neighborhood-apps-like-nextdoor)
