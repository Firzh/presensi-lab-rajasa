# Testing

Dokumen ini menjelaskan test otomatis, test manual, dan validasi database untuk MVP Presensi QR Rajasa sampai Tahap 8.3c.

## Stack

```text
Backend  : PHP 8.2, PHPUnit 11
Frontend : Vite, Preact, Tailwind via @tailwindcss/vite
Database : MySQL 8
```

Konfigurasi utama:

```text
backend/phpunit.xml
frontend/vite.config.js
```

Folder test backend:

```text
backend/tests/Unit/
backend/tests/Feature/
backend/tests/Support/
```

## Script Utama

Backend full test:

```bash
./scripts/test-backend.sh
```

Backend unit test:

```bash
./scripts/test-backend-unit.sh
```

Backend feature test:

```bash
./scripts/test-backend-feature.sh
```

Frontend build test:

```bash
docker compose exec frontend npm run build
```

Reset database demo:

```bash
./scripts/db-reset-demo.sh
```

Import data siswa real:

```bash
./scripts/import-scan-readiness.sh backend/database/data/data-siswa.csv
```

Audit hasil import:

```bash
./scripts/check-import-table-fill.sh
```

Audit presensi berhasil setelah import fresh:

```bash
./scripts/check-successful-attendance.sh
```

## Baseline Test Terbaru

Status terakhir yang diharapkan:

```text
Backend full test passed
Frontend build passed
Manual scan via /dev/scan passed
Cloudflare Quick Tunnel demo passed
```

Contoh output backend terbaru:

```text
OK (28 tests, 135 assertions)
```

Jumlah test dan assertion boleh bertambah. Yang wajib dijaga adalah status `OK`.

## Coverage Otomatis Saat Ini

| Area                       | Jenis   | Status      |
| -------------------------- | ------- | ----------- |
| Health endpoint            | Feature | implemented |
| 404 dan 405                | Feature | implemented |
| Login demo                 | Feature | implemented |
| `/api/me`                  | Feature | implemented |
| Token stateless            | Unit    | implemented |
| Permission read            | Feature | implemented |
| Create sesi rombel         | Feature | implemented |
| Create sesi piket          | Feature | implemented |
| Pause, resume, finish sesi | Feature | implemented |
| Duplicate sesi rombel      | Feature | implemented |
| Bentrok lab                | Feature | implemented |
| Import scan readiness      | Feature | implemented |
| Import invalid rows        | Feature | implemented |
| Import audit table fill    | Bash    | implemented |
| QR parser Google Form      | Unit    | implemented |
| QR parser plain payload    | Unit    | implemented |
| Scan valid rombel          | Feature | implemented |
| Scan beda rombel           | Feature | implemented |
| Scan invalid QR            | Feature | implemented |
| Scan piket terlambat       | Feature | implemented |
| Duplicate scan guard       | Feature | implemented |
| Dynamic rombel options     | Feature | implemented |
| Frontend `/dev/scan` build | Build   | implemented |

## Test Auth Manual

Login:

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin.demo","password":"Rajasa@123"}'
```

Ambil token:

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin.demo","password":"Rajasa@123"}' \
  | docker compose exec -T backend php -r '$j=json_decode(stream_get_contents(STDIN), true); echo $j["data"]["token"] ?? "";')
```

Cek user aktif:

```bash
curl -i http://localhost:8080/api/me \
  -H "Authorization: Bearer $TOKEN"
```

Expected:

```text
HTTP/1.1 200 OK
```

## Test Presensi Sesi Manual

Create sesi rombel:

```bash
curl -i -X POST http://localhost:8080/api/presensi/sesi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"mode_presensi":"rombel","rombel_id":1,"jam_ids":[1,2],"ruang_pilihan":"kelas"}'
```

Create sesi piket:

```bash
curl -i -X POST http://localhost:8080/api/presensi/sesi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"mode_presensi":"piket","jam_ids":[1,2],"ruang_pilihan":"piket"}'
```

Cek sesi aktif:

