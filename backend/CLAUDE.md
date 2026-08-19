# Conventions

Framework:        FastAPI
Python version:   3.13
Package manager:  pip
ORM:              SQLAlchemy
Validation:       Pydantic v2
Auth:             PyJWT
Task queue:       none
Test runner:      pytest
Linter/formatter: ruff

---

# Language

Code comments:     English
Docstrings:        English

---

# Checklist before finishing code

- [ ] New/changed endpoints have request + response models with field constraints (no bare `dict` payloads)
- [ ] No blocking calls inside `async def` (FastAPI) — use `httpx.AsyncClient` or `run_in_threadpool` or sync `def`
- [ ] No `os.environ` reads outside settings/config module
- [ ] No raw `print()` left in application code (use `logging.getLogger(__name__)`)
- [ ] No bare `except:` or `except Exception:` wrapping a whole function
- [ ] No raw f-string or % SQL queries (parameterize all SQL queries)
- [ ] All public functions and endpoints have explicit type hints and return type annotations `-> ReturnType`
- [ ] Pydantic v2 conventions (`model_dump()`, `model_validate()`, `Field()`, not `.dict()` or `.json()`)
- [ ] FastAPI dependencies use `Annotated[T, Depends(...)]`
