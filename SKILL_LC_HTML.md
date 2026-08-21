---
name: lc-html-to-exam-pipeline
description: Convert one or more raw TOEIC Listening (LC) exam HTML files (ETS/Hacker/YBM/any source) into structured JSON exam data wired into the TOIEC Web platform (frontend + backend), fully automated and repeatable across a batch of files. Use whenever the user gives one or more file paths to LC HTML exports and says to process/import/add them as exams. Do NOT use for Reading (RC) exam files — those have no answer key and need the separate RC pipeline.
---

# LC HTML → Exam Pipeline

Given a list of file paths (one file, several files, or a whole folder), run this exact 6-step pipeline **per file**, then produce one consolidated report at the end covering every file. Never process a file silently and only report at the very end — if a file fails at any step, stop on that file, report the failure with the real command output, and move to the next file (don't let one bad file block the whole batch, but don't hide its failure either).

**Hard rule inherited from this project's history: every checklist item below is checked by pasting real command output — a terminal result, a `grep` count, an actual JSON snippet — never a narrated "done"/"passed"/"0 lỗi" claim. If a step can't produce real evidence, the step isn't actually complete yet.**

**Hard rule #2: never modify the audit script, the interface definition, or a data value for the sole purpose of making a check pass. If `audit.bat` or `npm run build` fails, the fix is in the exam data or the generation code — not in loosening the check.** (This project has a documented incident of an agent renaming `Questions XXX-XXX` to a fake-looking value specifically to dodge a `grep XXX` check instead of fixing the actual placeholder — that pattern is explicitly forbidden here.)

---

## Step 1 — Structure Inspection

