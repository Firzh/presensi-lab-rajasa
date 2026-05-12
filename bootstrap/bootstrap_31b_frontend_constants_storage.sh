#!/usr/bin/env bash
set -Eeuo pipefail

# bootstrap_31b_frontend_constants_storage.sh
# Patch 31b: frontend constants and storage helpers.
#
# Scope:
# - Membuat branch baru alfy/31b-frontend-constants-storage dari development.
# - Menambahkan modul constants:
#   - frontend/src/constants/app.js
#   - frontend/src/constants/routes.js
#   - frontend/src/constants/storageKeys.js
#   - frontend/src/constants/index.js
# - Menambahkan helper storage:
#   - frontend/src/lib/storage.js
#   - frontend/src/lib/index.js
# - Menambahkan test bootstrap:
#   - bootstrap/tests/test_31b_frontend_constants_storage.sh
# - Menambahkan report:
#   - bootstrap/reports/31b_frontend_constants_storage_report.md
#
# Non-scope:
# - Tidak refactor app.jsx besar-besaran.
# - Tidak mengubah backend.
# - Tidak mengubah API.
# - Tidak mengubah package.json.
# - Tidak menghapus bootstrap.
#
# Kenapa patch ini perlu:
# - Sebelum fitur siswa/jurusan/ruangan diekstrak, konstanta dan akses localStorage harus punya rumah resmi.
# - Refactor app.jsx berikutnya bisa kecil dan terukur karena storage helper sudah tersedia.
# - Branch fitur yang memakai localStorage nanti dapat diarahkan ke helper ini tanpa menduplikasi logic.

BASE_BRANCH="development"
TARGET_BRANCH="alfy/31b-frontend-constants-storage"
DRY_RUN=0
DEBUG_RUN=0
TEST_ONLY=0
WITH_NPM=0
DO_COMMIT=0
COMMIT_MESSAGE="refactor: add frontend constants and storage helpers"
PYTHON_CMD=""

