# API

Branch acuan: `alfy/combine`

Base URL development:

```text
http://localhost:8080/api
```

Frontend Vite dapat memakai proxy:

```text
/api
```

## Format Response

Sukses:

```json
{
  "success": true,
  "message": "Berhasil",
  "data": {}
}
```

Gagal:

```json
{
  "success": false,
  "message": "Terjadi kesalahan",
  "errors": {}
}
```

catatan:

- Response error dapat memiliki field opsional `code` jika error internal sudah dimigrasikan pada flow terkait.

Auth header:

```text
Authorization: Bearer TOKEN
```

## Endpoint Ringkas

| Method   | Endpoint                                  | Fungsi                                             | Permission                     |
| -------- | ----------------------------------------- | -------------------------------------------------- | ------------------------------ |
| `GET`    | `/health`                                 | Cek backend aktif                                  | Public                         |
| `POST`   | `/auth/login`                             | Login dan ambil token                              | Public                         |
| `POST`   | `/auth/logout`                            | Logout client-side                                 | Login                          |
| `GET`    | `/me`                                     | Data user aktif                                    | Login                          |
| `GET`    | `/rombel/options`                         | Daftar rombel aktif                                | `attendance.session.read`      |
| `GET`    | `/siswa`                                  | Menampilkan daftar siswa                           | `student.read`                 |
| `GET`    | `/jurusan`                                | Daftar jurusan                                     | `jurusan.read`                 |
| `POST`   | `/jurusan`                                | Menambah jurusan                                   | `jurusan.create`               |
| `PATCH`  | `/jurusan/{id}`                           | Memperbarui jurusan                                | `jurusan.update`               |
| `DELETE` | `/jurusan/{id}`                           | Menonaktifkan jurusan                              | `jurusan.delete`               |
| `GET`    | `/admin/users`                            | Daftar user                                        | `users.read`                   |
| `POST`   | `/admin/users`                            | Menambah user                                      | `users.create`                 |
| `PATCH`  | `/admin/users/{id}`                       | Memperbarui user                                   | `users.update`                 |
| `GET`    | `/admin/user-activities`                  | Log aktivitas user                                 | `user_activities.read`         |
| `GET`    | `/settings`                               | Data pengaturan                                    | `konfigurasi.read`             |
| `POST`   | `/settings/backup`                        | Membuat backup database                            | `konfigurasi.manage`           |
| `GET`    | `/settings/backup/download`               | Mengambil file backup                              | `konfigurasi.read`             |
| `POST`   | `/settings/backup/preview-import`         | Preview file backup                                | `konfigurasi.manage`           |
| `POST`   | `/settings/backup/import`                 | Restore data dari backup                           | `konfigurasi.manage`           |
| `PATCH`  | `/settings/rombel-schedule`               | Memperbarui jadwal rombel                          | `konfigurasi.manage`           |
| `PATCH`  | `/settings/late-rule`                     | Memperbarui aturan terlambat                       | `konfigurasi.manage`           |
| `POST`   | `/presensi/sesi/check-warning`            | Cek jam sudah pernah dipakai hari ini              | `attendance.session.create`    |
| `POST`   | `/presensi/sesi`                          | Membuat sesi presensi                              | `attendance.session.create`    |
| `GET`    | `/presensi/sesi/aktif`                    | Melihat sesi aktif/suspended                       | `attendance.session.read`      |
| `POST`   | `/presensi/sesi/{id}/pause`               | Menjeda sesi                                       | `attendance.session.update`    |
| `POST`   | `/presensi/sesi/{id}/resume`              | Melanjutkan sesi                                   | `attendance.session.update`    |
| `POST`   | `/presensi/sesi/{id}/finish`              | Menutup sesi                                       | `attendance.session.update`    |
| `POST`   | `/presensi/sesi/{id}/heartbeat`           | Menjaga sesi tetap aktif                           | `attendance.session.update`    |
| `POST`   | `/import/scan-readiness`                  | Import siswa CSV untuk QR                          | `import.submit`                |
| `POST`   | `/import/preview`                         | Preview CSV/XLSX tanpa menulis database            | `import.submit`                |
| `POST`   | `/import`                                 | Import one-gate CSV/XLSX dengan auto-detect header | `import.submit`                |
| `GET`    | `/import/jobs`                            | Riwayat import                                     | `import.read`                  |
| `GET`    | `/import/jobs/{id}/rows`                  | Log baris import                                   | `import.read`                  |
| `POST`   | `/presensi/scan`                          | Menerima hasil scan QR atau fallback NISN      | `attendance.scan`              |
| `GET`    | `/presensi/audit/latest`                  | Audit scan dan presensi terkini                    | `attendance.log.read`          |
| `GET`    | `/presensi/jam-siswa`                     | Daftar presensi siswa                              | `attendance.manual.read`       |
| `PATCH`  | `/presensi/jam-siswa/{id}`                | Edit presensi manual                               | `attendance.manual.update`     |
| `GET`    | `/presensi/edit-reasons`                  | Daftar alasan edit                                 | `attendance.edit_reasons.read` |
| `GET`    | `/reports/presensi`                       | Daftar dan ringkasan laporan presensi              | `reports.attendance.read`      |
| `GET`    | `/reports/presensi/export`                | Export laporan CSV/XLSX/PDF/DOCX                   | `reports.attendance.export`    |


