# API

Branch acuan: `alfy/backend-presensi-scan`

Base URL development:

```text
http://localhost:8080/api
```

Jika frontend berjalan lewat Vite dev server, request API dari browser memakai proxy:

```text
/api
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

## Auth Header

Endpoint yang membutuhkan login wajib memakai header:

```text
Authorization: Bearer TOKEN
```

## Health

### GET `/health`

Status: `implemented`

Fungsi: cek layanan backend aktif.

Auth: tidak perlu.

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

Response sukses mengembalikan token, user, role, dan permission.

### POST `/auth/logout`

Status: `implemented`

Catatan: token masih stateless. Logout dilakukan dengan menghapus token di sisi client.

### GET `/me`

Status: `implemented`

Fungsi: membaca user aktif, role, dan permission dari token.

## Rombel Options

### GET `/rombel/options`

Status: `implemented`

Fungsi: mengambil daftar rombel aktif dari database untuk dropdown demo scan.

Permission:

```text
attendance.session.read
```

Response data:

```json
{
  "success": true,
  "message": "Daftar rombel aktif.",
  "data": {
    "rombel": [
      {
        "rombel_id": 38,
        "label": "12 TKRO 1",
        "label_rombel": "12 TKRO 1",
        "label_rombel_raw": "12 TKRO 1",
        "tingkatan": "XII",
        "tingkat_angka": 12,
        "nomor_rombel": 1,
        "jurusan_id": 5,
        "kode_jurusan": "TKRO",
        "nama_jurusan": "TKRO",
        "status": "aktif"
      }
    ]
  }
}
```

Catatan:

- `label` dipakai langsung oleh frontend.
- Jika `label_rombel` kosong, backend memakai `label_rombel_raw`.
- Jika keduanya kosong, backend memakai fallback `Rombel #{rombel_id}`.
- Endpoint ini tidak mengecualikan seed demo.

## Presensi Sesi

Status: `implemented`

Endpoint:

| Method | Endpoint                     | Fungsi                                             | Permission                  |
| ------ | ---------------------------- | -------------------------------------------------- | --------------------------- |
| `POST` | `/presensi/sesi`             | Membuat sesi presensi                              | `attendance.session.create` |
| `GET`  | `/presensi/sesi/aktif`       | Melihat sesi aktif atau suspended milik user aktif | `attendance.session.read`   |
| `POST` | `/presensi/sesi/{id}/pause`  | Menjeda sesi                                       | `attendance.session.update` |
| `POST` | `/presensi/sesi/{id}/resume` | Melanjutkan sesi                                   | `attendance.session.update` |
| `POST` | `/presensi/sesi/{id}/finish` | Menutup sesi                                       | `attendance.session.update` |

### Request mode rombel dengan ruang kelas

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

### Request mode rombel dengan ruang lab

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

### Request mode piket

```json
{
  "mode_presensi": "piket",
  "jam_ids": [1, 2],
  "ruang_pilihan": "piket"
}
```

Backend mengisi:

```text
rombel_id = null
ruang_pilihan = piket
ruang_label_snapshot = Piket
```

### Response sukses create sesi

```json
{
  "success": true,
  "message": "Sesi presensi berhasil dibuat.",
  "data": {
    "session": {
      "presensi_sesi_id": 9,
      "session_uuid": "fdcbcc06-e89b-4532-94d4-db26a561a9db",
      "mode_presensi": "rombel",
      "rombel_id": 38,
      "tanggal": "2026-05-21",
      "status": "aktif",
      "ruang_pilihan": "kelas",
      "ruang_label_snapshot": "Kelas 12 TKRO 1"
    },
    "jam_ids": [1, 2]
  }
}
```

### Validasi create sesi

