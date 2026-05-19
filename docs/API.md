# API

Base URL development:

```text
http://localhost:8080/api
```

## Format Response

Response sukses:

```json
{
  "success": true,
  "message": "Berhasil",
  "data": {}
}
```

Response gagal:

```json
{
  "success": false,
  "message": "Terjadi kesalahan",
  "errors": {}
}
```

## Auth

### POST `/auth/login`

Status: `implemented`

Request:

```json
{
  "username": "admin.demo",
  "password": "Rajasa@123"
}
```

### POST `/auth/logout`

Status: `implemented`

Catatan: token masih stateless. Logout dilakukan dengan menghapus token di sisi client.

### GET `/me`

Status: `implemented`

Header:

```text
Authorization: Bearer TOKEN
```

## Health

### GET `/health`

Status: `implemented`

## Presensi Sesi

Status:

```text
implemented
```

Endpoint:

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/api/presensi/sesi` | Membuat sesi presensi |
| `GET` | `/api/presensi/sesi/aktif` | Melihat sesi aktif |
| `POST` | `/api/presensi/sesi/{id}/pause` | Menjeda sesi |
| `POST` | `/api/presensi/sesi/{id}/resume` | Melanjutkan sesi |
| `POST` | `/api/presensi/sesi/{id}/finish` | Menutup sesi |

Permission:

```text
attendance.session.create
```

#### Request mode rombel dengan ruang kelas

```json
{
  "mode_presensi": "rombel",
  "rombel_id": 1,
  "jam_ids": [1, 2],
  "ruang_pilihan": "kelas"
}
```

Backend mengisi:

```text
ruang_pilihan = kelas
ruang_label_snapshot = Kelas {label_rombel}
```

#### Request mode rombel dengan ruang lab

```json
{
  "mode_presensi": "rombel",
  "rombel_id": 1,
  "jam_ids": [3],
  "ruang_pilihan": "lab-tkj-1"
}
```

Pilihan lab valid:

```text
lab-tkj-1
lab-tkj-2
lab-tkj-3
lab-tkj-4
```

Backend mengisi:

```text
ruang_label_snapshot = LAB-TKJ-1
```

#### Request mode piket

```json
{
  "mode_presensi": "piket",
  "jam_ids": [1],
  "ruang_pilihan": "piket"
}
```

Backend mengisi:

```text
rombel_id = NULL
ruang_pilihan = piket
ruang_label_snapshot = Piket
```

#### Response sukses

```json
{
  "success": true,
  "message": "Sesi presensi berhasil dibuat.",
  "data": {
    "session": {
      "presensi_sesi_id": 3,
      "session_uuid": "fdcbcc06-e89b-4532-94d4-db26a561a9db",
      "mode_presensi": "rombel",
      "rombel_id": 1,
      "tanggal": "2026-05-19",
      "status": "aktif",
      "ruang_pilihan": "kelas",
      "ruang_label_snapshot": "Kelas X-TKJ-1"
    },
    "jam_ids": [1, 2]
  }
}
```

#### Validasi create sesi

| Aturan | Response |
|---|---|
| Token tidak ada | `401` |
| Tidak punya permission | `403` |
| Mode tidak valid | `422` |
| Rombel wajib untuk mode `rombel` | `422` |
| Mode `piket` tidak boleh memilih rombel | `422` |
| Jam kosong | `422` |
| Jam lebih dari 3 | `422` |
| Jam tidak berurutan | `422` |
| Rombel punya sesi aktif/suspended pada jam yang sama | `409` |
| Lab sama dipakai sesi aktif/suspended pada jam yang sama | `409` |

Response duplicate rombel:

```json
{
  "success": false,
  "message": "Rombel sudah memiliki sesi aktif pada jam yang dipilih.",
  "errors": []
}
```

Response bentrok lab:

```json
{
  "success": false,
  "message": "Ruangan lab sedang digunakan pada jam yang dipilih.",
  "errors": []
}
```

### GET `/presensi/sesi/aktif`

Status: `implemented`

Fungsi: melihat sesi aktif atau suspended milik user aktif.

Permission:

```text
attendance.session.read
```

### POST `/presensi/sesi/{id}/pause`

Status: `implemented`

Fungsi: menjeda sesi presensi.

Permission:

```text
attendance.session.update
```

### POST `/presensi/sesi/{id}/resume`

Status: `implemented`

Fungsi: melanjutkan sesi presensi yang dijeda.

Permission:

```text
attendance.session.update
```

### POST `/presensi/sesi/{id}/finish`

Status: `implemented`

Fungsi: menutup sesi presensi.

Permission:

```text
attendance.session.update
```

## Scan Readiness Import

Status:

```text
implemented
```

Tujuan:

Menyiapkan data siswa minimal agar Tahap 8 scan QR bisa mencocokkan payload QR dengan database.

### POST `/import/scan-readiness`

Permission:

```text
import.submit
```

Fungsi:

Import CSV minimal yang berisi data siswa untuk persiapan scan QR.

Kolom CSV yang dibaca:

| Kolom | Wajib | Kegunaan |
|---|---|---|
| `NISN` | Ya | Kunci pencocokan siswa dan QR |
| `NAMA` | Ya | Nama siswa dan validasi payload QR |
| `KELAS` | Ya | Pembentukan jurusan, rombel, dan rombel aktif |
| `N` | Tidak | Nomor urut, diabaikan |

Contoh CSV:

```csv
N,NISN,NAMA,KELAS
1,0096672112,AISYAH LISTYA NARISTA,10 AKL
2,0106325606,AISYAH NUR AMALINA,10 AKL
```

Request JSON dengan file path di container:

```json
{
  "file_path": "/var/www/database/data/data-siswa.csv"
}
```

Request multipart dari host:

```bash
curl -i -X POST http://localhost:8080/api/import/scan-readiness   -H "Authorization: Bearer TOKEN"   -F "file=@backend/database/data/data-siswa.csv"
```

Response sukses:

```json
{
  "success": true,
  "message": "Import scan readiness selesai.",
  "data": {
    "import_job_id": 3,
    "summary": {
      "total_rows": 1391,
      "success_rows": 1391,
      "failed_rows": 0,
      "created_students": 1389,
      "updated_students": 2,
      "created_qr": 1389,
      "updated_qr": 2
    }
  }
}
```

Validasi:

| Kondisi | Response |
|---|---|
| Token tidak ada | `401` |
| Tidak punya permission | `403` |
| File tidak dikirim | `422` |
| File tidak ditemukan | `422` |
| Header `NISN`, `NAMA`, `KELAS` tidak ditemukan | `422` |
| Baris tanpa NISN | Masuk `import_row_logs`, tidak menghentikan import |
| Baris tanpa nama | Masuk `import_row_logs`, tidak menghentikan import |
| Baris tanpa kelas | Masuk `import_row_logs`, tidak menghentikan import |

### GET `/import/jobs`

Status:

```text
implemented
```

Permission:

```text
import.read
```

Fungsi:

Melihat riwayat import.

### GET `/import/jobs/{id}/rows`

Status:

```text
implemented
```

Permission:

```text
import.read
```

Fungsi:

Melihat log baris import yang error, warning, skipped, inserted, atau updated.

## Presensi Scan

Status:

```text
planned
```

Rencana endpoint:

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/api/presensi/scan` | Menerima hasil scan QR |

Tahap 8 akan memakai data dari:

```text
siswa
siswa_qr
rombel
penempatan_siswa_rombel
presensi_sesi
presensi_sesi_jam
```

## Error Code

| HTTP Code | Arti |
|---|---|
| 200 | Berhasil |
| 201 | Data dibuat |
| 401 | Belum login atau token tidak valid |
| 403 | Tidak punya akses |
| 404 | Endpoint/data tidak ditemukan |
| 405 | Method tidak diizinkan |
| 409 | Konflik data |
| 422 | Validasi gagal |
| 500 | Error sistem |
