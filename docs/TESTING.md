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

Baseline test mencakup:

| Test | Jenis |
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

## Catatan

Folder kosong harus punya `.gitkeep`.

Contoh:

```text
backend/tests/Unit/.gitkeep
```

Tanpa `.gitkeep`, Git tidak menyimpan folder kosong dan PHPUnit bisa gagal di mesin lain.
