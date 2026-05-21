# Architecture

Dokumen ini menjelaskan arsitektur terkini MVP Presensi Siswa Rajasa pada branch `alfy/backend-presensi-scan`.

## 1. Tujuan Sistem

Sistem dibuat untuk mencatat presensi siswa berbasis QR.

Mode utama:

1. `rombel`: presensi siswa sesuai rombel aktif.
2. `piket`: presensi siswa terlambat lintas rombel.

Fokus MVP saat ini:

- login dan permission,
- import data siswa dari CSV,
- pembentukan jurusan dan rombel dari data import,
- pencocokan QR ke siswa,
- sesi presensi per jam,
- scan QR,
- warning jika siswa tidak sesuai rombel,
- demo scan via halaman `/dev/scan`.

## 2. Stack

| Layer                | Teknologi                            |
| -------------------- | ------------------------------------ |
| Frontend             | Preact + Vite                        |
| Styling              | Tailwind CSS via `@tailwindcss/vite` |
| Backend              | PHP 8.2 FPM                          |
| Routing backend      | FastRoute                            |
| Dependency injection | PHP-DI                               |
| Database layer       | Illuminate Database                  |
| Environment          | `vlucas/phpdotenv`                   |
| Database             | MySQL 8                              |
| Web server           | Nginx                                |
| Test backend         | PHPUnit 11                           |
| Dev container        | Docker Compose                       |

Catatan:

- Backend bukan Laravel.
- Tailwind CDN sudah tidak dipakai.
- `frontend/vite.config.js` memakai `server.allowedHosts: true` untuk demo Cloudflare Quick Tunnel.
- `allowedHosts: true` hanya untuk kebutuhan demo/development, bukan konfigurasi production.

## 3. Alur Request

```text
Browser / HP
  ↓
Vite dev server
  ↓ proxy /api
Nginx
  ↓
PHP-FPM backend
  ↓
MySQL
```

Untuk demo HP:

```text
HP Browser
  ↓ HTTPS
Cloudflare Quick Tunnel
  ↓
Vite dev server /dev/scan
  ↓ proxy /api
Nginx
  ↓
Backend PHP API
  ↓
MySQL
```

## 4. Struktur Project

```text
backend/
  boilerplate/
  database/
    schema/
    seeds/
    data/
  public/
  routes/
    api.php
  src/
    Core/
    Http/
      Controllers/
      Middleware/
    Services/
    Support/
  tests/
    Unit/
    Feature/
    Support/

frontend/
  src/
    features/
      presensi-scan/
    pages/
      dev/
  index.html
  vite.config.js

docs/
scripts/
docker-compose.yml
nginx.conf
```

## 5. Backend

Backend memakai pola custom PHP API.

Komponen utama:

| Komponen                                                | Fungsi                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| `public/index.php`                                      | Front controller                                                   |
| `boilerplate/app.php`                                   | Bootstrap aplikasi                                                 |
| `boilerplate/config.php`                                | Konfigurasi app, database, auth, CORS, presensi                    |
| `boilerplate/container.php`                             | Dependency injection                                               |
| `boilerplate/database.php`                              | Boot database                                                      |
| `boilerplate/routes.php`                                | Load FastRoute dispatcher                                          |
| `routes/api.php`                                        | Definisi route API                                                 |
| `src/Core/Request.php`                                  | Baca request                                                       |
| `src/Core/Response.php`                                 | Response JSON standar                                              |
| `src/Core/ExceptionHandler.php`                         | Error handler                                                      |
| `src/Core/RouteDispatcher.php`                          | Dispatch route ke controller                                       |
| `src/Http/Middleware/PermissionMiddleware.php`          | Guard permission                                                   |
| `src/Services/AuthService.php`                          | Login dan user aktif                                               |
| `src/Services/TokenService.php`                         | Bearer token stateless                                             |
| `src/Services/PermissionService.php`                    | Role dan permission                                                |
| `src/Services/QrPayloadService.php`                     | Parse QR Google Form atau payload plain                            |
| `src/Services/ScanReadinessImportService.php`           | Import siswa, rombel, dan referensi QR                             |
| `src/Services/PresensiScanService.php`                  | Proses scan QR ke presensi                                         |
| `src/Http/Controllers/PresensiJamSiswaController.php`   | Menampilkan daftar presensi siswa untuk edit manual                |
| `src/Http/Controllers/PresensiManualEditController.php` | Menerima request perubahan status presensi manual                  |
| `src/Http/Controllers/PresensiEditReasonController.php` | Menyediakan daftar alasan edit presensi                            |
| `src/Services/PresensiManualEditService.php`            | Logic edit status, validasi alasan, update presensi, dan audit log |
| `presensi_jam_siswa`                                    | Tabel status presensi utama siswa per tanggal dan jam              |
| `presensi_edit_log`                                     | Tabel audit perubahan status presensi manual                       |

