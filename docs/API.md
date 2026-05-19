# API

Dokumen ini menjelaskan API MVP Presensi Siswa Rajasa.

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

Status:

```text
implemented
```

Fungsi:

Login user.

Request:

```json
{
  "username": "admin.demo",
  "password": "Rajasa@123"
}
```

Response sukses:

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token": "...",
    "user": {
      "user_id": 2,
      "username": "admin.demo",
      "email": "admin.demo@smksrajasa.sch.id",
      "user_type": "admin",
      "siswa_id": null,
      "guru_id": 2,
      "status": "aktif"
    },
    "roles": ["Admin"],
    "permissions": ["dashboard.read"]
  }
}
```

Response password salah:

```json
{
  "success": false,
  "message": "Username atau password salah.",
  "errors": []
}
```

Response validasi gagal:

```json
{
  "success": false,
  "message": "Validasi gagal.",
  "errors": {
    "username": "Username wajib diisi.",
    "password": "Password wajib diisi."
  }
}
```

### POST `/auth/logout`

Status:

```text
implemented
```

Fungsi:

Logout client-side.

Catatan:

Token masih stateless. Logout dilakukan dengan menghapus token di sisi client.

Response:

```json
{
  "success": true,
  "message": "Logout berhasil.",
  "data": {
    "note": "Token stateless. Hapus token di sisi client."
  }
}
```

### GET `/me`

Status:

```text
implemented
```

Fungsi:

Mengambil user aktif, role, dan permission.

Header:

```text
Authorization: Bearer TOKEN
```

Response sukses:

```json
{
  "success": true,
  "message": "Data user aktif.",
  "data": {
    "user": {
      "username": "admin.demo",
      "user_type": "admin",
      "status": "aktif"
    },
    "roles": ["Admin"],
    "permissions": ["dashboard.read"]
  }
}
```

Response tanpa token:

```json
{
  "success": false,
  "message": "Token tidak ditemukan.",
  "errors": []
}
```

Response token rusak:

```json
{
  "success": false,
  "message": "Token tidak valid.",
  "errors": []
}
```

## Health

### GET `/health`

Status:

```text
implemented
```

Fungsi:

Cek backend hidup.

Response:

```json
{
  "success": true,
  "message": "Backend API is running",
  "data": {
    "service": "presensi-siswa-api",
    "app": "Presensi Siswa Rajasa",
    "env": "local",
    "status": "ok"
  }
}
```

## Presensi Sesi

Status:

```text
planned
```

Rencana endpoint:

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/presensi/sesi` | Membuat sesi presensi |
| `GET` | `/presensi/sesi/aktif` | Melihat sesi aktif user |
| `POST` | `/presensi/sesi/{id}/pause` | Pause sesi |
| `POST` | `/presensi/sesi/{id}/resume` | Resume sesi |
| `POST` | `/presensi/sesi/{id}/finish` | Menutup sesi |

Aturan:

- mode `rombel` wajib punya `rombel_id`,
- mode `piket` tidak boleh punya `rombel_id`,
- maksimal 3 jam,
- jam harus berurutan.

## Presensi Scan

Status:

```text
planned
```

Rencana endpoint:

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/presensi/scan` | Menerima hasil scan QR |

Request rencana:

```json
{
  "presensi_sesi_id": 1,
  "payload_raw": "NAMA SISWA|1234567890"
}
```

## Laporan

Status:

```text
planned
```

Rencana endpoint:

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/laporan/presensi` | Laporan presensi |
| `GET` | `/laporan/presensi/export` | Export laporan |

## Import

Status:

```text
planned
```

Rencana endpoint:

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/import/siswa` | Import siswa |
| `GET` | `/import/jobs` | Riwayat import |
| `GET` | `/import/jobs/{id}/rows` | Log baris import |

## Error Code

| HTTP Code | Arti |
|---|---|
| 200 | Berhasil |
| 201 | Data dibuat |
| 400 | Request tidak valid |
| 401 | Belum login atau token tidak valid |
| 403 | Tidak punya akses |
| 404 | Endpoint/data tidak ditemukan |
| 405 | Method tidak diizinkan |
| 409 | Konflik data |
| 422 | Validasi gagal |
| 500 | Error sistem |
