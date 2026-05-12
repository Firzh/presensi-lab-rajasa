#!/usr/bin/env bash
set -Eeuo pipefail

BASE_REF="origin/development"
BRANCH=""
SCOPE="generic"
WITH_NPM=0
STRICT=0
FAIL=0
WARN=0
REPORT=""

usage() {
  cat <<'EOF'
Usage:
  bash ./bootstrap/bootstrap_review_gate.sh [options]

Options:
  --base <ref>       Base pembanding. Default: origin/development
  --branch <branch>  Branch target. Default: branch aktif
  --scope <name>     Scope audit: review-gate, 31a, 31b, generic
  --with-npm         Jalankan npm ci, format:check, lint
  --strict           package.json tanpa package-lock dianggap failure
  --debug-run        set -x
EOF
}

step(){ printf '\n==> %s\n' "$*"; }
ok(){ printf 'OK: %s\n' "$*"; }
warn(){ WARN=$((WARN+1)); printf 'WARNING: %s\n' "$*" >&2; }
fail(){ FAIL=$((FAIL+1)); printf 'FAIL: %s\n' "$*" >&2; }
die(){ printf 'ERROR: %s\n' "$*" >&2; exit 1; }

pycmd() {
  if command -v python3 >/dev/null 2>&1 && python3 -c "import sys" >/dev/null 2>&1; then echo python3; return 0; fi
  if command -v python >/dev/null 2>&1 && python -c "import sys" >/dev/null 2>&1; then echo python; return 0; fi
  if command -v py >/dev/null 2>&1 && py -3 -c "import sys" >/dev/null 2>&1; then echo "py -3"; return 0; fi
  return 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base) BASE_REF="${2:-}"; shift 2 ;;
    --branch) BRANCH="${2:-}"; shift 2 ;;
    --scope) SCOPE="${2:-}"; shift 2 ;;
    --with-npm) WITH_NPM=1; shift ;;
    --strict) STRICT=1; shift ;;
    --debug-run) set -x; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "Argumen tidak dikenal: $1" ;;
  esac
done

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || die "Bukan git repo"
cd "$ROOT"

[[ -n "$BRANCH" ]] || BRANCH="$(git branch --show-current)"
[[ -n "$BRANCH" ]] || die "Branch target tidak terbaca"

SAFE_BRANCH="$(printf '%s' "$BRANCH" | tr '/:' '__')"
mkdir -p bootstrap/reports
REPORT="bootstrap/reports/review_gate_${SAFE_BRANCH}_$(date '+%Y%m%d-%H%M%S').md"

cat > "$REPORT" <<EOF
# Review Gate Report

Generated at: $(date '+%Y-%m-%d %H:%M:%S %z')

\`\`\`text
Base   : $BASE_REF
Branch : $BRANCH
Scope  : $SCOPE
NPM    : $WITH_NPM
Strict : $STRICT
\`\`\`
EOF

section() {
  printf '\n## %s\n\n```text\n' "$1" >> "$REPORT"
  shift
  "$@" >> "$REPORT" 2>&1 || true
  printf '```\n' >> "$REPORT"
}

step "Review gate"
echo "Base   : $BASE_REF"
echo "Branch : $BRANCH"
echo "Scope  : $SCOPE"
echo "Report : $REPORT"

