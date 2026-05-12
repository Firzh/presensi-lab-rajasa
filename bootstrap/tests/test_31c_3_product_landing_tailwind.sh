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
  "frontend/src/app.jsx"
  "frontend/src/app.css"
  "frontend/src/pages/LoginPage.jsx"
  "bootstrap/bootstrap_31c_3_product_landing_tailwind.sh"
  "bootstrap/tests/test_31c_3_product_landing_tailwind.sh"
  "bootstrap/reports/31c_3_product_landing_tailwind_report.md"
)

required_icons=(
  "frontend/public/icon/circle-half-stroke-solid-full.svg"
  "frontend/public/icon/id-card-solid.svg"
  "frontend/public/icon/user-solid.svg"
  "frontend/public/icon/lock-solid.svg"
  "frontend/public/icon/wifi-solid.svg"
  "frontend/public/icon/shield-halved-solid.svg"
  "frontend/public/icon/clock-solid.svg"
  "frontend/public/icon/eye-solid.svg"
  "frontend/public/icon/eye-slash-solid.svg"
)

for file in "${required_files[@]}" "${required_icons[@]}"; do
  [[ -s "$file" ]] || fail "File wajib 31c-3 belum ada/kosong: $file"
done

grep -q "cdn.tailwindcss.com" frontend/index.html \
  || fail "Tailwind CDN belum tersedia dari 31c-2"

grep -q "darkMode: 'class'" frontend/index.html \
  || fail "Tailwind darkMode class belum tersedia dari 31c-2"

grep -q "LoginPage" frontend/src/app.jsx \
  || fail "app.jsx belum memakai LoginPage"

grep -q "variant=\"auth\"" frontend/src/app.jsx \
  || fail "app.jsx belum memakai AppShell auth variant"

grep -q "classList.toggle('dark'" frontend/src/app.jsx \
  || fail "app.jsx belum toggle class dark untuk Tailwind"

for forbidden in "Selamat Datang" "Sistem Presensi Lab" "Masukkan Username" "IoT Based" "login-shell" "login-form" "feature-card"; do
  if grep -q "$forbidden" frontend/src/app.jsx; then
    fail "app.jsx masih berisi markup halaman: $forbidden"
  fi
done

for text in "Selamat Datang" "Sistem Presensi Lab" "SMK Rajasa Surabaya" "IoT Based" "Secure" "Real-Time" "Masukkan Username" "Masukkan Password" "Ingat Saya" "Lupa Password?"; do
  grep -q "$text" frontend/src/pages/LoginPage.jsx || fail "LoginPage.jsx belum memuat: $text"
done

for icon in "/icon/id-card-solid.svg" "/icon/user-solid.svg" "/icon/lock-solid.svg" "/icon/wifi-solid.svg" "/icon/shield-halved-solid.svg" "/icon/clock-solid.svg" "/icon/eye-solid.svg" "/icon/eye-slash-solid.svg" "/icon/circle-half-stroke-solid-full.svg"; do
  grep -q "$icon" frontend/src/pages/LoginPage.jsx || fail "LoginPage.jsx belum memakai public icon: $icon"
done

if grep -Eq "<svg|viewBox=|function (UserIcon|LockIcon|IdCardIcon|WifiIcon|ShieldIcon|ClockIcon|EyeIcon)" frontend/src/pages/LoginPage.jsx; then
  fail "LoginPage.jsx masih memakai inline SVG/icon component lama."
fi

grep -q "min-h-screen" frontend/src/pages/LoginPage.jsx \
  || fail "LoginPage.jsx belum memakai className Tailwind untuk root layout"

grep -q "grid-cols-\[46%_54%\]" frontend/src/pages/LoginPage.jsx \
  || fail "LoginPage.jsx belum memakai split panel Tailwind"

grep -q "shadow-rajasa" frontend/src/pages/LoginPage.jsx \
  || fail "LoginPage.jsx belum memakai shadow token Tailwind dari 31c-2"

if grep -Eq "\\.logo|\\.card|read-the-docs|login-shell|login-form|feature-card|brand-panel|form-panel" frontend/src/app.css; then
  fail "app.css masih mengandung Vite/default/page-specific CSS."
fi

ok "31c-3 product landing Tailwind validation passed"
printf '\nPATCH 31C-3 PRODUCT LANDING TAILWIND TEST PASSED\n'