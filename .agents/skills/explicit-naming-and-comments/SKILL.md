---
name: explicit-naming-and-comments
description: Enforce descriptive, unambiguous naming (files, variables, functions, classes) and professional-grade code comments — docstrings on every public function, section comments for non-trivial logic, WHY-comments over WHAT-comments. Use when writing new code, reviewing a diff, or when the user says code is "hard to read", "no comments", "unclear names", or asks to make code more maintainable/production-ready.
---

# Explicit Naming & Professional Comments

Most "Clean Code" guidance (Robert C. Martin included) pushes toward *fewer* comments on the theory that good names make comments unnecessary. That's right for a training exercise, but production codebases maintained by a team — or handed off between AI agents and humans — need more than self-documenting names. This skill's target is **workplace-grade code**: a new teammate (or an AI agent picking up the file cold) should understand *what* a piece of code does from its name, and understand *why* it exists / *why* it's written this way from a comment, without opening a second file.

Two things, always together: **explicit names** AND **explicit comments**. Neither substitutes for the other.

---

## Part 1 — Naming

### Rule N1: Every name says what it holds or does, not its type or its history

```python
# BAD — vague, types-as-names, no signal of purpose
def proc(d, t, flag=False):
    x = []
    for i in d:
        ...
    return x

# GOOD — reads like a sentence
def apply_regional_tax(transactions: list[Transaction], tax_year: int) -> list[float]:
    taxed_totals = []
    for transaction in transactions:
        ...
    return taxed_totals
```

- No `data`, `obj`, `res`, `tmp`, `val`, `item`, `flag`, `x`/`y`/`i` (outside a tight, obvious loop index) — say what the thing *is*.
- Booleans read as a yes/no question: `is_expired`, `has_permission`, `can_retry` — never a bare `flag`/`status`/`check`.
- Functions that fetch: `get_x`/`find_x`. Functions that mutate: a verb that names the effect (`cancel_booking`, `mark_as_paid`) — never generic `process`, `handle`, `do_thing`.
- No Hungarian notation / type-in-name (`strName`, `arrUsers`) — the type checker and the IDE already know the type; the name should carry meaning the type can't.

### Rule N2: Name length matches scope

- A loop index used for two lines inside a tight `for` can be `i`. A variable that lives for 40 lines, or that crosses a function boundary, needs a real name.
- Module-level / exported names carry more context than a local: `parse_toeic_pdf_to_markdown` (exported) vs `chunks` (local variable three lines from its only use).

### Rule N3: File and module names describe the domain, not the pattern

```
# BAD
utils.py          # dumping ground — everything and nothing
helper.py
manager.py

# GOOD
extraction_service.py     # extracts questions from raw text via Gemini
chunking_service.py       # splits a document into Part 5/6/7 chunks
vocabulary_lookup_service.py
```

- `utils.py` / `helpers.py` / `common.py` are a smell once a project has more than a handful of files — split by what the code actually does (`date_formatting.py`, `pdf_parsing.py`), not by "misc stuff that didn't fit elsewhere".
- Test files mirror the module they test: `chunking_service.py` → `test_chunking_service.py`, not `test_utils_3.py`.

### Rule N4: Consistent vocabulary across the whole codebase

Pick one word per concept and never mix synonyms for the same thing within a project: if it's `fetch_user`, don't also have `get_account`, `retrieve_profile` for the same kind of operation elsewhere. Inconsistent vocabulary forces the reader to double-check whether two differently-named things are actually different.

---

## Part 2 — Comments

The goal is not maximum comments — it's **comments that carry information the code can't carry on its own**. A comment that repeats what the next line obviously does is noise; a comment that's missing when the next line does something non-obvious is a trap for the next person.

### Rule C1: Every public function/class gets a docstring — always, no exceptions

Minimum: one line describing what it does. For anything with non-trivial parameters, edge cases, or a return value that isn't self-evident, add `Args`/`Returns`/`Raises`.

```python
def extract_questions_from_part(
    part_text: str,
    part_number: int,
    api_key: str | None,
) -> list[ExtractedQuestion]:
    """Extract TOEIC questions from a single Part's raw text using Gemini.

    Splits part_text into ~4500-char subchunks (Gemini's practical context
    limit for reliable structured extraction) and processes every subchunk,
    so no content is silently dropped for long Parts (e.g. Part 7 reading
    passages). Falls back to a local regex-based extractor when api_key is
    None — see fallback_extract_part5() — so the pipeline still produces
    (lower-quality) output in dev environments without a configured key.

    Args:
        part_text: Raw markdown text for this Part only (already chunked
            by chunk_markdown_document()).
        part_number: 5, 6, or 7 — determines which prompt template is used.
        api_key: Gemini API key, or None to force fallback mode.

    Returns:
        One ExtractedQuestion per detected question, in source order.
        May be empty if part_text contains no recognizable question markers.
    """
```