For each input file:
- Count how many full Tests the file contains, and print the count (don't just say "multiple").
- Locate the Part boundaries for every test:
  - Part 1: photo-description questions (Q1–Q6)
  - Part 2: question-response (Q7–Q31, 25 questions)
  - Part 3: conversations (Q32–Q70, 39 questions → must group into exactly 13 conversations of 3 questions each)
  - Part 4: short talks (Q71–Q100, 30 questions → must group into exactly 10 talks of 3 questions each)
- Locate the **Answer Key table** (usually at the end of the file, or a separate section) — LC files, unlike RC OCR dumps, normally do include this. If a file has **no** answer key table, stop and flag it — don't guess answers, and don't silently import a test with `correct_answer: null` for all 100 questions without telling the user.

**Evidence to paste:** number of tests found, number of Part-boundary matches per part per test (e.g. "Test 1: Part1=6✓ Part2=25✓ Part3=39✓ Part4=30✓, answer key: found").

---

## Step 2 — Local Asset Archiving (images)

- Find every `<img src="...">` (Part 1 photos, Part 3/4 graphics — maps, coupons, charts used in "Look at the graphic" questions).
- Download each image and save to **both**:
  1. `frontend/public/images/<tên_bộ_sách>/` — served directly by the web app.
  2. `Book_LC/images/<tên_bộ_sách>/` — permanent local backup, independent of the original (often temporary/signed) source URL.
- Build a mapping table: original URL → local path `/images/<tên_bộ_sách>/img_xxx.jpg`, and rewrite every reference in the extracted data to use the local path — the shipped app must never depend on the original external image URL (those are frequently signed/expiring CDN links).

**Evidence to paste:** count of `<img>` tags found vs. count of files actually saved in both locations — the two numbers must match. If they don't, say which images failed and why (404, corrupt, etc.) rather than silently dropping them from the exam.

---

## Step 3 — Data Extraction & Answer Cleanup

- **Part 1 (6 câu):** image reference (local path from Step 2) + 4 choices (A–D) + correct answer, from the answer key table matched by question number.
- **Part 2 (25 câu, Q7–Q31):** question-response text + **3 choices (A–C only — Part 2 never has a D option)** + correct answer.
- **Part 3 (39 câu → 13 nhóm hội thoại × 3 câu):**
  - Group into exactly 13 conversation sets.
  - Strip duplicated choice-letter prefixes — the known bug pattern is `[A] (A) ...` (letter tagged twice); the cleaned choice text must have the letter exactly once.
  - Attach the associated graphic/table (local image path) to any question with "Look at the graphic" in its stem.
- **Part 4 (30 câu → 10 nhóm bài nói ngắn × 3 câu):** same grouping + cleanup rules as Part 3.
- Match every question to its correct answer from the Step 1 answer-key table — **by question number, not by position** (a single skipped/misdetected question earlier in the file shifts every later position, so number-based matching is the only safe method).

**Evidence to paste:** total question count per part per test (must be exactly 6/25/39/30 = 100 per test — any deviation is `needsReview`, not silently accepted), and 2–3 sample extracted questions (including one Part 3/4 "Look at the graphic" question) printed raw so they can be eyeballed for the `[A] (A)` duplication bug and for stray HTML/OCR noise.

---

## Step 4 — JSON Export

- Output path: `frontend/src/data/<tên_bộ_sách>/<tên_bộ_sách>_lc_data.json`
- **Before generating the JSON, read the actual current `LCExamDocument` and `NormalizedLCParts` TypeScript interface definitions in the codebase** — don't assume or reuse a remembered shape from a previous session; interfaces may have changed. Generate JSON that matches the interface exactly, field for field.
- Run the project's TypeScript type-check (or a JSON-schema validation step if one exists) against the generated file before moving to Step 5 — a JSON file that merely "looks right" but doesn't type-check against `LCExamDocument` is not done.

**Evidence to paste:** the type-check/validation command and its real output (pass or the actual error list).

---

## Step 5 — Catalog & Room Wiring

- Register the new data in `frontend/src/data/lcCatalogData.ts` and the backend route `backend/app/routers/listening.py`.
- Confirm the exam shows the **"Đủ 100 Câu & Ảnh"** badge — this badge logic reads from real data, so if it doesn't light up, something from Steps 1–4 is incomplete; don't force the badge to show by hardcoding a flag.
- Confirm the exam is reachable end-to-end: catalog entry → click → `LcExamTakePage.tsx` loads the 100 questions.

**Evidence to paste:** the diff/snippet added to `lcCatalogData.ts`, and confirmation the router change matches the existing route pattern for other exams in the same file (don't invent a new pattern per exam).

---

## Step 6 — Build & Quality Audit

- `npm run build` — must be **0 TypeScript errors, 0 compile errors**. Paste the real terminal output, not a summary.
- `dev-rules/audit.bat` (or whichever audit script the project currently has) — paste the real output section by section, same as Step 1–5's evidence rule.
- If either fails, fix the underlying code/data and re-run — don't edit the audit script or the interface to make the failure disappear (see Hard Rule #2 above).

---

## Batch mode — multiple files in one request

When given several file paths (or a folder), run Steps 1–6 **per file, in order given**, and keep each file's evidence separate — don't merge outputs across files, since a passing Part-count check on file B doesn't tell you anything about file A. At the end, print one summary table:

| File | Tests found | Images (found/saved) | Questions/test (100 expected) | Type-check | Build | Audit |
|---|---|---|---|---|---|---|
| ETS2018.html | 5 | 120/120 | 100,100,100,100,100 | ✅ | ✅ | ✅ |
| Hacker_Vol3.html | 3 | 84/84 | 100,100,98(⚠️Test3) | ✅ | ✅ | ⚠️ 1 needsReview |

A row with any ⚠️/❌ means that file is **not** wired into the catalog yet — report it as still-pending, don't include a partially-broken exam in the "done" count.

---

## Known bug patterns to actively check for (from prior extraction runs on this project)

- Duplicated choice letter: `[A] (A) some text` instead of `(A) some text`.
- Question numbers shifting after a misdetected/skipped question — always match answers by number, never by list position.
- Image URLs pointing to the original (often temporary/signed) source instead of the rewritten local `/images/...` path.
- A part's question count silently short of the fixed total (6/25/39/30) because a boundary regex missed one question — must surface as `needsReview`, never as a quietly smaller exam.
- Renaming or rewording a data value / audit rule specifically to pass a check, instead of fixing the real gap (see Hard Rule #2).
