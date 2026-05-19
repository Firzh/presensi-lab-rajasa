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

### POST `/presensi/sesi`

Status: `implemented`

Fungsi: membuat sesi presensi baru.

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

## Presensi Scan

Status: `planned`

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/presensi/scan` | Menerima hasil scan QR |

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
