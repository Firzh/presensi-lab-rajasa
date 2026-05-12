#!/usr/bin/env bash
set -Eeuo pipefail

# bootstrap_31a_frontend_tooling.sh
# Patch 31a: add prettier, eslint, editorconfig
#
# Scope:
# - Membuat branch implementasi baru dengan prefix alfy/...
# - Menambahkan root .editorconfig
# - Menambahkan konfigurasi Prettier di frontend/
# - Menambahkan konfigurasi ESLint flat config di frontend/
# - Menambahkan script lint/format/format:check di frontend/package.json
# - Menambahkan devDependencies tooling di frontend/package.json
# - Membuat test bootstrap untuk patch 31a
# - Membuat report patch 31a
#
# Non-scope:
# - Tidak melakukan refactor app.jsx
# - Tidak memformat seluruh codebase
# - Tidak menjalankan npm install secara default
# - Tidak mengubah backend
#
# Modes:
#   --dry-run
#   --debug-run
#   --test-only
#   --commit
#
# Example:
#   bash ./bootstrap/bootstrap_31a_frontend_tooling.sh --base alfy/contract-first-bootstrap --branch alfy/31a-frontend-tooling --dry-run
#   bash ./bootstrap/bootstrap_31a_frontend_tooling.sh --base alfy/contract-first-bootstrap --branch alfy/31a-frontend-tooling --debug-run
#   bash ./bootstrap/bootstrap_31a_frontend_tooling.sh --branch alfy/31a-frontend-tooling --test-only

DRY_RUN=0
DEBUG_RUN=0
TEST_ONLY=0
DO_COMMIT=0
BASE_BRANCH="alfy/contract-first-bootstrap"
TARGET_BRANCH="alfy/31a-frontend-tooling"
COMMIT_MESSAGE="chore: add frontend tooling baseline"
PYTHON_CMD=""

usage() {
  cat <<'EOF'
Usage:
  bash ./bootstrap/bootstrap_31a_frontend_tooling.sh [options]

Options:
  --base <branch>       Base branch. Default: alfy/contract-first-bootstrap
  --branch <branch>     Target branch. Default: alfy/31a-frontend-tooling
  --dry-run             Simulasi tanpa menulis file.
  --debug-run           Eksekusi real dengan trace set -x.
  --test-only           Hanya menjalankan test patch 31a.
  --commit              Commit otomatis setelah implementasi dan test lolos.
  --commit-message <m>  Pesan commit custom.
  -h, --help            Tampilkan bantuan.

Recommended:
  bash ./bootstrap/bootstrap_31a_frontend_tooling.sh --dry-run
  bash ./bootstrap/bootstrap_31a_frontend_tooling.sh --debug-run
  bash ./bootstrap/bootstrap_31a_frontend_tooling.sh --test-only
EOF
}

log() { printf '%s\n' "$*"; }
step() { printf '\n==> %s\n' "$*"; }
warn() { printf 'WARNING: %s\n' "$*" >&2; }
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

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
  git rev-parse --show-toplevel 2>/dev/null || fail "Bukan di dalam git repository."
}

current_branch() {
  git branch --show-current 2>/dev/null || true
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Command tidak ditemukan: $1"
}

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

