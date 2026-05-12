#!/usr/bin/env bash
set -Eeuo pipefail

fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
ok() { printf 'OK: %s\n' "$*"; }

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null)" || fail "Bukan git repository."
cd "$ROOT_DIR"

BRANCH="$(git branch --show-current 2>/dev/null || true)"
[[ "$BRANCH" == alfy/* || "$BRANCH" == "development" ]] || fail "Branch aktif wajib prefix alfy/... atau development. Saat ini: $BRANCH"

required_files=(
  "frontend/index.html"
  "docs/contracts/FRONTEND_TAILWIND_CONTRACT.md"
  "docs/CONTRACT_INDEX.md"
  "bootstrap/bootstrap_31c_2_tailwind_cdn_only.sh"
  "bootstrap/tests/test_31c_2_tailwind_cdn_only.sh"
  "bootstrap/reports/31c_2_tailwind_cdn_only_report.md"
)

for file in "${required_files[@]}"; do
  [[ -s "$file" ]] || fail "File wajib 31c-2 belum ada/kosong: $file"
done

grep -q "cdn.tailwindcss.com" frontend/index.html \
  || fail "frontend/index.html belum memasang Tailwind CDN"

grep -q "darkMode: 'class'" frontend/index.html \
  || fail "Tailwind CDN belum memakai darkMode class"

grep -q "Tailwind Play CDN" docs/contracts/FRONTEND_TAILWIND_CONTRACT.md \
  || fail "Kontrak Tailwind belum mencatat Tailwind Play CDN"

grep -q "31c-3 may implement" docs/contracts/FRONTEND_TAILWIND_CONTRACT.md \
  || fail "Kontrak Tailwind belum mengarahkan implementasi halaman ke 31c-3"

grep -q "FRONTEND_TAILWIND_CONTRACT.md" docs/CONTRACT_INDEX.md \
  || fail "CONTRACT_INDEX belum mencatat FRONTEND_TAILWIND_CONTRACT"

# Guard: 31c-2 Tailwind-only must not implement page content.
# This guard is branch-scoped so later patches such as 31c-3 may add pages.
if [[ "$BRANCH" == "alfy/31c-2-tailwind-cdn-only" ]]; then
  if git diff --name-only origin/development...HEAD 2>/dev/null | grep -Eq '^frontend/src/(app\.jsx|app\.css|pages/|public/icon/)'; then
    fail "31c-2 Tailwind-only tidak boleh mengubah app.jsx, app.css, pages, atau public/icon."
  fi
fi

ok "31c-2 Tailwind CDN-only validation passed"
printf '\nPATCH 31C-2 TAILWIND CDN ONLY TEST PASSED\n'