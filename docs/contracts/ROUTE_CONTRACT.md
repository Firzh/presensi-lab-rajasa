# Route Contract

## 1. Purpose

Kontrak ini mengunci route frontend dan API agar path tidak dibuat bebas di tiap branch.

## 2. Frontend Route Contract

### 2.1 Public Routes

| Route | Page | Status |
|---|---|---|
| `/` | Landing page atau redirect login | Planned |
| `/login` | LoginPage | Required |

### 2.2 Admin Routes

| Route | Page | Status |
|---|---|---|
| `/dashboard/admin` | Admin dashboard placeholder | Required |
| `/dashboard/admin/manajemen/data-siswa` | SiswaListPage | Required |
| `/dashboard/admin/manajemen/data-siswa/tambah` | SiswaFormPage create mode | Required |
| `/dashboard/admin/manajemen/data-siswa/:id/edit` | SiswaFormPage edit mode | Required |
| `/dashboard/admin/manajemen/data-jurusan` | JurusanListPage | Required |
| `/dashboard/admin/manajemen/data-jurusan/tambah` | JurusanFormPage create mode | Required |
| `/dashboard/admin/manajemen/data-jurusan/:id/edit` | JurusanFormPage edit mode | Required |
| `/dashboard/admin/manajemen/data-ruangan` | RuanganListPage | Required |
| `/dashboard/admin/manajemen/data-ruangan/tambah` | RuanganFormPage create mode | Required |
| `/dashboard/admin/manajemen/data-ruangan/:id/edit` | RuanganFormPage edit mode | Required |
| `/dashboard/admin/laporan` | Placeholder | Later |
| `/dashboard/admin/users` | Placeholder | Later |
| `/dashboard/admin/log-users` | Placeholder | Later |
| `/dashboard/admin/pengaturan` | Placeholder | Later |

### 2.3 Siswa Routes

| Route | Page | Status |
|---|---|---|
| `/dashboard/siswa` | DashboardSiswaPage | Planned |

## 3. Frontend Router Rule

Target router:

```text
preact-router
```

Route manual berbasis `window.history.pushState` harus dihentikan setelah fase 2.

## 4. API Route Prefix

Semua endpoint backend wajib memakai prefix:

```text
/api
```

## 5. Backend API Routes

### 5.1 Health

| Method | Path | Controller |
|---|---|---|
| GET | `/api/health` | HealthController::show |

### 5.2 Auth

| Method | Path | Controller |
|---|---|---|
| POST | `/api/login` | AuthController::login |
| POST | `/api/logout` | AuthController::logout |
| GET | `/api/me` | AuthController::me |

### 5.3 Admin Jurusan

| Method | Path | Controller |
|---|---|---|
| GET | `/api/admin/jurusan` | JurusanController::index |
| POST | `/api/admin/jurusan` | JurusanController::store |
| GET | `/api/admin/jurusan/{id}` | JurusanController::show |
| PUT | `/api/admin/jurusan/{id}` | JurusanController::update |
| DELETE | `/api/admin/jurusan/{id}` | JurusanController::destroy |

### 5.4 Admin Ruangan

| Method | Path | Controller |
|---|---|---|
| GET | `/api/admin/ruangan` | RuanganController::index |
| POST | `/api/admin/ruangan` | RuanganController::store |
| GET | `/api/admin/ruangan/{id}` | RuanganController::show |
| PUT | `/api/admin/ruangan/{id}` | RuanganController::update |
| DELETE | `/api/admin/ruangan/{id}` | RuanganController::destroy |

### 5.5 Admin Siswa

| Method | Path | Controller |
|---|---|---|
| GET | `/api/admin/siswa` | SiswaController::index |
| POST | `/api/admin/siswa` | SiswaController::store |
| GET | `/api/admin/siswa/{id}` | SiswaController::show |
| PUT | `/api/admin/siswa/{id}` | SiswaController::update |
| DELETE | `/api/admin/siswa/{id}` | SiswaController::destroy |

## 6. Route Change Rule

Setiap route baru wajib ditambahkan ke dokumen ini sebelum implementasi dinyatakan selesai.
