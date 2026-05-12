# DEV PLAN PHASE 3 — API Layer and Backend Foundation

**Kode fase:** FASE-31C  
**Rentang backlog:** `31i`, `31m`, `31n`, `31o` + `31o-1`  
**Tujuan utama:** membuat satu pintu komunikasi API di frontend dan fondasi backend custom PHP API.

## 1. Milestone

```text
31i refactor(api): introduce centralized apiClient and feature services
31m backend: add public front controller and FastRoute bootstrap
31n backend: add PHP-DI container definitions
31o backend: add admin siswa, jurusan, and ruangan controllers
31o-1 docs(api): document phase 3 API and backend foundation
```

## 2. Critical Rule

Backend harus memakai namespace:

```text
Rajasa\PresensiLabBackend\
```

Jangan memakai namespace `App\` kecuali stack berubah resmi.

## 3. Target Backend Files

```text
backend/public/index.php
backend/src/Bootstrap/routes.php
backend/src/Bootstrap/container.php
backend/src/Controllers/HealthController.php
backend/src/Controllers/AuthController.php
backend/src/Controllers/Admin/SiswaController.php
backend/src/Controllers/Admin/JurusanController.php
backend/src/Controllers/Admin/RuanganController.php
```

## 4. Acceptance Criteria

- `GET /api/health` berjalan;
- endpoint CRUD minimal tersedia;
- response memakai envelope contract;
- `apiClient` menjadi satu-satunya pintu request frontend;
- tidak ada token palsu;
- dokumentasi API diperbarui.
