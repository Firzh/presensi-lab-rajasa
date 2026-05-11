# DEV PLAN PHASE 0 — Contract and Branch Baseline

**Kode fase:** FASE-31PRE  
**Rentang backlog:** `31pre-a` sampai `31pre-h`  
**Tujuan utama:** menyiapkan kontrak dan baseline integrasi sebelum refactor frontend/backend dilakukan.  
**Prinsip utama:** jangan menyentuh fitur besar sebelum sumber kebenaran branch, stack, route, API, database, dan frontend boundary jelas.

## 1. Latar belakang teknis

Presensi memiliki beberapa branch fitur aktif. Kode manajemen siswa, jurusan, ruangan, landing page, dan dashboard siswa tidak boleh langsung digabung karena risiko konflik `app.jsx`, route, env, auth, dan storage sangat tinggi.

Phase 0 bertugas mengubah repo dari mode “branch fitur bebas” menjadi “branch integrasi berbasis kontrak”.

## 2. Sasaran fase

Setelah fase ini selesai:

1. branch integrasi resmi tersedia;
2. stack contract dikunci;
3. API response contract dikunci;
4. database contract awal dikunci;
5. frontend module contract dikunci;
6. branch integration contract dikunci;
7. script pengecekan dokumentasi tersedia;
8. status implementasi diperbarui.

## 3. Milestone

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

## 4. 31pre-a — Audit active branches and feature ownership

### Tujuan

Menentukan branch mana yang menjadi sumber fitur untuk siswa, jurusan, ruangan, landing page, dan dashboard siswa.

### Langkah kerja

1. Jalankan:

```bash
git branch -a
```

2. Buat branch integrasi:

```bash
git checkout development
git pull
git checkout -b integration/contract-first-presensi
```

3. Bandingkan branch fitur:

```bash
git diff development..origin/alfy/manajemen-data-ruangan -- frontend/src/app.jsx
git diff development..origin/fashich/dashboard-siswa-page -- frontend/src
```

4. Catat fitur yang akan diambil dari setiap branch.

### Output

Update `docs/contracts/BRANCH_INTEGRATION_CONTRACT.md`.

## 5. 31pre-b — Define stack contract

### Tujuan

Menghapus ambiguitas Laravel/custom PHP dan React/Preact.

### Output

Update `docs/contracts/STACK_CONTRACT.md`.

## 6. 31pre-c — Define API response contract

### Tujuan

Menentukan envelope response agar frontend service tidak menebak bentuk data.

### Output

Update `docs/contracts/API_CONTRACT.md` dan `docs/contracts/ERROR_CONTRACT.md`.

## 7. 31pre-d — Define database contract

### Tujuan

Menentukan tabel awal siswa, jurusan, ruangan, users, roles, dan role_user.

### Output

Update `docs/contracts/DATABASE_CONTRACT.md`.

## 8. 31pre-e — Define frontend module contract

### Tujuan

Menentukan struktur folder dan batas import agar `app.jsx` tidak kembali membesar.

### Output

Update `docs/contracts/FRONTEND_CONTRACT.md` dan `docs/contracts/ROUTE_CONTRACT.md`.

## 9. 31pre-f — Define branch integration contract

### Tujuan

Menentukan cara menggabungkan branch fitur aktif secara aman.

### Output

Update `docs/contracts/BRANCH_INTEGRATION_CONTRACT.md`.

## 10. 31pre-g — Add documentation contract checker

### Tujuan

Membuat script sederhana untuk memastikan dokumen wajib tidak hilang.

### Output

`scripts/check_docs_contracts.py`.

## 11. 31pre-h — Record phase 0 baseline

### Tujuan

Mencatat status terbaru setelah kontrak dibuat.

### Output

Update:

- `docs/IMPLEMENTATION_STATUS.md`
- `CHANGELOG.md`

## 12. Acceptance Criteria

Phase 0 selesai jika:

- [ ] branch integrasi dibuat;
- [ ] dokumen kontrak tersedia;
- [ ] `python scripts/check_docs_contracts.py` berhasil;
- [ ] sumber branch untuk setiap fitur sudah dipetakan;
- [ ] tim sepakat tidak ada fitur baru sebelum Fase 1 berjalan.
