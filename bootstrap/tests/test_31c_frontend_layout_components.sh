#!/usr/bin/env bash
set -Eeuo pipefail

fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
ok() { printf 'OK: %s\n' "$*"; }

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null)" || fail "Bukan git repository."
cd "$ROOT_DIR"

BRANCH="$(git branch --show-current 2>/dev/null || true)"
[[ "$BRANCH" == alfy/* || "$BRANCH" == "development" ]] || fail "Branch aktif wajib prefix alfy/... atau development. Saat ini: $BRANCH"

required_files=(
  "frontend/src/components/layout/AppHeader.jsx"
  "frontend/src/components/layout/AppShell.jsx"
  "frontend/src/components/layout/AppSidebar.jsx"
  "frontend/src/components/layout/index.js"
  "frontend/src/components/layout/layout.css"
  "bootstrap/bootstrap_31c_frontend_layout_components.sh"
  "bootstrap/tests/test_31c_frontend_layout_components.sh"
  "bootstrap/reports/31c_frontend_layout_components_report.md"
)

for file in "${required_files[@]}"; do
  [[ -f "$file" ]] || fail "File wajib 31c belum ada: $file"
done

grep -q "export function AppHeader" frontend/src/components/layout/AppHeader.jsx \
  || fail "AppHeader.jsx tidak mengekspor AppHeader"

grep -q "export function AppShell" frontend/src/components/layout/AppShell.jsx \
  || fail "AppShell.jsx tidak mengekspor AppShell"

grep -q "export function AppSidebar" frontend/src/components/layout/AppSidebar.jsx \
  || fail "AppSidebar.jsx tidak mengekspor AppSidebar"

grep -q "export { AppShell }" frontend/src/components/layout/index.js \
  || fail "layout index tidak mengekspor AppShell"

grep -q "app-shell" frontend/src/components/layout/layout.css \
  || fail "layout.css tidak memuat class app-shell"

ok "31c layout files validated"

printf '\nPATCH 31C FRONTEND LAYOUT COMPONENTS TEST PASSED\n'