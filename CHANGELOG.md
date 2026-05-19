# Changelog

Semua perubahan penting dalam project ini dicatat di file ini.

Format:

```text
Added
Changed
Fixed
Removed
```

## [Unreleased]

### Added

- Menambahkan endpoint `POST /api/auth/login`.
- Menambahkan endpoint `POST /api/auth/logout`.
- Menambahkan endpoint `GET /api/me`.
- Menambahkan signed bearer token stateless untuk auth MVP.
- Menambahkan service auth, token, dan permission.
- Menambahkan middleware auth dan permission baseline.
- Menambahkan koneksi database memakai Illuminate Database.
- Menambahkan model awal `User`.
- Menambahkan PHPUnit baseline.
- Menambahkan test auth, `/api/me`, token, health, 404, dan 405.
- Menambahkan schema database MVP di `backend/database/schema`.
- Menambahkan seed permission MVP dan akun demo.
- Menambahkan script reset database demo.
- Menambahkan `.gitkeep` agar folder test kosong tetap ikut Git.
- Menambahkan room snapshot fields for presensi_sesi.

### Changed

- Mengubah namespace backend dari `PresensiLabBackend` menjadi `PresensiSiswa`.
- Mengubah dokumentasi project agar mengikuti implementasi nyata.
- Mengubah database menjadi fokus presensi siswa, bukan presensi lab.
- Mengubah constraint sensitif dari `CHECK` menjadi trigger jika kolom juga dipakai foreign key.
- Mengubah banyak foreign key histori dan audit menjadi `ON DELETE RESTRICT ON UPDATE RESTRICT`.
- Menyesuaikan seed akun demo agar `user_type` sesuai akun.
- Menyesuaikan permission reader agar membaca kolom `perm_slug`.

### Fixed

- Memperbaiki error schema pada `rombel`, `users`, `presensi_sesi`, `penempatan_siswa_rombel`, dan `rombel_wali_kelas`.
- Memperbaiki seed yang masih mengarah ke database lama.
- Memperbaiki seed akun demo yang masih memakai kolom lama.
- Memperbaiki mapping permission kosong pada response login.
- Memperbaiki test agar membaca environment testing dengan benar.
- Memperbaiki script database runner agar memakai `.env`.

### Removed

- Menghapus dokumentasi contract pack lama.
- Menghapus folder root `bootstrap/` lama.
- Menghapus folder `examples/api`.
- Menghapus script `check_docs_contracts.py`.
- Menghapus acuan terhadap ESP32, ruangan, plotting rombel, policy engine, group engine, arsip, dan notifikasi kompleks dari scope MVP.

## [0.5.0] - Auth and Permission Baseline

### Added

- Login dengan username dan password.
- Token stateless berbasis HMAC.
- Endpoint `/api/me`.
- Permission reader berbasis role dan user custom permission.
- Test auth dan token.

## [0.4.0] - Database Assets

### Added

- Schema database MVP.
- Seed permission MVP.
- Seed akun demo.
- Script reset database demo.

### Fixed

- Constraint database yang bentrok dengan MySQL foreign key behavior.

## [0.3.0] - PHPUnit Baseline

### Added

- PHPUnit 11.
- Test suite Unit dan Feature.
- Test `/api/health`, 404, dan 405.

## [0.2.0] - Backend Boilerplate

### Added

- Backend boilerplate Composer based.
- FastRoute routing.
- PHP-DI container.
- Response JSON standar.
- Request object.
- Exception handler.
- CORS middleware.
- Endpoint `/api/health`.

## [0.1.0] - Development Baseline

### Added

- Docker development environment.
- Nginx reverse proxy.
- Backend PHP-FPM.
- Frontend Vite.
- MySQL service.
