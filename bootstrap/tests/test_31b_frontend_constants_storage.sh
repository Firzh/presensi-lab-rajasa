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