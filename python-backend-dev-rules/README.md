# Python Backend Dev Rules (FastAPI / Flask) for AI coding agents

Companion to the Java/Spring backend bundle — same idea, for a Python (FastAPI or Flask) backend. Turns Claude Code / Gemini (Antigravity) / Cursor / Codex into a teammate who writes Python the way a production team would: layered by domain, async/sync routing done correctly, no secrets in source, bounded pagination, migrations reviewed by hand, no silent exception swallowing.

## Sources

Distilled and adapted from, plus original rules for gaps these didn't cover:

- **[zhanymkanov/fastapi-best-practices](https://github.com/zhanymkanov/fastapi-best-practices)** — 17k+ stars, the most-referenced FastAPI conventions repo; ships its own `AGENTS.md` for AI coding agents, which the async/sync routing and dependency-injection rules here are adapted from.
- Flask "large application" structure — the pattern used across the most-cited Flask structuring guides (DigitalOcean's *How To Structure Large Flask Applications*, Miguel Grinberg's Flask Mega-Tutorial Part XV, and the application-factory + blueprint pattern documented in Flask's own docs).

## What's inside

```
python-backend-dev-rules/
├── CLAUDE.md              # CORE — framework-agnostic Python backend rules, install once
├── CLAUDE.fastapi.md       # ADD-ON — append only for FastAPI projects
├── CLAUDE.flask.md         # ADD-ON — append only for Flask projects
├── PROJECT-CLAUDE.md       # per-project conventions + PR checklist template
├── audit-rules.sh          # grep-based checks, auto-detects FastAPI vs Flask
└── README.md
```

## Install (2 minutes)

### Claude Code / any agent reading CLAUDE.md or AGENTS.md

```bash
unzip python-backend-dev-rules.zip -d ~/python-backend-dev-rules
cat ~/python-backend-dev-rules/CLAUDE.md > ~/python-backend-dev-rules/CLAUDE-python-backend.md
cat ~/python-backend-dev-rules/CLAUDE.fastapi.md >> ~/python-backend-dev-rules/CLAUDE-python-backend.md   # if FastAPI
# or: cat ~/python-backend-dev-rules/CLAUDE.flask.md >> ~/python-backend-dev-rules/CLAUDE-python-backend.md  # if Flask

cp ~/python-backend-dev-rules/PROJECT-CLAUDE.md ./backend/CLAUDE.md   # inside the project, then edit Conventions
```

For Codex, save the same merged content as `AGENTS.md` instead — same content, different filename.

## Run the audit

```bash
bash ~/python-backend-dev-rules/audit-rules.sh              # audits ./src or ./app, auto-detects framework
bash ~/python-backend-dev-rules/audit-rules.sh backend/app
```

Auto-detects FastAPI vs Flask by scanning imports, so it only runs the checks relevant to the stack found. Output is grouped by rule with `file:line` per hit — read it yourself, don't take an agent's paraphrase of the output as ground truth. If an agent reports "0 violations", ask it to paste the actual terminal output, or run it yourself.

## Why this matters for a project already burned by self-reported "done"

If a project's history includes agent-reported fixes that turned out to be silent fallbacks or half-implementations (truncated extraction, hardcoded synonym fallback, broken filter logic that still "passed"), the fix isn't a stricter prompt — it's an independently runnable check whose raw output you can read yourself. That's what `audit-rules.sh` is: point it at the real source tree, read the actual `file:line` hits, and treat any agent's summary of "all clear" as a claim to verify, not a fact to file.

## License

Same spirit as the source repos: use it, fork it, adapt `PROJECT-CLAUDE.md` to your team's real conventions.