| Aturan                                                        | Response |
| ------------------------------------------------------------- | -------- |
| Token tidak ada                                               | `401`    |
| Tidak punya permission                                        | `403`    |
| Mode tidak valid                                              | `422`    |
| Rombel wajib untuk mode `rombel`                              | `422`    |
| Mode `piket` tidak boleh memilih rombel                       | `422`    |
| Jam kosong                                                    | `422`    |
| Jam lebih dari 3                                              | `422`    |
| Jam tidak berurutan                                           | `422`    |
| Rombel punya sesi aktif atau suspended pada jam yang sama     | `409`    |
| Lab sama dipakai sesi aktif atau suspended pada jam yang sama | `409`    |

## Scan Readiness Import

Status: `implemented`

Tujuan: menyiapkan data siswa, rombel, penempatan rombel, dan referensi QR untuk scan presensi.

### POST `/import/scan-readiness`

Permission:

```text
import.submit
```

Kolom CSV yang dibaca:

| Kolom   | Wajib | Kegunaan                                      |
| ------- | ----- | --------------------------------------------- |
| `NISN`  | Ya    | Kunci pencocokan siswa dan QR                 |
| `NAMA`  | Ya    | Nama siswa dan payload QR                     |
| `KELAS` | Ya    | Pembentukan jurusan, rombel, dan rombel aktif |
| `N`     | Tidak | Nomor urut, diabaikan                         |

Contoh CSV:

```csv
N,NISN,NAMA,KELAS
1,0096672112,AISYAH LISTYA NARISTA,10 AKL
2,0088556888,MUHAMMAD SOBRI,12 TKRO 1
```

Request JSON dengan file path di container:

```json
{
  "file_path": "/var/www/database/data/data-siswa.csv"
}
```

Request multipart dari host:

```bash
curl -i -X POST http://localhost:8080/api/import/scan-readiness \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@backend/database/data/data-siswa.csv"
```

Response sukses:

```json
{
  "success": true,
  "message": "Import scan readiness selesai.",
  "data": {
    "import_job_id": 1,
    "summary": {
      "total_rows": 1391,
      "success_rows": 1391,
      "failed_rows": 0,
      "created_students": 1391,
      "updated_students": 0,
      "created_qr": 1391,
      "updated_qr": 0
    }
  }
}
```

Catatan:

- Import terbaru sudah memetakan rombel bernomor secara dinamis.
- Contoh `10 TKRO 1` sampai `10 TKRO 5` masuk ke `rombel_id` berbeda.
- Seed demo tidak di-exclude dari database.
- Jika setelah reset dan import total siswa menjadi `1393`, itu karena seed demo menambah 2 siswa demo.

### GET `/import/jobs`

Status: `implemented`

Permission:

```text
import.read
```

Fungsi: melihat riwayat import.

### GET `/import/jobs/{id}/rows`

Status: `implemented`

Permission:

```text
import.read
```

Fungsi: melihat log baris import.

## Presensi Scan

### POST `/presensi/scan`

Status: `implemented`

Fungsi: menerima payload QR, mencocokkan ke `siswa_qr`, lalu mencatat hasil scan.

Permission:

```text
attendance.scan
```

Request:

```json
{
  "presensi_sesi_id": 9,
  "payload_raw": "https://docs.google.com/forms/d/e/demo/formResponse?entry.1743651050=MUHAMMAD+SOBRI&entry.178375719=0088556888"
}
```

Format payload yang didukung:

| Format                                     | Status                      |
| ------------------------------------------ | --------------------------- |
| URL Google Form dengan parameter `entry.*` | Didukung                    |
| Payload plain berisi nama dan NISN         | Didukung                    |
| NISN dengan nol depan                      | Tetap dibaca sebagai string |

Aturan parser Google Form:

- Parser membaca semua parameter `entry.*` secara dinamis.
- Field yang berisi huruf dipakai sebagai nama.
- Field angka 8 sampai 20 digit dipakai sebagai NISN.
- `+` dibaca sebagai spasi.
- NISN seperti `0088556888` tidak boleh berubah menjadi angka.

### Hasil scan

