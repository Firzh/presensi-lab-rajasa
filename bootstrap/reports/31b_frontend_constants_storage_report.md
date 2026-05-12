# Patch 31b Report — Frontend Constants and Storage Helpers

Generated at: 2026-05-12 09:41:12 +0700

## Branch

```text
alfy/31b-frontend-constants-storage
```

## What Changed

Patch ini menambahkan modul konstanta dan helper storage frontend:

```text
frontend/src/constants/app.js
frontend/src/constants/routes.js
frontend/src/constants/storageKeys.js
frontend/src/constants/index.js
frontend/src/lib/storage.js
frontend/src/lib/index.js
bootstrap/tests/test_31b_frontend_constants_storage.sh
```

## Why

Sebelum memecah `app.jsx` dan mengintegrasikan branch fitur siswa/jurusan/ruangan, akses konstanta dan `localStorage` harus punya lokasi resmi.

Tanpa patch ini, refactor berikutnya cenderung memindahkan kode sambil menduplikasi string key, route path, dan logic parsing JSON. Patch ini membuat refactor berikutnya lebih kecil dan mudah diaudit.

## Non-Scope

- Tidak mengubah backend.
- Tidak mengubah API.
- Tidak mengubah database.
- Tidak refactor layout.
- Tidak memecah halaman fitur.
- Tidak mengubah package.json.

## Validation

```bash
bash ./bootstrap/bootstrap_31b_frontend_constants_storage.sh \
  --branch alfy/31b-frontend-constants-storage \
  --test-only \
  --with-npm
```

## Next Step

Lanjut patch 31c:

```text
31c refactor: extract layout components from app.jsx
```

Jika branch fitur siswa/jurusan/ruangan akan diintegrasikan dulu, helper storage ini menjadi target pengganti akses `localStorage` langsung.