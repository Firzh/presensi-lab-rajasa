# Testing

Dokumen ini menjelaskan testing backend Presensi Siswa Rajasa.

## Stack

Backend memakai:

```text
PHPUnit 11
PHP 8.2
```

Konfigurasi:

```text
backend/phpunit.xml
```

Folder test:

```text
backend/tests/
  Unit/
  Feature/
  Support/
```

## Script Test

Jalankan semua test:

```bash
./scripts/test-backend.sh
```

Unit test:

```bash
./scripts/test-backend-unit.sh
```

Feature test:

```bash
./scripts/test-backend-feature.sh
```

## Persiapan Test

Sebelum test fitur yang memakai database:

```bash
./scripts/db-reset-demo.sh
```

Lalu:

```bash
docker compose exec backend composer dump-autoload
./scripts/test-backend.sh
```

## Test Saat Ini

test coverage:

|---|---|
| Health endpoint | Feature |
| Endpoint tidak ditemukan | Feature |
| Method tidak diizinkan | Feature |
| Login sukses | Feature |
| Login password salah | Feature |
| Login payload kosong | Feature |
| `/api/me` tanpa token | Feature |
| `/api/me` dengan token | Feature |
| Permission muncul saat login | Feature |
| Token valid | Unit |
| Token invalid | Unit |
| Create sesi rombel ruang kelas | Feature |
| Create sesi tanpa token | Feature |
| Reject sesi lebih dari 3 jam | Feature |
| Pause, resume, finish sesi | Feature |
| Reject duplicate sesi rombel aktif pada jam yang sama | Feature |
| Scan readiness import creates students and QR reference | Feature |
| Scan readiness import logs invalid rows | Feature |
| Scan readiness import requires token | Feature |

Status terakhir yang diharapkan:

```text
OK (11 tests, 43 assertions)
```

Jumlah assertion bisa bertambah seiring development.

## Validasi Manual Auth

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

Cek `/api/me`:

```bash
curl -i http://localhost:8080/api/me \
  -H "Authorization: Bearer $TOKEN"
```

Expected:

```text
HTTP/1.1 200 OK
```

Cek tanpa token:

```bash
curl -i http://localhost:8080/api/me
```

Expected:

```text
HTTP/1.1 401 Unauthorized
```

## Aturan Test untuk Fitur Baru

Setiap fitur backend minimal punya:

1. Unit test untuk logic utama.
2. Feature test untuk endpoint.
3. Test untuk error case.

Contoh untuk tahap Presensi Sesi:

```text
Unit:
- JamPembelajaranValidatorTest
- PresensiSessionRuleTest

Feature:
- CreateRombelSessionTest
- CreatePiketSessionTest
- PauseResumeFinishSessionTest
```

Contoh untuk tahap Presensi Scan:

```text
Unit:
- QrPayloadServiceTest
- PresensiScanRuleTest

Feature:
- ScanValidRombelQrTest
- ScanWarningBedaRombelTest
- ScanInvalidQrTest
- ScanPiketTerlambatTest
```

## Validasi Manual Presensi Sesi

Reset database:

```bash
./scripts/db-reset-demo.sh
```

Ambil token:

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin.demo","password":"Rajasa@123"}' \
  | docker compose exec -T backend php -r '$j=json_decode(stream_get_contents(STDIN), true); echo $j["data"]["token"] ?? "";')
