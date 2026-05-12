# DEV PLAN PHASE 4 — Data Source Migration and Final Documentation Sync

**Kode fase:** FASE-31D  
**Rentang backlog:** `31k`, `31l`, `31j`, `31p` + `31p-1`  
**Tujuan utama:** memindahkan sumber data dari `localStorage` ke backend API dan menyinkronkan dokumentasi final.

## 1. Milestone

```text
31k refactor(jurusan): replace localStorage jurusan with jurusanService API
31l refactor(ruangan): replace localStorage ruangan with ruanganService API
31j refactor(siswa): replace localStorage siswa with siswaService API
31p docs: sync stack naming, routes, architecture, and development guide
31p-1 docs(release): document phase 4 migration and final handoff
```

## 2. Why This Order

Migrasi dimulai dari jurusan dan ruangan karena keduanya menjadi referensi sebelum data siswa dimigrasikan penuh.

## 3. Required Result

- data jurusan berasal dari API;
- data ruangan berasal dari API;
- data siswa berasal dari API;
- seed data frontend dipindah ke fixture dev-only atau dihapus;
- `localStorage` tidak lagi menjadi database utama;
- refresh halaman tidak menghilangkan data;
- dokumentasi final sinkron.

## 4. Acceptance Criteria

- CRUD jurusan berjalan via API;
- CRUD ruangan berjalan via API;
- CRUD siswa berjalan via API;
- frontend punya loading, error, dan empty state;
- test plan manual lolos;
- implementation status diperbarui.
