# Dev Rules — FastAPI add-on

Append **only if** the project is FastAPI. Assumes `CLAUDE.md` (core) is loaded first. Rules below are distilled from production conventions in `zhanymkanov/fastapi-best-practices` (17k+ GitHub stars) plus the framework's own dependency-injection model.

---

## Async vs sync routes — pick correctly, this is a real footgun

FastAPI runs `async def` routes directly on the event loop. A **blocking call inside an async route freezes the entire event loop for every other request** on that worker — this is the single most common FastAPI performance bug.

```python
# WRONG — blocking call inside an async route stalls every other request
@router.get("/bad")
async def bad():
    time.sleep(10)          # or any blocking I/O: requests.get(), sync DB driver, etc.
    return {"ok": True}

# RIGHT — sync route: FastAPI runs it in a threadpool automatically
@router.get("/sync-ok")
def sync_ok():
    time.sleep(10)           # blocks one threadpool worker, not the event loop
    return {"ok": True}

# RIGHT — async route with a genuinely awaitable operation
@router.get("/async-ok")
async def async_ok():
    await asyncio.sleep(10)  # yields control back to the loop
    return {"ok": True}

# RIGHT — async route that must call a blocking/sync library
from fastapi.concurrency import run_in_threadpool

@router.get("/wrap")
async def wrap():
    return await run_in_threadpool(legacy_sync_client.fetch, "id")
```

- If a route has only blocking I/O calls (sync DB driver, `requests`, blocking SDK) and you haven't wrapped them, **make the route `def`, not `async def`** — plain sync routes are automatically dispatched to a threadpool.
- Starlette's default threadpool has a fixed size (40) — saturating it with slow sync work still degrades the whole app; it's a smaller footgun than blocking the loop, but still a footgun.
- If you `await` a sync SDK call directly (not wrapped in `run_in_threadpool`), you almost certainly have a bug — SQLAlchemy's sync `Session`, `requests`, and most non-async SDKs are not awaitable and either error or block.

---

## Dependency injection

- Use the modern `Annotated` form, not the default-argument form:

  ```python
  # DO
  from typing import Annotated
  from fastapi import Depends

  CurrentUser = Annotated[User, Depends(get_current_user)]

  @router.get("/me")
  async def me(user: CurrentUser) -> UserResponse:
      return user

  # Avoid (legacy, still works, more error-prone with defaults)
  @router.get("/me")
  async def me(user: User = Depends(get_current_user)):
      return user
  ```

- **Dependencies are cached per request** by default — if two parts of the same request depend on `get_current_user`, FastAPI calls it once and reuses the result. Rely on this instead of manually threading a value through multiple functions.
- Extract repeated validation (e.g. "does this ID exist and belong to this user") into a dependency, not a helper function called inside every route separately.

---

## Pydantic schemas — SQL-first, Pydantic-second

- Do filtering, joining, and aggregation **at the database layer** (SQLAlchemy query), not by pulling all rows and post-processing in Python with a Pydantic model in the loop. Pydantic validates and shapes the boundary; it isn't a query engine.
- Request and response schemas are **separate classes**, even when they look identical today: `CreateBookingRequest` vs `BookingResponse`.
- `model_config = ConfigDict(from_attributes=True)` (Pydantic v2) to convert an ORM instance to a response schema — never return the ORM instance directly from a route (lazy-loaded fields, internal columns, and relationship objects will leak or blow up serialization).
- Response model declared explicitly (`response_model=...` or a return-type annotation FastAPI can use) — don't let FastAPI guess the shape from whatever the route happens to return.

---

## Validation

- Pagination params declared with a bound: `limit: int = Query(default=20, le=100)` — never an unbounded `limit: int` accepted straight from the client.
- Cross-field validation goes in a Pydantic `@field_validator`/`@model_validator`, not as an `if` inside the route after the fact.

---

## Migrations

- Alembic for schema migrations. Autogenerate (`alembic revision --autogenerate`), then **read the generated migration before committing it** — autogenerate misses some changes (renamed columns, some constraint changes) and silently produces a migration that drops and recreates data.
- Never hand-edit a migration that has already run against a shared environment — write a new one.

---

## Error handling

- Raise `HTTPException` (or a custom exception caught by an `@app.exception_handler`) from services — never return a `{"success": False, ...}` dict with a 200 status and expect the client to check a field.
- One `@app.exception_handler` per exception type/hierarchy, not one giant catch-all that returns 500 for everything including validation errors.
