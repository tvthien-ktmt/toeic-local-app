# Dev Rules — Next.js App Router add-on

Append this to your global rules **only** when the project is Next.js with the App Router. It adds what the core rules cannot assume about a framework.

---

## `src/app/` — routes only

- `src/app/` contains route folders only (plus `api/`, `auth/` if any).
- Each route folder contains **exactly one `page.tsx`** (plus `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts` when needed). No other components live there.
- `page.tsx` only guards auth (server-side) and renders a component from `src/features/<name>/pages/`. All real UI lives in `features/`.

```tsx
// src/app/dashboard/page.tsx
import DashboardPage from "@/features/dashboard/pages/dashboard-page";
import { requireUser } from "@/lib/require-user";

export default async function Page() {
  const user = await requireUser();

  return <DashboardPage user={user} />;
}
```

---

## Server first

- Prefer server components. Reach for `"use client"` only when the component needs interactivity (state, effects, browser APIs, event handlers).
- Keep the `"use client"` boundary as low in the tree as possible: a client leaf inside a server page, not a client page wrapping server children.

---

## Next.js primitives

- Use `next/link` instead of `<a>` for internal navigation. `<a>` only for external domains or `target="_blank"`.
- Use `next/image` instead of `<img>` (unless the project rules explicitly allow `<img>`).
- Route handlers in `src/app/api/**/route.ts` validate input first, then auth, then work. Return `Response.json(...)` with a real status code; never swallow errors into a 200.
