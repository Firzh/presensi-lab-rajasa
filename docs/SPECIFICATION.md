# Presensi Lab Rajasa Specification

## 1. System Identity

Presensi Lab Rajasa adalah sistem presensi laboratorium untuk SMKS Rajasa Surabaya. Sistem ini dirancang untuk mengelola data siswa, data jurusan, data ruangan, login pengguna, dan alur presensi laboratorium secara bertahap.

Sistem ini bukan hanya halaman frontend. Sistem ini harus diperlakukan sebagai aplikasi full-stack yang memiliki kontrak antarmuka antara frontend, backend, database, dan container runtime.

## 2. Current Implementation Scope

Lingkup implementasi awal yang dikunci oleh dokumen ini adalah:

- login dan logout dasar;
- layout dashboard admin;
- manajemen data siswa;
- manajemen data jurusan;
- manajemen data ruangan;
- health check backend;
- API CRUD dasar untuk domain siswa, jurusan, dan ruangan;
- migrasi sumber data dari `localStorage` ke backend API;
- dokumentasi kontrak dan test plan.

## 3. Explicitly Out of Scope

Fitur berikut tidak boleh masuk ke fase stabilisasi awal:

- AI recognition jobs;
- modul ujian;
- modul nilai;
- notifikasi WhatsApp;
- notifikasi email;
- dashboard analytics kompleks;
- upload/import Excel;
- QR presensi lanjutan;
- deployment production final;
- migrasi backend ke NestJS/Prisma.

Fitur tersebut boleh direncanakan setelah kontrak dasar stabil.

## 4. Architecture Principle

Presensi mengikuti prinsip:

```text
contract-first, feature-second
```

Artinya, struktur kontrak harus lebih dulu jelas sebelum fitur baru ditambahkan.

## 5. Stack Boundary

Stack yang dikunci:

| Layer | Contract |
|---|---|
| Frontend | Preact + Vite |
| Routing Frontend | `preact-router` |
| Backend | Custom PHP API |
| Backend Router | FastRoute |
| Backend DI | PHP-DI |
| Database Layer | Illuminate Database/Eloquent |
| Environment | vlucas/phpdotenv |
| Database | MySQL 8.0 |
| Web Server | Nginx + PHP-FPM |
| Runtime | Docker Compose |

Presensi tidak boleh disebut Laravel penuh selama struktur backend tetap custom PHP API.

## 6. Core Domains

### 6.1 Auth

Auth menangani login, logout, session, user aktif, dan role dasar.

### 6.2 Siswa

Siswa menangani data siswa, identitas siswa, jurusan, kelas, status, dan catatan.

### 6.3 Jurusan

Jurusan menangani daftar kompetensi keahlian/program keahlian yang menjadi referensi siswa dan ruangan.

### 6.4 Ruangan

Ruangan menangani data lab, kelas, workshop, kapasitas, lokasi, jaringan, fasilitas, dan status.

## 7. Frontend Contract Summary

Frontend harus memakai struktur modul:

```text
frontend/src/
  app.jsx
  main.jsx
  constants/
  lib/
  components/
  features/
    auth/
    siswa/
    jurusan/
    ruangan/
  routes/
```

`app.jsx` hanya boleh menjadi komposisi aplikasi. `app.jsx` tidak boleh lagi menampung seed data, seluruh halaman, seluruh form, seluruh tabel, dan seluruh route manual.

## 8. Backend Contract Summary

Backend harus memakai struktur:

```text
backend/
  public/index.php
  src/
    Bootstrap/
    Config/
    Controllers/
    Services/
    Repositories/
    Models/
    Http/
    Support/
  database/
    migrations/
    seeders/
```

Namespace PHP utama:

```text
Rajasa\PresensiLabBackend\
```

## 9. API Envelope Contract

Response sukses:

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "meta": {}
}
```

Response error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

## 10. Data Source Contract

Data bisnis utama tidak boleh menggunakan `localStorage` sebagai sumber kebenaran.

`localStorage` hanya boleh digunakan untuk:

- theme preference;
- non-sensitive UI preference;
- temporary development fixture apabila diberi flag dev-only.

## 11. Safety Boundary

Presensi harus menolak praktik berikut:

- token palsu buatan frontend;
- endpoint mutasi tanpa validasi;
- data bisnis utama hanya di browser;
- route frontend tanpa kontrak;
- tabel database tanpa constraint;
- environment variable tidak terdokumentasi;
- perubahan branch fitur langsung ke `development` tanpa integrasi.

## 12. Documentation Rule

Setiap selesai fase atau setiap 10 commit, dokumen wajib diperbarui:

- `README.md`
- `CHANGELOG.md`
- `docs/SPECIFICATION.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/DEV_PLAN_SHORT_TERM.md`
- `docs/TEST_PLAN.md`
- kontrak terkait di `docs/contracts/`
