#!/usr/bin/env bash
set -Eeuo pipefail

BASE_BRANCH="development"
TARGET_BRANCH="alfy/31c-frontend-layout-components"
DRY_RUN=0
DEBUG_RUN=0
TEST_ONLY=0
WITH_NPM=0
DO_COMMIT=0
COMMIT_MESSAGE="refactor: add frontend layout components"
PYTHON_CMD=""

usage() {
  cat <<'EOF'
Usage:
  bash ./bootstrap/bootstrap_31c_frontend_layout_components.sh [options]

Options:
  --base <branch>       Base branch. Default: development
  --branch <branch>     Target branch. Default: alfy/31c-frontend-layout-components
  --dry-run             Simulasi tanpa menulis file
  --debug-run           Eksekusi real dengan trace set -x
  --test-only           Hanya menjalankan test 31c
  --with-npm            Jalankan format:check dan lint
  --commit              Commit otomatis setelah test lolos
  --commit-message <m>  Pesan commit custom
  -h, --help            Bantuan
EOF
}

step(){ printf '\n==> %s\n' "$*"; }
log(){ printf '%s\n' "$*"; }
warn(){ printf 'WARNING: %s\n' "$*" >&2; }
fail(){ printf 'ERROR: %s\n' "$*" >&2; exit 1; }

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
    printf '[dry-run] cat > %q\n' "$target"
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
    printf '%s\n' "python3"; return 0
  fi
  if command -v python >/dev/null 2>&1 && python -c "import sys" >/dev/null 2>&1; then
    printf '%s\n' "python"; return 0
  fi
  if command -v py >/dev/null 2>&1 && py -3 -c "import sys" >/dev/null 2>&1; then
    printf '%s\n' "py -3"; return 0
  fi
  return 1
}

