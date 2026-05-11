# DEV PLAN PHASE 1 — Frontend Stabilization

**Kode fase:** FASE-31A  
**Rentang backlog:** `31a` sampai `31d` + `31d-1`  
**Tujuan utama:** menstabilkan fondasi frontend sebelum fitur dipecah lebih jauh.

## 1. Milestone

```text
31a chore: add prettier, eslint, editorconfig
31b refactor(frontend): extract constants and storage helpers
31c refactor(frontend): extract dashboard and auth layouts
31d refactor(frontend): extract shared UI components
31d-1 docs(frontend): document phase 1 stabilization result
```

## 2. Scope

Termasuk:

- formatter dan linter;
- constants;
- storage helper;
- layout;
- shared UI components.

Tidak termasuk:

- migrasi API;
- backend endpoint;
- perubahan database;
- route `preact-router`;
- penghapusan penuh seed data.

## 3. Target Output

```text
frontend/src/constants/
frontend/src/lib/storage.js
frontend/src/components/layout/
frontend/src/components/ui/
```

## 4. Acceptance Criteria

- `app.jsx` berkurang signifikan;
- tidak ada perubahan perilaku fitur;
- build frontend tetap berhasil;
- dokumen fase diperbarui.
