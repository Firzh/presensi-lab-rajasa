#!/usr/bin/env bash
set -Eeuo pipefail

# bootstrap_31c_2_tailwind_cdn_only.sh
# 31c-2: install Tailwind CDN only.
#
# Scope:
# - frontend/index.html
# - docs/contracts/FRONTEND_TAILWIND_CONTRACT.md
# - docs/CONTRACT_INDEX.md
# - bootstrap/tests/test_31c_2_tailwind_cdn_only.sh
# - bootstrap/reports/31c_2_tailwind_cdn_only_report.md
#
# Non-scope:
# - No app.jsx changes.
# - No app.css changes.
# - No page implementation.
# - No icon changes.
# - No backend/API/database/auth changes.

BASE_BRANCH="development"
TARGET_BRANCH="alfy/31c-2-tailwind-cdn-only"
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
  bash ./bootstrap/bootstrap_31c_2_tailwind_cdn_only.sh [options]

Options:
  --base <branch>             Base branch. Default: development
  --branch <branch>           Target branch. Default: alfy/31c-2-tailwind-cdn-only
  --dry-run                   Simulasi tanpa menulis file
  --debug-run                 Eksekusi real dengan trace set -x
  --test-only                 Hanya menjalankan test 31c-2
  --with-npm                  Jalankan format:check dan lint
  --allow-dirty-expected      Izinkan dirty file jika hanya file scope 31c-2
  -h, --help                  Bantuan

Recommended:
  bash ./bootstrap/bootstrap_31c_2_tailwind_cdn_only.sh \
    --branch alfy/31c-2-tailwind-cdn-only \
    --debug-run \
    --with-npm \
    --allow-dirty-expected
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
    frontend/index.html) return 0 ;;
    docs/contracts/FRONTEND_TAILWIND_CONTRACT.md) return 0 ;;
    docs/CONTRACT_INDEX.md) return 0 ;;
    bootstrap/bootstrap_31c_2_tailwind_cdn_only.sh) return 0 ;;
    bootstrap/tests/test_31c_2_tailwind_cdn_only.sh) return 0 ;;
    bootstrap/reports/31c_2_tailwind_cdn_only_report.md) return 0 ;;
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
      is_expected_file "$file" || fail "Ada dirty file di luar scope 31c-2 Tailwind-only: $file"
    done <<< "$dirty"
    [[ -n "$dirty" ]] && warn "Dirty file scope 31c-2 Tailwind-only terdeteksi; script akan rewrite file tersebut."
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
  step "Validasi prasyarat"

  [[ -f frontend/index.html ]] || fail "frontend/index.html tidak ditemukan."
  [[ -f frontend/src/app.jsx ]] || fail "frontend/src/app.jsx tidak ditemukan."
  [[ -f frontend/src/app.css ]] || fail "frontend/src/app.css tidak ditemukan."
  [[ -f bootstrap/bootstrap_review_gate.sh ]] || fail "bootstrap/bootstrap_review_gate.sh belum ada."
  [[ -f bootstrap/tests/test_31c_frontend_layout_components.sh ]] || fail "test 31c belum ada."
  [[ -f bootstrap/tests/test_31c_1_wire_app_shell.sh ]] || fail "test 31c-1 belum ada."

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] python scripts/check_docs_contracts.py\n'
    printf '[dry-run] bash bootstrap/tests/test_31c_frontend_layout_components.sh\n'
    printf '[dry-run] bash bootstrap/tests/test_31c_1_wire_app_shell.sh\n'
    return 0
  fi

  local py
  py="$(resolve_python_cmd)"
  "$py" scripts/check_docs_contracts.py
  bash bootstrap/tests/test_31c_frontend_layout_components.sh
  bash bootstrap/tests/test_31c_1_wire_app_shell.sh
}

patch_index_html() {
  step "Memasang Tailwind CDN di frontend/index.html"

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] inject Tailwind CDN into frontend/index.html\n'
    return 0
  fi

  local py
  py="$(resolve_python_cmd)"
  "$py" <<'PY'
from pathlib import Path

path = Path("frontend/index.html")
text = path.read_text(encoding="utf-8")

if "cdn.tailwindcss.com" in text:
    raise SystemExit(0)

snippet = """    <!-- 31c-2: Tailwind Play CDN for product UI prototyping. Temporary until Tailwind is migrated to Vite/npm. -->
    <script>
      window.tailwind = window.tailwind || {};
      window.tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
            },
            boxShadow: {
              rajasa: '0 24px 60px rgb(15 23 42 / 0.28)',
            },
          },
        },
      };
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
"""

if "</head>" not in text:
    raise SystemExit("frontend/index.html tidak punya </head>")

text = text.replace("</head>", snippet + "  </head>")
path.write_text(text, encoding="utf-8")
PY
}

