#!/usr/bin/env bash
set -Eeuo pipefail

fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
ok() { printf 'OK: %s\n' "$*"; }

resolve_python_cmd() {
  if command -v python3 >/dev/null 2>&1 && python3 -c "import sys" >/dev/null 2>&1; then
    printf '%s\n' "python3"
    return 0
  fi

  if command -v python >/dev/null 2>&1 && python -c "import sys" >/dev/null 2>&1; then
    printf '%s\n' "python"
    return 0
  fi

  if command -v py >/dev/null 2>&1 && py -3 -c "import sys" >/dev/null 2>&1; then
    printf '%s\n' "py -3"
    return 0
  fi

  return 1
}

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null)" || fail "Bukan di dalam git repository."
cd "$ROOT_DIR"

BRANCH="$(git branch --show-current 2>/dev/null || true)"
[[ "$BRANCH" == alfy/* ]] || fail "Branch aktif wajib prefix alfy/... Saat ini: $BRANCH"
ok "branch prefix valid: $BRANCH"

required_files=(
  ".editorconfig"
  "frontend/.prettierrc.json"
  "frontend/.prettierignore"
  "frontend/eslint.config.mjs"
  "frontend/package.json"
  "bootstrap/bootstrap_31a_frontend_tooling.sh"
  "bootstrap/tests/test_31a_frontend_tooling.sh"
  "bootstrap/reports/31a_frontend_tooling_report.md"
)

missing=0
for f in "${required_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    printf 'MISSING: %s\n' "$f" >&2
    missing=1
  fi
done
[[ "$missing" == "0" ]] || fail "Ada file patch 31a yang belum ada."
ok "patch 31a files present"

PYTHON_CMD="$(resolve_python_cmd)" || fail "Python valid tidak ditemukan."

# shellcheck disable=SC2086
$PYTHON_CMD - <<'PY'
import json
from pathlib import Path

pkg = json.loads(Path("frontend/package.json").read_text(encoding="utf-8"))

scripts = pkg.get("scripts", {})
required_scripts = {
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
}

missing_scripts = [
    f"{name}={command}"
    for name, command in required_scripts.items()
    if scripts.get(name) != command
]
if missing_scripts:
    raise SystemExit("Missing/invalid scripts: " + ", ".join(missing_scripts))

dev_deps = pkg.get("devDependencies", {})
for name in ["@eslint/js", "eslint", "globals", "prettier"]:
    if name not in dev_deps:
        raise SystemExit(f"Missing devDependency: {name}")

prettier = json.loads(Path("frontend/.prettierrc.json").read_text(encoding="utf-8"))
for key in ["semi", "singleQuote", "trailingComma", "printWidth", "tabWidth"]:
    if key not in prettier:
        raise SystemExit(f"Missing prettier option: {key}")

editorconfig = Path(".editorconfig").read_text(encoding="utf-8")
if "root = true" not in editorconfig:
    raise SystemExit(".editorconfig must contain root = true")

eslint_config = Path("frontend/eslint.config.mjs").read_text(encoding="utf-8")
for expected in ["@eslint/js", "globals", "no-unused-vars"]:
    if expected not in eslint_config:
        raise SystemExit(f"eslint.config.mjs missing: {expected}")

print("31a JSON/config validation passed.")
PY

ok "package.json and config validation passed"

if command -v node >/dev/null 2>&1; then
  node -e "JSON.parse(require('fs').readFileSync('frontend/package.json', 'utf8')); console.log('node package.json parse passed')"
  ok "node package.json parse passed"
else
  ok "node not found; skipped node parse check"
fi

printf '\nPATCH 31A FRONTEND TOOLING TEST PASSED\n'