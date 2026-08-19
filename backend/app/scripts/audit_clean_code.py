"""
Clean Code & Architecture Quality Auditor.
Implements the Explicit Naming (N1-N7) & Professional Comments (C1-C6) Skill.
Scans Python (Backend) and TypeScript/React (Frontend) for workplace-grade standards.
"""
import os
import sys
import ast
import re
import argparse
import logging
from pathlib import Path
from typing import List, Dict, Any

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("clean_code_auditor")

VAGUE_NAMES = {"tmp", "temp", "val", "item", "flag", "obj", "fn", "cb"}
VAGUE_ASSIGN_REGEX = re.compile(r'\b(const|let|var)\s+(res|tmp|temp|val|item|flag|obj)\b')

class PythonFileAuditor(ast.NodeVisitor):
    """AST-based code visitor that checks Python files for naming, docstrings, and error handling."""

    def __init__(self, filepath: str, source_code: str) -> None:
        self.filepath = filepath
        self.source_code = source_code
        self.lines = source_code.splitlines()
        self.violations: List[Dict[str, Any]] = []
        self.total_functions = 0
        self.docstring_count = 0
        self.typed_functions = 0

    def audit(self) -> None:
        """Parses the Python file AST and performs syntax, docstring, and code-pattern checks."""
        try:
            tree = ast.parse(self.source_code, filename=self.filepath)
            self.visit(tree)
        except SyntaxError as e:
            self.violations.append({
                "type": "SYNTAX_ERROR",
                "line": e.lineno or 1,
                "severity": "HIGH",
                "message": f"Syntax error: {e.msg}"
            })

        # Text-level checks
        for idx, line in enumerate(self.lines, 1):
            stripped = line.strip()
            # Check for print() in app code (excluding scripts)
            if "backend/app/routers" in self.filepath or "backend/app/services" in self.filepath:
                if re.search(r'\bprint\s*\(', stripped) and not stripped.startswith("#"):
                    self.violations.append({
                        "type": "NO_PRINT",
                        "line": idx,
                        "severity": "HIGH",
                        "message": "Use logger.info/warning/error instead of print() in service/router code."
                    })

            # Check for commented-out dead code
            if re.match(r'^\s*#\s*(def |class |return |import |from |if |for |while |db\.)', stripped):
                self.violations.append({
                    "type": "DEAD_CODE_COMMENT",
                    "line": idx,
                    "severity": "MEDIUM",
                    "message": f"Commented-out code detected: '{stripped[:40]}...'. Delete dead code; rely on git history."
                })

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        """Visits standard function definitions."""
        self._check_function(node)
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        """Visits async function definitions."""
        self._check_function(node)
        self.generic_visit(node)

    def _check_function(self, node: Any) -> None:
        """Performs docstring, return type hint, and parameter naming checks on a function node."""
        if node.name.startswith("_"):
            return  # Skip private/internal helpers

        self.total_functions += 1

        # C1: Docstring Check on public functions
        docstring = ast.get_docstring(node)
        if docstring:
            self.docstring_count += 1
        else:
            self.violations.append({
                "type": "MISSING_DOCSTRING",
                "line": node.lineno,
                "severity": "MEDIUM",
                "message": f"Public function '{node.name}()' is missing a docstring explaining WHAT it does and WHY."
            })

        # Type hint check
        if node.returns is not None:
            self.typed_functions += 1
        else:
            self.violations.append({
                "type": "MISSING_RETURN_TYPE",
                "line": node.lineno,
                "severity": "LOW",
                "message": f"Function '{node.name}()' is missing an explicit return type hint (e.g. -> None)."
            })

        # N1: Vague Parameter Names
        for arg in node.args.args:
            if arg.arg in VAGUE_NAMES:
                self.violations.append({
                    "type": "VAGUE_PARAMETER_NAME",
                    "line": node.lineno,
                    "severity": "HIGH",
                    "message": f"Vague parameter name '{arg.arg}' in '{node.name}()'. Use a descriptive domain name."
                })

    def visit_ExceptHandler(self, node: ast.ExceptHandler) -> None:
        """Audits exception handler blocks for bare excepts or silently swallowed passes."""
        if node.type is None:
            self.violations.append({
                "type": "BARE_EXCEPT",
                "line": node.lineno,
                "severity": "HIGH",
                "message": "Bare 'except:' caught. Catch a specific exception type (e.g., Exception, ValueError)."
            })
        if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
            self.violations.append({
                "type": "SILENT_EXCEPTION_PASS",
                "line": node.lineno,
                "severity": "HIGH",
                "message": "Silently swallowed exception with bare 'pass'. Log the error or handle it."
            })
        self.generic_visit(node)


