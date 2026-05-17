# Presensi Siswa Rajasa

Aplikasi presensi siswa berbasis QR untuk SMKS Rajasa. Sistem dirancang untuk mendukung presensi rombel, presensi piket untuk siswa terlambat, rekap per jam pembelajaran, serta pengelolaan data siswa berdasarkan tahun ajaran.

Repositori ini sedang dibersihkan dari dokumentasi dan file development lama. Dokumentasi di repo ini hanya boleh mengacu pada struktur kode, konfigurasi, schema database, dan kebutuhan MVP yang masih aktif.

## Status Project

Status saat ini:

- Environment Docker sudah tersedia.
- Nginx digunakan sebagai reverse proxy.
- Backend memakai PHP 8.2 FPM.
- Frontend memakai Vite.
- Database memakai MySQL 8.0.
- Backend API masih dalam tahap persiapan boilerplate.
- Schema database MVP sudah disiapkan terpisah dari seed.

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
| Testing Backend         | PHPUnit             |

## Cara Menjalankan Development

Salin file environment:

```bash
cp .env.example .env
```

Jalankan container:

```bash
docker compose up -d --build
```

Cek service:

```text
http://localhost:8080
http://localhost:8080/api/health
```

## Struktur Project

```text
backend/
frontend/
docs/
scripts/
docker-compose.yml
nginx.conf
```

## Struktur Dokumentasi

```text
docs/
  ARCHITECTURE.md
  API.md
  DATABASE.md
  TESTING.md
```

## Database

Schema dan seed database akan diletakkan di:

```text
backend/database/schema/
backend/database/seeds/
```

Urutan eksekusi database:

```text
1. Schema utama
2. Seed permission MVP
3. Seed akun demo
```

## Branch

Prefix branch project ini memakai:

```text
alfy/
```

Contoh:

```text
alfy/nginx-configure
alfy/cleanup-dev-sampah
alfy/backend-boilerplate
alfy/backend-phpunit
alfy/backend-auth-permission
alfy/backend-presensi-session
alfy/backend-presensi-scan
```

## Prinsip Development

1. Gunakan isi script nyata sebagai acuan.
2. Jangan mengandalkan catatan lama jika tidak sesuai kode.
3. Jangan menambah fitur di luar MVP tanpa alasan teknis.
4. Setiap fitur backend wajib punya test.
5. Schema database dan seed harus dipisah.
6. Dokumentasi harus diperbarui jika struktur kode berubah.

## Scope MVP

MVP fokus pada:

- login user,
- role dan permission sederhana,
- akun guru, staff, admin, intern, dan siswa,
- presensi mode rombel,
- presensi mode piket untuk siswa terlambat,
- scan QR berbasis payload nama dan NISN,
- presensi per jam pembelajaran,
- warning jika kartu QR beda rombel,
- laporan presensi,
- import data siswa,
- audit edit presensi,
- error log sistem.

Di luar MVP:

- policy engine,
- group engine,
- ESP32,
- plotting ruangan,
- presensi berbasis ruang,
- arsip media,
- notifikasi kompleks,
- multi sekolah,
- integrasi orang tua.
