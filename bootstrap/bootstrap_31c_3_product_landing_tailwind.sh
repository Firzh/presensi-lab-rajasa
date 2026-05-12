#!/usr/bin/env bash
set -Eeuo pipefail

# bootstrap_31c_3_product_landing_tailwind.sh
# 31c-3: implement product login landing with Tailwind utilities.
#
# Requires:
# - 31c-2 Tailwind CDN setup already merged.
#
# Scope:
# - frontend/src/app.jsx
# - frontend/src/app.css
# - frontend/src/pages/LoginPage.jsx
# - frontend/public/icon/*.svg
# - bootstrap/tests/test_31c_2_tailwind_cdn_only.sh compatibility patch
# - bootstrap/tests/test_31c_3_product_landing_tailwind.sh
# - bootstrap/reports/31c_3_product_landing_tailwind_report.md
#
# Non-scope:
# - No backend changes.
# - No database changes.
# - No routing library.
# - No production Tailwind migration.
# - No CRUD feature implementation.

BASE_BRANCH="development"
TARGET_BRANCH="alfy/31c-3-product-landing-tailwind"
DRY_RUN=0
DEBUG_RUN=0
TEST_ONLY=0
WITH_NPM=0
ALLOW_DIRTY_EXPECTED=0

step(){ printf '\n==> %s\n' "$*"; }
warn(){ printf 'WARNING: %s\n' "$*" >&2; }
fail(){ printf 'ERROR: %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Usage:
  bash ./bootstrap/bootstrap_31c_3_product_landing_tailwind.sh [options]

Options:
  --base <branch>             Base branch. Default: development
  --branch <branch>           Target branch. Default: alfy/31c-3-product-landing-tailwind
  --dry-run                   Simulasi tanpa menulis file
  --debug-run                 Eksekusi real dengan trace set -x
  --test-only                 Hanya menjalankan test 31c-3
  --with-npm                  Jalankan format:check dan lint
  --allow-dirty-expected      Izinkan dirty file jika hanya file scope 31c-3
  -h, --help                  Bantuan
EOF
}

run() {
  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run]'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

write_file() {
  local target="$1"
  local content="$2"

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] write %q\n' "$target"
    return 0
  fi

  mkdir -p "$(dirname "$target")"
  printf '%s' "$content" > "$target"
}

repo_root() {
  git rev-parse --show-toplevel 2>/dev/null || fail "Bukan git repository."
}

current_branch() {
  git branch --show-current 2>/dev/null || true
}

resolve_python_cmd() {
  if command -v python3 >/dev/null 2>&1 && python3 -c "import sys" >/dev/null 2>&1; then
    printf 'python3'
    return 0
  fi

  if command -v python >/dev/null 2>&1 && python -c "import sys" >/dev/null 2>&1; then
    printf 'python'
    return 0
  fi

  fail "Python valid tidak ditemukan."
}

