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

- Menambahkan endpoint presensi sesi:
  - `POST /api/presensi/sesi`
  - `GET /api/presensi/sesi/aktif`
  - `POST /api/presensi/sesi/{id}/pause`
  - `POST /api/presensi/sesi/{id}/resume`
  - `POST /api/presensi/sesi/{id}/finish`
- Menambahkan service `PresensiSessionService`.
- Menambahkan controller create, active, pause, resume, dan finish sesi.
- Menambahkan pilihan ruang pada sesi presensi: `kelas`, `lab-tkj-1`, `lab-tkj-2`, `lab-tkj-3`, `lab-tkj-4`, dan `piket`.
- Menambahkan `ruang_label_snapshot` untuk menyimpan label ruang sebagai histori sesi.
- Menambahkan validasi maksimal 3 jam pembelajaran per sesi.
- Menambahkan validasi jam pembelajaran harus berurutan.
- Menambahkan guard duplicate sesi aktif/suspended untuk rombel dan jam yang sama.
- Menambahkan guard bentrok ruang lab aktif/suspended pada tanggal dan jam yang sama.
- Menambahkan inisialisasi presensi `alpha` untuk siswa pada sesi rombel.
- Menambahkan test presensi sesi.
- Menambahkan test duplicate sesi rombel aktif pada jam yang sama.
- Menambahkan test pause, resume, dan finish sesi.

### Changed

- Mengubah endpoint presensi sesi dari status `planned` menjadi `implemented`.
- Mengubah dokumentasi database agar mencatat `ruang_pilihan`, `ruang_label_snapshot`, dan `presensi_sesi_jam.urutan`.
- Mengubah dokumentasi testing dengan status terbaru `16 tests, 56 assertions`.
- Menjaga logic ruang tetap ramping tanpa menghidupkan tabel ruangan lama.

### Fixed

- Memperbaiki insert sesi presensi dengan mengisi `session_uuid`.
- Memperbaiki `presensi_sesi_jam.urutan` agar mengikuti urutan jam yang dipilih.
- Memperbaiki test isolation agar sesi aktif dari test tidak mengganggu test berikutnya.

### Removed

- Menghapus dokumentasi contract pack lama.
- Menghapus folder root `bootstrap/` lama.
- Menghapus folder `examples/api`.
- Menghapus script `check_docs_contracts.py`.
- Menghapus acuan terhadap ESP32, ruangan, plotting rombel, policy engine, group engine, arsip, dan notifikasi kompleks dari scope MVP.

## [0.6.0] - Presensi Sesi

### Added

- Sesi presensi mode `rombel`.
- Sesi presensi mode `piket`.
- Pilihan ruang `kelas`, `lab-tkj-1` sampai `lab-tkj-4`, dan `piket`.
- Pause, resume, dan finish sesi.
- Guard bentrok ruang lab.
- Guard duplicate sesi rombel pada jam yang sama.
- Test presensi sesi.

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
