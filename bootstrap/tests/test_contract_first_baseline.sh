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
[[ -n "$BRANCH" ]] || fail "Branch aktif tidak terbaca."
[[ "$BRANCH" == alfy/* || "$BRANCH" == "development" ]] || fail "Branch aktif wajib prefix alfy/... atau development. Saat ini: $BRANCH"
ok "branch prefix valid: $BRANCH"

required_files=(
  "README.md"
  "CHANGELOG.md"
  "CONTRIBUTING.md"
  "SOURCE_NOTES.md"
  "docs/SPECIFICATION.md"
  "docs/IMPLEMENTATION_STATUS.md"
  "docs/DEV_PLAN_SHORT_TERM.md"
  "docs/TEST_PLAN.md"
  "docs/ARCHITECTURE.md"
  "docs/CONTRACT_INDEX.md"
  "docs/contracts/STACK_CONTRACT.md"
  "docs/contracts/BRANCH_INTEGRATION_CONTRACT.md"
  "docs/contracts/FRONTEND_CONTRACT.md"
  "docs/contracts/ROUTE_CONTRACT.md"
  "docs/contracts/API_CONTRACT.md"
  "docs/contracts/AUTH_CONTRACT.md"
  "docs/contracts/DATABASE_CONTRACT.md"
  "docs/contracts/ERROR_CONTRACT.md"
  "docs/contracts/ENV_DOCKER_CONTRACT.md"
  "docs/contracts/SECURITY_CONTRACT.md"
  "docs/dev-plans/DEV_PLAN_PHASE_0_CONTRACT_BASELINE.md"
  "docs/dev-plans/DEV_PLAN_PHASE_1_FRONTEND_STABILIZATION.md"
  "docs/dev-plans/DEV_PLAN_PHASE_2_FEATURE_MODULARIZATION_ROUTING.md"
  "docs/dev-plans/DEV_PLAN_PHASE_3_API_BACKEND_FOUNDATION.md"
  "docs/dev-plans/DEV_PLAN_PHASE_4_DATA_MIGRATION_FINAL_DOCS.md"
  "docs/reviews/CODE_QUALITY_REVIEW.md"
  "examples/api/response-envelope.examples.json"
  "scripts/check_docs_contracts.py"
  "bootstrap/bootstrap_implementasi_contract_first.sh"
  "bootstrap/reports/contract_first_bootstrap_report.md"
)

missing=0
for f in "${required_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    printf 'MISSING: %s\n' "$f" >&2
    missing=1
  fi
done

[[ "$missing" == "0" ]] || fail "Ada file contract-first wajib yang belum ada."
ok "required contract-first files present"

PYTHON_CMD="$(resolve_python_cmd)" || fail "Python interpreter valid tidak ditemukan. Di Git Bash Windows, alias python3 kadang mengarah ke Microsoft Store. Coba install Python asli, atau aktifkan Python launcher `py -3`, atau matikan App execution alias Python."
ok "python interpreter detected: $PYTHON_CMD"

# shellcheck disable=SC2086
$PYTHON_CMD scripts/check_docs_contracts.py
ok "scripts/check_docs_contracts.py passed"

if [[ -f "backend/composer.json" ]]; then
  grep -q "Rajasa\\\\\\\\PresensiLabBackend\\\\\\\\" backend/composer.json \
    || fail "backend/composer.json belum memakai namespace Rajasa\\\\PresensiLabBackend\\\\ sesuai kontrak."
  ok "backend namespace contract detected"
fi

if [[ -f "frontend/package.json" ]]; then
  grep -q '"preact"' frontend/package.json \
    || fail "frontend/package.json belum mendeteksi dependency preact."
  ok "frontend stack contract detected"
fi

printf '\nCONTRACT-FIRST BASELINE TEST PASSED\n'