```bash
curl -i http://localhost:8080/api/presensi/sesi/aktif \
  -H "Authorization: Bearer $TOKEN"
```

Expected create sesi sukses:

```text
HTTP/1.1 201 Created
```

## Test Import Real

Urutan wajib:

```bash
./scripts/db-reset-demo.sh
./scripts/import-scan-readiness.sh backend/database/data/data-siswa.csv
./scripts/check-import-table-fill.sh
```

Expected import real:

```text
total_rows = 1391
success_rows = 1391
failed_rows = 0
```

Catatan validasi:

```text
Total siswa setelah reset dan import = 1393
1391 siswa berasal dari data-siswa.csv
2 siswa berasal dari seed demo
```

Seed demo yang sengaja tidak di-exclude:

```text
Siswa Demo X TKJ 1
Siswa Warning Demo X TKJ 2
```

Karena seed demo memakai label lama `X-TKJ-1` dan `X-TKJ-2`, `ROMBEL COLLAPSE CHECK` masih boleh menampilkan rombel_id 1 dan 2. Itu bukan bukti gagal mapping CSV.

Mapping import real valid jika kelas bernomor sudah terpisah, misalnya:

```text
10 TKRO 1 -> rombel_id berbeda
10 TKRO 2 -> rombel_id berbeda
10 TKRO 3 -> rombel_id berbeda
10 TKRO 4 -> rombel_id berbeda
10 TKRO 5 -> rombel_id berbeda
```

## Test Fresh Import Tidak Membuat Presensi Berhasil

Jalankan tepat setelah reset dan import, sebelum test scan:

```bash
./scripts/db-reset-demo.sh
./scripts/import-scan-readiness.sh backend/database/data/data-siswa.csv
./scripts/check-successful-attendance.sh
```

Expected:

```text
presensi_scan_log berhasil: 0
presensi_jam_siswa with scan_log_id: 0
presensi_jam_siswa scanned hadir/terlambat: 0
RESULT: PASSED
```

Jika script gagal, berarti sudah ada scan/test/manual action setelah import.

## Test Rombel Options

Endpoint:

```text
GET /api/rombel/options
```

Test:

```bash
docker compose exec backend ./vendor/bin/phpunit --filter RombelOptionsTest
```

Expected:

```text
OK
```

Manual:

```bash
curl -i http://localhost:8080/api/rombel/options \
  -H "Authorization: Bearer $TOKEN"
```

Valid jika response berisi daftar rombel aktif dengan `rombel_id` dan label rombel.

## Test Scan QR Manual

Contoh scan valid:

```bash
curl -i -X POST http://localhost:8080/api/presensi/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "presensi_sesi_id": 1,
    "payload_raw": "https://docs.google.com/forms/d/e/demo/formResponse?entry.1743651050=MUHAMMAD+SOBRI&entry.178375719=0088556888"
  }'
```

Expected untuk rombel sesuai:

```text
status_scan = berhasil
attendance_status = hadir
affected_rows > 0
```

Expected untuk mode piket:

```text
status_scan = berhasil
attendance_status = terlambat
affected_rows > 0
```

Expected untuk beda rombel:

```text
status_scan = warning
warning_reason = siswa_tidak_sesuai_rombel
affected_rows = 0
```

Expected untuk QR tidak dikenal:

```text
status_scan = invalid
affected_rows = 0
```

Expected untuk scan ulang:

```text
status_scan = ditolak
affected_rows = 0
```

## Cek Scan di Database

Cek log scan:

```bash
DB_NAME="$(grep '^DB_DATABASE=' .env | cut -d '=' -f2-)"
DB_PASS="$(grep '^DB_PASSWORD=' .env | cut -d '=' -f2-)"

docker compose exec -T -e MYSQL_PWD="$DB_PASS" db mysql -uroot "$DB_NAME" <<'SQL'
SELECT
  scan_log_id,
  presensi_sesi_id,
  payload_nama,
  payload_nisn,
  status_scan,
  warning_reason,
  siswa_id,
  selected_rombel_id,
  actual_rombel_id,
  created_at
FROM presensi_scan_log
ORDER BY scan_log_id DESC
LIMIT 10;
SQL
```