Tahap 9 menambahkan alur manual edit presensi. Warning beda rombel tidak di-resolve, tetapi tetap menjadi log kejadian di `presensi_scan_log`. Perubahan status presensi manual dicatat di `presensi_edit_log`.

## 6. Frontend

Frontend memakai Preact + Vite.

Route demo:

```text
/dev/scan
```

Fungsi halaman dev scanner:

- login demo,
- mengambil daftar rombel dari database,
- memilih mode `rombel` atau `piket`,
- memilih jam presensi,
- membuat sesi presensi,
- membaca QR via kamera,
- mengirim payload ke endpoint scan,
- menampilkan response JSON.

Catatan UI demo:

- Dropdown rombel mengambil data dari `GET /api/rombel/options`.
- Value dropdown tetap `rombel_id`.
- Label tampil memakai `label`, `label_rombel`, atau `label_rombel_raw`.
- Pilihan jam memakai dropdown custom multi-select dengan tanda centang.
- Mode `rombel` default memilih Jam 1.
- Mode `piket` default memilih Jam 1 dan Jam 2.
- Frontend tetap mengirim `jam_ids` sebagai array angka.

## 7. Nginx dan Routing

Nginx membagi request:

| Path            | Tujuan          |
| --------------- | --------------- |
| `/api/*`        | Backend PHP-FPM |
| selain `/api/*` | Frontend Vite   |

Frontend memakai proxy Vite untuk mengirim request `/api` ke Nginx.

## 8. Auth dan Permission

Auth memakai signed bearer token stateless.

Token berisi:

```text
user_id
iat
exp
```

Signature memakai `SESSION_SECRET`.

Konsekuensi:

- logout dilakukan di sisi client,
- server-side token revoke belum tersedia,
- cukup untuk MVP dan demo development.

Permission dibaca dari:

```text
user_roles
role_permissions
permissions
user_permissions
```

Permission penting saat ini:

| Permission                  | Fungsi                             |
| --------------------------- | ---------------------------------- |
| `attendance.session.create` | Membuat sesi presensi              |
| `attendance.session.read`   | Melihat sesi aktif dan opsi rombel |
| `attendance.session.update` | Pause, resume, finish sesi         |
| `attendance.scan`           | Scan QR presensi                   |
| `import.submit`             | Import data scan readiness         |
| `import.read`               | Melihat riwayat dan row import     |

## 9. Modul API Aktif

| Modul                 | Endpoint utama                                                                              | Status      |
| --------------------- | ------------------------------------------------------------------------------------------- | ----------- |
| Health                | `GET /api/health`                                                                           | implemented |
| Auth                  | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/me`                              | implemented |
| Presensi sesi         | `POST /api/presensi/sesi`, `GET /api/presensi/sesi/aktif`, pause, resume, finish            | implemented |
| Rombel options        | `GET /api/rombel/options`                                                                   | implemented |
| Scan readiness import | `POST /api/import/scan-readiness`, `GET /api/import/jobs`, `GET /api/import/jobs/{id}/rows` | implemented |
| Presensi scan         | `POST /api/presensi/scan`                                                                   | implemented |

Detail request dan response ditulis di `docs/API.md`.

## 10. Database

Database memakai MySQL 8.

Kelompok tabel utama:

| Kelompok        | Tabel utama                                                                           |
| --------------- | ------------------------------------------------------------------------------------- |
| IAM             | `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `user_permissions` |
| Master akademik | `tahun_ajaran`, `jurusan`, `rombel`, `jam_pembelajaran`                               |
| Siswa           | `siswa`, `penempatan_siswa_rombel`, `siswa_qr`                                        |
| Presensi        | `presensi_sesi`, `presensi_sesi_jam`, `presensi_scan_log`, `presensi_jam_siswa`       |
| Import          | `import_jobs`, `import_row_logs`                                                      |
| Audit/log       | tabel log dan pendukung lain sesuai schema MVP                                        |

## 11. Alur Import Scan Readiness

```text
CSV data-siswa.csv
  ↓
POST /api/import/scan-readiness
  ↓
ScanReadinessImportService
  ↓
jurusan
rombel
siswa
siswa_qr
penempatan_siswa_rombel
import_jobs
import_row_logs
```

Input minimal CSV:

```text
NISN
NAMA
KELAS
```

Perbaikan terbaru:

