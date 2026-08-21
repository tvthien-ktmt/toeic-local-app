---
name: overflow-safe-responsive-layout
description: Prevent basic layout bugs where content overflows its container with no way to reach it — a horizontal nav bar/toolbar that clips items off-screen with no horizontal scroll, a grid (number pad, table, card grid) that overflows its parent, any layout where some buttons/links become physically unreachable at common viewport widths. Use when building or reviewing any nav bar, toolbar, tab strip, grid, or table component, and whenever the user reports "bị tràn", "mất chức năng", "không truy cập được", "vỡ giao diện", or similar layout-breakage language.
---

# Overflow-Safe Responsive Layout

The failure mode this skill exists to prevent: a row of items (nav bar, toolbar, tab strip) is wider than its container. The browser doesn't wrap it, doesn't scroll it — it just **clips it silently**. Whatever falls past the edge still exists in the DOM, but no user can see it, click it, or tab to it with a keyboard. This is worse than an ugly UI — it's **inaccessible functionality that looks fine to whoever built it** because their monitor was wide enough to never trigger the bug.

Every horizontal row of interactive items ships with an explicit answer to "what happens when this doesn't fit?" — never left to the browser's default (which is silent clipping).

---

## Rule 1: A horizontal row of items NEVER has a fixed/undefined overflow behavior — pick one on purpose

```css
/* BAD — the default. When content is wider than the container, it clips.
   No scrollbar, no indicator, no way to reach the hidden items. */
.navbar {
  display: flex;
  white-space: nowrap;
}

/* OPTION A — horizontal scroll with a visible affordance.
   Good for a nav bar with many peer-level items (tabs, toolbar icons). */
.navbar {
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;          /* don't hide the scrollbar — a hidden
                                      scrollbar is the same bug with extra
                                      steps: no visual cue anything is
                                      cut off */
  gap: 0.5rem;
}
.navbar > * { flex-shrink: 0; }    /* items keep their size, row scrolls
                                      instead of squishing text unreadable */

/* OPTION B — collapse into a menu below a breakpoint.
   Better when items have unequal priority (primary nav vs. secondary). */
```

```tsx
// OPTION B in React — priority nav: show what fits, collapse the rest into "More"
function PriorityNav({ items }: { items: NavItem[] }) {
  const [visibleCount, overflowCount] = useAvailableWidth(items); // measure via
                                                                    // ResizeObserver,
                                                                    // never hardcode
  const visible = items.slice(0, visibleCount);
  const overflow = items.slice(visibleCount);

  return (
    <nav className="flex items-center gap-2">
      {visible.map(item => <NavLink key={item.id} {...item} />)}
      {overflow.length > 0 && (
        <DropdownMenu label={`Thêm (${overflow.length})`}>
          {overflow.map(item => <NavLink key={item.id} {...item} />)}
        </DropdownMenu>
      )}
    </nav>
  );
}
```

**Never both omit `overflow-x` AND assume the row will always fit.** A nav bar with 10 items (like `Kho Đề LC / Luyện Nghe LC / Dashboard LC / Sổ Lỗi LC / Kho Đề RC / ...`) will not fit a 1366px laptop screen once font, icons, and badges are accounted for — that's not an edge case, that's the normal case the moment a new nav item is added six months from now.

---

## Rule 2: Grids constrain to their container, never to a fixed pixel count

```css
/* BAD — assumes the container is always wide enough for 10 fixed-width
   columns. On a narrower viewport (sidebar open, smaller window, mobile),
   the grid overflows its parent instead of reflowing. */
.number-grid {
  display: grid;
  grid-template-columns: repeat(10, 48px);
}

/* GOOD — column count adapts to available width; nothing overflows */
.number-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 0.5rem;
}
```

A "Ma Trận 100 Câu" number grid, a data table, a card grid — all follow this rule. If a table specifically must scroll horizontally instead of reflowing (common for wide data tables), that's Rule 1's Option A applied to the table's wrapper (`<div className="overflow-x-auto"><table>...</table></div>`), not the table growing past its container with no wrapper at all.

---

## Rule 3: Build mobile-first, verify at fixed breakpoints — not "looks fine on my screen"

Test every new/changed layout at these widths before calling it done (from `addyosmani/agent-skills`, the most-starred production frontend skill on this pattern):

**320px, 768px, 1024px, 1440px** — plus whatever your actual sidebar/dark-mode-toggle states do to available width (a nav bar measured with the sidebar collapsed is not the same test as with it open).

```
// Tailwind: mobile-first, not desktop-first-then-hope
<nav className="
  flex overflow-x-auto gap-2 p-2   /* mobile: scrolls if needed */
  md:overflow-visible md:flex-wrap  /* wider: allow wrap instead if that's the intent */
">
```

Building desktop-first and "adding responsive later" is backwards — retrofitting overflow handling onto an already-built fixed-width nav bar is consistently more work than designing the overflow behavior in from the start.

---

## Rule 4: A component is not done until proven reachable, not just proven rendered

`npm run build` passing proves the code compiles. It proves **nothing** about whether every nav item is visible or clickable at a real viewport width — that bug ships clean through a green build every time. Verification for any nav bar / toolbar / grid change:

- [ ] At 320px and 768px width, every single item in the row is either visible, reachable by scrolling, or reachable via an overflow menu — **not one item is simply gone**.
- [ ] Tab through the row with the keyboard alone (no mouse) — every interactive item receives visible focus, in order, including ones that required scrolling to see.
- [ ] If using horizontal scroll (Rule 1 Option A): the scrollbar or a fade/arrow affordance is visibly present — a scrollable row that *looks* like it ends at the container edge, with no visual hint there's more, fails this check even though it's technically reachable.
- [ ] Paste an actual screenshot (or Playwright/browser-tool output) at the narrowest tested width as evidence — a claim of "responsive, tested" with no visual proof is not verified, the same way a "0 lỗi" audit claim with no pasted terminal output isn't verified. Re-render narration is not evidence; a screenshot is.

---

## Common rationalizations — reject these

| Excuse | Reality |
|---|---|
| "Nav bar fits fine on my screen" | Your screen is one data point, not a spec. A 13" laptop at default zoom, or the same screen with browser sidebar/devtools open, is a different width you didn't test. |
| "It has a horizontal scrollbar so it's fine" | Only if the scrollbar is actually visible/discoverable. An invisible/auto-hiding scrollbar with no other affordance is the same "user can't find the hidden items" bug, just technically scrollable. |
| "Build passed, so it's done" | A compile-clean build says nothing about layout overflow. That's a rendering/CSS problem, not a TypeScript problem — different failure class, different check. |
| "We'll fix responsive later" | Retrofitting is ~3x the work of building it correctly the first time (every added nav item since has to be re-tested against the retrofit). |