is_expected_file() {
  case "$1" in
    frontend/src/app.jsx) return 0 ;;
    frontend/src/app.css) return 0 ;;
    frontend/src/pages/) return 0 ;;
    frontend/src/pages/*) return 0 ;;
    frontend/src/pages/LoginPage.jsx) return 0 ;;
    frontend/public/icon/) return 0 ;;
    frontend/public/icon/*) return 0 ;;
    frontend/public/icon/*.svg) return 0 ;;
    docs/contracts/FRONTEND_TAILWIND_CONTRACT.md) return 0 ;;
    bootstrap/bootstrap_31c_3_product_landing_tailwind.sh) return 0 ;;
    bootstrap/tests/test_31c_2_tailwind_cdn_only.sh) return 0 ;;
    bootstrap/tests/test_31c_3_product_landing_tailwind.sh) return 0 ;;
    bootstrap/reports/31c_3_product_landing_tailwind_report.md) return 0 ;;
    bootstrap/reports/review_gate_*.md) return 0 ;;
    *) return 1 ;;
  esac
}

ensure_clean_worktree() {
  if [[ "$TEST_ONLY" == "1" || "$DRY_RUN" == "1" ]]; then
    return 0
  fi

  if [[ "$ALLOW_DIRTY_EXPECTED" == "1" ]]; then
    local dirty
    dirty="$(git status --short | sed 's/^...//')"
    while IFS= read -r file; do
      [[ -z "$file" ]] && continue
      is_expected_file "$file" || fail "Ada dirty file di luar scope 31c-3: $file"
    done <<< "$dirty"
    [[ -n "$dirty" ]] && warn "Dirty file scope 31c-3 terdeteksi; script akan rewrite file tersebut."
    return 0
  fi

  git diff --quiet -- . || fail "Ada unstaged tracked changes. Commit/stash dulu atau pakai --allow-dirty-expected."
  git diff --cached --quiet -- . || fail "Ada staged changes. Commit/stash dulu atau pakai --allow-dirty-expected."
}

checkout_target_branch() {
  if [[ "$TEST_ONLY" == "1" ]]; then
    local active
    active="$(current_branch)"
    [[ "$active" == "$TARGET_BRANCH" || "$active" == "development" ]] || fail "Untuk --test-only, branch aktif harus $TARGET_BRANCH atau development. Saat ini: $active"
    return 0
  fi

  [[ "$TARGET_BRANCH" == alfy/* ]] || fail "Branch target wajib prefix alfy/... Diberikan: $TARGET_BRANCH"

  step "Menyiapkan branch $TARGET_BRANCH"
  if git show-ref --verify --quiet "refs/heads/$TARGET_BRANCH"; then
    run git checkout "$TARGET_BRANCH"
  else
    run git checkout "$BASE_BRANCH"
    run git pull --ff-only origin "$BASE_BRANCH"
    run git checkout -b "$TARGET_BRANCH"
  fi
}

ensure_previous_baseline() {
  step "Validasi prasyarat 31c-3"

  [[ -f frontend/index.html ]] || fail "frontend/index.html tidak ditemukan."
  [[ -f frontend/src/app.jsx ]] || fail "frontend/src/app.jsx tidak ditemukan."
  [[ -f frontend/src/app.css ]] || fail "frontend/src/app.css tidak ditemukan."
  [[ -f frontend/src/components/layout/AppShell.jsx ]] || fail "AppShell.jsx belum ada. Pastikan 31c sudah merge."
  [[ -f frontend/src/components/layout/index.js ]] || fail "layout index belum ada."
  [[ -f frontend/src/constants/index.js ]] || fail "constants index belum ada."
  [[ -f bootstrap/tests/test_31c_frontend_layout_components.sh ]] || fail "test 31c belum ada."
  [[ -f bootstrap/tests/test_31c_1_wire_app_shell.sh ]] || fail "test 31c-1 belum ada."
  [[ -f bootstrap/tests/test_31c_2_tailwind_cdn_only.sh ]] || fail "test 31c-2 Tailwind belum ada. Pastikan 31c-2 sudah merge."

  grep -q "cdn.tailwindcss.com" frontend/index.html \
    || fail "Tailwind CDN belum terpasang. Merge 31c-2 dulu."

  grep -q "darkMode: 'class'" frontend/index.html \
    || fail "Tailwind CDN belum memakai darkMode class. Merge 31c-2 yang benar dulu."

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] python scripts/check_docs_contracts.py\n'
    printf '[dry-run] bash bootstrap/tests/test_31c_frontend_layout_components.sh\n'
    printf '[dry-run] bash bootstrap/tests/test_31c_1_wire_app_shell.sh\n'
    printf '[dry-run] bash bootstrap/tests/test_31c_2_tailwind_cdn_only.sh\n'
    return 0
  fi

  local py
  py="$(resolve_python_cmd)"
  "$py" scripts/check_docs_contracts.py
  bash bootstrap/tests/test_31c_frontend_layout_components.sh
  bash bootstrap/tests/test_31c_1_wire_app_shell.sh
  bash bootstrap/tests/test_31c_2_tailwind_cdn_only.sh
}

make_app_jsx() {
  cat <<'EOF'
import { useEffect, useState } from 'preact/hooks';
import './app.css';
import { AppShell } from './components/layout/index.js';
import { ROUTES, STORAGE_KEYS } from './constants/index.js';
import { LoginPage } from './pages/LoginPage.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const AUTH_USER_KEY = 'rajasa-auth-user';
const THEME_KEY = STORAGE_KEYS.THEME || 'rajasa-presensi-theme';

const APP_NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard' },
  { href: ROUTES.SISWA, label: 'Siswa' },
  { href: ROUTES.JURUSAN, label: 'Jurusan' },
  { href: ROUTES.RUANGAN, label: 'Ruangan' },
];

function readStoredTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function App() {
  const [theme, setTheme] = useState(readStoredTheme);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  }

  async function handleLoginSubmit({ username, password, remember }) {
    setLoginError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
          remember,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Login gagal.');
      }

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      window.history.pushState(null, '', data.user.dashboard_path || '/dashboard');
    } catch (error) {
      setLoginError(error.message || 'Tidak bisa menghubungi server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell title="Login" navItems={APP_NAV_ITEMS} variant="auth">
      <LoginPage
        isSubmitting={isSubmitting}
        loginError={loginError}
        onSubmit={handleLoginSubmit}
        onToggleTheme={toggleTheme}
        theme={theme}
      />
    </AppShell>
  );
}
EOF
}

make_app_css() {
  cat <<'EOF'
html,
body,
#app {
  min-width: 320px;
  min-height: 100%;
  margin: 0;
}

body {
  min-height: 100vh;
}

button,
input {
  font: inherit;
}

* {
  box-sizing: border-box;
}

.app-auth-shell {
  min-height: 100vh;
}
EOF
}

make_login_page() {
  cat <<'EOF'
import { useState } from 'preact/hooks';

const ICONS = {
  clock: '/icon/clock-solid.svg',
  eye: '/icon/eye-solid.svg',
  eyeSlash: '/icon/eye-slash-solid.svg',
  idCard: '/icon/id-card-solid.svg',
  lock: '/icon/lock-solid.svg',
  shield: '/icon/shield-halved-solid.svg',
  theme: '/icon/circle-half-stroke-solid-full.svg',
  user: '/icon/user-solid.svg',
  wifi: '/icon/wifi-solid.svg',
};

const FEATURE_BADGES = [
  { label: 'IoT Based', icon: ICONS.wifi },
  { label: 'Secure', icon: ICONS.shield },
  { label: 'Real-Time', icon: ICONS.clock },
];

const maskBase =
  'inline-block shrink-0 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]';

function AssetMask({ className = '', src }) {
  return (
    <span
      aria-hidden="true"
      className={`${maskBase} ${className}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
      }}
    />
  );
}

function FeatureCard({ icon, label }) {
  return (
    <div className="flex h-[82px] w-[84px] flex-col items-center justify-center rounded-2xl bg-white/75 px-2.5 py-3 text-[#496f9d] shadow-[0_14px_30px_rgb(15_23_42_/_0.10)] dark:bg-[#202b33]/85 dark:text-[#eef2f5] sm:h-[92px] sm:w-24 sm:rounded-[18px]">
      <AssetMask className="mb-1.5 h-8 w-8 sm:h-9 sm:w-9" src={icon} />
      <p className="m-0 whitespace-nowrap text-xs font-extrabold leading-none tracking-[-0.02em] sm:text-[13px]">
        {label}
      </p>
    </div>
  );
}

function FormField({
  autoComplete,
  children,
  icon,
  id,
  label,
  onInput,
  placeholder,
  type = 'text',
  value,
}) {
  return (
    <div className="mb-6">
      <label
        className="mb-2 ml-1.5 inline-flex items-center gap-2.5 text-[15px] font-extrabold leading-none text-[#4d75a8] dark:text-[#eef2f5]"
        htmlFor={id}
      >
        <AssetMask className="h-[18px] w-[18px]" src={icon} />
        {label}
      </label>

      <div className="relative">
        <input
          autoComplete={autoComplete}
          className="h-[50px] w-full rounded-[10px] border-[3px] border-[#8b8d8f] bg-transparent px-3.5 pr-11 text-base font-medium text-[#2b3440] outline-none transition placeholder:text-[#8d949d] focus:border-[#6f97c1] focus:shadow-[0_0_0_4px_rgb(111_151_193_/_0.18)] dark:border-[#7a7f84] dark:text-[#eef2f5] dark:placeholder:text-[#8e969d] dark:focus:border-[#7fa9d3] dark:focus:shadow-[0_0_0_4px_rgb(127_169_211_/_0.16)]"
          id={id}
          name={id}
          onInput={onInput}
          placeholder={placeholder}
          type={type}
          value={value}
        />
        {children}
      </div>
    </div>
  );
}

export function LoginPage({
  isSubmitting,
  loginError,
  onSubmit,
  onToggleTheme,
  theme,
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      password,
      remember,
      username,
    });
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_50%_120%,rgb(255_255_255_/_0.32)_0%,transparent_26%),linear-gradient(180deg,#6f90b8_0%,#6687ae_56%,#2d4b70_100%)] px-4 py-4 dark:bg-[radial-gradient(circle_at_50%_120%,rgb(255_255_255_/_0.08)_0%,transparent_26%),linear-gradient(180deg,#6f8794_0%,#455c66_56%,#202d34_100%)] sm:px-6 sm:py-7">
      <section
        aria-label="Halaman login sistem presensi lab"
        className="relative grid min-h-[auto] w-full max-w-[1180px] overflow-hidden rounded-[18px] bg-[#f8f8f7] shadow-rajasa dark:bg-[#151c24] lg:min-h-[760px] lg:grid-cols-[46%_54%] lg:rounded-3xl xl:max-w-[1240px]"
      >
        <button
          aria-label={theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-transparent text-[#29323a] dark:text-[#eef2f5] sm:right-5 sm:top-5"
          onClick={onToggleTheme}
          type="button"
        >
          <AssetMask className="h-7 w-7" src={ICONS.theme} />
        </button>

        <section className="grid min-h-[320px] place-items-center bg-[linear-gradient(180deg,rgb(135_169_207_/_0.88)_0%,rgb(97_130_166_/_0.86)_48%,rgb(47_79_118_/_0.94)_100%)] px-6 py-10 text-white dark:bg-[linear-gradient(180deg,rgb(45_63_72_/_0.84)_0%,rgb(93_116_128_/_0.82)_48%,rgb(147_172_184_/_0.86)_100%)] sm:min-h-[360px] sm:px-8 lg:min-h-0">
          <div className="flex w-full flex-col items-center">
            <div className="mb-5 grid h-[88px] w-[88px] place-items-center rounded-full bg-white text-[#5478a6] shadow-[0_18px_42px_rgb(15_23_42_/_0.15)] dark:bg-[#26333d] dark:text-[#eef2f5] sm:h-[108px] sm:w-[108px]">
              <AssetMask className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px]" src={ICONS.idCard} />
            </div>

            <div className="text-center">
              <h1 className="m-0 text-[28px] font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-[34px] lg:text-[38px]">
                Sistem Presensi Lab
              </h1>
              <p className="m-0 mt-2.5 text-base font-extrabold leading-tight sm:text-xl lg:text-[22px]">
                SMK Rajasa Surabaya
              </p>
            </div>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:mt-[38px] lg:mt-[58px] lg:gap-7">
              {FEATURE_BADGES.map((feature) => (
                <FeatureCard icon={feature.icon} key={feature.label} label={feature.label} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid min-h-[620px] grid-rows-[1fr_auto] bg-[#f8f8f7] px-0 pb-[30px] pt-[60px] text-[#2c3440] dark:bg-[#151c24] dark:text-[#eef2f5] sm:pt-[72px] lg:min-h-0 lg:pb-[34px] lg:pt-[88px]">
          <div className="grid place-items-center">
            <div className="w-[88%] sm:w-[min(480px,84%)] lg:w-[min(450px,76%)]">
              <header className="mb-[42px] text-center lg:mb-[54px]">
                <h2 className="m-0 text-[34px] font-[850] leading-[1.05] tracking-[-0.045em] text-[#242b36] dark:text-[#eef2f5] sm:text-5xl">
                  Selamat Datang
                </h2>
                <p className="m-0 mt-2.5 text-[15px] font-medium tracking-[-0.01em] text-[#747b84] dark:text-[#8e969d] sm:text-base">
                  Silahkan masuk untuk mengakses sistem
                </p>
              </header>

              <form className="w-full" onSubmit={handleSubmit}>
                <FormField
                  autoComplete="username"
                  icon={ICONS.user}
                  id="username"
                  label="Username"
                  onInput={(event) => setUsername(event.currentTarget.value)}
                  placeholder="Masukkan Username"
                  value={username}
                />

                <FormField
                  autoComplete="current-password"
                  icon={ICONS.lock}
                  id="password"
                  label="Password"
                  onInput={(event) => setPassword(event.currentTarget.value)}
                  placeholder="Masukkan Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                >
                  <button
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute right-3 top-1/2 grid h-[30px] w-[30px] -translate-y-1/2 place-items-center rounded-full bg-transparent text-[#40484f] dark:text-[#eef2f5]"
                    onClick={() => setShowPassword((currentValue) => !currentValue)}
                    type="button"
                  >
                    <AssetMask className="h-[22px] w-[22px]" src={showPassword ? ICONS.eyeSlash : ICONS.eye} />
                  </button>
                </FormField>

                <div className="-mt-1 mx-1 flex flex-wrap items-start justify-between gap-4 text-sm">
                  <label className="inline-flex cursor-pointer items-center gap-2.5 font-medium text-[#747b84] dark:text-[#8e969d]">
                    <input
                      checked={remember}
                      className="h-[15px] w-[15px] accent-[#7fa9d3]"
                      onChange={(event) => setRemember(event.currentTarget.checked)}
                      type="checkbox"
                    />
                    <span>Ingat Saya</span>
                  </label>

                  <a className="font-extrabold leading-none text-[#3f679a] underline underline-offset-2 dark:text-[#eef2f5]" href="#">
                    Lupa Password?
                  </a>
                </div>

                {loginError ? (
                  <p className="mx-1 mt-[18px] rounded-[10px] bg-red-500/10 px-3.5 py-3 text-sm font-bold text-red-600">
                    {loginError}
                  </p>
                ) : null}

                <button
                  className="mt-[38px] h-[58px] w-full rounded-lg bg-[#7fa9d3] text-lg font-[850] text-[#1f2a34] transition hover:-translate-y-px hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 dark:text-[#eef2f5] sm:mt-12"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? 'Memproses...' : 'Login'}
                </button>
              </form>
            </div>
          </div>

          <footer className="mt-7 text-center text-sm font-bold leading-[1.18] tracking-[0.03em] text-[#8a8a8a] dark:text-[#8e969d] lg:mt-5">
            <p className="m-0">2026 SMKS Rajasa Surabaya</p>
            <p className="m-0">Tim Magang TKJ</p>
          </footer>
        </section>
      </section>
    </main>
  );
}
EOF
}

write_fallback_icon() {
  local target="$1"
  local path_data="$2"
  local view_box="${3:-0 0 24 24}"

  write_file "$target" "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"$view_box\"><path fill=\"currentColor\" d=\"$path_data\"/></svg>
"
}

download_icon() {
  local target="$1"
  local url="$2"
  local fallback_path="$3"
  local view_box="${4:-0 0 24 24}"

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] ensure icon %q\n' "$target"
    return 0
  fi

  mkdir -p "$(dirname "$target")"

  if [[ -s "$target" ]]; then
    return 0
  fi

  if command -v curl >/dev/null 2>&1 && curl -fsSL "$url" -o "$target"; then
    return 0
  fi

  if command -v wget >/dev/null 2>&1 && wget -q "$url" -O "$target"; then
    return 0
  fi

  warn "Gagal download $target. Membuat fallback SVG lokal."
  write_fallback_icon "$target" "$fallback_path" "$view_box"
}

ensure_icons() {
  step "Memastikan icon assets di frontend/public/icon"

  download_icon "frontend/public/icon/circle-half-stroke-solid-full.svg" "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/circle-half-stroke.svg" "M12 2a10 10 0 1 0 0 20V2Z"
  download_icon "frontend/public/icon/id-card-solid.svg" "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/id-card.svg" "M2 5h20v14H2V5Zm4 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm6 1h7v2h-7v-2Zm0 4h7v2h-7v-2Z"
  download_icon "frontend/public/icon/user-solid.svg" "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/user.svg" "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 9a9 9 0 0 1 18 0H3Z"
  download_icon "frontend/public/icon/lock-solid.svg" "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/lock.svg" "M6 10V8a6 6 0 0 1 12 0v2h1v12H5V10h1Zm3 0h6V8a3 3 0 0 0-6 0v2Z"
  download_icon "frontend/public/icon/wifi-solid.svg" "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/wifi.svg" "M12 18.5 15 22l3-3.5a8 8 0 0 0-12 0L9 22l3-3.5ZM2 9l3 3.5a14 14 0 0 1 14 0L22 9A20 20 0 0 0 2 9Z"
  download_icon "frontend/public/icon/shield-halved-solid.svg" "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/shield-halved.svg" "M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z"
  download_icon "frontend/public/icon/clock-solid.svg" "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/clock.svg" "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v5l4 2-1 2-5-3V7h2Z"
  download_icon "frontend/public/icon/eye-solid.svg" "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/eye.svg" "M12 5c5 0 9 4 10 7-1 3-5 7-10 7S3 15 2 12c1-3 5-7 10-7Zm0 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
  download_icon "frontend/public/icon/eye-slash-solid.svg" "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/eye-slash.svg" "M3 3 21 21l-2 1-3-3a12 12 0 0 1-4 1C7 20 3 16 2 12a13 13 0 0 1 4-5L2 4l1-1Zm9 2c5 0 9 4 10 7a12 12 0 0 1-3 4l-3-3a4 4 0 0 0-5-5L9 6a12 12 0 0 1 3-1Z"
}

patch_31c2_test_compat() {
  step "Menyesuaikan test 31c-2 agar kompatibel dengan branch setelahnya"

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] patch bootstrap/tests/test_31c_2_tailwind_cdn_only.sh diff guard\n'
    return 0
  fi

  [[ -f bootstrap/tests/test_31c_2_tailwind_cdn_only.sh ]] || return 0

  local py
  py="$(resolve_python_cmd)"
  "$py" <<'PY'
from pathlib import Path

path = Path("bootstrap/tests/test_31c_2_tailwind_cdn_only.sh")
text = path.read_text(encoding="utf-8")

old = """# Guard: 31c-2 Tailwind-only must not implement page content.
if git diff --name-only origin/development...HEAD 2>/dev/null | grep -Eq '^frontend/src/(app\\.jsx|app\\.css|pages/|public/icon/)'; then
  fail "31c-2 Tailwind-only tidak boleh mengubah app.jsx, app.css, pages, atau public/icon."
fi
"""

new = """# Guard: 31c-2 Tailwind-only must not implement page content.
# This guard is branch-scoped so later patches such as 31c-3 may add pages.
if [[ "$BRANCH" == "alfy/31c-2-tailwind-cdn-only" ]]; then
  if git diff --name-only origin/development...HEAD 2>/dev/null | grep -Eq '^frontend/src/(app\\.jsx|app\\.css|pages/|public/icon/)'; then
    fail "31c-2 Tailwind-only tidak boleh mengubah app.jsx, app.css, pages, atau public/icon."
  fi
fi
"""

if old in text:
    text = text.replace(old, new)
elif "later patches such as 31c-3" not in text:
    raise SystemExit("Block guard 31c-2 tidak ditemukan. Periksa manual test_31c_2_tailwind_cdn_only.sh.")

path.write_text(text, encoding="utf-8")
PY
}

patch_tailwind_contract() {
  step "Memperbarui kontrak Tailwind untuk 31c-3"

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] append 31c-3 note to docs/contracts/FRONTEND_TAILWIND_CONTRACT.md\n'
    return 0
  fi

  [[ -f docs/contracts/FRONTEND_TAILWIND_CONTRACT.md ]] || return 0

  local py
  py="$(resolve_python_cmd)"
  "$py" <<'PY'
from pathlib import Path

path = Path("docs/contracts/FRONTEND_TAILWIND_CONTRACT.md")
text = path.read_text(encoding="utf-8")
needle = "## 31c-3 Implementation Rule"

if needle not in text:
    if not text.endswith("\n"):
        text += "\n"
    text += """
## 31c-3 Implementation Rule

Patch 31c-3 may implement the login landing page with Tailwind utilities after Tailwind CDN is available.

Allowed in 31c-3:

```text
frontend/src/app.jsx
frontend/src/app.css
frontend/src/pages/LoginPage.jsx
frontend/public/icon/*.svg
```

Rules:

```text
- app.jsx remains shell/state orchestration.
- LoginPage.jsx owns login page markup and page-local form state.
- Page JSX must not define inline SVG icon components.
- Icons must be referenced from frontend/public/icon.
- app.css remains global reset only.
```
"""
path.write_text(text, encoding="utf-8")
PY
}

make_test_script() {
  cat <<'EOF'
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
EOF
}

make_report() {
  cat <<'EOF'
# Patch 31c-3 Report — Product Landing with Tailwind

## What Changed

Patch ini mengimplementasikan halaman login produk setelah Tailwind CDN tersedia dari 31c-2.

Changed scope:

```text
frontend/src/app.jsx
frontend/src/app.css
frontend/src/pages/LoginPage.jsx
frontend/public/icon/*.svg
bootstrap/tests/test_31c_2_tailwind_cdn_only.sh
bootstrap/tests/test_31c_3_product_landing_tailwind.sh
bootstrap/reports/31c_3_product_landing_tailwind_report.md
```

## Product Reference

Landing lama menjadi acuan visual dan perilaku, tetapi tidak dibawa sebagai god file.

## Architecture

```text
app.jsx
= shell/state orchestration

LoginPage.jsx
= page markup + page-local form state

frontend/public/icon
= icon assets used via mask and currentColor

app.css
= global reset only
```

## Non-Scope

```text
backend/
database/
routing library
Tailwind production migration
CRUD siswa/jurusan/ruangan
```

## Next Step

```text
31c-4 or 31d = refine visual / extract shared UI components after visual smoke test is accepted
```
EOF
}

install_files() {
  step "Menulis app.jsx shell/state"
  write_file "frontend/src/app.jsx" "$(make_app_jsx)"

  step "Menulis app.css global reset"
  write_file "frontend/src/app.css" "$(make_app_css)"

  step "Menulis LoginPage Tailwind"
  write_file "frontend/src/pages/LoginPage.jsx" "$(make_login_page)"

  ensure_icons
  patch_31c2_test_compat
  patch_tailwind_contract

  step "Menulis test dan report 31c-3"
  write_file "bootstrap/tests/test_31c_3_product_landing_tailwind.sh" "$(make_test_script)"
  write_file "bootstrap/reports/31c_3_product_landing_tailwind_report.md" "$(make_report)"

  if [[ "$DRY_RUN" != "1" ]]; then
    chmod +x bootstrap/tests/test_31c_3_product_landing_tailwind.sh
    chmod +x bootstrap/bootstrap_31c_3_product_landing_tailwind.sh 2>/dev/null || true
  fi
}

run_tests() {
  step "Menjalankan test 31c-3"

  [[ -f bootstrap/tests/test_31c_3_product_landing_tailwind.sh ]] || fail "test_31c_3_product_landing_tailwind.sh belum ada."

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] bash bootstrap/tests/test_31c_3_product_landing_tailwind.sh\n'
  else
    bash bootstrap/tests/test_31c_3_product_landing_tailwind.sh
  fi

  if [[ "$WITH_NPM" == "1" ]]; then
    step "Menjalankan npm checks"
    if [[ "$DRY_RUN" == "1" ]]; then
      printf '[dry-run] cd frontend && npm run format:check && npm run lint\n'
    else
      (cd frontend && npm run format:check && npm run lint)
    fi
  else
    warn "NPM checks dilewati. Pakai --with-npm untuk format:check dan lint."
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --base)
        BASE_BRANCH="${2:-}"
        shift 2
        ;;
      --branch)
        TARGET_BRANCH="${2:-}"
        shift 2
        ;;
      --dry-run)
        DRY_RUN=1
        shift
        ;;
      --debug-run)
        DEBUG_RUN=1
        shift
        ;;
      --test-only)
        TEST_ONLY=1
        shift
        ;;
      --with-npm)
        WITH_NPM=1
        shift
        ;;
      --allow-dirty-expected)
        ALLOW_DIRTY_EXPECTED=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        fail "Argumen tidak dikenal: $1"
        ;;
    esac
  done

  [[ "$DRY_RUN" == "1" && "$DEBUG_RUN" == "1" ]] && fail "--dry-run dan --debug-run tidak boleh bersamaan."

  if [[ "$DEBUG_RUN" == "1" ]]; then
    set -x
  fi

  return 0
}

main() {
  parse_args "$@"

  local root
  root="$(repo_root)"
  cd "$root"

  step "Repository root"
  printf '%s\n' "$root"

  step "Branch aktif"
  current_branch

  checkout_target_branch
  ensure_clean_worktree
  ensure_previous_baseline

  if [[ "$TEST_ONLY" == "1" ]]; then
    run_tests
    exit 0
  fi

  install_files

  if [[ "$DRY_RUN" == "1" ]]; then
    step "Dry-run selesai"
    exit 0
  fi

  if [[ "$WITH_NPM" == "1" ]]; then
    step "Format patched files"
    (cd frontend && npx prettier --write src/app.jsx src/app.css src/pages/LoginPage.jsx)
  fi

  run_tests

  step "Patch 31c-3 selesai"
  printf 'Review:\n'
  printf '  git status --short\n'
  printf '  git diff --stat\n'
  printf '  git diff -- frontend/src/app.jsx frontend/src/app.css frontend/src/pages/LoginPage.jsx frontend/public/icon\n'
}

main "$@"
