# Dev Plan Short Term

Dokumen ini menjadi ringkasan rencana kerja jangka pendek. Detail tiap fase tersedia di `docs/dev-plans/`.

## Phase 0 — Contract and Branch Baseline

Tujuan:

- mengunci stack;
- mengunci kontrak API awal;
- mengunci kontrak database awal;
- mengunci kontrak frontend awal;
- membuat branch integrasi;
- memetakan branch fitur aktif.

Milestone:

```text
31pre-a audit: list active branches and feature ownership
31pre-b docs: define stack contract
31pre-c docs: define API response contract
31pre-d docs: define database contract
31pre-e docs: define frontend module contract
31pre-f docs: define branch integration contract
31pre-g test: add documentation contract checker
31pre-h docs: record phase 0 baseline
```

## Phase 1 — Frontend Stabilization

Milestone:

```text
31a chore: add prettier, eslint, editorconfig
31b refactor(frontend): extract constants and storage helpers
31c refactor(frontend): extract dashboard and auth layouts
31d refactor(frontend): extract shared UI components
31d-1 docs(frontend): document phase 1 stabilization result
```

## Phase 2 — Feature Modularization and Routing

Milestone:

```text
31e refactor(siswa): extract siswa pages, table, filters, and form
31f refactor(jurusan): extract jurusan pages, card, and form
31g refactor(ruangan): extract ruangan pages, card, and form
31h refactor(router): replace manual client routing with preact-router
31h-1 docs(frontend): document feature modularization and routing result
```

## Phase 3 — API Layer and Backend Foundation

Milestone:

```text
31i refactor(api): introduce centralized apiClient and feature services
31m backend: add public front controller and FastRoute bootstrap
31n backend: add PHP-DI container definitions
31o backend: add admin siswa, jurusan, and ruangan controllers
31o-1 docs(api): document phase 3 API and backend foundation
```

## Phase 4 — Data Source Migration and Final Documentation Sync

Urutan domain sengaja dimulai dari referensi, lalu data utama.

Milestone:

```text
31k refactor(jurusan): replace localStorage jurusan with jurusanService API
31l refactor(ruangan): replace localStorage ruangan with ruanganService API
31j refactor(siswa): replace localStorage siswa with siswaService API
31p docs: sync stack naming, routes, architecture, and development guide
31p-1 docs(release): document phase 4 migration and final handoff
```

## Why jurusan and ruangan before siswa?

Siswa adalah data utama yang bergantung pada referensi jurusan dan kelas. Migrasi jurusan lebih dulu mengurangi risiko data siswa menyimpan nilai teks yang tidak konsisten.

## Exit Criteria

Short-term cycle dianggap selesai apabila:

- `app.jsx` tidak lagi menjadi file monolitik;
- route frontend sudah deklaratif;
- `apiClient` menjadi satu pintu request;
- endpoint CRUD dasar tersedia;
- data siswa, jurusan, dan ruangan berasal dari API;
- dokumentasi dan kontrak sinkron dengan implementasi.