## Auth

### POST `/auth/login`

Request:

```json
{
  "username": "admin.demo",
  "password": "Rajasa@123"
}
```

Response mengembalikan token, user, role, dan permission.

Token login berlaku 10 menit; response juga memuat `token_type`, `expires_in`, dan `expires_at`.

### GET `/me`

Mengembalikan user aktif berdasarkan bearer token.

## Rombel Options

### GET `/rombel/options`

Fungsi: mengisi dropdown rombel dari database.

Response utama:

```json
{
  "rombel": [
    {
      "rombel_id": 38,
      "label": "12 TKRO 1",
      "tingkat_angka": 12,
      "nomor_rombel": 1,
      "status": "aktif"
    }
  ]
}
```

## Presensi Sesi

### POST `/presensi/sesi`

Request mode rombel:

```json
{
  "mode_presensi": "rombel",
  "rombel_id": 38,
  "jam_ids": [1, 2],
  "ruang_pilihan": "kelas"
}
```

Request mode piket:

```json
{
  "mode_presensi": "piket",
  "jam_ids": [1, 2],
  "ruang_pilihan": "piket"
}
```

Aturan utama:

| Aturan                                               | Response |
| ---------------------------------------------------- | -------- |
| Token tidak ada                                      | `401`    |
| Tidak punya permission                               | `403`    |
| Mode tidak valid                                     | `422`    |
| Rombel wajib untuk mode `rombel`                     | `422`    |
| Mode `piket` tidak boleh memilih rombel              | `422`    |
| Jam kosong/lebih dari 3/tidak berurutan              | `422`    |
| Rombel pernah dipakai pada tanggal dan jam yang sama | `409`    |
| Lab pernah dipakai pada tanggal dan jam yang sama    | `409`    |

### POST `/presensi/sesi/check-warning`

Fungsi: memberi warning jika mode rombel memiliki konflik rombel dan jam pada tanggal yang sama.

Response aman:

```json
{
  "has_warning": false,
  "message": "Tidak ada warning.",
  "conflicts": []
}
```

Response warning:

```json
{
  "has_warning": true,
  "message": "Rombel sudah memiliki sesi pada jam yang dipilih.",
  "conflicts": [
    {
      "presensi_sesi_id": 12,
      "jam_id": 1,
      "status": "selesai",
      "ruang_label_snapshot": "Kelas 12 TKRO 1"
    }
  ]
}
```

Catatan:

- Untuk `mode_presensi = rombel`, sesi lama berstatus `aktif`, `suspended`, `expired`, atau `selesai` tetap dihitung sebagai konflik jika `rombel_id`, tanggal, dan `jam_id` sama.
- Untuk ruang lab, sesi lama berstatus apa pun tetap dihitung sebagai konflik jika ruang lab, tanggal, dan `jam_id` sama.
- Untuk `mode_presensi = piket`, check-warning selalu aman dan tidak dikunci oleh sesi rombel/lab.
- Warning bersifat pra-validasi frontend; validasi final tetap dilakukan saat create sesi.

