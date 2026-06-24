# Architecture

Branch acuan: `alfy/combine`

Dokumen ini merangkum arsitektur MVP Presensi Siswa Rajasa secara singkat.

## Tujuan Sistem

Sistem mencatat presensi siswa berbasis QR.

Mode utama:

| Mode     | Fungsi                                 |
| -------- | -------------------------------------- |
| `rombel` | Presensi siswa sesuai rombel           |
| `piket`  | Presensi siswa terlambat lintas rombel |

## Stack

| Layer          | Teknologi             |
| -------------- | --------------------- |
| Frontend       | Preact + Vite         |
| Styling        | Tailwind CSS via Vite |
| Backend        | PHP 8.2 FPM           |
| Routing        | FastRoute             |
| DI             | PHP-DI                |
| Database layer | Illuminate Database   |
| Database       | MySQL 8               |
| Web server     | Nginx                 |
| Test           | PHPUnit 11            |
| Dev env        | Docker Compose        |

Catatan:

- Backend bukan Laravel.
- Tailwind CDN tidak dipakai.
- `allowedHosts: true` dipakai untuk demo Cloudflare Quick Tunnel.

## Alur Request

```text
Browser / HP
  -> Vite dev server
  -> proxy /api
  -> Nginx
  -> PHP-FPM backend
  -> MySQL
```

Demo HP:

```text
HP HTTPS
  -> Cloudflare Quick Tunnel
  -> Vite /dev/scan
  -> proxy /api
  -> Backend API
```

## Struktur Ringkas

```text
backend/
  routes/api.php
  src/Core/
  src/Http/Controllers/
  src/Http/Middleware/
  src/Services/
  database/schema/
  database/seeds/
  tests/

frontend/
  src/features/presensi-scan/
  src/pages/dev/
  src/app.jsx

docs/
scripts/
```

## Modul Backend Aktif

| Modul        | Komponen utama                                                                                                       | Fungsi                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Auth         | `AuthService`, `TokenService`                                                                                        | Login dan token                                                             |
| Permission   | `PermissionService`, `PermissionMiddleware`                                                                          | Guard akses                                                                 |
| Import       | `ImportController, ImportFileReaderService, ImportAutoDetectService, ImportColumnMapper, ScanReadinessImportService` | Import one-gate CSV/XLSX, auto-detect header, lalu proses siswa, rombel, QR |
| Rombel       | `RombelController`                                                                                                   | Dropdown rombel aktif                                                       |
| Sesi         | `PresensiSessionService`                                                                                             | Buat, pause, resume, finish sesi                                            |
| Timeout sesi | `PresensiSessionTimeoutService`                                                                                      | Expire sesi idle 5 menit                                                    |
| Warning sesi | `PresensiSesiWarningCheckController`                                                                                 | Cek jam pernah dipakai hari ini                                             |
| Scan QR      | `PresensiScanService`, `QrPayloadService`                                                                            | Parse QR dan proses fallback no absen                                       |
| Manual edit  | `PresensiManualEditService`                                                                                          | Edit presensi dan audit                                                     |
| Audit demo   | `PresensiAuditController`                                                                                            | Baca hasil scan terkini                                                     |
| Laporan     | `ReportController`, `ReportService`                                                                                  | Filter dan ringkasan laporan presensi                                       |
| Export       | `ReportExportController`, `Services/Exporters/*`                                                                     | Export laporan CSV, XLSX, PDF, dan DOCX                                     |
| Settings     | `SettingsController`, `SettingsService`                                                                              | Pengaturan, backup, restore data-only, jadwal rombel, dan aturan terlambat  |
| Jurusan      | `JurusanController`, `JurusanService`                                                                                | CRUD jurusan aktif/nonaktif                                                 |
| Admin user   | `AdminUserController`, `AdminUserService`, `UserActivityController`, `UserActivityService`                            | Kelola user dan baca log aktivitas                                          |

## Modul Frontend Management

