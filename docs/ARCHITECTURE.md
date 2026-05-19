# Architecture

Dokumen ini menjelaskan arsitektur MVP Presensi Siswa Rajasa.

## Tujuan Sistem

Sistem dibuat untuk mencatat presensi siswa berbasis QR.

Mode utama:

1. Presensi rombel.
2. Presensi piket untuk siswa terlambat.

## Diagram Ringkas

```text
Browser
  ↓
Nginx
  ↓
Frontend Vite
  ↓
Backend PHP API
  ↓
MySQL
```

## Backend

Backend memakai PHP 8.2 FPM dan Composer.

Struktur utama:

```text
backend/
  boilerplate/
    app.php
    config.php
    container.php
    database.php
    routes.php

  public/
    index.php

  routes/
    api.php

  src/
    Core/
    Http/
    Models/
    Services/
    Repositories/
    Support/

  database/
    schema/
    seeds/

  tests/
    Unit/
    Feature/
    Support/
```

## Komponen Backend

| Komponen | Fungsi |
|---|---|
| `public/index.php` | Front controller |
| `boilerplate/app.php` | Entry aplikasi backend |
| `boilerplate/config.php` | Konfigurasi app, database, auth, CORS, presensi |
| `boilerplate/container.php` | Dependency injection |
| `boilerplate/database.php` | Boot Illuminate Database |
| `boilerplate/routes.php` | Load FastRoute dispatcher |
| `routes/api.php` | Daftar route API |
| `src/Core/Request.php` | Baca method, URI, query, body, header |
| `src/Core/Response.php` | Response JSON standar |
| `src/Core/ExceptionHandler.php` | Error response standar |
| `src/Core/RouteDispatcher.php` | Dispatch route ke handler |
| `src/Http/Middleware/CorsMiddleware.php` | CORS development |
| `src/Services/AuthService.php` | Login dan user aktif |
| `src/Services/TokenService.php` | Token stateless |
| `src/Services/PermissionService.php` | Role dan permission user |

## Auth

Auth memakai signed bearer token stateless.

Token berisi:

```text
user_id
iat
exp
```

Signature memakai `SESSION_SECRET`.

Tidak ada tabel token di MVP.

Konsekuensi:

- logout dilakukan di sisi client dengan menghapus token,
- revoke token server side belum tersedia,
- cukup untuk development dan MVP.

## Permission

Permission dibaca dari:

```text
user_roles
role_permissions
permissions
user_permissions
```

Urutan logika:

1. Ambil role aktif user.
2. Ambil permission dari role aktif.
3. Ambil custom permission user.
4. Gabungkan permission.
5. Hilangkan duplikasi.

Kolom permission utama:

```text
permissions.perm_slug
```

## Frontend

Frontend memakai Vite.

Frontend akan memakai endpoint:

```text
/api/auth/login
/api/me
/api/presensi/...
```

## Nginx

Nginx membagi request:

| Path | Tujuan |
|---|---|
| `/api/*` | Backend PHP-FPM |
| selain `/api/*` | Frontend Vite |

## Database

Database memakai MySQL 8.0.

Kelompok utama:

- IAM sederhana,
- master akademik,
- QR siswa,
- presensi,
- import,
- notifikasi dan error log.

## Trigger

Trigger dipakai untuk mengganti beberapa `CHECK constraint` yang bentrok dengan foreign key MySQL.

Contoh aturan:

- user siswa wajib punya `siswa_id`,
- user guru/staff/admin wajib punya `guru_id`,
- mode presensi rombel wajib punya `rombel_id`,
- mode presensi piket tidak boleh punya `rombel_id`.

Trigger hanya dipakai untuk guard rail database, bukan untuk semua logic bisnis.

## Testing

Testing memakai PHPUnit 11.

Jenis test:

- Unit test untuk service kecil,
- Feature test untuk endpoint API.

Current baseline mencakup:

- health endpoint,
- 404,
- 405,
- login,
- `/api/me`,
- token service,
- permission read.

## Non Scope MVP

Tidak masuk MVP:

- ESP32,
- ruangan,
- plotting rombel,
- presensi berbasis ruang,
- Laravel penuh,
- Redis,
- queue worker,
- policy engine,
- group engine,
- multi sekolah,
- integrasi orang tua.