### POST `/presensi/sesi/{id}/heartbeat`

Fungsi: memperbarui aktivitas sesi.

Aturan:

```text
timeout = 5 menit tanpa aktivitas
heartbeat memperbarui last_seen_at dan expires_at
sesi idle berubah menjadi expired
ended_reason = timeout
```

### POST `/presensi/sesi/{id}/finish`

Fungsi: mengakhiri sesi secara manual.

## Import Advanced

### POST `/import`

Fungsi: import one-gate CSV/XLSX dengan auto-detect jenis data. Tahap 10.1 baru mengaktifkan import `siswa`; deteksi `guru` dan `wali_kelas` masih `disabled`.

Input didukung:

```text
multipart file
file_path
```

Format didukung:

```text
.csv
.xlsx
```

### POST `/import/preview`

Memvalidasi dan menampilkan preview CSV/XLSX tanpa menulis database. Input sama dengan `/import`: multipart `file` atau `file_path`.

## Import Scan Readiness

### POST `/import/scan-readiness`

Fungsi: import CSV siswa untuk kebutuhan scan QR.

Kolom wajib:

| Kolom   | Fungsi                           |
| ------- | -------------------------------- |
| `NISN`  | Identitas QR dan siswa           |
| `NAMA`  | Nama siswa                       |
| `KELAS` | Jurusan, rombel, dan kelas aktif |

Request file path:

```json
{
  "file_path": "/var/www/database/data/data-siswa.csv"
}
```

Request multipart:

```bash
curl -i -X POST http://localhost:8080/api/import/scan-readiness \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@backend/database/data/data-siswa.csv"
```

Response sukses:

```json
{
  "import_job_id": 1,
  "summary": {
    "total_rows": 1391,
    "success_rows": 1391,
    "failed_rows": 0
  }
}
```

Implementasi saat ini:

```text
CSV siswa aktif
mapping rombel bernomor aktif
10 TKRO 1 sampai 10 TKRO 5 masuk rombel berbeda
```

## Presensi Scan

### POST `/presensi/scan`

Request QR:

```json
{
  "presensi_sesi_id": 9,
  "payload_raw": "https://docs.google.com/forms/d/e/demo/formResponse?entry.1743651050=MUHAMMAD+SOBRI&entry.178375719=0088556888"
}
```

Request fallback NISN:

```json
{
  "presensi_sesi_id": 1,
  "fallback_nisn": "0096672112"
}
```

Salah satu dari `payload_raw` atau `fallback_no_presensi` wajib diisi.

Format payload yang didukung:

| Format                      | Status       |
| --------------------------- | ------------ |
| URL Google Form `entry.*`   | Didukung     |
| Payload plain nama dan NISN | Didukung     |
| NISN nol depan              | Tetap string |
| `fallback_no_presensi`      | Nomor urut siswa aktif di rombel sesi berdasarkan `nama_lengkap ASC`, `siswa_id ASC` |

Hasil scan:

| Kondisi                | `status_scan` | Efek DB                           |
| ---------------------- | ------------- | --------------------------------- |
| QR valid sesuai rombel | `berhasil`    | `presensi_jam_siswa = hadir`      |
| Fallback NISN valid | `berhasil`    | `presensi_jam_siswa = hadir`      |
| QR valid mode piket    | `berhasil`    | `presensi_jam_siswa = terlambat`  |
| QR valid beda rombel   | `warning`     | Hanya masuk `presensi_scan_log`   |
| QR tidak dikenal       | `invalid`     | Hanya masuk `presensi_scan_log`   |
| Scan duplikat          | `ditolak`     | Log masuk, presensi tidak berubah |

Response berhasil:

```json
{
  "status_scan": "berhasil",
  "attendance_status": "hadir",
  "affected_rows": 1,
  "warning_reason": "none"
}
```

Response warning:

```json
{
  "status_scan": "warning",
  "warning_reason": "siswa_tidak_sesuai_rombel",
  "attendance_status": null,
  "affected_rows": 0
}
```

## Audit Presensi Terkini

### GET `/presensi/audit/latest`