usage() {
  cat <<'EOF'
Usage:
  bash ./bootstrap/bootstrap_31b_frontend_constants_storage.sh [options]

Options:
  --base <branch>       Base branch. Default: development
  --branch <branch>     Target branch. Default: alfy/31b-frontend-constants-storage
  --dry-run             Simulasi tanpa menulis file.
  --debug-run           Eksekusi real dengan trace set -x.
  --test-only           Hanya menjalankan test 31b.
  --with-npm            Jalankan npm run format:check dan npm run lint.
  --commit              Commit otomatis setelah test lolos.
  --commit-message <m>  Pesan commit custom.
  -h, --help            Bantuan.

Recommended:
  bash ./bootstrap/bootstrap_31b_frontend_constants_storage.sh --dry-run
  bash ./bootstrap/bootstrap_31b_frontend_constants_storage.sh --debug-run --with-npm
  bash ./bootstrap/bootstrap_31b_frontend_constants_storage.sh --test-only --with-npm
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
  [[ "$branch" == alfy/* ]] || fail "Branch target wajib prefix alfy/... Diberikan: $branch"
}

ensure_clean_worktree() {
  if [[ "$TEST_ONLY" == "1" || "$DRY_RUN" == "1" ]]; then
    return 0
  fi

  if ! git diff --quiet -- .; then
    fail "Ada unstaged tracked changes. Commit/stash dulu agar patch 31b tidak tercampur."
  fi

  if ! git diff --cached --quiet -- .; then
    fail "Ada staged changes. Commit/stash dulu agar patch 31b tidak tercampur."
  fi
}

checkout_target_branch() {
  validate_branch_name "$TARGET_BRANCH"

  if [[ "$TEST_ONLY" == "1" ]]; then
    local active
    active="$(current_branch)"
    [[ "$active" == "$TARGET_BRANCH" ]] || fail "Untuk --test-only, branch aktif harus $TARGET_BRANCH. Saat ini: $active"
    return 0
  fi

  step "Menyiapkan branch $TARGET_BRANCH"

  if git show-ref --verify --quiet "refs/heads/$TARGET_BRANCH"; then
    run git checkout "$TARGET_BRANCH"
  else
    run git checkout "$BASE_BRANCH"
    run git pull --ff-only origin "$BASE_BRANCH"
    run git checkout -b "$TARGET_BRANCH"
  fi
}

ensure_previous_gate() {
  step "Validasi prasyarat sebelum 31b"

  [[ -f docs/SPECIFICATION.md ]] || fail "docs/SPECIFICATION.md tidak ditemukan."
  [[ -f docs/contracts/FRONTEND_CONTRACT.md ]] || fail "docs/contracts/FRONTEND_CONTRACT.md tidak ditemukan."
  [[ -f bootstrap/bootstrap_review_gate.sh ]] || fail "bootstrap/bootstrap_review_gate.sh belum ada. Merge review gate audit dulu."
  [[ -f bootstrap/tests/test_contract_first_baseline.sh ]] || fail "test_contract_first_baseline.sh belum ada."
  [[ -f bootstrap/tests/test_31a_frontend_tooling.sh ]] || fail "test_31a_frontend_tooling.sh belum ada."
  [[ -f frontend/package.json ]] || fail "frontend/package.json tidak ditemukan."
  [[ -f frontend/eslint.config.mjs ]] || fail "frontend/eslint.config.mjs tidak ditemukan."

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] %s scripts/check_docs_contracts.py\n' "$PYTHON_CMD"
    printf '[dry-run] bash bootstrap/tests/test_contract_first_baseline.sh\n'
    printf '[dry-run] bash bootstrap/tests/test_31a_frontend_tooling.sh\n'
    return 0
  fi

  # shellcheck disable=SC2086
  $PYTHON_CMD scripts/check_docs_contracts.py
  bash bootstrap/tests/test_contract_first_baseline.sh
  bash bootstrap/tests/test_31a_frontend_tooling.sh

  log "Prasyarat 31b valid."
}

make_app_constants() {
  cat <<'EOF'
export const APP_ID = 'presensi-lab-rajasa';

export const APP_NAME = 'Presensi Lab Rajasa';

export const APP_VERSION = '0.0.0';

export const APP_ENV = import.meta.env?.MODE ?? 'development';
EOF
}

make_routes_constants() {
  cat <<'EOF'
export const ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SISWA: '/siswa',
  JURUSAN: '/jurusan',
  RUANGAN: '/ruangan',
});
EOF
}

make_storage_keys_constants() {
  cat <<'EOF'
const STORAGE_PREFIX = 'presensi_lab_rajasa';

export const STORAGE_KEYS = Object.freeze({
  SESSION: `${STORAGE_PREFIX}:session`,
  AUTH_USER: `${STORAGE_PREFIX}:auth_user`,
  AUTH_TOKEN: `${STORAGE_PREFIX}:auth_token`,
  THEME: `${STORAGE_PREFIX}:theme`,
  SISWA_LIST: `${STORAGE_PREFIX}:siswa_list`,
  JURUSAN_LIST: `${STORAGE_PREFIX}:jurusan_list`,
  RUANGAN_LIST: `${STORAGE_PREFIX}:ruangan_list`,
});
EOF
}

make_constants_index() {
  cat <<'EOF'
export * from './app.js';
export * from './routes.js';
export * from './storageKeys.js';
EOF
}

make_storage_lib() {
  cat <<'EOF'
function getDefaultStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage ?? null;
}

function isStorageLike(storage) {
  return (
    storage &&
    typeof storage.getItem === 'function' &&
    typeof storage.setItem === 'function' &&
    typeof storage.removeItem === 'function'
  );
}

function safeParseJSON(rawValue, fallbackValue) {
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return fallbackValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch (_error) {
    return fallbackValue;
  }
}

export function createStorageAdapter(storage = getDefaultStorage()) {
  const available = isStorageLike(storage);

  return {
    isAvailable() {
      return available;
    },

    getRaw(key, fallbackValue = null) {
      if (!available) {
        return fallbackValue;
      }

      return storage.getItem(key) ?? fallbackValue;
    },

    setRaw(key, value) {
      if (!available) {
        return false;
      }

      storage.setItem(key, String(value));
      return true;
    },

    getJSON(key, fallbackValue = null) {
      const rawValue = this.getRaw(key, null);
      return safeParseJSON(rawValue, fallbackValue);
    },

    setJSON(key, value) {
      if (!available) {
        return false;
      }

      storage.setItem(key, JSON.stringify(value));
      return true;
    },

    remove(key) {
      if (!available) {
        return false;
      }

      storage.removeItem(key);
      return true;
    },
  };
}

export const appStorage = createStorageAdapter();
EOF
}

make_lib_index() {
  cat <<'EOF'
export * from './storage.js';
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
[[ "$BRANCH" == alfy/* ]] || fail "Branch aktif wajib prefix alfy/... Saat ini: $BRANCH"

required_files=(
  "frontend/src/constants/app.js"
  "frontend/src/constants/routes.js"
  "frontend/src/constants/storageKeys.js"
  "frontend/src/constants/index.js"
  "frontend/src/lib/storage.js"
  "frontend/src/lib/index.js"
  "bootstrap/bootstrap_31b_frontend_constants_storage.sh"
  "bootstrap/tests/test_31b_frontend_constants_storage.sh"
  "bootstrap/reports/31b_frontend_constants_storage_report.md"
)

for file in "${required_files[@]}"; do
  [[ -f "$file" ]] || fail "File wajib 31b belum ada: $file"
done
ok "required 31b files present"

command -v node >/dev/null 2>&1 || fail "node tidak ditemukan."

node --input-type=module <<'NODE'
import { APP_ID, APP_NAME, ROUTES, STORAGE_KEYS } from './frontend/src/constants/index.js';
import { createStorageAdapter } from './frontend/src/lib/index.js';

if (APP_ID !== 'presensi-lab-rajasa') {
  throw new Error('APP_ID invalid');
}

if (!APP_NAME.includes('Presensi')) {
  throw new Error('APP_NAME invalid');
}

for (const key of ['HOME', 'LOGIN', 'DASHBOARD', 'SISWA', 'JURUSAN', 'RUANGAN']) {
  if (!ROUTES[key]) {
    throw new Error(`Missing ROUTES.${key}`);
  }
}

for (const key of ['SESSION', 'AUTH_USER', 'THEME', 'SISWA_LIST', 'JURUSAN_LIST', 'RUANGAN_LIST']) {
  if (!STORAGE_KEYS[key]) {
    throw new Error(`Missing STORAGE_KEYS.${key}`);
  }
}

const memory = new Map();
const memoryStorage = {
  getItem(key) {
    return memory.has(key) ? memory.get(key) : null;
  },
  setItem(key, value) {
    memory.set(key, String(value));
  },
  removeItem(key) {
    memory.delete(key);
  },
};

const storage = createStorageAdapter(memoryStorage);

if (!storage.isAvailable()) {
  throw new Error('Storage adapter should be available with memory storage');
}

storage.setRaw('raw_key', 'raw_value');
if (storage.getRaw('raw_key') !== 'raw_value') {
  throw new Error('getRaw/setRaw failed');
}

const payload = { id: 1, name: 'Rajasa' };
storage.setJSON('json_key', payload);

const restored = storage.getJSON('json_key', null);
if (!restored || restored.id !== 1 || restored.name !== 'Rajasa') {
  throw new Error('getJSON/setJSON failed');
}

storage.remove('json_key');
if (storage.getJSON('json_key', null) !== null) {
  throw new Error('remove failed');
}

const nullStorage = createStorageAdapter(null);
if (nullStorage.isAvailable()) {
  throw new Error('Null storage adapter should not be available');
}

if (nullStorage.setRaw('x', 'y') !== false) {
  throw new Error('Null storage setRaw should return false');
}

console.log('31b constants/storage module validation passed.');
NODE

ok "31b module validation passed"

printf '\nPATCH 31B FRONTEND CONSTANTS/STORAGE TEST PASSED\n'
EOF
}

make_report() {
  local branch="$1"
  local now
  now="$(date '+%Y-%m-%d %H:%M:%S %z')"

  cat <<EOF
# Patch 31b Report — Frontend Constants and Storage Helpers

Generated at: ${now}

## Branch

\`\`\`text
${branch}
\`\`\`

## What Changed

Patch ini menambahkan modul konstanta dan helper storage frontend:

\`\`\`text
frontend/src/constants/app.js
frontend/src/constants/routes.js
frontend/src/constants/storageKeys.js
frontend/src/constants/index.js
frontend/src/lib/storage.js
frontend/src/lib/index.js
bootstrap/tests/test_31b_frontend_constants_storage.sh
\`\`\`

## Why

Sebelum memecah \`app.jsx\` dan mengintegrasikan branch fitur siswa/jurusan/ruangan, akses konstanta dan \`localStorage\` harus punya lokasi resmi.

Tanpa patch ini, refactor berikutnya cenderung memindahkan kode sambil menduplikasi string key, route path, dan logic parsing JSON. Patch ini membuat refactor berikutnya lebih kecil dan mudah diaudit.

## Non-Scope

- Tidak mengubah backend.
- Tidak mengubah API.
- Tidak mengubah database.
- Tidak refactor layout.
- Tidak memecah halaman fitur.
- Tidak mengubah package.json.

## Validation

\`\`\`bash
bash ./bootstrap/bootstrap_31b_frontend_constants_storage.sh \\
  --branch ${branch} \\
  --test-only \\
  --with-npm
\`\`\`

## Next Step

Lanjut patch 31c:

\`\`\`text
31c refactor: extract layout components from app.jsx
\`\`\`

Jika branch fitur siswa/jurusan/ruangan akan diintegrasikan dulu, helper storage ini menjadi target pengganti akses \`localStorage\` langsung.
EOF
}

install_files() {
  step "Menulis constants dan storage helper"

  write_file "frontend/src/constants/app.js" "$(make_app_constants)"
  write_file "frontend/src/constants/routes.js" "$(make_routes_constants)"
  write_file "frontend/src/constants/storageKeys.js" "$(make_storage_keys_constants)"
  write_file "frontend/src/constants/index.js" "$(make_constants_index)"
  write_file "frontend/src/lib/storage.js" "$(make_storage_lib)"
  write_file "frontend/src/lib/index.js" "$(make_lib_index)"

  step "Menulis test dan report 31b"

  write_file "bootstrap/tests/test_31b_frontend_constants_storage.sh" "$(make_test_script)"
  write_file "bootstrap/reports/31b_frontend_constants_storage_report.md" "$(make_report "$TARGET_BRANCH")"

  if [[ "$DRY_RUN" != "1" ]]; then
    chmod +x bootstrap/tests/test_31b_frontend_constants_storage.sh
    chmod +x bootstrap/bootstrap_31b_frontend_constants_storage.sh 2>/dev/null || true
  else
    run chmod +x bootstrap/tests/test_31b_frontend_constants_storage.sh
  fi
}

run_tests() {
  step "Menjalankan test 31b"

  [[ -f bootstrap/tests/test_31b_frontend_constants_storage.sh ]] || fail "test_31b_frontend_constants_storage.sh belum ada."

  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] bash bootstrap/tests/test_31b_frontend_constants_storage.sh\n'
  else
    bash bootstrap/tests/test_31b_frontend_constants_storage.sh
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

  step "Commit patch 31b"
  run git add \
    frontend/src/constants \
    frontend/src/lib \
    bootstrap/bootstrap_31b_frontend_constants_storage.sh \
    bootstrap/tests/test_31b_frontend_constants_storage.sh \
    bootstrap/reports/31b_frontend_constants_storage_report.md

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
  command -v node >/dev/null 2>&1 || fail "node tidak ditemukan."

  PYTHON_CMD="$(resolve_python_cmd)" || fail "Python valid tidak ditemukan."

  ROOT="$(repo_root)"
  cd "$ROOT"

  step "Repository root"
  log "$ROOT"

  step "Python interpreter"
  log "$PYTHON_CMD"

  checkout_target_branch
  ensure_clean_worktree
  ensure_previous_gate

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

  run_tests
  commit_changes

  step "Patch 31b selesai"
  log "Review:"
  log "  git status --short"
  log "  git diff --stat"
}

main "$@"
