# Presensi Siswa Rajasa

Aplikasi presensi siswa berbasis QR untuk SMKS Rajasa.

Sistem ini dirancang untuk mendukung presensi rombel, presensi piket untuk siswa terlambat, presensi per jam pembelajaran, warning kartu QR tidak sesuai rombel, laporan presensi, serta pengelolaan data berbasis tahun ajaran.

## Status Project

Status saat ini:

- Environment development Docker sudah berjalan.
- Backend Composer based sudah berjalan.
- Frontend Vite sudah berjalan.
- Database MVP schema dan seed sudah masuk repo.
- Auth dan permission baseline sudah berjalan.
- Endpoint presensi sesi sudah implemented.
- Endpoint scan readiness import sudah implemented.
- Endpoint presensi scan QR sudah implemented.
- Endpoint dynamic rombel options sudah implemented.
- Halaman demo scanner `/dev/scan` sudah tersedia untuk demo HP.
- Cloudflare Quick Tunnel dapat dipakai untuk demo kamera HP via HTTPS.
- Tailwind sudah memakai plugin Vite, bukan CDN.
- Tahap 8.3c sudah fokus pada dynamic rombel dropdown dan polish demo scanner.

## Presensi Sesi

Endpoint presensi sesi sudah tersedia:

```text
POST /api/presensi/sesi
GET  /api/presensi/sesi/aktif
POST /api/presensi/sesi/{id}/pause
POST /api/presensi/sesi/{id}/resume
POST /api/presensi/sesi/{id}/finish
```

## Presensi Scan QR

Endpoint scan QR sudah tersedia:

```text
POST /api/presensi/scan
```

Flow utama:

- User login dan membuat sesi presensi.
- User scan QR siswa.
- Backend parse payload QR.
- Backend cocokkan payload ke siswa_qr.
- Backend validasi sesi aktif.
- Backend mencatat hasil scan ke presensi_scan_log.
- Jika valid, backend update presensi_jam_siswa.

Status Scan:

| Status     | Arti                                             |
| ---------- | ------------------------------------------------ |
| `berhasil` | QR valid dan presensi masuk                      |
| `warning`  | QR valid, tetapi siswa beda rombel               |
| `invalid`  | QR tidak dikenal                                 |
| `ditolak`  | Scan duplikat atau tidak boleh mengubah presensi |

Mode sesi:

| Mode     | Fungsi                         |
| -------- | ------------------------------ |
| `rombel` | Presensi untuk rombel tertentu |
| `piket`  | Presensi untuk siswa terlambat |

Aturan Mode:

| Mode     | Hasil presensi                      |
| -------- | ----------------------------------- |
| `rombel` | siswa sesuai rombel menjadi `hadir` |
| `piket`  | siswa valid menjadi `terlambat`     |

Pilihan ruang:

| Pilihan     | Arti         |
| ----------- | ------------ |
| `kelas`     | Kelas rombel |
| `lab-tkj-1` | LAB-TKJ-1    |
| `lab-tkj-2` | LAB-TKJ-2    |
| `lab-tkj-3` | LAB-TKJ-3    |
| `lab-tkj-4` | LAB-TKJ-4    |
| `piket`     | Area piket   |

Aturan utama:

- mode `rombel` wajib memilih rombel,
- mode `piket` tidak boleh memilih rombel,
- jam maksimal 3,
- jam harus berurutan,
- rombel tidak boleh punya dua sesi aktif/suspended pada tanggal dan jam yang sama,
- lab tidak boleh dipakai dua sesi aktif/suspended pada tanggal dan jam yang sama,
- sesi yang sudah `selesai` tidak memblokir sesi baru.

Testing terakhir:

```text
OK (16 tests, 56 assertions)
```

## Stack

| Bagian                  | Teknologi           |
| ----------------------- | ------------------- |
| Frontend                | Vite                |
| Backend                 | PHP 8.2 FPM         |
| Database                | MySQL 8.0           |
| Web Server              | Nginx               |
| Package Manager Backend | Composer            |
| Routing Backend         | FastRoute           |
| Dependency Injection    | PHP-DI              |
| Database Layer          | Illuminate Database |
| Environment Loader      | vlucas/phpdotenv    |
| Testing Backend         | PHPUnit 11          |

## Cara Menjalankan Development

Salin environment:

```bash
cp .env.example .env
```

Jalankan container:

```bash
docker compose up -d --build
```

Cek container:

```bash
docker compose ps
```

Cek backend:

```bash
curl http://localhost:8080/api/health
```

## Database Lokal

Reset database demo:

```bash
./scripts/db-reset-demo.sh
```

Script ini menjalankan:

1. Drop database lama.
2. Buat database baru.
3. Import schema MVP.
4. Seed permission MVP.
5. Seed akun demo.

## Akun Demo

Password demo:

```text
Rajasa@123
```

Akun utama:

| Username             | Tipe        |
| -------------------- | ----------- |
| `superadmin.demo`    | super_admin |
| `admin.demo`         | admin       |
| `guru.demo`          | guru        |
| `staff.demo`         | staff       |
| `intern.demo`        | intern      |
| `siswa.demo`         | siswa       |
| `siswa.warning.demo` | siswa       |

## Testing

Jalankan semua test backend:

```bash
./scripts/test-backend.sh
```

Jalankan unit test saja:

```bash
./scripts/test-backend-unit.sh
```

Jalankan feature test saja:

```bash
./scripts/test-backend-feature.sh
```

## Endpoint Penting

```text
GET  /api/health
POST /api/auth/login
POST /api/auth/logout
GET  /api/me
```

## Struktur Project

```text
backend/
  boilerplate/
  database/
  public/
  routes/
  src/
  tests/

frontend/
docs/
scripts/
docker-compose.yml
nginx.conf
```

## Branch

Prefix branch project:

```text
nama/feature
```

Contoh:

```text
alfy/cleanup-dev-sampah
alfy/backend-boilerplate
alfy/backend-phpunit
alfy/backend-database-assets
alfy/backend-auth-permission
alfy/backend-presensi-session
```

## Scope MVP

Masuk MVP:

- login user,
- role dan permission sederhana,
- akun guru, staff, admin, intern, dan siswa,
- presensi mode rombel,
- presensi mode piket untuk siswa terlambat,
- scan QR berbasis payload nama dan NISN,
- presensi per jam pembelajaran,
- warning jika kartu QR beda rombel,
- laporan presensi,
- import data,
- audit edit presensi,
- error log sistem.

Tidak masuk MVP:

- ESP32,
- ruangan,
- plotting rombel,
- policy engine,
- group engine,
- arsip media,
- notifikasi kompleks,
- multi sekolah,
- integrasi orang tua,
- queue worker,
- Redis,
- Laravel penuh.

## Scan Readiness Import

Tahap 7 menyiapkan data minimal agar scan QR pada Tahap 8 bisa mencocokkan payload QR dengan database.

Input CSV minimal:

```text
NISN
NAMA
KELAS
```

Contoh:

```csv
N,NISN,NAMA,KELAS
1,0096672112,NAMA,10 AKL
2,0106325606,NAMA,10 AKL
```

Jalankan import:

```bash
./scripts/import-scan-readiness.sh backend/database/data/NAMA-FILE-DATA.csv
```

Reset jika import salah:

```bash
./scripts/db-reset-import-demo.sh
```

Catatan:

`db-reset-demo.sh` akan menghapus data hasil import dan mengembalikan database ke seed demo.

Status validasi terbaru:

```text
Import real: 1391 rows, 1391 success, 0 failed
Backend test: OK (19 tests, 70 assertions)
```
