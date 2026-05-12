#!/usr/bin/env bash
set -Eeuo pipefail

BASE_BRANCH="development"
TARGET_BRANCH="alfy/31c-1-wire-app-shell"
DRY_RUN=0
DEBUG_RUN=0
TEST_ONLY=0
WITH_NPM=0
DO_COMMIT=0
COMMIT_MESSAGE="refactor: wire app shell into app"
PYTHON_CMD=""

usage() {
  cat <<'EOF'
Usage:
  bash ./bootstrap/bootstrap_31c_1_wire_app_shell.sh [options]

Options:
  --base <branch>       Base branch. Default: development
  --branch <branch>     Target branch. Default: alfy/31c-1-wire-app-shell
  --dry-run             Simulasi tanpa menulis file
  --debug-run           Eksekusi real dengan trace set -x
  --test-only           Hanya menjalankan test 31c-1
  --with-npm            Jalankan format:check dan lint
  --commit              Commit otomatis setelah test lolos
  --commit-message <m>  Pesan commit custom
  -h, --help            Bantuan

Recommended:
  bash ./bootstrap/bootstrap_31c_1_wire_app_shell.sh --dry-run
  bash ./bootstrap/bootstrap_31c_1_wire_app_shell.sh --debug-run --with-npm
  bash ./bootstrap/bootstrap_31c_1_wire_app_shell.sh --test-only --with-npm
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
  git diff --quiet -- . || fail "Ada unstaged tracked changes. Commit/stash dulu agar patch 31c-1 tidak tercampur."
  git diff --cached --quiet -- . || fail "Ada staged changes. Commit/stash dulu agar patch 31c-1 tidak tercampur."
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
  step "Validasi prasyarat sebelum 31c-1"

  [[ -f bootstrap/bootstrap_review_gate.sh ]] || fail "bootstrap/bootstrap_review_gate.sh belum ada."
  [[ -f frontend/src/app.jsx ]] || fail "frontend/src/app.jsx tidak ditemukan."
  [[ -f frontend/src/constants/index.js ]] || fail "frontend/src/constants/index.js belum ada."
  [[ -f frontend/src/constants/routes.js ]] || fail "frontend/src/constants/routes.js belum ada."
  [[ -f frontend/src/components/layout/AppShell.jsx ]] || fail "AppShell.jsx belum ada. Pastikan 31c sudah merge."
  [[ -f frontend/src/components/layout/index.js ]] || fail "layout index belum ada. Pastikan 31c sudah merge."
  [[ -f frontend/src/components/layout/layout.css ]] || fail "layout.css belum ada. Pastikan 31c sudah merge."
  [[ -f bootstrap/tests/test_31c_frontend_layout_components.sh ]] || fail "test 31c belum ada. Pastikan 31c sudah merge."

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] %s scripts/check_docs_contracts.py\n' "$PYTHON_CMD"
    printf '[dry-run] bash bootstrap/tests/test_31c_frontend_layout_components.sh\n'
    return 0
  fi

  # shellcheck disable=SC2086
  $PYTHON_CMD scripts/check_docs_contracts.py
  bash bootstrap/tests/test_31c_frontend_layout_components.sh

  log "Prasyarat 31c-1 valid."
}

patch_app_jsx() {
  step "Patch frontend/src/app.jsx dengan AppShell"

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] inspect-and-patch frontend/src/app.jsx\n'
    return 0
  fi

  # shellcheck disable=SC2086
  $PYTHON_CMD <<'PY'
from pathlib import Path
import re
import sys

path = Path("frontend/src/app.jsx")
text = path.read_text(encoding="utf-8")

if "AppShell" in text and "components/layout" in text:
    print("app.jsx already uses AppShell; skip patch.")
    raise SystemExit(0)

if "export function App" not in text and "function App" not in text:
    raise SystemExit("Cannot find App function in frontend/src/app.jsx")

def insert_imports(source: str) -> str:
    additions = []
    if "from './components/layout" not in source:
        additions.append("import { AppShell } from './components/layout/index.js';")
    if "from './constants" not in source and "from './constants/index.js'" not in source:
        additions.append("import { ROUTES } from './constants/index.js';")

    if not additions:
        return source

    lines = source.splitlines()
    last_import = -1
    for i, line in enumerate(lines):
        if line.startswith("import ") or line.startswith("import'") or line.startswith('import"'):
            last_import = i

    if last_import == -1:
        return "\n".join(additions) + "\n" + source

    lines[last_import + 1:last_import + 1] = additions
    return "\n".join(lines) + "\n"

def insert_nav_items(source: str) -> str:
    if "APP_NAV_ITEMS" in source:
        return source

    nav = """const APP_NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard' },
  { href: ROUTES.SISWA, label: 'Siswa' },
  { href: ROUTES.JURUSAN, label: 'Jurusan' },
  { href: ROUTES.RUANGAN, label: 'Ruangan' },
];

"""

    # Put after import block.
    lines = source.splitlines()
    last_import = -1
    for i, line in enumerate(lines):
        if line.startswith("import ") or line.startswith("import'") or line.startswith('import"'):
            last_import = i

    insert_at = last_import + 1
    # Preserve one blank line after imports.
    while insert_at < len(lines) and lines[insert_at].strip() == "":
        insert_at += 1

    lines[insert_at:insert_at] = nav.rstrip("\n").splitlines() + [""]
    return "\n".join(lines) + "\n"

