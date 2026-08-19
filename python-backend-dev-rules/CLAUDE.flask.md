# Dev Rules — Flask add-on

Append **only if** the project is Flask. Assumes `CLAUDE.md` (core) is loaded first. Rules below follow the community-standard "large Flask application" structure (application factory + blueprints + service layer), the same pattern documented across the most-referenced Flask structuring guides.

---

## Application factory — MANDATORY for anything beyond a toy script

Flask apps must use the **application factory pattern**, not a module-level global `app = Flask(__name__)` imported everywhere.

```python
# WRONG — global app instance, hard to test, breaks with multiple configs
app = Flask(__name__)
db = SQLAlchemy(app)

# RIGHT — factory: each call produces an independently configurable app,
# essential for testing (separate test config/DB) and for avoiding import-order bugs
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    from .auth import auth_bp
    app.register_blueprint(auth_bp)

    return app
```

- Extensions (`SQLAlchemy`, `Migrate`, `LoginManager`, etc.) are instantiated **without** an app (`db = SQLAlchemy()`) at module level, then bound inside `create_app` via `.init_app(app)`. Binding directly in the constructor (`SQLAlchemy(app)`) at import time is what forces the global-app anti-pattern.

---

## Project layout — blueprints by domain

```
project/
├── app/
│   ├── __init__.py        # create_app() factory
│   ├── config.py
│   ├── extensions.py       # db = SQLAlchemy(), migrate = Migrate(), etc. — uninitialized
│   ├── auth/
│   │   ├── routes.py        # Blueprint — thin, calls service only
│   │   ├── service.py       # business logic
│   │   ├── models.py
│   │   └── schemas.py       # marshmallow/pydantic for (de)serialization
│   ├── booking/
│   │   └── ... (same shape)
│   └── errors.py            # centralized error handlers
├── migrations/               # Flask-Migrate / Alembic
├── tests/
└── run.py
```

- One `Blueprint` per domain, registered in `create_app`. A route file over ~150 lines handling more than one domain concept is a sign it should split into two blueprints.
- **Views/routes never query the database directly.** Call a service function; the service uses the model/repository layer. A `@bp.route` handler with a raw `Model.query.filter_by(...)` call inline is skipping the service layer — fine for a 10-line prototype, not for anything meant to last.

---

## Config

- Config is a **class hierarchy** (`Config` → `DevConfig`/`TestConfig`/`ProdConfig`), not `if os.environ.get("FLASK_ENV") == "production":` branches scattered through `config.py`. Pick the config class in `create_app`/`run.py` based on environment, not inside the config file itself.
- Secrets (`SECRET_KEY`, DB URI, mail credentials) come from environment variables with **no hardcoded fallback value** for anything security-sensitive — `os.environ["SECRET_KEY"]` (raises if missing) rather than `os.environ.get("SECRET_KEY", "dev")`.

---

## Database (Flask-SQLAlchemy)

- Migrations via **Flask-Migrate** (Alembic under the hood) — `flask db migrate` then read the generated migration before `flask db upgrade`, same caveat as raw Alembic: autogenerate misses some changes.
- Watch for N+1: iterating a query result and touching a relationship per row without `.options(joinedload(...))` / lazy='joined' where appropriate.
- Don't put query logic in the view. A repository/service function (`get_active_bookings_for_user(user_id)`) is testable independent of the request context; a query built inline in the view is not.

---

## Serialization / validation

- Use a schema layer for request/response shaping — Marshmallow, Pydantic (via a thin adapter), or Flask-RESTX/Flask-Smorest's built-in schema support. Don't hand-build response dicts field-by-field scattered across views, and don't return a raw SQLAlchemy model from `jsonify()` (it will serialize internal columns and choke on relationships).
- Validate request bodies with the schema **before** the view's business logic runs — reject with 400 on schema failure, don't let a missing field surface as a 500 deep in the service.

---

## Error handling

- Centralized error handlers via `@app.errorhandler(...)` (registered in the factory or an `errors.py` blueprint), not a `try/except` duplicated in every view that builds its own error JSON.
- Custom exception classes for domain errors (`BookingNotFoundError`, `InsufficientInventoryError`) caught once at the error-handler level and mapped to the right status code — not string-matching `str(e)` inside a view.

---

## Background work

- Long-running or retryable work (emails, webhooks, report generation) goes through a task queue (Celery/RQ), not inline in the request-response cycle — a view that blocks on sending an email is a latency and reliability problem waiting to happen.
