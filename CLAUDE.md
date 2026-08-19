# Conventions (edit once per project)

- Framework: `React (Vite)`
- Path alias: `@/`
- Filenames: `PascalCase`
- Types: `interface over type`
- React version: `19`
- Styling helper: `none`
- Button: `raw <button> allowed`
- Icons: `lucide-react`
- Images: `raw <img> allowed`
- Internal links: `react-router Link`

---

# Language

- Code comments and commit messages: **English**
- User-facing copy: **English** / **Vietnamese**
- Comments explain *why*, not *what*. A comment that repeats the code line is noise; delete it.

---

# Component checklist — MANDATORY

Before finishing any component file (`.tsx`), check every item:

- [ ] **One file = one component.** No helper components (Avatar, DayIcon, ItemRow...) declared in the same file. Split them out.
- [ ] **Pure constants** (not depending on props / state) → moved to `constants/`, not left in the component file.
- [ ] **Helper / utility functions** (formatting, calculation, data massaging) → moved to `utils/`, not left in the component file.
- [ ] **Buttons / icons / images from the declared source only** (see Conventions above). No mixing.
- [ ] **No inline type** in the function signature (e.g. `{ day }: { day: DayActivity }`) → declare a proper `interface`.
- [ ] **Blank line before `return`** in every component and function that has logic above it.
- [ ] **No duplicate function.** Before writing `formatXP`, `getWeekStart`... grep for it. Used in 2+ places → move to `utils/`.
- [ ] **Component length limit:** Aim to keep components under ~300 lines. If a component exceeds 300 lines, consider extracting sub-views or sub-components.

---

# Dev Rules — Core

## Project structure
Organize code cleanly:
- `frontend/src/components/` — UI components
- `frontend/src/pages/` — Page routes
- `frontend/src/hooks/` — Custom hooks
- `frontend/src/utils/` — Pure functions
- `frontend/src/api/` — API clients & services
- `frontend/src/types/` — TypeScript interfaces & models

## Component rules
- **One file = one component.** Do not declare several components in one file.
- Every declared hook must be used; delete unused ones.
- Always fix TypeScript errors and warnings in components and functions.
- **Before creating a new util / hook / constant, grep for the file name and the function name.** Never create a second copy of an existing utility.

## Naming conventions
- **Variable and function names must describe meaning.** No single letters or vague abbreviations such as `a`, `b`, `c`, `p`, `res`, `tmp`, `val`, `obj`, `arr`, `fn`, `cb`, `e` (the only exception is `i` in a plain `for` loop).
- Function names start with a verb: `handleSubmit`, `fetchUser`, `parseResponse`, `validateEmail`.
- Boolean-returning functions and boolean variables use `is`, `has`, `should`, `can` prefixes: `isLoading`, `hasError`, `shouldUpdate`, `canEdit`.
- Callback parameters in `.map`, `.filter`, `.forEach` still get real names: `user` not `u`, `item` not `i`, `event` not `e`.

## TypeScript types
- **Object shapes use `interface` over `type`.**
- **No inline types in function signatures.**
- **Component props are named `<ComponentName>Props`**, never generic `Props`.
- **Constants get an explicit type / interface.**
- **On React 19, do not use `React.FormEvent` or `React.FormEventHandler`** (deprecated). Use:
  - `onSubmit` → `React.SyntheticEvent<HTMLFormElement>`
  - `onChange` on an input → `React.ChangeEvent<HTMLInputElement>`

## Code style inside a function
- Always leave a **blank line between distinct logical blocks** inside a function.
- **Always leave one blank line between the logic and the `return`**.
- **Every `eslint-disable` or `@ts-ignore` needs a comment explaining why on the line above.**

## UI elements — one source per element type
- **Icons** come exclusively from `lucide-react`. Never inline SVG for icons.
- **Images** use consistent image elements.

## Workflow & Git — MANDATORY
- **Never commit or push on your own.** Wait until the user explicitly asks.
- When the code is done, say so and let the user decide the next step.