def find_app_function_bounds(source: str):
    match = re.search(r"(export\s+default\s+function\s+App\s*\(|export\s+function\s+App\s*\(|function\s+App\s*\()", source)
    if not match:
        return None

    start = match.start()
    brace = source.find("{", match.end())
    if brace == -1:
        return None

    depth = 0
    in_str = None
    escape = False
    for i in range(brace, len(source)):
        ch = source[i]
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_str:
                in_str = None
            continue

        if ch in ("'", '"', "`"):
            in_str = ch
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return start, i + 1, brace, i + 1

    return None

def find_return_expr(source: str, body_start: int, body_end: int):
    # Find the first return ( ... ); inside App body.
    body = source[body_start:body_end]
    m = re.search(r"\breturn\s*\(", body)
    if not m:
        return None

    open_paren = body_start + m.end() - 1
    depth = 0
    in_str = None
    escape = False
    for i in range(open_paren, body_end):
        ch = source[i]
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_str:
                in_str = None
            continue

        if ch in ("'", '"', "`"):
            in_str = ch
            continue
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth == 0:
                return open_paren, i

    return None

def wrap_return(source: str) -> str:
    bounds = find_app_function_bounds(source)
    if not bounds:
        raise SystemExit("Cannot locate App function bounds")

    _, _, body_open, body_end = bounds
    ret = find_return_expr(source, body_open, body_end)
    if not ret:
        raise SystemExit("Cannot locate return (...) inside App function")

    open_paren, close_paren = ret
    inner = source[open_paren + 1:close_paren].strip()

    if "<AppShell" in inner:
        return source

    wrapped = """(
    <AppShell title="Dashboard" navItems={APP_NAV_ITEMS}>
      {RETURN_CONTENT}
    </AppShell>
  )""".replace("RETURN_CONTENT", inner)

    return source[:open_paren] + wrapped + source[close_paren + 1:]

text = insert_imports(text)
text = insert_nav_items(text)
text = wrap_return(text)

path.write_text(text, encoding="utf-8")
print("app.jsx patched with AppShell.")
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
EOF
}

make_report() {
  local branch="$1"
  local now
  now="$(date '+%Y-%m-%d %H:%M:%S %z')"

  cat <<EOF
# Patch 31c-1 Report — Wire AppShell into app.jsx

Generated at: ${now}

## Branch

\`\`\`text
${branch}
\`\`\`

## What Changed

Patch ini menghubungkan komponen layout dari patch 31c ke \`frontend/src/app.jsx\`.

Perubahan utama:

\`\`\`text
frontend/src/app.jsx
bootstrap/tests/test_31c_1_wire_app_shell.sh
\`\`\`

## Why

Patch 31c hanya menambahkan komponen layout. Patch 31c-1 membuat aplikasi mulai memakai \`AppShell\` agar struktur UI tidak terus berada langsung di \`app.jsx\`.

## Safety Note

Patch ini hanya memasang shell layout dan navigasi dasar. Patch ini tidak mengubah API, database, backend, autentikasi, atau business logic.

## Validation

\`\`\`bash
bash ./bootstrap/bootstrap_31c_1_wire_app_shell.sh \\
  --branch ${branch} \\
  --test-only \\
  --with-npm
\`\`\`

## Next Step

Lanjut patch 31d:

\`\`\`text
31d refactor: extract shared UI components
\`\`\`
EOF
}

install_files() {
  patch_app_jsx

  step "Menulis test dan report 31c-1"
  write_file "bootstrap/tests/test_31c_1_wire_app_shell.sh" "$(make_test_script)"
  write_file "bootstrap/reports/31c_1_wire_app_shell_report.md" "$(make_report "$TARGET_BRANCH")"

  if [[ "$DRY_RUN" != "1" ]]; then
    chmod +x bootstrap/tests/test_31c_1_wire_app_shell.sh
    chmod +x bootstrap/bootstrap_31c_1_wire_app_shell.sh 2>/dev/null || true
  else
    run chmod +x bootstrap/tests/test_31c_1_wire_app_shell.sh
  fi
}

run_tests() {
  step "Menjalankan test 31c-1"

  [[ -f bootstrap/tests/test_31c_1_wire_app_shell.sh ]] || fail "test_31c_1_wire_app_shell.sh belum ada."

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] bash bootstrap/tests/test_31c_1_wire_app_shell.sh\n'
  else
    bash bootstrap/tests/test_31c_1_wire_app_shell.sh
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

  step "Commit patch 31c-1"
  run git add \
    frontend/src/app.jsx \
    bootstrap/bootstrap_31c_1_wire_app_shell.sh \
    bootstrap/tests/test_31c_1_wire_app_shell.sh \
    bootstrap/reports/31c_1_wire_app_shell_report.md

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
    step "Format patched app file"
    (cd frontend && npx prettier --write src/app.jsx)
  fi

  run_tests
  commit_changes

  step "Patch 31c-1 selesai"
  log "Review:"
  log "  git status --short"
  log "  git diff --stat"
  log "  git diff -- frontend/src/app.jsx"
}

main "$@"
