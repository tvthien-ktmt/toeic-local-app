---
name: code-quality-auditor
description: Automated Fullstack Clean Code & Architecture Auditor for React 19 + FastAPI projects. Audits explicit naming (N1-N7), docstring completeness (C1), WHY-comments (C2), dead code elimination (C6), type annotations, and database-to-service layering. Runs a deep AST-based static scan and generates a score card with actionable line-by-line recommendations.
---

# Code Quality & Clean Architecture Auditor

This skill provides an automated, objective, production-grade quality audit for Fullstack applications (React TypeScript + FastAPI Python). It combines the **Explicit Naming (N1-N7)** and **Professional Comments (C1-C6)** guidelines with clean architecture constraints.

---

## What This Skill Does

1. **Explicit Naming Analysis**: Detects vague variable names (`tmp`, `res`, `data`, `obj`, `val`, `item`, `flag`) and uninformative file names (`utils.py`, `helpers.py`).
2. **Docstring & JSDoc Coverage**: Flags public functions/classes lacking descriptive docstrings or JSDoc comments.
3. **Comment Quality & Dead Code**: Flags commented-out legacy code, author/date metadata comments, and bare WHAT-comments.
4. **Architectural Purity**: Checks that database ORM queries stay inside service layers and routes remain thin.
5. **Type Hint Completeness**: Validates that all public Python functions have parameter and return type hints.
6. **Automated Scorecard**: Generates an A+ through F rating with exact file/line pointers.

---

## How to Run the Automated Quality Audit

You can run the audit tool with one command:

```powershell
python backend/app/scripts/audit_clean_code.py
```

Options:
- `--target backend/app` : Audit only Backend
- `--target frontend/src` : Audit only Frontend
- `--strict` : Fail if score is below 90% (Grade A)
- `--json` : Output machine-readable JSON for CI/CD

---

## Grading Rubric

- **Grade A (95 - 100%)**: Workplace-ready enterprise quality. Explicit names, complete docstrings, pure separation of concerns.
- **Grade B (85 - 94%)**: Good codebase, minor missing docstrings or few vague variable names.
- **Grade C (70 - 84%)**: Needs refactoring. Vague naming or lack of WHY-comments.
- **Grade D/F (< 70%)**: High technical debt.

---

## Rule Checklist

### Naming (N1-N7)
- [ ] No `tmp`, `val`, `res`, `obj`, `data`, `flag` in active scope.
- [ ] Boolean variables start with `is_`, `has_`, `can_`, `should_`.
- [ ] File names are domain-specific (e.g., `extraction_service.py`, not `utils.py`).

### Comments & Docstrings (C1-C6)
- [ ] Every exported function has a docstring explaining what, why, and edge cases.
- [ ] Multi-step functions use `# --- 1. Step ---` section dividers.
- [ ] No commented-out dead code.
- [ ] Known limitations documented with clear explanation.
