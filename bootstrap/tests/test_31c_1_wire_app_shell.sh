#!/usr/bin/env bash
set -Eeuo pipefail

fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
ok() { printf 'OK: %s\n' "$*"; }

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null)" || fail "Bukan git repository."
cd "$ROOT_DIR"

BRANCH="$(git branch --show-current 2>/dev/null || true)"
[[ "$BRANCH" == alfy/* || "$BRANCH" == "development" ]] || fail "Branch aktif wajib prefix alfy/... atau development. Saat ini: $BRANCH"

required_files=(
  "frontend/src/app.jsx"
  "frontend/src/components/layout/AppShell.jsx"
  "frontend/src/components/layout/index.js"
  "frontend/src/constants/index.js"
  "bootstrap/bootstrap_31c_1_wire_app_shell.sh"
  "bootstrap/tests/test_31c_1_wire_app_shell.sh"
  "bootstrap/reports/31c_1_wire_app_shell_report.md"
)

for file in "${required_files[@]}"; do
  [[ -f "$file" ]] || fail "File wajib 31c-1 belum ada: $file"
done

grep -q "AppShell" frontend/src/app.jsx \
  || fail "app.jsx belum memakai AppShell"

grep -q "components/layout" frontend/src/app.jsx \
  || fail "app.jsx belum import layout components"

grep -q "APP_NAV_ITEMS" frontend/src/app.jsx \
  || fail "app.jsx belum mendefinisikan APP_NAV_ITEMS"

grep -q "ROUTES" frontend/src/app.jsx \
  || fail "app.jsx belum memakai ROUTES untuk nav"

grep -q "<AppShell" frontend/src/app.jsx \
  || fail "app.jsx belum membungkus UI dengan AppShell"

ok "31c-1 app shell wiring validated"

printf '\nPATCH 31C-1 WIRE APP SHELL TEST PASSED\n'