# Implementation Status

Dokumen ini mencatat status implementasi Presensi Lab Rajasa berdasarkan kontrak yang disepakati.

## 1. Overall Status

Status saat ini:

```text
contract baseline phase
```

Proyek belum dianggap siap produksi. Fokus saat ini adalah menstabilkan struktur repo, menyatukan branch fitur aktif, memecah frontend, menyiapkan backend API, dan memindahkan data bisnis dari `localStorage` ke database.

## 2. Stable Decisions

Keputusan yang sudah dikunci:

| Area | Keputusan |
|---|---|
| Frontend | Preact + Vite |
| Backend | Custom PHP API |
| Router Backend | FastRoute |
| DI Container | PHP-DI |
| Database Layer | Illuminate Database/Eloquent |
| Database | MySQL 8.0 |
| Namespace Backend | `Rajasa\PresensiLabBackend\` |
| API Base Env | `VITE_API_BASE_URL` |
| Source Data Target | Backend API + MySQL |

## 3. Implemented / Available

Kondisi yang sudah terlihat atau sudah tersedia sebagai baseline awal:

- repo publik `presensi-lab-rajasa`;
- branch default `development`;
- frontend dengan Vite/Preact;
- backend dengan `composer.json` yang mengarah ke FastRoute, PHP-DI, Illuminate Database, dan Dotenv;
- Docker Compose dengan service `db`, `backend`, `frontend`, dan `nginx`;
- branch fitur aktif untuk data siswa, data jurusan, data ruangan, landing page, dan dashboard siswa;
- implementasi frontend fitur pada branch tertentu masih banyak berada dalam `app.jsx`.

## 4. Not Yet Stable

Bagian berikut belum dianggap stabil:

- API contract final;
- database schema final;
- route contract final;
- auth contract final;
- service layer frontend;
- backend controller/service/repository;
- migration strategy;
- test suite;
- CI pipeline;
- deployment production.

## 5. Known Technical Debt

| Debt | Risiko | Tindakan |
|---|---|---|
| `app.jsx` terlalu besar | Konflik merge dan sulit review | Pecah ke layout, components, features, routes |
| Data bisnis memakai `localStorage` | Tidak bisa multi-user dan lintas perangkat | Migrasi ke API dan database |
| Branch fitur aktif terpisah | Konflik integrasi | Buat branch integrasi dan branch contract |
| Env API tidak konsisten | Frontend memanggil endpoint salah | Gunakan `VITE_API_BASE_URL` saja |
| Docker/Nginx masih menyebut Laravel | Ambiguitas stack | Ubah komentar dan struktur menjadi custom PHP API |
| Auth belum jelas | Sesi palsu dan akses tidak valid | Ikuti `AUTH_CONTRACT.md` |
| Belum ada error contract | Error handling tidak konsisten | Ikuti `ERROR_CONTRACT.md` |

## 6. Current Safe Flow

Alur aman pengembangan saat ini:

```text
Contract update
  ↓
Branch integration audit
  ↓
Frontend stabilization
  ↓
Feature modularization
  ↓
API client standardization
  ↓
Backend foundation
  ↓
Data migration
  ↓
Contract tests + manual acceptance
  ↓
Documentation sync
```

## 7. Blockers

Blocker utama sebelum produksi:

1. belum ada schema database final;
2. belum ada controller backend real;
3. belum ada API CRUD yang stabil;
4. belum ada auth/session yang aman;
5. belum ada test minimal;
6. belum ada branch integration baseline.

## 8. Next Milestone

Milestone berikutnya adalah:

```text
Milestone 00 — Contract and Branch Baseline
```

Output milestone:

- kontrak stack selesai;
- kontrak branch selesai;
- kontrak API awal selesai;
- kontrak database awal selesai;
- kontrak frontend awal selesai;
- branch integrasi dibuat;
- fitur siswa, jurusan, dan ruangan dipetakan ke file sumber yang benar.
