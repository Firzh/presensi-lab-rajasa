# Branch Integration Contract

## 1. Purpose

Dokumen ini mengatur cara menyatukan branch fitur aktif agar repo Presensi tidak rusak karena konflik `app.jsx`, route, environment, auth, dan storage.

## 2. Known Active Branches

Branch aktif yang perlu diaudit:

```text
development
alfy/manajemen-data-siswa
alfy/manajemen-data-jurusan
alfy/manajemen-data-ruangan
alfy/landing-page
fashich/dashboard-siswa-page
```

## 3. Integration Baseline

Buat branch integrasi resmi:

```bash
git checkout development
git pull
git checkout -b integration/contract-first-presensi
```

Semua ekstraksi dan refactor awal dilakukan di branch integrasi ini.

## 4. Source of Truth Priority

Prioritas sumber fitur awal:

| Domain | Source Candidate | Catatan |
|---|---|---|
| Data siswa | `alfy/manajemen-data-siswa` atau `alfy/manajemen-data-ruangan` | Pilih versi paling lengkap setelah diff audit. |
| Data jurusan | `alfy/manajemen-data-jurusan` atau `alfy/manajemen-data-ruangan` | Jangan duplikasi komponen. |
| Data ruangan | `alfy/manajemen-data-ruangan` | Kandidat baseline paling lengkap untuk tiga domain admin. |
| Dashboard siswa | `fashich/dashboard-siswa-page` | Ambil pola modularnya, bukan token palsu. |
| Landing page | `alfy/landing-page` | Integrasikan setelah route contract stabil. |

## 5. Merge Rule

Branch fitur tidak boleh langsung merge ke `development` apabila:

- masih menambah kode besar ke `app.jsx`;
- masih memakai `localStorage` sebagai database utama;
- memakai nama env tidak sesuai kontrak;
- menambahkan route tanpa update `ROUTE_CONTRACT.md`;
- menambahkan endpoint tanpa update `API_CONTRACT.md`;
- menambahkan tabel tanpa update `DATABASE_CONTRACT.md`.

## 6. Conflict Hotspots

File yang berisiko konflik tinggi:

```text
frontend/src/app.jsx
frontend/src/app.css
frontend/package.json
frontend/src/utils/api.js
frontend/src/utils/auth.js
backend/composer.json
docker-compose.yml
nginx.conf
.env.example
```

Perubahan pada file tersebut harus direview manual.

## 7. Integration Checklist

Sebelum merge branch fitur ke branch integrasi:

- [ ] fitur sudah dipetakan ke domain;
- [ ] route sudah dipetakan ke `ROUTE_CONTRACT.md`;
- [ ] data shape sudah dipetakan ke `API_CONTRACT.md`;
- [ ] field database sudah dipetakan ke `DATABASE_CONTRACT.md`;
- [ ] tidak ada token palsu;
- [ ] tidak ada `fetch` langsung di komponen;
- [ ] tidak ada seed data sebagai sumber utama;
- [ ] tidak ada route manual baru;
- [ ] tidak ada env baru tanpa kontrak.

## 8. Branch Cleanup Rule

Setelah fitur berhasil masuk ke branch integrasi dan lolos test:

```text
feature branch → archive or delete after merge
```

Jangan biarkan branch lama tetap aktif dan dikembangkan paralel tanpa rebase.