validate_target_branch_name() {
  local branch="$1"
  [[ -n "$branch" ]] || fail "Nama branch kosong."
  [[ "$branch" == alfy/* ]] || fail "Branch target wajib prefix alfy/... Diberikan: $branch"
}

ensure_clean_worktree() {
  if [[ "$TEST_ONLY" == "1" || "$DRY_RUN" == "1" ]]; then
    return 0
  fi
  git diff --quiet -- . || fail "Ada unstaged tracked changes. Commit/stash dulu."
  git diff --cached --quiet -- . || fail "Ada staged changes. Commit/stash dulu."
}

checkout_target_branch() {
  if [[ "$TEST_ONLY" == "1" ]]; then
    local active
    active="$(current_branch)"
    [[ "$active" == "$TARGET_BRANCH" || "$active" == "development" ]] || fail "Untuk --test-only, branch aktif harus $TARGET_BRANCH atau development. Saat ini: $active"
    return 0
  fi

  validate_target_branch_name "$TARGET_BRANCH"

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
  step "Validasi prasyarat sebelum 31c"

  [[ -f docs/SPECIFICATION.md ]] || fail "docs/SPECIFICATION.md tidak ditemukan."
  [[ -f docs/contracts/FRONTEND_CONTRACT.md ]] || fail "docs/contracts/FRONTEND_CONTRACT.md tidak ditemukan."
  [[ -f bootstrap/bootstrap_review_gate.sh ]] || fail "bootstrap/bootstrap_review_gate.sh belum ada."
  [[ -f bootstrap/tests/test_contract_first_baseline.sh ]] || fail "test_contract_first_baseline.sh belum ada."
  [[ -f bootstrap/tests/test_31a_frontend_tooling.sh ]] || fail "test_31a_frontend_tooling.sh belum ada."
  [[ -f bootstrap/tests/test_31b_frontend_constants_storage.sh ]] || fail "test_31b_frontend_constants_storage.sh belum ada."
  [[ -f frontend/src/constants/index.js ]] || fail "31b constants belum ada."
  [[ -f frontend/src/lib/storage.js ]] || fail "31b storage helper belum ada."
  [[ -f frontend/src/app.jsx ]] || fail "frontend/src/app.jsx tidak ditemukan."

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] %s scripts/check_docs_contracts.py\n' "$PYTHON_CMD"
    printf '[dry-run] bash bootstrap/tests/test_contract_first_baseline.sh\n'
    printf '[dry-run] bash bootstrap/tests/test_31a_frontend_tooling.sh\n'
    printf '[dry-run] bash bootstrap/tests/test_31b_frontend_constants_storage.sh\n'
    return 0
  fi

  # shellcheck disable=SC2086
  $PYTHON_CMD scripts/check_docs_contracts.py
  bash bootstrap/tests/test_contract_first_baseline.sh
  bash bootstrap/tests/test_31a_frontend_tooling.sh
  bash bootstrap/tests/test_31b_frontend_constants_storage.sh

  log "Prasyarat 31c valid."
}

make_app_header() {
  cat <<'EOF'
export function AppHeader({ title, subtitle }) {
  return (
    <header className="app-header">
      <div>
        {subtitle ? <p className="app-header__eyebrow">{subtitle}</p> : null}
        <h1 className="app-header__title">{title}</h1>
      </div>
    </header>
  );
}
EOF
}

make_app_sidebar() {
  cat <<'EOF'
export function AppSidebar({ brand = 'Rajasa', navItems = [] }) {
  return (
    <aside className="app-sidebar" aria-label="Navigasi utama">
      <div className="app-sidebar__brand">{brand}</div>
      <nav className="app-sidebar__nav">
        {navItems.map((item) => (
          <a key={item.href} className="app-sidebar__link" href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
EOF
}

make_app_shell() {
  cat <<'EOF'
import { AppHeader } from './AppHeader.jsx';
import { AppSidebar } from './AppSidebar.jsx';
import './layout.css';

export function AppShell({ title, subtitle = 'Presensi Lab', navItems = [], children }) {
  return (
    <div className="app-shell">
      <AppSidebar navItems={navItems} />
      <div className="app-shell__main">
        <AppHeader title={title} subtitle={subtitle} />
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}
EOF
}

make_layout_index() {
  cat <<'EOF'
export { AppHeader } from './AppHeader.jsx';
export { AppShell } from './AppShell.jsx';
export { AppSidebar } from './AppSidebar.jsx';
EOF
}

make_layout_css() {
  cat <<'EOF'
.app-shell {
  min-height: 100vh;
  display: flex;
  background: #f7f8fb;
  color: #172033;
}

.app-shell__main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.app-shell__content {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px;
}

.app-header {
  min-height: 88px;
  display: flex;
  align-items: center;
  padding: 24px 32px;
  background: #ffffff;
  border-bottom: 1px solid #e7eaf0;
}

.app-header__eyebrow {
  margin: 0 0 4px;
  color: #667085;
  font-size: 0.875rem;
  font-weight: 600;
}

.app-header__title {
  margin: 0;
  color: #101828;
  font-size: 1.75rem;
  line-height: 1.2;
}

.app-sidebar {
  width: 240px;
  flex: 0 0 240px;
  padding: 24px 18px;
  background: #111827;
  color: #ffffff;
}

.app-sidebar__brand {
  margin-bottom: 28px;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.app-sidebar__nav {
  display: grid;
  gap: 8px;
}

.app-sidebar__link {
  display: block;
  padding: 10px 12px;
  color: #d1d5db;
  text-decoration: none;
  border-radius: 10px;
}

.app-sidebar__link:hover {
  color: #ffffff;
  background: rgb(255 255 255 / 10%);
}

@media (max-width: 768px) {
  .app-shell {
    display: block;
  }

  .app-sidebar {
    width: auto;
    min-height: auto;
  }

  .app-shell__content {
    padding: 20px;
  }
}
EOF
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
EOF
}

make_report() {
  local branch="$1"
  local now
  now="$(date '+%Y-%m-%d %H:%M:%S %z')"

  cat <<EOF
# Patch 31c Report — Frontend Layout Components

Generated at: ${now}

## Branch

\`\`\`text
${branch}
\`\`\`

## What Changed

Patch ini menambahkan layer layout frontend:

\`\`\`text
frontend/src/components/layout/AppHeader.jsx
frontend/src/components/layout/AppShell.jsx
frontend/src/components/layout/AppSidebar.jsx
frontend/src/components/layout/index.js
frontend/src/components/layout/layout.css
bootstrap/tests/test_31c_frontend_layout_components.sh
\`\`\`

## Why

Setelah 31b memindahkan konstanta dan helper storage ke lokasi resmi, 31c membuat fondasi layout agar \`app.jsx\` tidak terus menjadi pusat semua struktur UI.

Patch ini sengaja belum memindahkan business logic atau routing. Tujuannya adalah membuat layout reusable terlebih dahulu sebelum page/feature module dipisahkan.

## Safety Note

Patch ini tidak mengubah \`frontend/src/app.jsx\` secara otomatis. Keputusan ini diambil agar perubahan behavior tidak tercampur dengan penambahan komponen layout. Integrasi \`AppShell\` ke \`app.jsx\` dapat dilakukan pada patch kecil berikutnya setelah diff layout ini merge.

## Non-Scope

- Tidak mengubah backend.
- Tidak mengubah API.
- Tidak mengubah database.
- Tidak mengintegrasikan branch fitur.
- Tidak mengubah routing.
- Tidak mengubah \`app.jsx\`.

## Validation

\`\`\`bash
bash ./bootstrap/bootstrap_31c_frontend_layout_components.sh \\
  --branch ${branch} \\
  --test-only \\
  --with-npm
\`\`\`

## Next Step

Lanjut patch 31c-1 atau 31d:

\`\`\`text
31c-1 refactor: wire AppShell into app.jsx
31d refactor: extract shared UI components
\`\`\`
EOF
}

install_files() {
  step "Menulis layout components"

  write_file "frontend/src/components/layout/AppHeader.jsx" "$(make_app_header)"
  write_file "frontend/src/components/layout/AppShell.jsx" "$(make_app_shell)"
  write_file "frontend/src/components/layout/AppSidebar.jsx" "$(make_app_sidebar)"
  write_file "frontend/src/components/layout/index.js" "$(make_layout_index)"
  write_file "frontend/src/components/layout/layout.css" "$(make_layout_css)"

  step "Menulis test dan report 31c"
  write_file "bootstrap/tests/test_31c_frontend_layout_components.sh" "$(make_test_script)"
  write_file "bootstrap/reports/31c_frontend_layout_components_report.md" "$(make_report "$TARGET_BRANCH")"

  if [[ "$DRY_RUN" != "1" ]]; then
    chmod +x bootstrap/tests/test_31c_frontend_layout_components.sh
    chmod +x bootstrap/bootstrap_31c_frontend_layout_components.sh 2>/dev/null || true
  else
    run chmod +x bootstrap/tests/test_31c_frontend_layout_components.sh
  fi
}

run_tests() {
  step "Menjalankan test 31c"

  [[ -f bootstrap/tests/test_31c_frontend_layout_components.sh ]] || fail "test_31c_frontend_layout_components.sh belum ada."

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] bash bootstrap/tests/test_31c_frontend_layout_components.sh\n'
  else
    bash bootstrap/tests/test_31c_frontend_layout_components.sh
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

commit_changes() {
  [[ "$DO_COMMIT" == "1" ]] || return 0

  step "Commit patch 31c"
  run git add \
    frontend/src/components/layout \
    bootstrap/bootstrap_31c_frontend_layout_components.sh \
    bootstrap/tests/test_31c_frontend_layout_components.sh \
    bootstrap/reports/31c_frontend_layout_components_report.md

  run git commit -m "$COMMIT_MESSAGE"
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --base)
        BASE_BRANCH="${2:-}"
        [[ -n "$BASE_BRANCH" ]] || fail "--base membutuhkan branch."
        shift 2
        ;;
      --branch)
        TARGET_BRANCH="${2:-}"
        [[ -n "$TARGET_BRANCH" ]] || fail "--branch membutuhkan nama branch."
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
      --commit)
        DO_COMMIT=1
        shift
        ;;
      --commit-message)
        COMMIT_MESSAGE="${2:-}"
        [[ -n "$COMMIT_MESSAGE" ]] || fail "--commit-message membutuhkan teks."
        shift 2
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

  if [[ "$DRY_RUN" == "1" && "$DEBUG_RUN" == "1" ]]; then
    fail "--dry-run dan --debug-run tidak boleh bersamaan."
  fi

  if [[ "$DEBUG_RUN" == "1" ]]; then
    set -x
  fi
}

main() {
  parse_args "$@"

  command -v git >/dev/null 2>&1 || fail "git tidak ditemukan."

  PYTHON_CMD="$(resolve_python_cmd)" || fail "Python valid tidak ditemukan."

  ROOT="$(repo_root)"
  cd "$ROOT"

  step "Repository root"
  log "$ROOT"

  step "Python interpreter"
  log "$PYTHON_CMD"

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
    log "Tidak ada file yang ditulis."
    exit 0
  fi

  if [[ "$WITH_NPM" == "1" ]]; then
    step "Format generated layout files"
    (cd frontend && npx prettier --write src/components/layout)
  fi

  run_tests
  commit_changes

  step "Patch 31c selesai"
  log "Review:"
  log "  git status --short"
  log "  git diff --stat"
}

main "$@"