step "Validasi refs"
git rev-parse --verify "$BASE_REF" >/dev/null 2>&1 || die "Base ref tidak ditemukan: $BASE_REF. Jalankan git fetch origin"
git rev-parse --verify "$BRANCH" >/dev/null 2>&1 || die "Branch tidak ditemukan: $BRANCH"
[[ "$BRANCH" == alfy/* ]] && ok "branch prefix alfy/ valid" || fail "branch tidak memakai prefix alfy/..."

step "Working tree awareness"
git diff --quiet -- . || warn "Ada unstaged changes. Untuk branch review-gate, script/report baru masih wajar sebelum commit."
git diff --cached --quiet -- . || warn "Ada staged changes."

step "Docs contract check"
PY="$(pycmd)" || { fail "Python valid tidak ditemukan"; PY=""; }
if [[ -n "$PY" && -f scripts/check_docs_contracts.py ]]; then
  # shellcheck disable=SC2086
  $PY scripts/check_docs_contracts.py && ok "docs contract passed" || fail "docs contract failed"
else
  fail "scripts/check_docs_contracts.py tidak ada atau Python tidak valid"
fi

step "Bootstrap tests"
FOUND=0
shopt -s nullglob
for t in bootstrap/tests/test_*.sh; do
  FOUND=1
  echo "RUN: $t"
  bash "$t" && ok "$t passed" || fail "$t failed"
done
shopt -u nullglob
[[ "$FOUND" == 1 ]] || fail "Tidak ada bootstrap/tests/test_*.sh"

step "NPM checks"
if [[ "$WITH_NPM" == 1 ]]; then
  if command -v npm >/dev/null 2>&1 && [[ -f frontend/package.json ]]; then
    (cd frontend && npm ci && npm run format:check && npm run lint) && ok "npm checks passed" || fail "npm checks failed"
  else
    fail "npm tidak ditemukan atau frontend/package.json tidak ada"
  fi
else
  warn "NPM checks dilewati. Pakai --with-npm untuk gate ketat."
fi

step "Diff audit"
section "Commit Range" git log --oneline --decorate "$BASE_REF..$BRANCH"
section "Diff Stat" git diff --stat "$BASE_REF...$BRANCH"
section "Name Status" git diff --name-status "$BASE_REF...$BRANCH"
section "Num Stat" git diff --numstat "$BASE_REF...$BRANCH"
section "Diff Check" git diff --check "$BASE_REF...$BRANCH"

FILES="$(git diff --name-only "$BASE_REF...$BRANCH")"

step "Forbidden file audit"
FORBIDDEN="$(printf '%s\n' "$FILES" | grep -E '(^|/)(node_modules|vendor|\.env|\.tmp|backups)(/|$)|\.(zip|rar|7z|tar|gz|sql|sqlite|db)$' || true)"
if [[ -n "$FORBIDDEN" ]]; then
  fail "Ada file/folder terlarang di diff"
  printf '\n## Forbidden Files\n\n```text\n%s\n```\n' "$FORBIDDEN" >> "$REPORT"
else
  ok "tidak ada file terlarang"
fi

step "Architecture audit"
printf '%s\n' "$FILES" | grep -Eq '^frontend/src/app\.jsx$' && warn "frontend/src/app.jsx berubah; wajib review manual"
if printf '%s\n' "$FILES" | grep -Eq '^backend/' && printf '%s\n' "$FILES" | grep -Eq '^frontend/'; then
  warn "Patch menyentuh backend dan frontend sekaligus"
fi

if printf '%s\n' "$FILES" | grep -Eq '^frontend/package\.json$' && ! printf '%s\n' "$FILES" | grep -Eq '^frontend/package-lock\.json$'; then
  if [[ "$STRICT" == 1 ]]; then fail "package.json berubah tanpa package-lock"; else warn "package.json berubah tanpa package-lock"; fi
fi

if [[ "$SCOPE" == "review-gate" ]]; then
  UNEXPECTED="$(printf '%s\n' "$FILES" | grep -Ev '^(bootstrap/bootstrap_review_gate\.sh|bootstrap/reports/review_gate_.*\.md)$' || true)"
  if [[ -n "$UNEXPECTED" ]]; then
    fail "Scope review-gate berisi file di luar allowed list"
    printf '\n## Unexpected Files for review-gate\n\n```text\n%s\n```\n' "$UNEXPECTED" >> "$REPORT"
  else
    ok "scope review-gate sesuai allowed list"
  fi
fi

cat >> "$REPORT" <<EOF

## Gate Summary

\`\`\`text
Failures : $FAIL
Warnings : $WARN
\`\`\`
EOF

if [[ "$FAIL" -gt 0 ]]; then
  echo "Result: FAILED" >> "$REPORT"
  step "Review gate selesai"
  echo "Report: $REPORT"
  echo "RESULT: FAILED with $FAIL failure(s), $WARN warning(s)"
  exit 1
fi

if [[ "$WARN" -gt 0 ]]; then
  echo "Result: PASSED WITH WARNINGS" >> "$REPORT"
  step "Review gate selesai"
  echo "Report: $REPORT"
  echo "RESULT: PASSED WITH $WARN warning(s). Baca report sebelum PR."
  exit 0
fi

echo "Result: PASSED" >> "$REPORT"
step "Review gate selesai"
echo "Report: $REPORT"
echo "RESULT: PASSED"