def audit_python_codebase(root_dir: Path) -> Dict[str, Any]:
    """Scans all Python files in the given directory using AST parsing and rules checking."""
    total_files = 0
    all_violations = []
    total_funcs = 0
    docstring_funcs = 0
    typed_funcs = 0

    for py_file in root_dir.rglob("*.py"):
        if ".venv" in py_file.parts or "node_modules" in py_file.parts or "__pycache__" in py_file.parts:
            continue

        total_files += 1
        with open(py_file, "r", encoding="utf-8", errors="ignore") as f:
            source = f.read()

        auditor = PythonFileAuditor(str(py_file), source)
        auditor.audit()

        total_funcs += auditor.total_functions
        docstring_funcs += auditor.docstring_count
        typed_funcs += auditor.typed_functions
        for v in auditor.violations:
            v["file"] = os.path.relpath(py_file, root_dir.parent)
            all_violations.append(v)

    return {
        "files_scanned": total_files,
        "total_functions": total_funcs,
        "docstring_coverage": round((docstring_funcs / max(1, total_funcs)) * 100, 1),
        "type_hint_coverage": round((typed_funcs / max(1, total_funcs)) * 100, 1),
        "violations": all_violations
    }


def audit_typescript_codebase(root_dir: Path) -> Dict[str, Any]:
    """Scans TypeScript and TSX files for JSDocs, naming, dead code, and convention adherence."""
    total_files = 0
    violations = []
    total_exports = 0
    documented_exports = 0

    for ts_file in root_dir.rglob("*.[t|j]s*"):
        if "node_modules" in ts_file.parts or "dist" in ts_file.parts or ".vite" in ts_file.parts:
            continue

        total_files += 1
        rel_path = str(ts_file)
        with open(ts_file, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()

        for idx, line in enumerate(lines, 1):
            stripped = line.strip()

            # Check exported components / functions for JSDoc docstrings
            if re.match(r'^export\s+(default\s+)?(function|const|class)\s+([A-Za-z0-9_]+)', stripped):
                total_exports += 1
                # Look backwards for JSDoc /** ... */
                has_doc = False
                for back_idx in range(idx - 2, max(-1, idx - 8), -1):
                    if back_idx >= 0 and ("*/" in lines[back_idx] or lines[back_idx].strip().startswith("/**") or lines[back_idx].strip().startswith("//")):
                        has_doc = True
                        break
                    elif back_idx >= 0 and lines[back_idx].strip() != "":
                        break
                if has_doc:
                    documented_exports += 1
                else:
                    match_name = re.search(r'(?:function|const|class)\s+([A-Za-z0-9_]+)', stripped)
                    name_str = match_name.group(1) if match_name else "entity"
                    violations.append({
                        "file": os.path.relpath(ts_file, root_dir.parent),
                        "line": idx,
                        "type": "MISSING_JSDOC",
                        "severity": "MEDIUM",
                        "message": f"Exported '{name_str}' is missing a JSDoc docstring explaining its purpose."
                    })

            # Check for console.log
            if "console.log(" in stripped and not stripped.startswith("//"):
                violations.append({
                    "file": os.path.relpath(ts_file, root_dir.parent),
                    "line": idx,
                    "type": "CONSOLE_LOG",
                    "severity": "LOW",
                    "message": "console.log() found in production code. Remove or wrap in debug helper."
                })

            # Check for vague variable assignment
            m = VAGUE_ASSIGN_REGEX.search(line)
            if m and not stripped.startswith("//") and not stripped.startswith("/*"):
                violations.append({
                    "file": os.path.relpath(ts_file, root_dir.parent),
                    "line": idx,
                    "type": "VAGUE_VARIABLE_NAME",
                    "severity": "HIGH",
                    "message": f"Vague variable declaration '{m.group(0)}'. Use a descriptive domain name."
                })

            # Check for commented-out dead code
            if re.match(r'^\s*//\s*(const |let |var |function |return |import |export |interface |type )', stripped):
                violations.append({
                    "file": os.path.relpath(ts_file, root_dir.parent),
                    "line": idx,
                    "type": "DEAD_CODE_COMMENT",
                    "severity": "MEDIUM",
                    "message": f"Commented-out code detected: '{stripped[:40]}...'. Delete dead code."
                })

            # Check for inline SVG (Conventions check)
            if "<svg" in line and "icons/" not in rel_path and not stripped.startswith("//"):
                if "data chart" not in line.lower():
                    violations.append({
                        "file": os.path.relpath(ts_file, root_dir.parent),
                        "line": idx,
                        "type": "INLINE_SVG",
                        "severity": "LOW",
                        "message": "Inline <svg> detected. Use 'lucide-react' icon components."
                    })

    return {
        "files_scanned": total_files,
        "total_exports": total_exports,
        "jsdoc_coverage": round((documented_exports / max(1, total_exports)) * 100, 1),
        "violations": violations
    }


def calculate_grade(score: float) -> str:
    """Calculates letter grade based on overall percentage quality score."""
    if score >= 95:
        return "A+ (Outstanding Production Quality)"
    elif score >= 90:
        return "A (Workplace Enterprise Ready)"
    elif score >= 80:
        return "B (Solid, Minor Refinements Needed)"
    elif score >= 70:
        return "C (Acceptable, Tech Debt Accumulating)"
    else:
        return "D/F (Action Required)"


def main() -> None:
    """Runs the Clean Code & Architecture Quality Auditor and logs detailed results."""
    parser = argparse.ArgumentParser(description="Clean Code & Enterprise Quality Auditor")
    parser.add_argument("--project-root", default=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))
    args = parser.parse_args()

    project_root = Path(args.project_root)
    backend_dir = project_root / "backend" / "app"
    frontend_dir = project_root / "frontend" / "src"

    logger.info("=" * 70)
    logger.info("🔍 CLEAN CODE & ARCHITECTURE QUALITY AUDITOR (SKILL V1)")
    logger.info("   Enforcing Explicit Naming (N1-N7) & Professional Comments (C1-C6)")
    logger.info("=" * 70)

    # 1. Audit Python Backend
    py_results = audit_python_codebase(backend_dir)
    # 2. Audit TypeScript Frontend
    ts_results = audit_typescript_codebase(frontend_dir)

    all_violations = py_results["violations"] + ts_results["violations"]
    high_sev = [v for v in all_violations if v["severity"] == "HIGH"]
    med_sev = [v for v in all_violations if v["severity"] == "MEDIUM"]
    low_sev = [v for v in all_violations if v["severity"] == "LOW"]

    # Penalty score formula
    deductions = (len(high_sev) * 3.0) + (len(med_sev) * 1.0) + (len(low_sev) * 0.5)
    doc_bonus = (py_results["docstring_coverage"] / 100) * 5.0
    raw_score = max(0.0, min(100.0, 100.0 - deductions + doc_bonus))
    grade = calculate_grade(raw_score)

    logger.info(f"\n📊 SUMMARY METRICS:")
    logger.info(f"   • Backend Files Scanned    : {py_results['files_scanned']} files")
    logger.info(f"   • Frontend Files Scanned   : {ts_results['files_scanned']} files")
    logger.info(f"   • Python Public Functions  : {py_results['total_functions']}")
    logger.info(f"   • Docstring Coverage (C1)  : {py_results['docstring_coverage']}%")
    logger.info(f"   • Return Type Hints        : {py_results['type_hint_coverage']}%")
    logger.info(f"   • Quality Score            : {raw_score:.1f} / 100.0")
    logger.info(f"   • Overall Quality Grade    : {grade}")

    logger.info(f"\n📋 VIOLATIONS BREAKDOWN:")
    logger.info(f"   • Critical / High Severity : {len(high_sev)}")
    logger.info(f"   • Medium Severity          : {len(med_sev)}")
    logger.info(f"   • Low Severity / Tips      : {len(low_sev)}")

    if all_violations:
        logger.info(f"\n🔎 ALL DETAILED FINDINGS ({len(all_violations)} items):")
        for v in all_violations:
            icon = "🔴" if v["severity"] == "HIGH" else ("🟡" if v["severity"] == "MEDIUM" else "ℹ️")
            logger.info(f"   {icon} [{v['severity']}] {v['file']}:{v['line']} — {v['message']}")
    else:
        logger.info("\n✨ PERFECT CODEBASE: Zero violations found across all naming & comment rules!")

    logger.info("=" * 70)


if __name__ == "__main__":
    main()
