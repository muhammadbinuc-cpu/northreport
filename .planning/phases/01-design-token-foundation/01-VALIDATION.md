---
phase: 1
slug: design-token-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-07
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None configured (CSS-only phase — visual validation) |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | DTKN-01 | smoke | `npm run build` | N/A | ⬜ pending |
| 01-01-02 | 01 | 1 | DTKN-02 | smoke | `npm run build` | N/A | ⬜ pending |
| 01-01-03 | 01 | 1 | DTKN-03 | manual | DevTools inspection | N/A | ⬜ pending |
| 01-01-04 | 01 | 1 | DTKN-04 | grep-audit | `grep -cE '#[0-9a-fA-F]{3,8}' app/globals.css` | N/A | ⬜ pending |
| 01-01-05 | 01 | 1 | DTKN-05 | manual | Visual shadow inspection | N/A | ⬜ pending |
| 01-01-06 | 01 | 1 | DTKN-06 | grep-audit | `grep 'backdrop' app/globals.css` | N/A | ⬜ pending |
| 01-02-01 | 02 | 1 | TYPO-01 | manual | DevTools font inspection | N/A | ⬜ pending |
| 01-02-02 | 02 | 1 | TYPO-02 | manual | Visual hierarchy check | N/A | ⬜ pending |
| 01-02-03 | 02 | 1 | TYPO-03 | manual | Already verified (existing 4px grid) | N/A | ⬜ pending |
| 01-02-04 | 02 | 1 | TYPO-04 | manual | DevTools width inspection | N/A | ⬜ pending |
| 01-02-05 | 02 | 1 | A11Y-01 | manual | Pre-computed contrast ratios verified | N/A | ⬜ pending |
| 01-02-06 | 02 | 1 | A11Y-02 | grep-audit | `grep -rn 'rose\|A07070' app/globals.css` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

No test framework installation needed. This phase is CSS-only — validation is:
1. `npm run build` (catches CSS syntax errors, TypeScript type errors)
2. `npm run lint` (catches ESLint issues)
3. Visual inspection confirming brand colors render correctly
4. Grep-based audits for hardcoded hex values and backdrop-blur usage

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Brand palette visible on all pages | DTKN-01, DTKN-03 | Visual CSS change — no test framework | Open each page, verify cream backgrounds, charcoal text, maroon accents |
| Shadow subtlety on light bg | DTKN-05 | Opacity perception requires visual check | Inspect cards — shadows should be barely visible, not heavy |
| Headings in Outfit 600, body in Inter 400 | TYPO-01 | Font rendering is visual | DevTools > Computed > font-family + font-weight on headings vs body |
| WCAG AA contrast ratios | A11Y-01 | Ratios pre-computed in RESEARCH.md | Spot-check 3 text/bg pairings with browser contrast checker |
| Muted Rose decorative only | A11Y-02 | Semantic usage check | Verify rose color never appears on text elements |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
