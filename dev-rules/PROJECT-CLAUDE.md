# Project rules — copy this into your project root as `CLAUDE.md` (or `AGENTS.md`)

The core rules live in your global rules file. This file declares what is specific to ONE project. Edit the values in the **Conventions** block; everything else reads from it. Delete sections that do not apply.

---

# Conventions (edit once per project)

The core rules say "the project's button / icon / image / helper". These lines are what they resolve to. `audit-rules.sh` reads this block too, so keep the keys as they are.

- Framework: `Next.js App Router` <!-- or: React (Vite) | Remix | Astro -->
- Path alias: `@/` <!-- or: ~/ | src/ -->
- Filenames: `kebab-case` <!-- or: PascalCase -->
- Types: `interface over type` <!-- or: type over interface -->
- React version: `19` <!-- 18 turns off the React.FormEvent rule -->
- Styling helper: `cn()` <!-- or: none (CSS Modules / styled-components) — turns off className rules -->
- Button: `Button from @/components` <!-- or: raw <button> allowed -->
- Icons: `lucide-react` <!-- or: @heroicons/react | @phosphor-icons/react | @radix-ui/react-icons | custom -->
- Images: `next/image` <!-- or: raw <img> allowed -->
- Internal links: `next/link` <!-- or: react-router Link | plain <a> -->

---

# Language

- Code comments and commit messages: **English** <!-- change to your team's language -->
- User-facing copy: **English** <!-- the language your product speaks -->
- Comments explain *why*, not *what*. A comment that repeats the code line is noise; delete it.

---

# Component checklist — MANDATORY

Before finishing any component file (`.tsx`), check every item:

- [ ] **One file = one component.** No helper components (Avatar, DayIcon, ItemRow...) declared in the same file. Split them out.
- [ ] **Pure constants** (not depending on props / state) → moved to the feature's `constants/`, not left in the component file.
- [ ] **Helper / utility functions** (formatting, calculation, data massaging) → moved to the feature's `utils/`, not left in the component file.
- [ ] **Buttons / icons / images from the declared source only** (see Conventions above). No mixing.
- [ ] **No inline type** in the function signature (e.g. `{ day }: { day: DayActivity }`) → declare a proper `interface`.
- [ ] **Blank line before `return`** in every component and function that has logic above it.
- [ ] **No duplicate function.** Before writing `formatXP`, `getWeekStart`... grep for it. Used in 2+ places → move to `utils/`.

---

# User-facing copy must match real behavior — MANDATORY

When you change how a feature behaves (a limit, a count, a step in a flow, how something enters a list...), **in the same turn grep and update every place that describes it to the user**:

- Landing / marketing constants
- Pricing page and free-tier lists
- Upgrade / paywall screens
- Onboarding slides
- Dashboard cards
- Chatbot / FAQ answers

Reason: copy that says one thing while the app does another is the fastest way to lose trust, and no linter catches it.

Rule of thumb: **grep the old wording before saying you are done.** When in doubt, ask, do not guess.

---

# Workflow — MANDATORY

- **Never commit or push on your own.** Wait until the user explicitly asks ("commit this", "push it") in the same turn.
- **Agent may run lint / build on its own:** `no` <!-- yes | no. "no" = only when the user asks; both are slow -->
- When the code is done, say so and let the user decide the next step.