validate_branch_name() {
  local branch="$1"
  [[ -n "$branch" ]] || fail "Nama branch kosong."
  [[ "$branch" == alfy/* ]] || fail "Branch wajib memakai prefix alfy/... Diberikan: $branch"
}

ensure_contract_baseline() {
  local root="$1"

  step "Validasi baseline contract-first"

  [[ -f "$root/docs/SPECIFICATION.md" ]] || fail "docs/SPECIFICATION.md belum ada. Jalankan baseline contract-first dulu."
  [[ -f "$root/docs/contracts/FRONTEND_CONTRACT.md" ]] || fail "docs/contracts/FRONTEND_CONTRACT.md belum ada."
  [[ -f "$root/scripts/check_docs_contracts.py" ]] || fail "scripts/check_docs_contracts.py belum ada."
  [[ -f "$root/bootstrap/tests/test_contract_first_baseline.sh" ]] || fail "bootstrap/tests/test_contract_first_baseline.sh belum ada."

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] %s scripts/check_docs_contracts.py\n' "$PYTHON_CMD"
    printf '[dry-run] bash bootstrap/tests/test_contract_first_baseline.sh\n'
  else
    # shellcheck disable=SC2086
    $PYTHON_CMD scripts/check_docs_contracts.py
    bash bootstrap/tests/test_contract_first_baseline.sh
  fi

  log "Baseline contract-first valid."
}

ensure_clean_tracked_worktree() {
  local root="$1"
  cd "$root"

  # Untracked bootstrap file boleh ada sebelum branch dibuat.
  # Tracked modification tidak boleh ada agar patch 31a tidak tercampur dengan kerja lain.
  if ! git diff --quiet -- . ':!bootstrap/bootstrap_31a_frontend_tooling.sh'; then
    fail "Ada tracked working tree changes. Commit/stash dulu sebelum membuat patch 31a."
  fi

  if ! git diff --cached --quiet -- .; then
    fail "Ada staged changes. Commit/stash dulu sebelum membuat patch 31a."
  fi
}

checkout_target_branch() {
  local root="$1"
  cd "$root"

  validate_branch_name "$BASE_BRANCH"
  validate_branch_name "$TARGET_BRANCH"

  step "Menyiapkan branch target $TARGET_BRANCH"

  if [[ "$TEST_ONLY" == "1" ]]; then
    local active
    active="$(current_branch)"
    [[ "$active" == "$TARGET_BRANCH" ]] || fail "Untuk --test-only, branch aktif harus $TARGET_BRANCH. Saat ini: $active"
    return 0
  fi

  if git show-ref --verify --quiet "refs/heads/$TARGET_BRANCH"; then
    run git checkout "$TARGET_BRANCH"
  else
    run git checkout "$BASE_BRANCH"
    run git pull --ff-only origin "$BASE_BRANCH" || warn "Pull base branch gagal/remote belum ada. Lanjut dengan branch lokal."
    run git checkout -b "$TARGET_BRANCH"
  fi
}

make_editorconfig_content() {
  cat <<'EOF'
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[*.{json,yml,yaml}]
indent_size = 2

[*.php]
indent_size = 4

[Makefile]
indent_style = tab
EOF
}

make_prettierrc_content() {
  cat <<'EOF'
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSameLine": false,
  "arrowParens": "always"
}
EOF
}

make_prettierignore_content() {
  cat <<'EOF'
node_modules/
dist/
build/
coverage/
.vite/
.cache/
.DS_Store

# generated/local artifacts
../bootstrap/.tmp/
../bootstrap/backups/
EOF
}

make_eslint_config_content() {
  cat <<'EOF'
import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      '.vite/**',
      'vite.config.*',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];
EOF
}

update_frontend_package_json() {
  local root="$1"
  local pkg="$root/frontend/package.json"

  [[ -f "$pkg" ]] || fail "frontend/package.json tidak ditemukan."

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] update package.json scripts/devDependencies: %q\n' "$pkg"
    return 0
  fi

  # shellcheck disable=SC2086
  $PYTHON_CMD - "$pkg" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
data = json.loads(path.read_text(encoding="utf-8"))

scripts = data.setdefault("scripts", {})
scripts.setdefault("lint", "eslint .")
scripts.setdefault("format", "prettier --write .")
scripts.setdefault("format:check", "prettier --check .")

dev_deps = data.setdefault("devDependencies", {})
required = {
    "@eslint/js": "^9.0.0",
    "eslint": "^9.0.0",
    "globals": "^15.0.0",
    "prettier": "^3.0.0",
}
for name, version in required.items():
    dev_deps.setdefault(name, version)

# Keep stable ordering for readability.
if "scripts" in data:
    data["scripts"] = dict(sorted(data["scripts"].items()))
if "dependencies" in data:
    data["dependencies"] = dict(sorted(data["dependencies"].items()))
if "devDependencies" in data:
    data["devDependencies"] = dict(sorted(data["devDependencies"].items()))

path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
PY
}

make_test_script_content() {
  cat <<'EOF'
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
[[ "$BRANCH" == alfy/* ]] || fail "Branch aktif wajib prefix alfy/... Saat ini: $BRANCH"
ok "branch prefix valid: $BRANCH"

required_files=(
  ".editorconfig"
  "frontend/.prettierrc.json"
  "frontend/.prettierignore"
  "frontend/eslint.config.mjs"
  "frontend/package.json"
  "bootstrap/bootstrap_31a_frontend_tooling.sh"
  "bootstrap/tests/test_31a_frontend_tooling.sh"
  "bootstrap/reports/31a_frontend_tooling_report.md"
)

missing=0
for f in "${required_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    printf 'MISSING: %s\n' "$f" >&2
    missing=1
  fi
done
[[ "$missing" == "0" ]] || fail "Ada file patch 31a yang belum ada."
ok "patch 31a files present"

PYTHON_CMD="$(resolve_python_cmd)" || fail "Python valid tidak ditemukan."

# shellcheck disable=SC2086
$PYTHON_CMD - <<'PY'
import json
from pathlib import Path

pkg = json.loads(Path("frontend/package.json").read_text(encoding="utf-8"))

scripts = pkg.get("scripts", {})
required_scripts = {
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
}

missing_scripts = [
    f"{name}={command}"
    for name, command in required_scripts.items()
    if scripts.get(name) != command
]
if missing_scripts:
    raise SystemExit("Missing/invalid scripts: " + ", ".join(missing_scripts))

dev_deps = pkg.get("devDependencies", {})
for name in ["@eslint/js", "eslint", "globals", "prettier"]:
    if name not in dev_deps:
        raise SystemExit(f"Missing devDependency: {name}")

prettier = json.loads(Path("frontend/.prettierrc.json").read_text(encoding="utf-8"))
for key in ["semi", "singleQuote", "trailingComma", "printWidth", "tabWidth"]:
    if key not in prettier:
        raise SystemExit(f"Missing prettier option: {key}")

editorconfig = Path(".editorconfig").read_text(encoding="utf-8")
if "root = true" not in editorconfig:
    raise SystemExit(".editorconfig must contain root = true")

eslint_config = Path("frontend/eslint.config.mjs").read_text(encoding="utf-8")
for expected in ["@eslint/js", "globals", "no-unused-vars"]:
    if expected not in eslint_config:
        raise SystemExit(f"eslint.config.mjs missing: {expected}")

print("31a JSON/config validation passed.")
PY

ok "package.json and config validation passed"

if command -v node >/dev/null 2>&1; then
  node -e "JSON.parse(require('fs').readFileSync('frontend/package.json', 'utf8')); console.log('node package.json parse passed')"
  ok "node package.json parse passed"
else
  ok "node not found; skipped node parse check"
fi

printf '\nPATCH 31A FRONTEND TOOLING TEST PASSED\n'
EOF
}

make_report_content() {
  local branch="$1"
  local now
  now="$(date '+%Y-%m-%d %H:%M:%S %z')"

  cat <<EOF
# Patch 31a Report — Frontend Tooling Baseline

Generated at: ${now}

## Branch

\`\`\`text
${branch}
\`\`\`

## Scope

Patch ini menambahkan baseline tooling frontend agar fase refactor berikutnya tidak berjalan tanpa standar format dan lint.

## Implemented

- Root \`.editorconfig\`.
- \`frontend/.prettierrc.json\`.
- \`frontend/.prettierignore\`.
- \`frontend/eslint.config.mjs\`.
- Script \`lint\`, \`format\`, dan \`format:check\` pada \`frontend/package.json\`.
- Dev dependencies minimum untuk ESLint dan Prettier pada \`frontend/package.json\`.
- Test patch \`bootstrap/tests/test_31a_frontend_tooling.sh\`.

## Non-Scope

- Belum menjalankan formatting massal.
- Belum memecah \`app.jsx\`.
- Belum mengubah route.
- Belum mengubah storage helper.
- Belum mengubah backend.

## Validation

\`\`\`bash
bash ./bootstrap/bootstrap_31a_frontend_tooling.sh --branch ${branch} --test-only
\`\`\`

## Next Step

Lanjut patch 31b:

\`\`\`text
31b refactor: split frontend constants and storage helpers
\`\`\`
EOF
}

install_patch_files() {
  local root="$1"
  local branch="$2"

  step "Menulis konfigurasi frontend tooling"

  write_file "$root/.editorconfig" "$(make_editorconfig_content)"
  write_file "$root/frontend/.prettierrc.json" "$(make_prettierrc_content)"
  write_file "$root/frontend/.prettierignore" "$(make_prettierignore_content)"
  write_file "$root/frontend/eslint.config.mjs" "$(make_eslint_config_content)"

  update_frontend_package_json "$root"

  step "Menulis bootstrap test dan report patch 31a"

  write_file "$root/bootstrap/tests/test_31a_frontend_tooling.sh" "$(make_test_script_content)"
  write_file "$root/bootstrap/reports/31a_frontend_tooling_report.md" "$(make_report_content "$branch")"

  if [[ "$DRY_RUN" != "1" ]]; then
    chmod +x "$root/bootstrap/tests/test_31a_frontend_tooling.sh"
    chmod +x "$root/bootstrap/bootstrap_31a_frontend_tooling.sh" 2>/dev/null || true
  else
    run chmod +x "$root/bootstrap/tests/test_31a_frontend_tooling.sh"
  fi
}

run_tests() {
  local root="$1"

  step "Menjalankan test patch 31a"

  [[ -f "$root/bootstrap/tests/test_31a_frontend_tooling.sh" ]] || fail "Test patch 31a belum ada."
  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] bash %q\n' "$root/bootstrap/tests/test_31a_frontend_tooling.sh"
  else
    bash "$root/bootstrap/tests/test_31a_frontend_tooling.sh"
  fi
}

commit_changes() {
  local root="$1"

  [[ "$DO_COMMIT" == "1" ]] || return 0

  step "Commit patch 31a"
  cd "$root"
  run git add .editorconfig frontend/.prettierrc.json frontend/.prettierignore frontend/eslint.config.mjs frontend/package.json bootstrap
  run git commit -m "$COMMIT_MESSAGE"
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --base)
        BASE_BRANCH="${2:-}"
        [[ -n "$BASE_BRANCH" ]] || fail "--base membutuhkan nama branch."
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
    fail "--dry-run dan --debug-run tidak boleh dipakai bersamaan."
  fi

  if [[ "$DEBUG_RUN" == "1" ]]; then
    set -x
  fi
}

main() {
  parse_args "$@"

  require_cmd git

  PYTHON_CMD="$(resolve_python_cmd)" || fail "Python valid tidak ditemukan."

  local root
  root="$(repo_root)"
  cd "$root"

  step "Repository root"
  log "$root"

  step "Python interpreter"
  log "$PYTHON_CMD"

  checkout_target_branch "$root"

  if [[ "$TEST_ONLY" != "1" ]]; then
    ensure_clean_tracked_worktree "$root"
  fi

  ensure_contract_baseline "$root"

  if [[ "$TEST_ONLY" == "1" ]]; then
    run_tests "$root"
    exit 0
  fi

  install_patch_files "$root" "$TARGET_BRANCH"

  if [[ "$DRY_RUN" == "1" ]]; then
    step "Dry-run selesai"
    log "Tidak ada file yang ditulis."
    exit 0
  fi

  run_tests "$root"
  commit_changes "$root"

  step "Patch 31a selesai"
  log "Lanjut review:"
  log "  git status --short"
  log "  git diff --stat"
}

main "$@"
