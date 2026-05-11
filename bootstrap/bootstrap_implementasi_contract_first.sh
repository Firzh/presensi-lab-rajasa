#!/usr/bin/env bash
set -Eeuo pipefail

# bootstrap_implementasi_contract_first.sh
# Clean-start bootstrap v3 untuk entry pola contract-first Presensi Lab Rajasa.
# Fix v3:
# - Tidak percaya pada `command -v python3` saja.
# - Mencari Python yang benar-benar bisa menjalankan script:
#   python3 -> python -> py -3
# - Aman untuk Git Bash Windows dan Windows App Execution Alias.

DRY_RUN=0
DEBUG_RUN=0
TEST_ONLY=0
DO_COMMIT=0
EXPECTED_BRANCH=""
COMMIT_MESSAGE="docs: add contract-first baseline"

REQUIRED_DOC_FILES=(
  "README.md"
  "CHANGELOG.md"
  "CONTRIBUTING.md"
  "SOURCE_NOTES.md"
  "docs/SPECIFICATION.md"
  "docs/IMPLEMENTATION_STATUS.md"
  "docs/DEV_PLAN_SHORT_TERM.md"
  "docs/TEST_PLAN.md"
  "docs/ARCHITECTURE.md"
  "docs/CONTRACT_INDEX.md"
  "docs/contracts/STACK_CONTRACT.md"
  "docs/contracts/BRANCH_INTEGRATION_CONTRACT.md"
  "docs/contracts/FRONTEND_CONTRACT.md"
  "docs/contracts/ROUTE_CONTRACT.md"
  "docs/contracts/API_CONTRACT.md"
  "docs/contracts/AUTH_CONTRACT.md"
  "docs/contracts/DATABASE_CONTRACT.md"
  "docs/contracts/ERROR_CONTRACT.md"
  "docs/contracts/ENV_DOCKER_CONTRACT.md"
  "docs/contracts/SECURITY_CONTRACT.md"
  "docs/dev-plans/DEV_PLAN_PHASE_0_CONTRACT_BASELINE.md"
  "docs/dev-plans/DEV_PLAN_PHASE_1_FRONTEND_STABILIZATION.md"
  "docs/dev-plans/DEV_PLAN_PHASE_2_FEATURE_MODULARIZATION_ROUTING.md"
  "docs/dev-plans/DEV_PLAN_PHASE_3_API_BACKEND_FOUNDATION.md"
  "docs/dev-plans/DEV_PLAN_PHASE_4_DATA_MIGRATION_FINAL_DOCS.md"
  "docs/reviews/CODE_QUALITY_REVIEW.md"
  "examples/api/response-envelope.examples.json"
  "scripts/check_docs_contracts.py"
)

