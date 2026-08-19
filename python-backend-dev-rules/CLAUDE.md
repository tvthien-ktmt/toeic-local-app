# Dev Rules — Python Backend Core

Framework-agnostic rules for a Python backend (FastAPI or Flask). Append the matching stack file after this one:

- `CLAUDE.fastapi.md` — for FastAPI projects
- `CLAUDE.flask.md` — for Flask projects
- `PROJECT-CLAUDE.md` — copy to the project root, fill in the Conventions block

Every rule here is checkable with `grep` — see `audit-rules.sh`.

---

## Type hints — MANDATORY

- Every function has full type hints: parameters and return type. `def get_booking(id):` is not acceptable; `def get_booking(booking_id: int) -> BookingResponse:` is.
- Run `mypy` (or `pyright`) in CI, not just locally on a good day.
- No bare `dict`/`list` in a signature when the shape is known — a Pydantic model / dataclass / `TypedDict` instead.

---

## Project layout — layered, by domain not by file type

For anything past a toy project, organize by **domain/feature module**, not by putting every model in one `models.py` and every route in one `routes.py`. Netflix's Dispatch structure (which `fastapi-best-practices` also converges on) scales better than the classic "flat by file type" tutorial layout once you have more than 3-4 domains:

```
src/
├── auth/
│   ├── router.py       # HTTP boundary — thin, calls service only
│   ├── service.py      # business logic
│   ├── schemas.py      # Pydantic models (request/response)
│   ├── models.py       # ORM models
│   ├── dependencies.py
│   ├── exceptions.py
│   └── constants.py
├── booking/
│   └── ... (same shape)
├── core/                # config, security, shared dependencies
└── main.py
```

Each domain module is internally consistent and mostly self-contained — importing across domains happens through the service layer, not by reaching into another domain's `models.py` directly.

---

## Layering discipline

- **Routes/views are thin.** A route function: parse/validate input (framework does this), call one service function, return the result. No business logic, no direct DB queries in a route.
- **No DB calls inside routes/views.** Go through a service or repository layer. A route that imports the ORM session and runs a query itself is skipping a layer.
- **Services never import HTTP types.** No `Request`/`Response`, no status codes, inside a service function — services take and return plain data (Pydantic models / dataclasses), so they're testable without spinning up the web framework.

---

## SQL-first, schema-second

- Let the database do set-based work (filtering, joins, aggregation) — don't pull rows into Python and filter/aggregate with a loop or list comprehension when a `WHERE`/`GROUP BY` does the same job at the DB layer.
- Validate and shape data with Pydantic/schemas at the boundary; don't hand-roll `if not x.get("field")` checks that a schema should be doing.

---

## Error handling — MANDATORY

- **Never `except: pass` or `except Exception: pass`.** An exception that's caught and silently discarded is a defect, not error handling.
- Catch **specific** exceptions you expect (`IntegrityError`, `ValidationError`) and let unexpected ones propagate to a central handler (FastAPI `exception_handler` / Flask `errorhandler`) — don't wrap every function body in a broad `try/except Exception` that returns a generic 500 and hides the real error.
- Client errors (400/404/409 — bad input, not found, conflict) are distinct from server errors (500 — bug/infra). A validation failure is never a 500.
- If you must catch broadly at a true boundary (background task runner, webhook receiver), **log the full traceback** and either re-raise or route to a dead-letter/retry mechanism — never let it vanish silently.

---

## Security — MANDATORY

- **No secrets in source**, and no fallback default for a secret: `os.environ.get("SECRET_KEY", "dev-secret")` is a vulnerability that ships silently the day someone forgets to set the env var in prod.
- Settings loaded through `pydantic-settings` (FastAPI) or `python-dotenv`/`django-environ`-style config (Flask) — fail loudly at startup if a required var is missing.
- `.env` is git-ignored; only `.env.example` with placeholder values is committed.
- Compare secrets/tokens/webhook signatures with a constant-time comparison (`hmac.compare_digest`), never `==`.
- Password hashing via `passlib`/`bcrypt`/`argon2` — never unsalted MD5/SHA1.
- Every client-facing list/search endpoint has a bounded `limit`/`page_size` — an unbounded one accepted from the client is a resource-exhaustion bug.

---

## Database & ORM

- Watch for **N+1 queries**: looping over a queryset and touching a related field per iteration without eager loading (`selectinload`/`joinedload` in SQLAlchemy, `select_related`/`prefetch_related` in Django ORM) is a defect at any real scale, not a style nit.
- No string-concatenated SQL with user input, ever — parameterized queries / ORM builders only.
- Migrations (Alembic for SQLAlchemy, Flask-Migrate, or Django migrations) are the only way schema changes reach a shared database — never a manual `ALTER TABLE`.

---

## Logging

- No `print()` in application code — use the standard `logging` module (or `structlog`/`loguru` if the project has standardized on one).
- Log levels mean something: `error` = needs eyes now, `warning` = degraded but handled, `info` = notable event, `debug` = developer detail.
- Never log secrets, tokens, or full card numbers — not even at `debug`.

---

## Dependencies & environment

- Every project runs inside a virtual environment (`venv`, `poetry`, `uv`) — never `pip install` into system Python.
- Dependencies pinned (`requirements.txt` with hashes, `poetry.lock`, or `uv.lock`) for anything meant to be reproducible.

---

## Testing

- `pytest`. A new endpoint/service function ships with at least: one happy-path test, one validation-failure test, one not-found/not-authorized test.
- Test names describe scenario + expected outcome: `cancel_booking_when_already_cancelled_raises_conflict`, not `test_cancel_2`.
- Tests use a real (or in-memory/transactional) test database — not mocks of the thing being tested.

---

## Git — MANDATORY

- **Never commit or push on your own.** Wait for the user to explicitly ask.