| Modul | Komponen API | Fungsi |
| --- | --- | --- |
| Laporan | `laporanApi.js` | Filter laporan dan export file |
| Pengaturan | `settingsApi.js` | Backup, preview restore, restore, jadwal rombel, dan aturan terlambat |
| Jurusan dan user | `jurusanApi.js`, `adminUsersApi.js` | Kelola master jurusan, user, dan log aktivitas |

## Modul Frontend Dev

| Halaman                 | Fungsi                                 |
| ----------------------- | -------------------------------------- |
| `/dev/scan`             | Demo login, sesi, scan QR, akhiri sesi |
| `/dev/attendance-audit` | Demo hasil presensi terkini            |

Komponen frontend penting:

```text
useQrScanner.js
presensiScanApi.js
DevScanPage.jsx
DevAttendanceAuditPage.jsx
```

## Alur Import

```text
CSV data siswa
  -> POST /api/import/scan-readiness
  -> ScanReadinessImportService
  -> jurusan, rombel, siswa, siswa_qr
  -> import_jobs, import_row_logs
```

```text
CSV/XLSX one-gate
  -> POST /api/import
  -> ImportFileReaderService
  -> ImportAutoDetectService
  -> ImportColumnMapper
  -> ScanReadinessImportService
```

Import saat ini:

- membaca `NISN`, `NAMA`, `KELAS`,
- membentuk rombel dinamis,
- menjaga NISN sebagai string,
- mencegah rombel bernomor collapse.
- import advanced membaca `.csv` dan `.xlsx`,
- Tahap 10.1 hanya mengaktifkan tipe `siswa`; tipe `guru` dan `wali_kelas` masih `disabled`.

## Alur Sesi Presensi

```text
User login
  -> POST /api/presensi/sesi/check-warning
  -> popup jika jam pernah dipakai
  -> POST /api/presensi/sesi
  -> presensi_sesi
  -> presensi_sesi_jam
  -> presensi_jam_siswa awal alpha
```

Aturan utama:

- mode `rombel` wajib `rombel_id`,
- mode `piket` tidak memakai `rombel_id`,
- jam maksimal 3 dan harus berurutan,
- sesi aktif idle 5 menit menjadi `expired`,
- heartbeat menjaga sesi tetap aktif.

## Alur Scan QR

```text
Kamera membaca QR
  -> QrPayloadService parse nama dan NISN
  -> lookup siswa_qr
  -> validasi sesi aktif
  -> validasi rombel jika mode rombel
  -> tulis presensi_scan_log
  -> update presensi_jam_siswa jika valid
```

## Alur Fallback No Absen

```text
Admin input no absen
  -> PresensiScanService hitung siswa aktif per rombel sesi
  -> urut nama_lengkap ASC, siswa_id ASC
  -> tulis presensi_scan_log
  -> update presensi_jam_siswa menjadi hadir
```

Status scan:

| Status     | Arti                                |
| ---------- | ----------------------------------- |
| `berhasil` | Presensi masuk                      |
| `warning`  | QR valid, beda rombel               |
| `invalid`  | QR tidak dikenal                    |
| `ditolak`  | Duplicate atau tidak boleh diproses |

Warning tidak di-resolve. Warning tetap menjadi log kejadian.

## Alur Manual Edit

```text
GET /api/presensi/jam-siswa
  -> pilih presensi
  -> PATCH /api/presensi/jam-siswa/{id}
  -> update presensi_jam_siswa
  -> insert presensi_edit_log
```

Edit manual wajib punya alasan. Alasan tersedia dari:

```text
GET /api/presensi/edit-reasons
```

## Alur Audit Demo

```text
/dev/attendance-audit
  -> GET /api/presensi/audit/latest
  -> presensi_scan_log
  -> presensi_jam_siswa
  -> tampil tabel scan dan presensi
```

Endpoint ini read-only.

## Database Inti

| Kelompok | Tabel                                                                                                |
| -------- | ---------------------------------------------------------------------------------------------------- |
| IAM      | `users`, `roles`, `permissions`, `user_roles`, `role_permissions`                                    |
| Akademik | `tahun_ajaran`, `jurusan`, `rombel`, `jam_pembelajaran`                                              |
| Siswa    | `siswa`, `penempatan_siswa_rombel`, `siswa_qr`                                                       |
| Import   | `import_jobs`, `import_row_logs`                                                                     |
| Presensi | `presensi_sesi`, `presensi_sesi_jam`, `presensi_jam_siswa`, `presensi_scan_log`, `presensi_edit_log` |

