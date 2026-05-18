# Presensi Siswa Rajasa

Aplikasi presensi siswa berbasis QR untuk SMKS Rajasa.

Sistem ini dirancang untuk mendukung presensi rombel, presensi piket untuk siswa terlambat, presensi per jam pembelajaran, warning kartu QR tidak sesuai rombel, laporan presensi, serta pengelolaan data berbasis tahun ajaran.

## Status Project

Status saat ini:

- Dokumentasi lama berbasis contract pack sudah dibersihkan.
- Folder `examples/api` sudah dihapus.
- Script `check_docs_contracts.py` sudah dihapus.
- Environment development Docker sudah dirapikan.
- Backend boilerplate Composer based sudah dibuat.
- PHPUnit baseline sudah berjalan.
- Database MVP schema dan seed sudah masuk repo.
- Auth dan permission baseline sudah berjalan.
- Endpoint `/api/health`, `/api/auth/login`, `/api/auth/logout`, dan `/api/me` sudah tersedia.
- Tahap berikutnya adalah Presensi Sesi.

## Stack

| Bagian                  | Teknologi           |
| ----------------------- | ------------------- |
| Frontend                | Vite                |
| Backend                 | PHP 8.2 FPM         |
| Database                | MySQL 8.0           |
| Web Server              | Nginx               |
| Package Manager Backend | Composer            |
| Routing Backend         | FastRoute           |
| Dependency Injection    | PHP-DI              |
| Database Layer          | Illuminate Database |
| Environment Loader      | vlucas/phpdotenv    |
| Testing Backend         | PHPUnit 11          |

## Cara Menjalankan Development

Salin environment:

```bash
cp .env.example .env
```

Jalankan container:

```bash
docker compose up -d --build
```

Cek container:

```bash
docker compose ps
```

Cek backend:

```bash
curl http://localhost:8080/api/health
```

## Database Lokal

Reset database demo:

```bash
./scripts/db-reset-demo.sh
```

Script ini menjalankan:

1. Drop database lama.
2. Buat database baru.
3. Import schema MVP.
4. Seed permission MVP.
5. Seed akun demo.

## Akun Demo

Password demo:

```text
Rajasa@123
```

Akun utama:

| Username             | Tipe        |
| -------------------- | ----------- |
| `superadmin.demo`    | super_admin |
| `admin.demo`         | admin       |
| `guru.demo`          | guru        |
| `staff.demo`         | staff       |
| `intern.demo`        | intern      |
| `siswa.demo`         | siswa       |
| `siswa.warning.demo` | siswa       |

## Testing

Jalankan semua test backend:

```bash
./scripts/test-backend.sh
```

Jalankan unit test saja:

```bash
./scripts/test-backend-unit.sh
```

Jalankan feature test saja:

```bash
./scripts/test-backend-feature.sh
```

## Endpoint Penting

```text
GET  /api/health
POST /api/auth/login
POST /api/auth/logout
GET  /api/me
```

## Struktur Project

```text
backend/
  boilerplate/
  database/
  public/
  routes/
  src/
  tests/

frontend/
docs/
scripts/
docker-compose.yml
nginx.conf
```

## Branch

Prefix branch project:

```text
nama/feature
```

Contoh:

```text
alfy/cleanup-dev-sampah
alfy/backend-boilerplate
alfy/backend-phpunit
alfy/backend-database-assets
alfy/backend-auth-permission
alfy/backend-presensi-session
```

## Scope MVP

Masuk MVP:

- login user,
- role dan permission sederhana,
- akun guru, staff, admin, intern, dan siswa,
- presensi mode rombel,
- presensi mode piket untuk siswa terlambat,
- scan QR berbasis payload nama dan NISN,
- presensi per jam pembelajaran,
- warning jika kartu QR beda rombel,
- laporan presensi,
- import data,
- audit edit presensi,
- error log sistem.

Tidak masuk MVP:

- ESP32,
- ruangan,
- plotting rombel,
- policy engine,
- group engine,
- arsip media,
- notifikasi kompleks,
- multi sekolah,
- integrasi orang tua,
- queue worker,
- Redis,
- Laravel penuh.
