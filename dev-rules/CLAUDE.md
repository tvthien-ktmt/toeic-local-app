# Dev Rules — Core (framework-agnostic)

These rules apply to every React / TypeScript project, whatever the framework. They are about structure, naming, types and discipline — not about which library you picked.

Two more files complete the set:

- `PROJECT-CLAUDE.md` — copy into each project root. It declares the **conventions** this project uses (button component, icon library, image component, styling helper, path alias, filename case, React version). Rules below that say "the project's X" read that file.
- `CLAUDE.nextjs.md` — append **only if** the project is Next.js App Router. Adds the `src/app` / server component / `next/link` / `next/image` rules.

Read this file before writing any code. Every rule here is concrete enough to be checked with `grep`; the bundled `audit-rules.sh` does exactly that.

---

## Project structure — feature-based

Organize code by feature, not by technical layer.

### `src/features/`

Every feature owns its own structure. Names depend on the project (`auth`, `dashboard`, `billing`, ...):

```
src/features/
├── <feature-name>/
│   ├── pages/        # Page-level components (routed by the framework)
│   ├── components/   # Components private to this feature
│   ├── hooks/        # Hooks private to this feature
│   ├── utils/        # Pure helper functions private to this feature
│   ├── constants/    # Constants private to this feature
│   └── types/        # Types / interfaces private to this feature
└── ...
```

### Shared (used by 2+ features)

- `src/components/` — shared UI components
- `src/hooks/` — shared hooks
- `src/utils/` — shared pure functions
- `src/lib/` — third-party client setup (API clients, SDK init, ...)
- `src/constants/` — shared constants
- `src/types/` — shared types / interfaces

### Principles

- **Never import across `features/`.** If code is needed by 2+ features, move it to the shared `src/` folders.
- UI elements repeated in 2+ features (button, input, heading, ...) must become a shared component in `src/components/`.
- When creating a shared component in `src/components/`:
  - One folder per component, e.g. `src/components/button/`
  - Filename follows the project's filename convention (default kebab-case: `button.tsx`)
  - Always ship an `index.ts` that re-exports it
  - Keep it simple first, extend on demand

---

## Component rules

- **Component filenames follow the project's convention** (default: kebab-case — `user-card.tsx`, `auth-form.tsx`). Whatever the convention, apply it everywhere; on macOS rename with `git mv` to avoid case-sensitivity failures on Linux CI.
- **One file = one component.** Do not declare several components in one file.
- Every declared hook must be used; delete unused ones.
- Always fix TypeScript errors and warnings in components and functions.
- When a piece of logic (fetch, state, side effect, data massaging) repeats in 2+ places, extract it:
  - A custom hook in `hooks/` if it touches state / lifecycle
  - A utility function in `utils/` if it is pure
- **Before creating a new util / hook / constant, grep for the file name and the function name** across `src/utils`, `src/hooks`, `src/constants` and `src/features/*/{utils,hooks,constants}`. A name clash (or a job clash) means it already exists: reuse it, or lift it to shared if it currently lives in another feature. Never create a second copy.
- **A component over ~300 lines is a signal to split.** Typical smell: one component owning a state machine plus 3-4 phase screens (`loading`, `answering`, `result`, `summary`, ...). Move each phase's render into a child component and keep state in the parent. Not a hard cap, but crossing it needs a reason.

---

## Naming conventions

- **Variable and function names must describe meaning.** No single letters or vague abbreviations such as `a`, `b`, `c`, `p`, `res`, `tmp`, `val`, `obj`, `arr`, `fn`, `cb`, `e` (the only exception is `i` in a plain `for` loop).

  ```ts
  // Wrong
  const p = (async () => {
    const res = await fetch(url);
    return res.json();
  })();

  // Right
  const fetchUserPromise = (async () => {
    const response = await fetch(url);
    return response.json();
  })();
  ```

- Function names start with a verb: `handleSubmit`, `fetchUser`, `parseResponse`, `validateEmail`.
- Boolean-returning functions use `is`, `has`, `should`, `can`: `isValidEmail`, `hasPermission`.
- Boolean variables use the same prefixes: `isLoading`, `hasError`, `shouldUpdate`, `canEdit`. Never neutral names like `flag`, `status`, `check`.
- Callback parameters in `.map`, `.filter`, `.forEach` still get real names: `user` not `u`, `item` not `i`, `event` not `e`.
- An async function stored in a variable gets the `Promise` suffix: `const userPromise = fetchUser()` then `const user = await userPromise`.

---

## TypeScript types

- **Object shapes use the project's declared preference** (default: `interface` over `type`). Whichever you pick, be consistent; `type` is always fine for unions, intersections, mapped and conditional types.

  ```ts
  // Default (interface preferred)
  interface UserCardProps {
    user: User | null;
  }
  ```

- **No inline types in function signatures.** Declare them at the top of the file.

  ```ts
  // Wrong
  function Cell({ value }: { value: boolean | string }) {}

  // Right
  interface CellProps {
    value: boolean | string;
  }
  function Cell({ value }: CellProps) {}
  ```