make_contract_doc() {
  cat <<'EOF'
# Frontend Tailwind Contract

## Status

Active from patch 31c-2.

## Purpose

Patch 31c-2 installs Tailwind through the Play CDN only. The purpose is to prepare the frontend for faster product UI iteration in patch 31c-3 without mixing Tailwind setup with page implementation.

## Scope of 31c-2

Allowed changes:

```text
frontend/index.html
docs/contracts/FRONTEND_TAILWIND_CONTRACT.md
docs/CONTRACT_INDEX.md
bootstrap/tests/test_31c_2_tailwind_cdn_only.sh
bootstrap/reports/31c_2_tailwind_cdn_only_report.md
```

Forbidden changes in 31c-2:

```text
frontend/src/app.jsx
frontend/src/app.css
frontend/src/pages/
frontend/public/icon/
backend/
database/
api/
auth/
```

## Tailwind Mode

Tailwind is installed through:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

The configuration must use class-based dark mode:

```js
darkMode: 'class'
```

## Temporary Decision

Tailwind Play CDN is allowed only for Milestone 1 visual prototyping. Before production release, the project must choose one of these paths:

```text
1. migrate Tailwind to Vite/npm
2. remove Tailwind CDN and return to modular CSS
3. keep CDN only in a prototype branch, not production
```

## 31c-3 Direction

Patch 31c-3 may implement the product landing page using Tailwind utilities after this setup is merged and verified.

Expected 31c-3 scope:

```text
frontend/src/app.jsx
frontend/src/pages/LoginPage.jsx
frontend/src/pages/DashboardPage.jsx
frontend/public/icon/
```

## Non-Scope

Tailwind setup must not implement product pages in 31c-2.
EOF
}

update_contract_index() {
  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] update docs/CONTRACT_INDEX.md\n'
    return 0
  fi

  local py
  py="$(resolve_python_cmd)"
  "$py" <<'PY'
from pathlib import Path

path = Path("docs/CONTRACT_INDEX.md")
entry = "- `docs/contracts/FRONTEND_TAILWIND_CONTRACT.md` — Tailwind CDN setup contract for 31c-2."

if not path.exists():
    path.write_text("# Contract Index\n\n## Frontend Tailwind\n\n" + entry + "\n", encoding="utf-8")
    raise SystemExit(0)

text = path.read_text(encoding="utf-8")
if "FRONTEND_TAILWIND_CONTRACT.md" not in text:
    if not text.endswith("\n"):
        text += "\n"
    text += "\n## Frontend Tailwind\n\n" + entry + "\n"
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
if git diff --name-only origin/development...HEAD 2>/dev/null | grep -Eq '^frontend/src/(app\.jsx|app\.css|pages/|public/icon/)'; then
  fail "31c-2 Tailwind-only tidak boleh mengubah app.jsx, app.css, pages, atau public/icon."
fi

ok "31c-2 Tailwind CDN-only validation passed"
printf '\nPATCH 31C-2 TAILWIND CDN ONLY TEST PASSED\n'
EOF
}

make_report() {
  cat <<'EOF'
# Patch 31c-2 Report — Tailwind CDN Only

## What Changed

Patch ini hanya memasang Tailwind Play CDN sebagai persiapan 31c-3.

Changed scope:

```text
frontend/index.html
docs/contracts/FRONTEND_TAILWIND_CONTRACT.md
docs/CONTRACT_INDEX.md
bootstrap/tests/test_31c_2_tailwind_cdn_only.sh
bootstrap/reports/31c_2_tailwind_cdn_only_report.md
```

## Why

Landing page masih perlu iterasi visual. Tailwind disiapkan dulu secara terpisah agar 31c-3 bisa fokus pada implementasi halaman tanpa mencampur setup styling.

## Non-Scope

```text
frontend/src/app.jsx
frontend/src/app.css
frontend/src/pages/
frontend/public/icon/
backend/
database/
api/
auth/
```

## Next Patch

```text
31c-3 — implement product landing with Tailwind
```
EOF
}

install_files() {
  patch_index_html

  step "Menulis kontrak Tailwind"
  write_file "docs/contracts/FRONTEND_TAILWIND_CONTRACT.md" "$(make_contract_doc)"
  update_contract_index

  step "Menulis test dan report"
  write_file "bootstrap/tests/test_31c_2_tailwind_cdn_only.sh" "$(make_test_script)"
  write_file "bootstrap/reports/31c_2_tailwind_cdn_only_report.md" "$(make_report)"

  if [[ "$DRY_RUN" != "1" ]]; then
    chmod +x bootstrap/tests/test_31c_2_tailwind_cdn_only.sh
    chmod +x bootstrap/bootstrap_31c_2_tailwind_cdn_only.sh 2>/dev/null || true
  fi
}

run_tests() {
  step "Menjalankan test 31c-2 Tailwind-only"

  [[ -f bootstrap/tests/test_31c_2_tailwind_cdn_only.sh ]] || fail "test_31c_2_tailwind_cdn_only.sh belum ada."

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] bash bootstrap/tests/test_31c_2_tailwind_cdn_only.sh\n'
  else
    bash bootstrap/tests/test_31c_2_tailwind_cdn_only.sh
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
    (cd frontend && npx prettier --write index.html)
  fi

  run_tests

  step "Patch 31c-2 Tailwind-only selesai"
  printf 'Review:\n'
  printf '  git status --short\n'
  printf '  git diff --stat\n'
  printf '  git diff -- frontend/index.html docs/contracts/FRONTEND_TAILWIND_CONTRACT.md docs/CONTRACT_INDEX.md\n'
}

main "$@"