```

Create sesi rombel kelas:

```bash
curl -i -X POST http://localhost:8080/api/presensi/sesi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"mode_presensi":"rombel","rombel_id":1,"jam_ids":[1,2],"ruang_pilihan":"kelas"}'
```

Expected:

```text
HTTP/1.1 201 Created
```

Duplicate sesi rombel:

```bash
curl -i -X POST http://localhost:8080/api/presensi/sesi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"mode_presensi":"rombel","rombel_id":1,"jam_ids":[1,2],"ruang_pilihan":"kelas"}'
```

Expected:

```text
HTTP/1.1 409 Conflict
```

Create sesi lab:

```bash
curl -i -X POST http://localhost:8080/api/presensi/sesi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"mode_presensi":"rombel","rombel_id":1,"jam_ids":[3],"ruang_pilihan":"lab-tkj-1"}'
```

Create sesi piket:

```bash
curl -i -X POST http://localhost:8080/api/presensi/sesi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"mode_presensi":"piket","jam_ids":[1],"ruang_pilihan":"piket"}'
```

Cek sesi aktif:

```bash
curl -i http://localhost:8080/api/presensi/sesi/aktif \
  -H "Authorization: Bearer $TOKEN"
```

## Validasi Database Presensi Sesi

Cek sesi:

```bash
DB_PASS=$(grep '^DB_PASSWORD=' .env | cut -d '=' -f2-)

docker compose exec -e MYSQL_PWD="$DB_PASS" db mysql -uroot \
  -e "USE sistem_presensi_siswa_qr; SELECT presensi_sesi_id, mode_presensi, rombel_id, tanggal, status, ruang_pilihan, ruang_label_snapshot FROM presensi_sesi ORDER BY presensi_sesi_id DESC LIMIT 10;"
```

Cek jam sesi:

```bash
docker compose exec -e MYSQL_PWD="$DB_PASS" db mysql -uroot \
  -e "USE sistem_presensi_siswa_qr; SELECT presensi_sesi_id, jam_id, urutan FROM presensi_sesi_jam ORDER BY presensi_sesi_jam_id DESC LIMIT 20;"
```

Cek alpha rows:

```bash
docker compose exec -e MYSQL_PWD="$DB_PASS" db mysql -uroot \
  -e "USE sistem_presensi_siswa_qr; SELECT COUNT(*) AS total_alpha FROM presensi_jam_siswa WHERE status = 'alpha';"
```

## Import Test

Import CSV real:

```bash
./scripts/import-scan-readiness.sh backend/database/data/NAMA-FILE-DATA.csv
```

Expected response:

```json
{
  "success": true,
  "message": "Import scan readiness selesai.",
  "data": {
    "summary": {
      "total_rows": 1391,
      "success_rows": 1391,
      "failed_rows": 0
    }
  }
}
```

Cek total siswa:

```bash
DB_PASS=$(grep '^DB_PASSWORD=' .env | cut -d '=' -f2-)

docker compose exec -e MYSQL_PWD="$DB_PASS" db mysql -uroot   -e "USE sistem_presensi_siswa_qr; SELECT COUNT(*) AS total_siswa FROM siswa;"
```

Cek total QR reference:

```bash
docker compose exec -e MYSQL_PWD="$DB_PASS" db mysql -uroot   -e "USE sistem_presensi_siswa_qr; SELECT COUNT(*) AS total_qr FROM siswa_qr;"
```

Cek import job:

```bash
docker compose exec -e MYSQL_PWD="$DB_PASS" db mysql -uroot   -e "USE sistem_presensi_siswa_qr; SELECT import_id, import_type, status, total_rows, valid_rows, error_rows, inserted_rows, updated_rows FROM import_jobs ORDER BY import_id DESC LIMIT 3;"
```

Cek error row untuk import terbaru:

```bash
docker compose exec -e MYSQL_PWD="$DB_PASS" db mysql -uroot   -e "USE sistem_presensi_siswa_qr; SELECT import_id, \`row_number\`, row_status, \`message\` FROM import_row_logs WHERE import_id = 3 ORDER BY row_log_id DESC LIMIT 20;"
```

Jika hasil kosong, berarti import terbaru tidak punya error row.

## Catatan

`db-reset-demo.sh` akan menghapus data hasil import real karena database dibuat ulang.

Folder kosong harus punya `.gitkeep`.

Contoh:

```text
backend/tests/Unit/.gitkeep
```

Tanpa `.gitkeep`, Git tidak menyimpan folder kosong dan PHPUnit bisa gagal di mesin lain.
