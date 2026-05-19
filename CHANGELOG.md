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

- Menambahkan Tahap 7: Scan Readiness Import.
- Menambahkan endpoint `POST /api/import/scan-readiness`.
- Menambahkan endpoint `GET /api/import/jobs`.
- Menambahkan endpoint `GET /api/import/jobs/{id}/rows`.
- Menambahkan service `ScanReadinessImportService`.
- Menambahkan controller import scan readiness.
- Menambahkan import minimal data siswa dari CSV dengan kolom:
  - `NISN`
  - `NAMA`
  - `KELAS`
- Menambahkan parsing kelas dari format seperti `10 AKL`, `11 TKJ`, atau `12 TP 2`.
- Menambahkan pembentukan atau update data:
  - `siswa`
  - `jurusan`
  - `rombel`
  - `penempatan_siswa_rombel`
  - `siswa_qr`
- Menambahkan pencatatan import ke `import_jobs`.
- Menambahkan pencatatan baris error ke `import_row_logs`.
- Menambahkan script `scripts/import-scan-readiness.sh`.
- Menambahkan script `scripts/db-reset-import-demo.sh`.
- Menambahkan test import scan readiness.

### Fixed

- Menyesuaikan `import_jobs` dengan schema nyata:
  - `import_code`
  - `import_type`
  - `tahun_ajaran_id`
  - `semester`
  - `created_by`
  - `valid_rows`
  - `error_rows`
  - `inserted_rows`
  - `updated_rows`
- Menyesuaikan `import_row_logs` dengan schema nyata:
  - `import_id`
  - `row_number`
  - `row_status`
  - `source_payload_json`
  - `message`
- Menjaga NISN tetap sebagai string agar nol depan tidak hilang.
- Memastikan `siswa_qr` dipakai sebagai referensi pencocokan payload QR hasil scan, bukan untuk membuat gambar QR.

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

## [0.7.0] - Scan Readiness Import

### Added

- Import CSV siswa minimal untuk persiapan scan QR.
- Auto create/update siswa.
- Auto create/update jurusan dan rombel dari kolom `KELAS`.
- Auto create/update `siswa_qr`.
- Import jobs dan row logs.
- Script import CSV dari folder `backend/database/data`.
- Reset helper jika hasil import salah.

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
