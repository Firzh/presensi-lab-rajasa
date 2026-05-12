# Stack Contract

## 1. Purpose

Dokumen ini mengunci pilihan stack teknis Presensi Lab Rajasa agar repo tidak berkembang dengan asumsi yang saling bertentangan.

## 2. Approved Stack

| Layer | Approved Stack | Status |
|---|---|---|
| Frontend runtime | Preact | Approved |
| Frontend build tool | Vite | Approved |
| Frontend router | preact-router | Approved target |
| Backend language | PHP 8.2 | Approved |
| Backend framework style | Custom PHP API | Approved |
| Backend router | nikic/fast-route | Approved |
| Dependency injection | php-di/php-di | Approved |
| Database abstraction | illuminate/database | Approved |
| Environment loader | vlucas/phpdotenv | Approved |
| Database engine | MySQL 8.0 | Approved |
| Web server | Nginx + PHP-FPM | Approved |
| Runtime | Docker Compose | Approved |

## 3. Not Approved for Current Cycle

Teknologi berikut tidak boleh dipakai pada siklus stabilisasi awal:

- Laravel full framework;
- NestJS;
- Prisma;
- Express.js backend;
- React full migration;
- Next.js;
- PostgreSQL;
- Redis;
- queue worker production;
- AI recognition runtime;
- WhatsApp/email notification service.

Teknologi tersebut boleh dibahas kembali setelah fase 4 selesai.

## 4. Backend Namespace Contract

Namespace utama backend:

```text
Rajasa\PresensiLabBackend\
```

Semua class backend di `backend/src` harus mengikuti namespace tersebut.

Contoh:

```php
namespace Rajasa\PresensiLabBackend\Controllers;
```

Tidak boleh memakai namespace `App\` kecuali stack berubah secara resmi.

## 5. Backend Folder Contract

Struktur backend target:

```text
backend/
  composer.json
  public/
    index.php
  src/
    Bootstrap/
      app.php
      routes.php
      container.php
    Config/
      database.php
    Controllers/
      HealthController.php
      AuthController.php
      Admin/
        SiswaController.php
        JurusanController.php
        RuanganController.php
    Services/
      AuthService.php
      SiswaService.php
      JurusanService.php
      RuanganService.php
    Repositories/
      SiswaRepository.php
      JurusanRepository.php
      RuanganRepository.php
    Models/
      Siswa.php
      Jurusan.php
      Ruangan.php
    Http/
      JsonResponse.php
      Request.php
      Validator.php
    Support/
      Env.php
      Str.php
  database/
    migrations/
    seeders/
```

## 6. Frontend Folder Contract

Struktur frontend target:

```text
frontend/src/
  main.jsx
  app.jsx
  constants/
    routes.js
    storageKeys.js
    options.js
  lib/
    apiClient.js
    apiError.js
    storage.js
  components/
    layout/
    ui/
  features/
    auth/
    siswa/
    jurusan/
    ruangan/
  routes/
    AppRouter.jsx
```

## 7. Comment and Naming Cleanup

Komentar yang menyebut backend sebagai Laravel harus diganti apabila implementasi tetap custom PHP API.

Contoh yang harus diubah:

```text
Service Backend (Laravel)
Install dependensi Laravel
Fallback ke index.php untuk routing Laravel
```

Menjadi:

```text
Service Backend (Custom PHP API)
Install dependensi PHP backend
Fallback ke PHP front controller API
```

## 8. Stack Change Rule

Perubahan stack hanya boleh dilakukan melalui RFC:

```text
docs/rfcs/RFC-YYYYMMDD-stack-change-title.md
```

RFC wajib menjelaskan:

- alasan perubahan;
- konsekuensi migration;
- risiko server;
- risiko tim;
- estimasi perubahan file;
- rollback plan;
- acceptance criteria.
