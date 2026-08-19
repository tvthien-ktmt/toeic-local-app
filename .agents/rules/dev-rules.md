# Project Conventions & Dev Rules for Antigravity

This file declares the coding guidelines and architecture rules for this repository (`TOIEC Web`).
The Antigravity Agent, Claude Code, and Codex adhere strictly to these rules during all code generation and refactoring.

---

# Conventions

- Framework: `React (Vite)`
- Path alias: `@/`
- Filenames: `PascalCase` for Components, `camelCase`/`kebab-case` for utils & hooks
- Types: `interface over type`
- React version: `19` (Note: React 19 deprecates `React.FormEvent`; use `React.SyntheticEvent<HTMLFormElement>` for form submission and `React.ChangeEvent<HTMLInputElement>` for inputs)
- Styling helper: `none` <!-- or cn() if clsx/tailwind-merge is installed -->
- Button: `raw <button> allowed` <!-- or: Button from @/components -->
- Icons: `lucide-react`
- Images: `raw <img> allowed`
- Internal links: `react-router Link`

---

# Language & Tone

- Code comments and commit messages: **English** (or Vietnamese if required by the user)
- Comments must explain *why*, not *what*. Never write redundant comments that merely repeat what the code does.

---

# Component Checklist — MANDATORY

Before finishing any component file (`.tsx`), check every item:

- [ ] **One file = one component.** No helper components (Avatar, CardRow, ItemRow, etc.) declared in the same file. Split them out into dedicated files.
- [ ] **Pure constants** (not depending on props/state) -> moved to `constants/`, not left inside the component function.
- [ ] **Helper / utility functions** (formatting, calculation, data transforms) -> moved to `utils/`.
- [ ] **Buttons / icons / images from declared source only:**
  - Icons: exclusively from `lucide-react`. No raw inline SVG for icons (data visualizations/charts with dynamic coordinates are exempt).
- [ ] **No inline type in function signatures:**
  - ❌ `function UserCard({ user }: { user: User })`
  - ✅ `interface UserCardProps { user: User; }` then `function UserCard({ user }: UserCardProps)`
- [ ] **Component props naming:** Always name props `<ComponentName>Props`, never generic `Props`.
- [ ] **Blank line before `return`:** Always include a blank line before the final `return` in every function/component that has logic above it.
- [ ] **No duplicate utilities:** Before creating any helper/utility function, search across `src/utils` to reuse existing implementations.
- [ ] **Component length limit:** Aim to keep components under ~300 lines. If a component exceeds 300 lines, consider extracting sub-views or sub-state components.

---

# Naming Conventions — MANDATORY

- **Variable and function names must describe meaning.**
  - ❌ Single letters or vague abbreviations: `p`, `res`, `tmp`, `val`, `obj`, `arr`, `fn`, `cb`, `e` (exception: `i` in simple numerical index `for` loops).
  - ✅ Real descriptive names:
    - ❌ `const res = await fetch(...)` -> ✅ `const response = await fetch(...)`
    - ❌ `users.map((u) => u.id)` -> ✅ `users.map((user) => user.id)`
    - ❌ `(e) => handleClick(e)` -> ✅ `(event) => handleClick(event)`
- **Booleans:** Must have prefix `is`, `has`, `should`, `can` (e.g. `isLoading`, `hasError`, `canSubmit`). Avoid ambiguous names like `loading`, `error`, `flag`, `status`.
- **Functions:** Start with verbs (e.g. `handleSubmit`, `fetchQuestions`, `validateExam`).

---

# TypeScript & React 19 Rules

- **Object shapes:** Prefer `interface` over `type` for object/prop definitions.
- **Constants:** Explicitly type constant arrays/objects instead of relying on inference.
- **React 19 Event Handlers:**
  - `onSubmit` -> `React.SyntheticEvent<HTMLFormElement>`
  - `onChange` -> `React.ChangeEvent<HTMLInputElement>`

---

# State Management & Code Quality

- **Group related state:** Combine tightly coupled state (e.g., `{ name: "", email: "" }`) rather than spamming individual `useState` calls where appropriate.
- **Linting & Suppressions:** Every `eslint-disable` or `@ts-ignore` MUST have a comment on the preceding line explaining the exact technical reason why it cannot be fixed cleanly.
- **Git Safety:** NEVER automatically commit or push code unless the user explicitly requests it.