Cek presensi yang berubah karena scan:

```bash
docker compose exec -T -e MYSQL_PWD="$DB_PASS" db mysql -uroot "$DB_NAME" <<'SQL'
SELECT
  p.presensi_id,
  p.presensi_sesi_id,
  p.scan_log_id,
  p.siswa_id,
  s.nisn,
  s.nama_lengkap,
  s.kelas_aktif,
  p.tanggal,
  p.jam_id,
  p.status,
  p.mode_presensi,
  p.scanned_at
FROM presensi_jam_siswa p
LEFT JOIN siswa s ON s.siswa_id = p.siswa_id
WHERE p.scan_log_id IS NOT NULL
ORDER BY p.presensi_id DESC
LIMIT 10;
SQL
```

Valid jika `scan_log_id` di `presensi_jam_siswa` sama dengan `scan_log_id` di `presensi_scan_log`.

## Test Dev Scanner `/dev/scan`

Jalankan frontend:

```bash
docker compose exec frontend npm run dev -- --host
```

Buka:

```text
http://localhost:3000/dev/scan
```

Alur test:

```text
Login demo
Muat daftar rombel
Pastikan dropdown rombel berasal dari database
Pilih mode rombel atau piket
Pilih jam lewat dropdown multi-select
Buat sesi
Scan QR dari kamera atau paste payload manual
Cek response JSON
Cek database
```

Validasi terbaru:

```text
MUHAMMAD SOBRI
NISN 0088556888
kelas_aktif 12 TKRO 1
rombel_id 38
status_scan berhasil
presensi_jam_siswa.status hadir
```

## Test Cloudflare Quick Tunnel

Gunakan untuk demo kamera HP:

```bash
docker run --rm -it --network host cloudflare/cloudflared:latest tunnel --url http://localhost:3000
```

Buka URL `https://xxxxx.trycloudflare.com/dev/scan` dari HP.

Expected:

```text
Halaman /dev/scan terbuka
Kamera HP bisa meminta izin
Dropdown rombel tampil
Scan QR berhasil
```

Catatan:

```text
frontend/vite.config.js memakai server.allowedHosts: true
Konfigurasi ini hanya untuk dev/demo
```

## Test Frontend Build

```bash
docker compose exec frontend npm run build
```

Expected:

```text
✓ built in ...
```

Tailwind harus diproses lokal dari Vite. Pastikan tidak ada CDN:

```bash
grep -RIn "cdn.tailwindcss.com\|tailwindcss.com" frontend --exclude-dir=node_modules --exclude-dir=dist
```

Expected:

```text
tidak ada output
```

## Urutan Validasi Sebelum Commit

```bash
docker compose exec backend ./vendor/bin/phpunit --filter QrPayloadServiceTest
docker compose exec backend ./vendor/bin/phpunit --filter PresensiScanTest
docker compose exec backend ./vendor/bin/phpunit --filter RombelOptionsTest
./scripts/test-backend.sh
docker compose exec frontend npm run build
```

Untuk perubahan import atau database, tambah:

```bash
./scripts/db-reset-demo.sh
./scripts/import-scan-readiness.sh backend/database/data/data-siswa.csv
./scripts/check-import-table-fill.sh
./scripts/check-successful-attendance.sh
```

## Aturan Test Fitur Baru

Setiap fitur backend baru minimal punya:

```text
Unit test untuk logic utama
Feature test untuk endpoint
Test auth/permission
Test error case
Manual curl jika menyentuh API
Query DB jika menyentuh database
```

Setiap fitur frontend baru minimal punya:

```text
npm run build passed
Manual browser test
Console browser bersih dari runtime error
Jika pakai kamera HP, test via HTTPS tunnel
```

## Catatan Operasional

`db-reset-demo.sh` menghapus data hasil import real dan hasil scan manual.

Folder kosong harus punya `.gitkeep`.

Jangan menganggap database fresh jika sebelumnya sudah menjalankan PHPUnit scan, manual scan, atau demo `/dev/scan`.
