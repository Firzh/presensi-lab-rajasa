# Architecture

## 1. Target Architecture

Presensi Lab Rajasa memakai arsitektur full-stack sederhana dengan pemisahan tanggung jawab yang jelas.

```text
Browser
  ↓
Preact + Vite Frontend
  ↓
apiClient
  ↓
Nginx reverse proxy
  ↓
PHP-FPM Backend
  ↓
FastRoute
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Illuminate Database / Eloquent
  ↓
MySQL 8.0
```

## 2. Frontend Responsibility

Frontend bertanggung jawab untuk:

- menampilkan halaman;
- mengelola state UI;
- mengelola form;
- memvalidasi input dasar;
- memanggil service;
- menampilkan loading dan error state;
- melakukan mapping data API ke bentuk UI.

Frontend tidak bertanggung jawab untuk:

- membuat data seed sebagai sumber utama;
- menyimpan data bisnis di `localStorage`;
- membuat token login palsu;
- menentukan role tanpa validasi backend;
- melakukan query database.

## 3. Backend Responsibility

Backend bertanggung jawab untuk:

- menerima request API;
- melakukan validasi;
- menjalankan business rule;
- mengakses database;
- mengembalikan response sesuai envelope contract;
- mengelola auth/session;
- menjaga error handling konsisten.

Backend tidak bertanggung jawab untuk:

- menyimpan logic tampilan frontend;
- mengembalikan HTML dashboard;
- mencampur route frontend dan route API;
- menjalankan fitur production yang belum dikontrak.

## 4. Module Boundary

### 4.1 Frontend Boundary

```text
Page → Service → apiClient → Backend
```

Komponen UI tidak boleh memanggil `fetch` langsung.

### 4.2 Backend Boundary

```text
Route → Controller → Service → Repository → Model/Database
```

Controller tidak boleh berisi query panjang atau business rule kompleks.

## 5. Data Flow Example

Contoh alur tambah siswa:

```text
SiswaFormPage
  ↓ submit
siswaService.create(payload)
  ↓
apiClient.post('/admin/siswa', payload)
  ↓
POST /api/admin/siswa
  ↓
SiswaController::store
  ↓
SiswaService::create
  ↓
SiswaRepository::create
  ↓
MySQL table siswa
  ↓
API envelope response
  ↓
Frontend redirect/list refresh
```

## 6. Deployment Boundary

Dalam development:

```text
frontend: Vite dev server
backend: PHP-FPM
nginx: reverse proxy
mysql: database
```

Dalam production, Vite harus dibuild menjadi static assets. Development proxy tidak boleh dianggap production architecture.
