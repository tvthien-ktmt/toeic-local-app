# Dev Rules for AI coding agents

A ruleset that turns Claude Code / Codex / Cursor into a teammate who writes React / TypeScript the way a senior dev would — feature-based structure, one component per file, one source per UI element, meaningful names, explicit types, and a few dozen more. Framework-agnostic core plus a Next.js App Router add-on.

Every rule is concrete enough to be checked with `grep`, and `audit-rules.sh` does exactly that: run it on any codebase and get a report of what breaks which rule.

Made by Trần Anh Tuấn (evondev). Free, MIT. Extracted from the rules used daily to build [SpeakNow](https://speaknowenglish.org).

## What is inside

```
dev-rules/
├── CLAUDE.md            # CORE — framework-agnostic rules, install once globally
├── CLAUDE.nextjs.md     # ADD-ON — append only for Next.js App Router projects
├── PROJECT-CLAUDE.md    # per-project: conventions (button/icons/images/...), language, checklist
├── audit-rules.sh       # 25 grep-based checks; reads your conventions and skips what does not apply
└── README.md
```

## Works with plain React?

Yes. The core file has no Next.js in it. Skip `CLAUDE.nextjs.md`, and in `PROJECT-CLAUDE.md` set `Framework: React (Vite)`, `Internal links: react-router Link`, `Images: raw <img> allowed` (or your image component). The audit script reads those lines and turns off the Next-only checks.

## Install (2 minutes)

### Claude Code

```bash
unzip dev-rules.zip -d ~/dev-rules
cp ~/dev-rules/CLAUDE.md ~/.claude/CLAUDE.md          # core, every project
cat ~/dev-rules/CLAUDE.nextjs.md >> ~/.claude/CLAUDE.md   # only if you do Next.js
cp ~/dev-rules/PROJECT-CLAUDE.md ./CLAUDE.md          # inside one project, then edit Conventions
```

Already have a `~/.claude/CLAUDE.md`? Append instead of overwrite:

```bash
cat ~/dev-rules/CLAUDE.md >> ~/.claude/CLAUDE.md
```

### Codex

Codex reads `AGENTS.md`. Same content, different filename:

```bash
cp ~/dev-rules/CLAUDE.md ~/.codex/AGENTS.md            # core
cat ~/dev-rules/CLAUDE.nextjs.md >> ~/.codex/AGENTS.md # only if Next.js
cp ~/dev-rules/PROJECT-CLAUDE.md ./AGENTS.md           # per project
```

### Cursor / Windsurf / others

Paste the content of `CLAUDE.md` into your rules file (`.cursorrules`, `.windsurfrules`, or the equivalent). The rules are plain markdown, no tool-specific syntax.

## Run the audit

```bash
bash ~/dev-rules/audit-rules.sh                    # audits ./src, reads ./CLAUDE.md
bash ~/dev-rules/audit-rules.sh app/src            # or any folder
bash ~/dev-rules/audit-rules.sh src --config AGENTS.md
```

Output is one section per rule, with `file:line` for each hit and a count. The script reads the **Conventions** block of your project rules and skips sections that do not apply (raw `<button>` allowed → button check off, React 18 → FormEvent check off, no styling helper → className checks off, non-Next → app-folder check off). Sections 3-7 (cross-feature imports, raw button / img / svg / a) are the ones that cause real bugs; fix those first. The rest are style.

Fastest way to clean up: paste one section back into your agent and say *"fix these, one file at a time, following the rules in CLAUDE.md"*.

## Your team uses Heroicons / raw buttons / PascalCase / `type`?

Fine. The core rules only say "one source per element type, never mix" and "pick a convention, apply it everywhere". Which source and which convention is declared once in the **Conventions** block of `PROJECT-CLAUDE.md`: button component, icon library, image component, styling helper, path alias, filename case, `interface` vs `type`, React version. Defaults are what the author uses; change any line and both the agent and the audit script follow.

## Language

Rules and comments in the bundle are in English so they work on international projects out of the box. Want comments in another language? Change the two lines under `# Language` in `PROJECT-CLAUDE.md`; project rules override global rules, so one install covers both Vietnamese and English projects.

## License

MIT. Use it, fork it, ship it. A link back is appreciated, not required.
