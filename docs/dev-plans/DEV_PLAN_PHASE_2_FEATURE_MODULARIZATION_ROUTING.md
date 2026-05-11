# DEV PLAN PHASE 2 — Feature Modularization and Routing

**Kode fase:** FASE-31B  
**Rentang backlog:** `31e` sampai `31h` + `31h-1`  
**Tujuan utama:** memecah fitur siswa, jurusan, dan ruangan menjadi modul, lalu mengganti route manual.

## 1. Milestone

```text
31e refactor(siswa): extract siswa pages, table, filters, and form
31f refactor(jurusan): extract jurusan pages, card, and form
31g refactor(ruangan): extract ruangan pages, card, and form
31h refactor(router): replace manual client routing with preact-router
31h-1 docs(frontend): document feature modularization and routing result
```

## 2. Target Structure

```text
frontend/src/features/siswa/
frontend/src/features/jurusan/
frontend/src/features/ruangan/
frontend/src/routes/AppRouter.jsx
```

## 3. Rule

Service boleh masih memakai storage helper sementara, tetapi page dan component tidak boleh langsung memakai `localStorage`.

## 4. Acceptance Criteria

- `app.jsx` hanya menjadi komposisi aplikasi;
- siswa, jurusan, dan ruangan keluar dari `app.jsx`;
- route manual hilang;
- route contract diperbarui;
- build frontend berhasil.