Fungsi: menampilkan ringkasan scan dan presensi terbaru untuk halaman demo audit.

Response utama:

```json
{
  "summary": {
    "scan_berhasil": 1,
    "scan_warning": 0,
    "scan_invalid": 0,
    "scan_ditolak": 0,
    "attendance_from_scan": 1
  },
  "scan_logs": [],
  "attendance_rows": []
}
```

## Manual Edit Presensi

### GET `/presensi/jam-siswa`

Fungsi: melihat daftar presensi siswa untuk koreksi manual.

Filter umum:

```text
tanggal
rombel_id
jam_id
status
q
```

### PATCH `/presensi/jam-siswa/{id}`

Request:

```json
{
  "status": "izin",
  "reason_code": "siswa_izin",
  "reason_text": ""
}
```

Aturan:

```text
status: alpha, hadir, terlambat, izin, sakit
reason_code = lainnya wajib reason_text
status baru tidak boleh sama dengan status lama
setiap edit masuk presensi_edit_log
```

### GET `/presensi/edit-reasons`

Response:

```json
{
  "reasons": [
    {
      "code": "siswa_izin",
      "label": "Siswa izin",
      "requires_text": false
    },
    {
      "code": "lainnya",
      "label": "Lainnya",
      "requires_text": true
    }
  ]
}
```

Alasan yang tersedia:

```text
siswa_sakit
siswa_izin
siswa_tidak_bawa_kartu
siswa_memakai_kartu_teman
koreksi_input
lainnya
```


## Implementasi API Terbaru

- Endpoint ringkas sudah dicek ulang terhadap `backend/routes/api.php` pada branch `alfy/combine`.
- `GET /reports/presensi` menerima `date_from`, `date_to`, `rombel_id`, `siswa_id`, `jam_ke`, `status`, `mode`, `page`, dan `per_page`.
- `GET /reports/presensi/export` memakai filter yang sama ditambah `format=csv|xlsx|pdf|docx`; respons berupa file attachment dan format tidak valid menghasilkan `400`.
- Export `csv/xlsx` tetap detail per jam, sedangkan `pdf/docx` memakai format compact per siswa: `Kehadiran`, `Jam Pelajaran Tidak Hadir`, dan status tampilan `Hadir/Tidak Lengkap`.
- Backup dibuat melalui `POST /settings/backup`, diambil dengan `GET /settings/backup/download?file=...`, lalu dipreview/restore memakai multipart `file` atau `file_path`; restore berjalan dalam mode data-only.
- Endpoint jurusan dan admin user memakai JSON body, sedangkan endpoint daftar mendukung filter/paginasi sesuai controller.

## Implementasi Dev Saat Ini

Route frontend demo:

| Route                   | Fungsi                      |
| ----------------------- | --------------------------- |
| `/dev/scan`             | Demo scan QR presensi       |
| `/dev/attendance-audit` | Demo hasil presensi terkini |

Catatan dev:

```text
/dev/* hanya untuk demo/testing
Cloudflare Quick Tunnel didukung untuk kamera HP
scanner HP memakai crop, qrbox besar, dan camera track enhancement
```

Catatan implementasi backend:

```text
Endpoint bertambah untuk preview import, laporan/export, pengaturan/backup, jurusan, dan admin user.
Validasi permission tetap dilakukan di controller melalui PermissionMiddleware.
Orchestration utama tetap dipisahkan ke service.
```

Tambahan implementasi frontend:

```text
Pemanggilan API dipisah per modul, termasuk import, laporan, pengaturan, dan presensi scan.
Routing halaman tetap berada di frontend route, bukan endpoint API backend.
```

## Error Code

| Code  | Arti                               |
| ----- | ---------------------------------- |
| `200` | Berhasil                           |
| `201` | Data dibuat                        |
| `400` | Request atau format tidak valid     |
| `401` | Token tidak ada/tidak valid        |
| `403` | Tidak punya akses                  |
| `404` | Endpoint atau data tidak ditemukan |
| `405` | Method tidak diizinkan             |
| `409` | Konflik data                       |
| `422` | Validasi gagal                     |
| `500` | Error sistem                       |