usage() {
  cat <<'EOF'
Usage:
  bash ./bootstrap/bootstrap_implementasi_contract_first.sh [options]

Options:
  --branch <name>       Validasi branch aktif sesuai nama ini. Wajib prefix alfy/ jika diberikan.
  --dry-run             Simulasi tanpa menulis file.
  --debug-run           Eksekusi real dengan trace set -x.
  --test-only           Hanya menjalankan test baseline contract-first.
  --commit              Commit otomatis setelah bootstrap dan test lolos.
  --commit-message <m>  Pesan commit custom.
  -h, --help            Tampilkan bantuan.
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

repo_root() {
  git rev-parse --show-toplevel 2>/dev/null || fail "Bukan di dalam git repository."
}

current_branch() {
  git branch --show-current 2>/dev/null || true
}

validate_branch_prefix() {
  local branch="$1"
  [[ -n "$branch" ]] || fail "Branch aktif tidak terbaca. Pastikan berada di branch lokal, bukan detached HEAD."
  [[ "$branch" == alfy/* ]] || fail "Branch aktif harus memakai prefix alfy/... Saat ini: $branch"
}

validate_expected_branch() {
  local branch="$1"
  if [[ -n "$EXPECTED_BRANCH" ]]; then
    [[ "$EXPECTED_BRANCH" == alfy/* ]] || fail "Argumen --branch wajib prefix alfy/... Diberikan: $EXPECTED_BRANCH"
    [[ "$branch" == "$EXPECTED_BRANCH" ]] || fail "Branch aktif ($branch) tidak sama dengan --branch ($EXPECTED_BRANCH)."
  fi
}

create_bootstrap_dirs() {
  local root="$1"

  step "Membuat struktur bootstrap"
  run mkdir -p \
    "$root/bootstrap" \
    "$root/bootstrap/tests" \
    "$root/bootstrap/reports" \
    "$root/bootstrap/backups" \
    "$root/bootstrap/.tmp"
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
[[ -n "$BRANCH" ]] || fail "Branch aktif tidak terbaca."
[[ "$BRANCH" == alfy/* ]] || fail "Branch aktif wajib prefix alfy/... Saat ini: $BRANCH"
ok "branch prefix valid: $BRANCH"

required_files=(
  "README.md"
  "CHANGELOG.md"
  "CONTRIBUTING.md"
  "SOURCE_NOTES.md"
  "docs/SPECIFICATION.md"
  "docs/IMPLEMENTATION_STATUS.md"
  "docs/DEV_PLAN_SHORT_TERM.md"
  "docs/TEST_PLAN.md"
  "docs/ARCHITECTURE.md"
  "docs/CONTRACT_INDEX.md"
  "docs/contracts/STACK_CONTRACT.md"
  "docs/contracts/BRANCH_INTEGRATION_CONTRACT.md"
  "docs/contracts/FRONTEND_CONTRACT.md"
  "docs/contracts/ROUTE_CONTRACT.md"
  "docs/contracts/API_CONTRACT.md"
  "docs/contracts/AUTH_CONTRACT.md"
  "docs/contracts/DATABASE_CONTRACT.md"
  "docs/contracts/ERROR_CONTRACT.md"
  "docs/contracts/ENV_DOCKER_CONTRACT.md"
  "docs/contracts/SECURITY_CONTRACT.md"
  "docs/dev-plans/DEV_PLAN_PHASE_0_CONTRACT_BASELINE.md"
  "docs/dev-plans/DEV_PLAN_PHASE_1_FRONTEND_STABILIZATION.md"
  "docs/dev-plans/DEV_PLAN_PHASE_2_FEATURE_MODULARIZATION_ROUTING.md"
  "docs/dev-plans/DEV_PLAN_PHASE_3_API_BACKEND_FOUNDATION.md"
  "docs/dev-plans/DEV_PLAN_PHASE_4_DATA_MIGRATION_FINAL_DOCS.md"
  "docs/reviews/CODE_QUALITY_REVIEW.md"
  "examples/api/response-envelope.examples.json"
  "scripts/check_docs_contracts.py"
  "bootstrap/bootstrap_implementasi_contract_first.sh"
  "bootstrap/reports/contract_first_bootstrap_report.md"
)

missing=0
for f in "${required_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    printf 'MISSING: %s\n' "$f" >&2
    missing=1
  fi
done

[[ "$missing" == "0" ]] || fail "Ada file contract-first wajib yang belum ada."
ok "required contract-first files present"

PYTHON_CMD="$(resolve_python_cmd)" || fail "Python interpreter valid tidak ditemukan. Di Git Bash Windows, alias python3 kadang mengarah ke Microsoft Store. Coba install Python asli, atau aktifkan Python launcher `py -3`, atau matikan App execution alias Python."
ok "python interpreter detected: $PYTHON_CMD"

# shellcheck disable=SC2086
$PYTHON_CMD scripts/check_docs_contracts.py
ok "scripts/check_docs_contracts.py passed"

if [[ -f "backend/composer.json" ]]; then
  grep -q "Rajasa\\\\\\\\PresensiLabBackend\\\\\\\\" backend/composer.json \
    || fail "backend/composer.json belum memakai namespace Rajasa\\\\PresensiLabBackend\\\\ sesuai kontrak."
  ok "backend namespace contract detected"
fi

if [[ -f "frontend/package.json" ]]; then
  grep -q '"preact"' frontend/package.json \
    || fail "frontend/package.json belum mendeteksi dependency preact."
  ok "frontend stack contract detected"
fi

printf '\nCONTRACT-FIRST BASELINE TEST PASSED\n'
EOF
}

make_readme_content() {
  cat <<'EOF'
# Bootstrap Contract-First Presensi Lab Rajasa

Folder ini berisi entry implementasi untuk pola kerja contract-first.

## File utama

- `bootstrap_implementasi_contract_first.sh`
- `tests/test_contract_first_baseline.sh`
- `reports/contract_first_bootstrap_report.md`

## Mode

```bash
bash ./bootstrap/bootstrap_implementasi_contract_first.sh --dry-run
bash ./bootstrap/bootstrap_implementasi_contract_first.sh --debug-run
bash ./bootstrap/bootstrap_implementasi_contract_first.sh --test-only
```

## Aturan branch

Semua branch implementasi baru wajib memakai prefix:

```text
alfy/...
```

## Scope bootstrap

Bootstrap ini tidak mengekstrak ZIP dokumentasi. Dokumentasi contract-first dimasukkan manual dari `presensi_contract_pack.zip` di root repo sebelum bootstrap dijalankan.

EOF
}

make_report_content() {
  local branch="$1"
  local now
  now="$(date '+%Y-%m-%d %H:%M:%S %z')"

  cat <<EOF
# Contract-First Bootstrap Report

Generated at: ${now}

## Branch

\`\`\`text
${branch}
\`\`\`

## Scope

Bootstrap clean-start ini membuat baseline implementasi contract-first untuk proyek Presensi Lab Rajasa.

## Implemented

- Validasi branch wajib prefix \`alfy/...\`.
- Struktur \`root/bootstrap/\`.
- Test baseline contract-first.
- Report bootstrap.
- Validasi dokumen wajib dari \`presensi_contract_pack.zip\`.
- Validasi \`scripts/check_docs_contracts.py\`.
- Validasi stack backend custom PHP sesuai namespace \`Rajasa\\\\PresensiLabBackend\\\\\`.
- Validasi stack frontend Preact.
- Resolver Python untuk Git Bash Windows: \`python3\`, \`python\`, lalu \`py -3\`.

## Non-Scope

- Tidak melakukan ekstraksi ZIP dokumentasi.
- Tidak mengubah kode fitur.
- Tidak mengubah database.
- Tidak melakukan merge branch fitur.
- Tidak melakukan migrasi API.
- Tidak melakukan deployment.

## Next Step

Lanjutkan ke Fase 1:

\`\`\`text
31a chore: add prettier, eslint, editorconfig
31b refactor: split frontend constants and storage helpers
31c refactor: extract layout components from app.jsx
31d refactor: extract shared UI components
31d-1 docs: sync frontend stabilization documentation
\`\`\`
EOF
}

install_bootstrap_files() {
  local root="$1"
  local branch="$2"

  step "Menulis file bootstrap README, test, dan report"

  write_file "$root/bootstrap/README.md" "$(make_readme_content)"
  write_file "$root/bootstrap/tests/test_contract_first_baseline.sh" "$(make_test_script_content)"
  write_file "$root/bootstrap/reports/contract_first_bootstrap_report.md" "$(make_report_content "$branch")"

  if [[ "$DRY_RUN" != "1" ]]; then
    chmod +x "$root/bootstrap/tests/test_contract_first_baseline.sh"
    chmod +x "$root/bootstrap/bootstrap_implementasi_contract_first.sh" 2>/dev/null || true
  else
    run chmod +x "$root/bootstrap/tests/test_contract_first_baseline.sh"
  fi
}

validate_docs_present_light() {
  local root="$1"
  local missing=0

  step "Validasi awal dokumen contract-first"

  for f in "${REQUIRED_DOC_FILES[@]}"; do
    if [[ ! -f "$root/$f" ]]; then
      printf 'MISSING: %s\n' "$f" >&2
      missing=1
    fi
  done

  if [[ "$missing" != "0" ]]; then
    fail "Dokumentasi contract-first belum lengkap. Ekstrak dulu presensi_contract_pack.zip dari root repo: unzip -o ./presensi_contract_pack.zip -d ."
  fi

  log "Dokumentasi contract-first ditemukan."
}

run_tests() {
  local root="$1"

  step "Menjalankan test baseline contract-first"

  if [[ -x "$root/bootstrap/tests/test_contract_first_baseline.sh" ]]; then
    run bash "$root/bootstrap/tests/test_contract_first_baseline.sh"
  elif [[ -f "$root/bootstrap/tests/test_contract_first_baseline.sh" ]]; then
    run chmod +x "$root/bootstrap/tests/test_contract_first_baseline.sh"
    run bash "$root/bootstrap/tests/test_contract_first_baseline.sh"
  else
    fail "Test script belum ada: bootstrap/tests/test_contract_first_baseline.sh"
  fi
}

commit_changes() {
  local root="$1"

  [[ "$DO_COMMIT" == "1" ]] || return 0

  step "Commit perubahan contract-first baseline"

  cd "$root"
  run git add README.md CHANGELOG.md CONTRIBUTING.md SOURCE_NOTES.md docs examples scripts bootstrap
  run git commit -m "$COMMIT_MESSAGE"
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --branch)
        EXPECTED_BRANCH="${2:-}"
        [[ -n "$EXPECTED_BRANCH" ]] || fail "--branch membutuhkan nama branch."
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
        [[ -n "$COMMIT_MESSAGE" ]] || fail "--commit-message membutuhkan teks pesan."
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

  local root
  root="$(repo_root)"
  cd "$root"

  local branch
  branch="$(current_branch)"

  step "Repository root"
  log "$root"

  step "Branch aktif"
  log "$branch"

  validate_branch_prefix "$branch"
  validate_expected_branch "$branch"

  local python_cmd
  python_cmd="$(resolve_python_cmd)" || warn "Python valid belum ditemukan saat bootstrap. Test akan gagal sampai Python valid tersedia."
  if [[ -n "${python_cmd:-}" ]]; then
    step "Python interpreter"
    log "$python_cmd"
  fi

  if [[ "$TEST_ONLY" == "1" ]]; then
    run_tests "$root"
    exit 0
  fi

  validate_docs_present_light "$root"

  if [[ "$DRY_RUN" == "1" ]]; then
    step "Mode dry-run aktif"
    log "Tidak ada file yang akan ditulis."
  fi

  create_bootstrap_dirs "$root"
  install_bootstrap_files "$root" "$branch"

  if [[ "$DRY_RUN" == "1" ]]; then
    step "Test dilewati pada dry-run"
    log "Jalankan --debug-run atau tanpa mode untuk eksekusi real."
    exit 0
  fi

  run_tests "$root"
  commit_changes "$root"

  step "Bootstrap contract-first selesai"
  log "Lanjut review:"
  log "  git status --short"
  log "  git diff --stat"
}

main "$@"