```javascript
// GOOD — JS/TS: same idea, JSDoc
/**
 * Debounce a search-input handler so the API is only called once the user
 * pauses typing for `delayMs`, instead of on every keystroke.
 *
 * @param {(query: string) => void} onSearch - called with the final query
 * @param {number} delayMs - quiet period before firing, default 300ms
 * @returns {(query: string) => void} debounced handler to wire to onChange
 */
function debounceSearch(onSearch, delayMs = 300) { ... }
```

### Rule C2: Comment the WHY, not the WHAT — the code already says what

```python
# BAD — restates the next line, adds zero information
# increment i by 1
i += 1

# BAD — describes what, which the code already shows
# loop through users and check if active
for user in users:
    if user.is_active:
        ...

# GOOD — explains a non-obvious reason, a constraint, or a gotcha
# Gemini's free tier throttles at ~15 req/min; batching 10 subchunks per
# call keeps us under that without needing a separate rate limiter.
for batch in chunked(subchunks, size=10):
    ...

# GOOD — explains why the "obvious" simpler approach is wrong here
# Can't use `==` for the HMAC comparison: string equality short-circuits
# on the first differing byte, which leaks timing info an attacker can
# use to guess the correct signature one byte at a time.
if not hmac.compare_digest(expected_signature, received_signature):
    raise InvalidSignatureError()
```

### Rule C3: Section comments for any function doing more than one obvious "paragraph" of work

If a function is long enough to have logical sections (setup → validate → transform → persist), mark them — it lets a reader skim instead of re-deriving the structure line by line.

```python
def import_curriculum(source_path: Path, db: Session) -> ImportResult:
    # --- 1. Load and validate the source file ---
    raw = load_yaml(source_path)
    validate_curriculum_schema(raw)

    # --- 2. Resolve topic references against existing DB rows ---
    topic_map = resolve_topic_ids(raw["topics"], db)

    # --- 3. Insert lessons, linking each to its resolved topic ---
    inserted = []
    for lesson in raw["lessons"]:
        ...

    return ImportResult(inserted_count=len(inserted), topic_map=topic_map)
```

### Rule C4: Flag known limitations and non-obvious decisions explicitly — don't let them hide

```python
# NOTE: this endpoint intentionally returns 200 even when 0 rows match,
# to keep the frontend's empty-state handling uniform with the paginated
# case. Do not "fix" this to 404 without checking FrontEnd SearchResults.tsx.

# TODO(thien): synonym lookup currently falls back to a 9-word hardcoded
# dict when Gemini has no result — replace with a real synonym API or a
# pre-generated synonym table before this ships to real users.
```

- A `TODO`/`FIXME` is not clutter to delete for an audit script to pass — it's a signal for a human. If a fallback/mock/stub exists, the comment says so plainly; hiding a known gap (renaming `XXX` to a fake-looking real value just to silence a linter) is worse than leaving the marker, because it removes the signal without removing the problem.
- If a comment is explaining a bug workaround, link the issue/ticket if one exists.

### Rule C5: Delete comments the moment the code they describe changes — never leave a stale comment

A wrong comment is worse than no comment — it actively misleads the next reader (including the next AI agent). When you touch a function, re-read its docstring/comments and update them in the same edit, not "later".

### Rule C6: No metadata comments and no commented-out code

```python
# BAD — git already tracks this; the comment goes stale immediately
# Author: Thien, Last modified: 2026-08-19

# BAD — dead code left "just in case"
# old_result = legacy_calculate(x)
# return old_result
return calculate(x)
```

Use `git blame`/`git log` for authorship and history. Delete dead code — it's in version control if it's ever needed again.

---

## Quick self-check before finishing any file

- [ ] Every public function/class has a docstring (what it does + non-obvious params/return/edge cases)
- [ ] No `data`/`tmp`/`obj`/`flag`/`utils.py`-style vague names introduced
- [ ] Every non-obvious line has a WHY comment near it; no comment just repeats the next line
- [ ] Long functions have section comments marking their logical steps
- [ ] Known gaps/fallbacks/mocks are explicitly commented, not silently hidden
- [ ] No stale comments left after this edit; no commented-out dead code; no author/date metadata comments

---

## Sources / inspiration

Adapted from the Names (N1-N7) and Comments (C1-C5) rule sets in [ertugrul-dmr/clean-code-skills](https://github.com/ertugrul-dmr/clean-code-skills) (Agent Skills for Clean Code, 55★) and [hatlesswizard/clean-code-skills](https://github.com/hatlesswizard/clean-code-skills) (18 chapter-based Clean Code checkers). **Diverges deliberately from both on comment density**: those follow Robert C. Martin's *Clean Code* preference for minimal comments ("good code mostly documents itself"); this skill instead targets explicit, docstring-everywhere, WHY-focused commenting suited to handoff between humans and AI coding agents, where the reader can't always ask the original author what they meant.
