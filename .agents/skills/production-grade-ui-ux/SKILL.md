---
name: production-grade-ui-ux
description: General-purpose standard for writing production-quality, accessible, responsive UI — not a checklist for one bug. Covers layout/overflow, responsive breakpoints, accessibility, interaction states, spacing/typography discipline, and avoiding generic "AI-generated" visual patterns. Use for ANY task that builds or modifies user-facing UI — components, pages, forms, nav/toolbars, tables, grids, modals — regardless of whether the user mentioned a specific bug. This is the default bar for UI code in this project, not a one-off fix.
---

# Production-Grade UI/UX

AI-written UI has a recognizable set of amateur mistakes, and they repeat across projects because each one individually looks "fine" in isolation — it's only at a real viewport width, with a keyboard instead of a mouse, or with real (long/short/empty) content that the code breaks. This skill is the standing bar every UI change is held to, not a reaction to one reported bug.

Before writing or reviewing any UI code, confirm it against every section below — not just the one that matches today's bug report.

---

## 1. Layout never silently overflows

Every container that can hold more content than it has room for needs an explicit answer for "what happens when this doesn't fit" — the browser's default (silent clipping, no scrollbar, no indicator) is never an acceptable answer.

```css
/* A row of items (nav bar, toolbar, tab strip): pick one on purpose */
.row { display: flex; overflow-x: auto; gap: 0.5rem; }   /* scrolls, with a visible scrollbar */
.row > * { flex-shrink: 0; }
/* or: collapse overflow items into a "More" menu once measured width is exceeded */

/* A grid (data table, card grid, number pad): size to the container, not to a fixed count */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 0.5rem; }
```

A component with 6 nav items today and no overflow handling is a landmine for the 7th item added next sprint — design the overflow behavior in from the start, not after someone reports missing buttons.

## 2. Responsive is mobile-first and verified at real breakpoints, not "looks fine on my monitor"

Build the small-viewport layout first, then expand — retrofitting responsive behavior onto a desktop-first layout is consistently more work and misses more cases than designing it in from the start.

```tsx
// Mobile-first Tailwind: base classes are the small-viewport styles
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

Verify at fixed widths before calling anything done: **320px, 768px, 1024px, 1440px**, and with the sidebar/toggle states this project actually has (a nav bar measured with the sidebar collapsed is a different layout than with it open).

## 3. Accessibility is a hard gate, not an afterthought

- Every interactive element is reachable and operable by keyboard alone (Tab, Enter, Space) — a `<div onClick>` with no `tabIndex`/`role`/`onKeyDown` fails this on its own; prefer a real `<button>`/`<a>` over reimplementing one.
- Every icon-only control has an `aria-label`. Every form input has an associated `<label>`.
- Focus moves deliberately on state change (opening a dialog moves focus into it; closing returns focus to the trigger) — focus should never silently vanish or stay on a now-hidden element.
- Color is never the *only* signal for state (error/success/selected) — pair it with an icon, text, or pattern. Contrast meets 4.5:1 for normal text, 3:1 for large text.

## 4. Every data-driven view handles all of its states, not just the happy path

A component that only renders correctly when data has already loaded and is non-empty is not finished.

```tsx
function TaskList({ tasks, isLoading, error }: Props) {
  if (isLoading) return <TaskListSkeleton />;                 // never a blank screen
  if (error) return <ErrorState message="..." onRetry={retry} />;
  if (tasks.length === 0) return <EmptyState message="Chưa có gì ở đây" />;
  return <ul>{tasks.map(t => <TaskItem key={t.id} task={t} />)}</ul>;
}
```

Missing any one of loading/error/empty is not a smaller bug than missing the happy path — it's the state a real user hits constantly (slow network, new account, filtered-to-zero-results) while the happy path is what the developer happened to see once while testing.

## 5. Spacing, typography, and color follow the project's existing scale — never invented values

```css
/* Good — on the project's spacing scale */
padding: 1rem; gap: 0.75rem;
/* Bad — arbitrary, doesn't align with anything else on the page */
padding: 13px; margin-top: 2.3rem;
```

Heading levels are semantic and sequential (`h1` once per page, no skipping `h2`→`h4`), not chosen for how big they look. Use the design system's semantic color tokens (`text-primary`, `bg-surface`) instead of raw hex values scattered per-component.

## 6. Avoid the generic "AI-generated" look

| Default AI reaches for | Why it's a problem | Do instead |
|---|---|---|
| Purple/indigo gradients everywhere | Every AI-built app looks identical | Use the project's actual palette |
| Rounded-2xl on everything | Flattens visual hierarchy | Consistent radius from the design system |
| Generic hero section, stock card grid | Template-driven, ignores actual content/priority | Layout driven by what this page's content actually needs |
| Lorem-ipsum placeholder text | Hides real layout problems (wrapping, overflow, truncation) | Realistic-length placeholder content |
| Oversized padding everywhere | Wastes space, kills hierarchy | Purposeful spacing, not maximum spacing |

## 7. A component is not done until proven, not just rendered

`npm run build` passing / no TypeScript errors proves the code compiles — it proves nothing about overflow, contrast, keyboard reachability, or empty states. Those are a different failure class and need a different check.

**Verification checklist before calling any UI change finished:**
- [ ] Tested at 320px, 768px, 1024px, 1440px — nothing overflows unhandled, nothing is clipped with no way to reach it.
- [ ] Tabbed through every interactive element with keyboard only, no mouse — everything reachable, in a sane order, with visible focus.
- [ ] Loading, error, and empty states all render something meaningful, not a blank area.
- [ ] No color-only state indicators; contrast checked on real text/background pairs, not assumed.
- [ ] Spacing/type/color pulled from the project's existing scale/tokens, not invented per-component.
- [ ] Evidence pasted (screenshot or browser-tool output at the narrowest tested width) — a claim of "responsive, accessible, tested" with no visual proof is not verified, same standard as any other "trust but verify" check in this project.

## Common rationalizations — reject these

| Excuse | Reality |
|---|---|
| "Looks fine on my screen" | One data point, not a spec — different laptop widths, zoom levels, and open sidebars are all different tests you didn't run. |
| "Build passed, so it's done" | Compile-clean says nothing about layout, contrast, or keyboard access — different bug class entirely. |
| "We'll make it responsive/accessible later" | Retrofitting is measurably more work than building it in from the start, and "later" tends not to arrive. |
| "It's just a prototype" | Prototypes become production code more often than not — build the foundation right the first time. |
| "The AI aesthetic is fine for now" | It reads as low-effort/generic the moment a real user compares it to any polished competitor. |