- **Component props are named `<ComponentName>Props`**, never the generic `Props`.

  ```ts
  // Wrong
  interface Props { user: User | null }

  // Right
  interface UserCardProps { user: User | null }
  ```

- **Constants get an explicit type / interface.** Do not let TypeScript infer the type of a constant array:

  ```ts
  interface BenefitRow { icon: string; title: string; description: string }
  const benefitRows: BenefitRow[] = [ ... ];
  ```

- **On React 19, do not use `React.FormEvent` or `React.FormEventHandler`** (deprecated). Use:
  - `onSubmit` → `React.SyntheticEvent<HTMLFormElement>`
  - `onChange` on an input → `React.ChangeEvent<HTMLInputElement>`

  On React 18 this rule is off (declare the React version in the project rules).

---

## Constants and utils

- **Constants inside a component file must move to a separate file** in the feature's `constants/`.
  - Name them by meaning: `benefitRows`, `qaList`, `pricingPlans` instead of `rows`, `list`, `data`.
- **Helper functions tied to a constant also move to `utils/`** of the feature, not the component file.
- **Types / interfaces used by constants or shared inside a feature live in `types/`**, not in the constants file or the component file.

---

## Barrel exports (index.ts)

Every `components/`, `hooks/`, `utils/` folder with 3+ exports must have an `index.ts` re-exporting them.

```ts
// index.ts — explicit names, never export *
export { default as Button } from "./button";
export { default as Input } from "./input";
```

- Never `export * from`. Always name the exports so they are traceable.
- Never import across features. If it is needed elsewhere, move it to shared.

---

## State management inside a component

- Group semantically related `useState` calls into one object:
  - `name` + `email` → `const [fields, setFields] = useState({ name: "", email: "" })`
  - `nameError` + `emailError` → `const [errors, setErrors] = useState({ name: "", email: "" })`
- Do not group unrelated state or state with different lifecycles.

---

## Code style inside a function

- Always leave a **blank line between distinct logical blocks** inside a function.
- **Always leave one blank line between the logic and the `return`**:

  ```tsx
  // Wrong
  export default function MyComponent({ items }: MyComponentProps) {
    const filtered = items.filter((item) => item.active);
    return <ul>{filtered.map(...)}</ul>;
  }

  // Right
  export default function MyComponent({ items }: MyComponentProps) {
    const filtered = items.filter((item) => item.active);

    return <ul>{filtered.map(...)}</ul>;
  }
  ```

- Each field validation is its own `if` block. No unnecessary nested if/else.
- A validate function collects results into one object and calls `setState` once:

  ```ts
  function validate() {
    const next = { name: "", email: "" };

    if (!fields.name.trim()) next.name = "Name is required";
    if (!fields.email.trim()) next.email = "Email is required";

    setErrors(next);
    return !next.name && !next.email;
  }
  ```

- **Every `eslint-disable` needs a comment explaining why on the line above.** If you cannot explain it, do not disable it: fix the code so lint passes.

  ```ts
  // Wrong
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Right
  // Run once on mount: runRound reads from a ref, not from props, so adding it
  // to deps would re-run on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  ```

---

## className — MANDATORY when the project uses a class-merging helper

If the project declares a styling helper (default: `cn()` from `clsx` / `tailwind-merge`):

- **Never build classes with array `.join(" ")` or template strings with nested ternaries.** Always use the helper.
- One condition per line:

  ```tsx
  // Wrong
  className={["base", isActive ? "bg-primary" : "bg-gray-100"].join(" ")}

  // Right
  className={cn(
    "base",
    isActive && "bg-primary text-white",
    isDisabled && "opacity-50",
    !isActive && !isDisabled && "bg-gray-100",
  )}
  ```

- Complex class logic goes into a helper function outside the JSX, never inline.

If the project uses CSS Modules / styled-components / no helper, this section is off.

---

## UI elements — one source per element type

The principle: **every kind of UI element has exactly one source in the project, and nothing bypasses it.** Which source is the project's decision (declared in `PROJECT-CLAUDE.md`); the rule is that you never mix.

- **Buttons** come from the project's button component. If the project declares "raw `<button>` allowed", use raw `<button>` consistently instead — but never both.
- **Icons** come from the project's icon library. Never inline an SVG for an icon and never pull a second icon library. If the library lacks an icon, add a named `IconXxx` component under `src/components/icons/` that takes `ComponentProps<"svg">` and spreads it onto `<svg>`:

  ```tsx
  import type { ComponentProps } from "react";

  export function IconFlower(props: ComponentProps<"svg">) {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        {/* path data */}
      </svg>
    );
  }
  ```

  Data graphics drawn from numbers (charts, progress rings) are not icons; an inline `<svg>` is fine there, but leave a comment saying so.
- **Images** use the project's image component (`next/image` in Next.js). If the project declares "plain `<img>` allowed", use `<img>` consistently.
- **Internal links** use the framework's link component (`next/link`, `react-router`'s `Link`, ...). Plain `<a>` only for external URLs or `target="_blank"`.

---

## Git — MANDATORY

- **Never commit or push on your own** after finishing code. Wait for the user to explicitly ask.