- importer membaca kelas seperti `10 TKRO 1`, `11 TKJ 3`, `12 TITL 2`,
- rombel tidak collapse ke satu ID,
- `rombel.label_rombel`, `label_rombel_raw`, `nomor_rombel`, `tingkat_angka`, dan relasi siswa terisi,
- seed demo tidak di-exclude,
- data seed demo `X-TKJ-1` dan `X-TKJ-2` tetap dicatat sebagai data seed, bukan hasil gagal import.

## 12. Alur Presensi Sesi

```text
User login
  ↓
POST /api/presensi/sesi
  ↓
validasi mode, rombel, jam, ruang
  ↓
presensi_sesi
presensi_sesi_jam
presensi_jam_siswa awal alpha untuk mode rombel
```

Aturan utama:

- mode `rombel` wajib memilih `rombel_id`,
- mode `piket` tidak boleh memilih `rombel_id`,
- jam maksimal 3,
- jam harus berurutan,
- rombel tidak boleh punya sesi aktif/suspended pada tanggal dan jam yang sama,
- lab tidak boleh dipakai dua sesi aktif/suspended pada tanggal dan jam yang sama,
- sesi `selesai` tidak memblokir sesi baru.

## 13. Alur Scan QR

```text
Scanner membaca payload QR
  ↓
POST /api/presensi/scan
  ↓
QrPayloadService parse nama dan NISN
  ↓
lookup siswa_qr
  ↓
cek sesi aktif
  ↓
cek rombel jika mode rombel
  ↓
tulis presensi_scan_log
  ↓
update presensi_jam_siswa jika valid
```

Status scan:

| Status     | Arti                                       |
| ---------- | ------------------------------------------ |
| `berhasil` | QR valid dan presensi masuk                |
| `warning`  | QR valid, tetapi siswa tidak sesuai rombel |
| `invalid`  | QR tidak ditemukan di `siswa_qr`           |
| `ditolak`  | Siswa sudah presensi pada jam yang sama    |

Efek ke presensi:

| Kondisi                | Efek                                      |
| ---------------------- | ----------------------------------------- |
| Mode `rombel` berhasil | `presensi_jam_siswa.status = hadir`       |
| Mode `piket` berhasil  | `presensi_jam_siswa.status = terlambat`   |
| Warning beda rombel    | hanya log, presensi tidak diubah          |
| Invalid QR             | hanya log, presensi tidak diubah          |
| Duplicate scan         | log `ditolak`, presensi tidak diubah lagi |

## 14. Demo HP

Demo HP memakai halaman:

```text
/dev/scan
```

Alur demo:

1. Jalankan frontend dev server.
2. Jalankan Cloudflare Quick Tunnel ke port frontend.
3. Buka URL HTTPS dari HP.
4. Login demo.
5. Pilih rombel dari dropdown database.
6. Buat sesi.
7. Scan QR via kamera HP.
8. Cek hasil di UI dan database.

Catatan:

- Kamera browser HP butuh secure context.
- HTTP LAN/IP laptop dapat gagal membuka kamera.
- Cloudflare Quick Tunnel dipakai agar akses menjadi HTTPS.
- `allowedHosts: true` membuat host tunnel dinamis tidak perlu didaftarkan ulang setiap demo.

## 15. Testing

Testing backend memakai PHPUnit 11.

Jenis test:

- Unit test untuk service kecil.
- Feature test untuk endpoint API.

Cakupan penting saat ini:

- health endpoint,
- 404 dan 405,
- auth login,
- `/api/me`,
- token service,
- permission read,
- presensi session,
- import scan readiness,
- QR payload parser,
- presensi scan,
- rombel options.

Script utama:

```bash
./scripts/test-backend.sh
./scripts/test-backend-unit.sh
./scripts/test-backend-feature.sh
```

Script audit pendukung:

```bash
./scripts/check-import-table-fill.sh
./scripts/check-successful-attendance.sh
```

## 16. Non Scope MVP

Tidak masuk MVP saat ini:

- Laravel penuh,
- Redis,
- queue worker,
- policy engine kompleks,
- group engine,
- multi sekolah,
- integrasi orang tua,
- ESP32,
- frontend final presensi,
- layout produksi,
- role guard final frontend,
- resolve warning beda rombel,
- laporan presensi final.

## 17. Status Terkini

Status branch `alfy/backend-presensi-scan`:

- Tahap 6 Presensi Session: selesai.
- Tahap 7 Scan Readiness Import: selesai.
- Tahap 8.0 Presensi Scan QR Endpoint: selesai.
- Tahap 8.1 Dev Scanner HP Demo: selesai.
- Tahap 8.3A Import Audit Tester Repair: selesai.
- Tahap 8.3B Dynamic Importer Rombel Mapping Fix: selesai.
- Tahap 8.3C Dynamic Rombel Options for Demo UI: selesai.