| Kondisi                                 | `status_scan` | Efek DB                                                             |
| --------------------------------------- | ------------- | ------------------------------------------------------------------- |
| QR valid dan siswa sesuai rombel        | `berhasil`    | `presensi_scan_log` masuk, `presensi_jam_siswa` menjadi `hadir`     |
| QR valid pada mode piket                | `berhasil`    | `presensi_scan_log` masuk, `presensi_jam_siswa` menjadi `terlambat` |
| QR valid tetapi siswa beda rombel       | `warning`     | Hanya masuk `presensi_scan_log`                                     |
| QR tidak dikenal                        | `invalid`     | Hanya masuk `presensi_scan_log`                                     |
| Siswa sudah presensi pada jam yang sama | `ditolak`     | Masuk `presensi_scan_log`, tidak mengubah presensi                  |

Response sukses scan rombel:

```json
{
  "success": true,
  "message": "Scan berhasil.",
  "data": {
    "status_scan": "berhasil",
    "attendance_status": "hadir",
    "affected_rows": 1,
    "warning_reason": "none",
    "siswa": {
      "siswa_id": 1202,
      "nisn": "0088556888",
      "nama_lengkap": "MUHAMMAD SOBRI",
      "kelas_aktif": "12 TKRO 1"
    }
  }
}
```

Response warning beda rombel:

```json
{
  "success": true,
  "message": "Siswa tidak sesuai rombel sesi.",
  "data": {
    "status_scan": "warning",
    "warning_reason": "siswa_tidak_sesuai_rombel",
    "attendance_status": null,
    "affected_rows": 0
  }
}
```

Response invalid QR:

```json
{
  "success": true,
  "message": "QR tidak dikenal.",
  "data": {
    "status_scan": "invalid",
    "attendance_status": null,
    "affected_rows": 0
  }
}
```

Response duplicate scan:

```json
{
  "success": true,
  "message": "Siswa sudah presensi pada jam ini.",
  "data": {
    "status_scan": "ditolak",
    "attendance_status": null,
    "affected_rows": 0
  }
}
```

Tabel yang dipakai:

```text
siswa
siswa_qr
presensi_sesi
presensi_sesi_jam
presensi_scan_log
presensi_jam_siswa
```

## Manual Edit Presensi

Status: `implemented`

Endpoint:

| Method  | Endpoint                       | Fungsi                          |
| ------- | ------------------------------ | ------------------------------- |
| `GET`   | `/api/presensi/jam-siswa`      | Melihat daftar presensi siswa   |
| `PATCH` | `/api/presensi/jam-siswa/{id}` | Mengubah status presensi manual |
| `GET`   | `/api/presensi/edit-reasons`   | Melihat daftar alasan edit      |

Permission:

```text
attendance.manual.read
attendance.manual.update
attendance.edit_reasons.read
attendance.manual.audit.read
```

### GET `/presensi/edit-reasons`

Response berisi alasan edit siap pakai:

```text
siswa_sakit
siswa_izin
siswa_tidak_bawa_kartu
siswa_memakai_kartu_teman
koreksi_input
lainnya
```

## Endpoint untuk Dev Scanner

Route frontend:

```text
/dev/scan
```

Endpoint API yang dipakai:

| Endpoint              | Fungsi                            |
| --------------------- | --------------------------------- |
| `POST /auth/login`    | Login demo                        |
| `GET /rombel/options` | Isi dropdown rombel dari database |
| `POST /presensi/sesi` | Membuat sesi                      |
| `POST /presensi/scan` | Mengirim hasil scan               |

Catatan:

- `/dev/scan` hanya halaman demo.
- Vite memakai `server.allowedHosts: true` agar Cloudflare Quick Tunnel dapat memakai host dinamis.
- Konfigurasi ini untuk demo, bukan production.

## Error Code

| HTTP Code | Arti                               |
| --------- | ---------------------------------- |
| `200`     | Berhasil                           |
| `201`     | Data dibuat                        |
| `401`     | Belum login atau token tidak valid |
| `403`     | Tidak punya akses                  |
| `404`     | Endpoint atau data tidak ditemukan |
| `405`     | Method tidak diizinkan             |
| `409`     | Konflik data                       |
| `422`     | Validasi gagal                     |
| `500`     | Error sistem                       |
