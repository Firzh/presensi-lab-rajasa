# API

Dokumen ini menjelaskan rancangan API MVP Presensi Siswa Rajasa.

Status API:

```text
draft baseline
```

Dokumen ini menjadi acuan pengembangan backend. Endpoint yang belum dibuat harus ditandai sebagai planned saat implementasi dimulai.

## Base URL

Development:

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

Status:

```text
planned
```

Fungsi:

Login user.

Body:

```json
{
  "username": "guru.demo",
  "password": "password"
}
```

Response:

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {},
    "permissions": []
  }
}
```

### POST `/auth/logout`

Status:

```text
planned
```

Fungsi:

Logout user aktif.

### GET `/me`

Status:

```text
planned
```

Fungsi:

Mengambil data user aktif.

Response:

```json
{
  "success": true,
  "message": "Data user aktif",
  "data": {
    "user": {},
    "roles": [],
    "permissions": []
  }
}
```

## Health

### GET `/health`

Status:

```text
stub
```

Fungsi:

Cek backend hidup.

Response:

```json
{
  "success": true,
  "message": "Backend API is running"
}
```

## Rombel

### GET `/rombel`

Status:

```text
planned
```

Fungsi:

Mengambil daftar rombel aktif.

Query opsional:

```text
tahun_ajaran_id
tingkat
jurusan_id
```

### GET `/rombel/{id}/siswa`

Status:

```text
planned
```

Fungsi:

Mengambil daftar siswa aktif dalam rombel.

## Presensi Sesi

### POST `/presensi/sesi`

Status:

```text
planned
```

Fungsi:

Membuat sesi presensi.

Body mode rombel:

```json
{
  "mode_presensi": "rombel",
  "rombel_id": 1,
  "jam_ids": [1, 2]
}
```

Body mode piket:

```json
{
  "mode_presensi": "piket",
  "jam_ids": [1]
}
```

Aturan:

- mode `rombel` wajib punya `rombel_id`,
- mode `piket` tidak boleh punya `rombel_id`,
- maksimal 3 jam,
- jam harus berurutan.

### GET `/presensi/sesi/aktif`

Status:

```text
planned
```

Fungsi:

Mengambil sesi aktif atau suspended milik user.

### POST `/presensi/sesi/{id}/pause`

Status:

```text
planned
```

Fungsi:

Mengubah status sesi menjadi suspended.

### POST `/presensi/sesi/{id}/resume`

Status:

```text
planned
```

Fungsi:

Melanjutkan sesi suspended.

### POST `/presensi/sesi/{id}/finish`

Status:

```text
planned
```

Fungsi:

Menutup sesi presensi.

## Presensi Scan

### POST `/presensi/scan`

Status:

```text
planned
```

Fungsi:

Menerima hasil scan QR.

Body:

```json
{
  "presensi_sesi_id": 1,
  "payload_raw": "NAMA SISWA|1234567890"
}
```

Response berhasil:

```json
{
  "success": true,
  "message": "Presensi berhasil",
  "data": {
    "status_scan": "berhasil",
    "status_presensi": "hadir"
  }
}
```

Response warning:

```json
{
  "success": true,
  "message": "QR tidak sesuai rombel",
  "data": {
    "status_scan": "warning",
    "payload_nama": "Nama Pemilik Kartu",
    "payload_nisn": "1234567890",
    "actual_rombel": "XI-TKJ-1",
    "selected_rombel": "X-TKJ-1"
  }
}
```

Response invalid:

```json
{
  "success": false,
  "message": "QR tidak ditemukan",
  "errors": {
    "payload": "Payload QR tidak terdaftar"
  }
}
```

## Presensi Manual

### PATCH `/presensi/{id}`

Status:

```text
planned
```

Fungsi:

Mengubah status presensi siswa secara manual.

Body:

```json
{
  "status": "izin",
  "keterangan": "Izin mengikuti kegiatan sekolah",
  "alasan_edit": "Dikonfirmasi oleh guru piket"
}
```

Aturan:

- hanya user dengan permission edit yang boleh mengakses,
- semua edit masuk `presensi_edit_log`.

## Warning

### GET `/warnings`

Status:

```text
planned
```

Fungsi:

Mengambil daftar warning scan.

Query opsional:

```text
tanggal
rombel_id
status_resolved
```

### GET `/warnings/wali-kelas`

Status:

```text
planned
```

Fungsi:

Mengambil warning untuk wali kelas aktif.

Data dicocokkan berdasarkan:

```text
rombel
tahun_ajaran
semester
```

### PATCH `/warnings/{id}/resolve`

Status:

```text
planned
```

Fungsi:

Menandai warning sudah ditangani.

Body:

```json
{
  "catatan": "Sudah dikonfirmasi oleh wali kelas"
}
```

## Laporan

### GET `/laporan/presensi`

Status:

```text
planned
```

Fungsi:

Mengambil laporan presensi.

Query:

```text
tanggal
rombel_id
jam_id
status
siswa_id
```

### GET `/laporan/presensi/export`

Status:

```text
planned
```

Fungsi:

Export laporan presensi.

Format yang direncanakan:

```text
xlsx
csv
pdf
docx
```

## Import

### POST `/import/siswa`

Status:

```text
planned
```

Fungsi:

Import data siswa.

Body:

```text
multipart/form-data
```

Field:

```text
file
tahun_ajaran_id
```

Aturan:

- sistem cek template standar,
- jika tidak sesuai, sistem cek `import_column_mappings`,
- jika tetap gagal, error dicatat.

### GET `/import/jobs`

Status:

```text
planned
```

Fungsi:

Melihat riwayat import.

### GET `/import/jobs/{id}/rows`

Status:

```text
planned
```

Fungsi:

Melihat log baris import.

## Error Code Umum

| HTTP Code | Arti                 |
| --------- | -------------------- |
| 200       | Berhasil             |
| 201       | Data dibuat          |
| 400       | Request tidak valid  |
| 401       | Belum login          |
| 403       | Tidak punya akses    |
| 404       | Data tidak ditemukan |
| 409       | Konflik data         |
| 422       | Validasi gagal       |
| 500       | Error sistem         |

## Permission Endpoint

Permission MVP yang direncanakan:

```text
attendance.read
attendance.scan.rombel
attendance.scan.piket
attendance.edit
attendance.warning.read
attendance.warning.resolve
attendance.report.read
attendance.report.export
student.attendance.view
import.run
import.read
user.read
master.read
master.manage
system.error.read
```