## Implementasi Terbaru dari Sisi Arsitektur

Tidak ada perubahan schema database pada penambahan terbaru.

Perubahan arsitektur terbaru:

| Area               | Perubahan                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Backend sesi       | Tambah timeout service dan heartbeat controller                                                                          |
| Backend sesi       | Tambah warning check sebelum create sesi                                                                                 |
| Backend audit      | Tambah endpoint audit presensi terkini                                                                                   |
| Frontend scan      | Tambah tombol akhiri sesi                                                                                                |
| Frontend audit     | Tambah halaman tabel audit presensi                                                                                      |
| Frontend scanner   | Improve kamera HP dengan crop, qrbox, dan track constraints                                                              |
| Script audit       | `check-successful-attendance.sh` ikut mengecek warning                                                                   |
| Backend core       | Rapikan HTTP core: `Response`, `Request`, `RouteDispatcher`, `HttpException`, `ExceptionHandler`, dan `RequestValidator` |
| Backend support    | Rapikan helper `Env` dan `Config` dengan typed getter untuk bootstrap/config                                             |
| Backend CORS       | Rapikan `CorsMiddleware` agar header CORS bisa diuji tanpa langsung emit header                                          |
| Backend model      | Perketat `User` model sesuai schema `users` dengan fillable, hidden, dan casts                                           |
| Backend test       | Tambah unit test untuk core/support/middleware/model agar migrasi backend tetap regression-safe                          |
| Backend controller | Konsolidasi controller kecil ke controller gabungan berbasis method route                                                |
| Backend service    | Pindahkan orchestration import, query rombel, audit, jam siswa, dan warning sesi ke service                              |
| Backend core       | Tambah request snapshot boundary melalui `RequestFactory` dan `RequestContext`                                           |
| Backend routing    | `RouteDispatcher` mendukung handler array `[ControllerClass, method]`                                                    |
| Frontend tree      | Rapikan struktur `src` menjadi `api`, `components`, `hooks`, `lib`, `pages`, `routes`, dan `tests`                       |
| Frontend routes    | Pindahkan routing halaman dev ke `AppRoutes`                                                                             |
| Frontend scan      | Modularisasi `DevScanPage` menjadi page orchestrator, hook, util, dan komponen UI                                        |
| Frontend dev       | Pisahkan komponen halaman scan, import, dan audit agar lebih mudah dites                                                 |
| Backend laporan    | Tambah service laporan dan exporter untuk CSV, XLSX, PDF, dan DOCX                                                     |
| Backend settings   | Tambah flow backup, preview restore, restore data-only, update jadwal rombel, dan aturan terlambat                     |
| Frontend settings  | Tambah panel import data, backup, restore, dan feedback validasi                                                       |
| Frontend layout    | Rapikan layout responsif pada halaman management terbaru                                                               |

## Auth dan Permission

Auth memakai bearer token stateless.

Permission penting:

```text
attendance.session.create
attendance.session.read
attendance.session.update
attendance.scan
attendance.manual.read
attendance.manual.update
attendance.edit_reasons.read
attendance.log.read
import.submit
import.read
reports.attendance.read
reports.attendance.export
konfigurasi.read
konfigurasi.manage
jurusan.read
jurusan.create
jurusan.update
jurusan.delete
users.read
users.create
users.update
user_activities.read
```

## Testing

Backend memakai PHPUnit.

Script utama:

```bash
./scripts/test-backend.sh
./scripts/test-backend-unit.sh
./scripts/test-backend-feature.sh
```

Script audit:

```bash
./scripts/check-import-table-fill.sh
./scripts/check-successful-attendance.sh
```

## Non Scope Saat Ini

- Laravel penuh.
- Redis.
- Queue worker.
- Multi sekolah.
- Integrasi orang tua.
- Tabel ruang final.
- Frontend production final.
- Resolve warning beda rombel.
- Laporan produksi final.
