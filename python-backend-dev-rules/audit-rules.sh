#!/usr/bin/env bash
# audit-rules.sh — check a Python backend (FastAPI or Flask) against
# CLAUDE.md (core) + CLAUDE.fastapi.md / CLAUDE.flask.md.
#
# Usage:
#   bash audit-rules.sh                 # audits ./src (or ./app), auto-detects framework
#   bash audit-rules.sh path/to/src
#
# Heuristic grep-based report. Exit code is always 0 — this is a report,
# not a gate. A hit means "worth a human look", not "definitely broken".

set -uo pipefail

SRC="src"
[ -d "$SRC" ] || SRC="app"
[ $# -gt 0 ] && SRC="$1"

if [ ! -d "$SRC" ]; then
  echo "No such directory: $SRC" >&2
  exit 1
fi

IS_FASTAPI=0
IS_FLASK=0
grep -rlq 'from fastapi import\|import fastapi' "$SRC" --include='*.py' 2>/dev/null && IS_FASTAPI=1
grep -rlq 'from flask import\|import flask' "$SRC" --include='*.py' 2>/dev/null && IS_FLASK=1

section() { printf '\n\033[1m%s\033[0m\n' "$1"; }
report() {
  local hits="$1" label="$2"
  local count
  count=$(printf '%s\n' "$hits" | grep -c . || true)
  if [ "$count" -eq 0 ]; then
    printf '  \033[32mOK\033[0m — %s\n' "$label"
  else
    printf '  \033[33m%s hit(s)\033[0m — %s\n' "$count" "$label"
    printf '%s\n' "$hits" | sed 's/^/    /'
  fi
}

section "Cross-framework (core rules)"

report "$(grep -rnE '^\s*print\(' "$SRC" --include='*.py' || true)" \
  "print() instead of a logger"

report "$(grep -rnE 'except\s*:\s*$' "$SRC" --include='*.py' || true)" \
  "Bare 'except:' — should catch a specific exception type"

report "$(grep -rnE 'except.*:\s*$' -A1 "$SRC" --include='*.py' | grep -B1 '^\s*pass\s*$' || true)" \
  "except block whose body is just 'pass' — silently swallowed exception"

report "$(grep -rnE 'def \w+\([^)]*\)\s*:' "$SRC" --include='*.py' | grep -vE '\->' || true)" \
  "Function with no return type hint — verify intentional (e.g. -> None)"

report "$(grep -rniE "os\.environ(\.get)?\([^,)]+,\s*[\"'][^\"']+[\"']\)" "$SRC" --include='*.py' | grep -iE 'secret|password|key|token' || true)" \
  "os.environ default fallback on something that looks like a secret"

report "$(grep -rnE "\.raw\(|\.execute\([\"'].*%s|f[\"'].*SELECT|f[\"'].*INSERT" "$SRC" --include='*.py' -i || true)" \
  "Possible raw/string-built SQL — confirm parameterized"

report "$(grep -rnE 'TODO|FIXME|XXX' "$SRC" --include='*.py' || true)" \
  "TODO / FIXME / XXX markers left in code"

if [ "$IS_FASTAPI" -eq 1 ]; then
  section "FastAPI"

  report "$(grep -rnE 'async def' -A15 "$SRC" --include='*.py' | grep -E 'time\.sleep\(|requests\.(get|post|put|delete)\(' || true)" \
    "Blocking call (time.sleep / requests.*) found near an async def — confirm it's not inside the async route itself"

  report "$(grep -rnE '@(router|app)\.(get|post|put|delete|patch)' -A3 "$SRC" --include='*.py' | grep -E '\.query\(|session\.execute\(|db\.query\(' || true)" \
    "DB query call directly inside a route handler — should go through a service"

  report "$(grep -rnE 'limit:\s*int(?!.*(le=|Query))' "$SRC" --include='*.py' -P 2>/dev/null || true)" \
    "'limit: int' parameter with no visible upper bound (le=/Query cap) — spot-check"

  report "$(grep -rnE 'return\s+\w+\s*$' -B3 "$SRC" --include='*.py' | grep -B3 'db\.query\|session\.query' | grep -v 'response_model\|-> ' || true)" \
    "Route may be returning an ORM object directly — confirm it goes through a Pydantic schema"
fi

if [ "$IS_FLASK" -eq 1 ]; then
  section "Flask"

  report "$(grep -rnE '^\s*app\s*=\s*Flask\(__name__\)' "$SRC" --include='*.py' || true)" \
    "Module-level 'app = Flask(__name__)' — should be inside a create_app() factory"

  report "$(grep -rnE '\w+\(app\)\s*$' "$SRC" --include='*.py' | grep -E 'SQLAlchemy|Migrate|LoginManager' || true)" \
    "Extension bound directly at construction (e.g. SQLAlchemy(app)) instead of .init_app(app) in the factory"

  report "$(grep -rnE "@\w+\.route\(" -A5 "$SRC" --include='*.py' | grep -E '\.query\.filter|\.query\.get|session\.query' || true)" \
    "DB query directly inside a Flask view — should go through a service"

  report "$(grep -rnE 'jsonify\(' "$SRC" --include='*.py' -A0 | grep -viE 'schema|serializ|dump|to_dict' || true)" \
    "jsonify() call — spot-check it's serializing a schema/dict, not a raw model instance"
fi

if [ "$IS_FASTAPI" -eq 0 ] && [ "$IS_FLASK" -eq 0 ]; then
  echo "No FastAPI or Flask imports found under $SRC — nothing framework-specific to audit."
fi

printf '\n\033[2mDone. Heuristic scan — every hit needs a human look, not an auto-fix.\033[0m\n'
