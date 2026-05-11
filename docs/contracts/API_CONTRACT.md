# API Contract

## 1. Purpose

Kontrak ini mengatur format endpoint, payload, response, error, dan pagination Presensi Lab Rajasa.

## 2. General Rules

Semua endpoint API wajib:

- memakai prefix `/api`;
- menerima dan mengembalikan JSON;
- memakai response envelope yang sama;
- mengembalikan HTTP status sesuai makna;
- tidak mengembalikan HTML untuk request API;
- tidak membocorkan stack trace ke frontend;
- tidak mengubah struktur response tanpa update dokumen ini.

## 3. Response Envelope

### 3.1 Success Object

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "meta": {}
}
```

### 3.2 Success List

```json
{
  "success": true,
  "message": "OK",
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 0,
    "total_pages": 0
  }
}
```

### 3.3 Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field_name": ["Pesan error."]
  },
  "meta": {}
}
```

## 4. HTTP Status Contract

| Status | Meaning |
|---|---|
| 200 | Request sukses. |
| 201 | Resource berhasil dibuat. |
| 204 | Resource berhasil dihapus tanpa body. |
| 400 | Request tidak valid secara umum. |
| 401 | Belum login atau sesi tidak valid. |
| 403 | Login valid tetapi tidak punya izin. |
| 404 | Resource tidak ditemukan. |
| 409 | Konflik data, misalnya kode jurusan sudah ada. |
| 422 | Validasi field gagal. |
| 500 | Error server yang tidak diharapkan. |

## 5. Query Parameter Contract

List endpoint boleh menerima:

```text
?page=1
?per_page=10
?search=keyword
?status=Aktif
?sort=created_at
?direction=desc
```

Filter spesifik domain boleh ditambahkan setelah didokumentasikan.

## 6. Health Endpoint

### GET `/api/health`

Response:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "service": "presensi-lab-backend",
    "status": "healthy"
  },
  "meta": {}
}
```

## 7. Auth Endpoints

### POST `/api/login`

Request:

```json
{
  "username": "admin",
  "password": "secret",
  "remember": false
}
```

Response:

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "user": {
      "id": 1,
      "nama_lengkap": "Administrator Utama",
      "username": "admin",
      "primary_role_slug": "admin",
      "primary_role_name": "Admin Operator"
    }
  },
  "meta": {}
}
```

Catatan: apabila auth memakai cookie session, response tidak perlu mengembalikan token.

### POST `/api/logout`

Response:

```json
{
  "success": true,
  "message": "Logout berhasil.",
  "data": null,
  "meta": {}
}
```

### GET `/api/me`

Response sama dengan data user login.

## 8. Jurusan API

### 8.1 GET `/api/admin/jurusan`

Response item:

```json
{
  "id": 1,
  "kode": "TKJ",
  "nama_jurusan": "Teknik Komputer dan Jaringan",
  "ketua_jurusan": "Nama Ketua Jurusan",
  "status": "Aktif",
  "created_at": "2026-05-11T00:00:00+07:00",
  "updated_at": "2026-05-11T00:00:00+07:00"
}
```

### 8.2 POST `/api/admin/jurusan`

Request:

```json
{
  "kode": "TKJ",
  "nama_jurusan": "Teknik Komputer dan Jaringan",
  "ketua_jurusan": "Nama Ketua Jurusan",
  "status": "Aktif"
}
```

Validation:

| Field | Rule |
|---|---|
| kode | required, string, max 20, unique |
| nama_jurusan | required, string, max 150 |
| ketua_jurusan | nullable, string, max 150 |
| status | required, enum Aktif/Nonaktif |

## 9. Ruangan API

### 9.1 GET `/api/admin/ruangan`

Response item:

```json
{
  "id": 1,
  "jenis_ruangan": "Lab",
  "kode": "LAB-TKJ-1",
  "nama_ruangan": "LAB Teknik Komputer Jaringan 1",
  "kapasitas": 32,
  "terisi": 0,
  "lokasi": "Lantai 2 Gedung A",
  "jaringan": "192.168.1.xx / xx:xx:xx:xx",
  "fasilitas": "Komputer, Proyektor",
  "status": "Aktif",
  "created_at": "2026-05-11T00:00:00+07:00",
  "updated_at": "2026-05-11T00:00:00+07:00"
}
```

### 9.2 POST `/api/admin/ruangan`

Request:

```json
{
  "jenis_ruangan": "Lab",
  "kode": "LAB-TKJ-1",
  "nama_ruangan": "LAB Teknik Komputer Jaringan 1",
  "kapasitas": 32,
  "lokasi": "Lantai 2 Gedung A",
  "jaringan": "192.168.1.xx / xx:xx:xx:xx",
  "fasilitas": "Komputer, Proyektor",
  "status": "Aktif"
}
```

Validation:

| Field | Rule |
|---|---|
| jenis_ruangan | required, enum Kelas/Lab/Rombel/Workshop |
| kode | required, string, max 50, unique |
| nama_ruangan | required, string, max 150 |
| kapasitas | required, integer, min 1 |
| lokasi | required, string, max 150 |
| jaringan | nullable, string, max 150 |
| fasilitas | nullable, string |
| status | required, enum Aktif/Nonaktif |

## 10. Siswa API

### 10.1 GET `/api/admin/siswa`

Allowed filters:

```text
search
jurusan_id
kelas
gender
status
page
per_page
```

Response item:

```json
{
  "id": 1,
  "nisn": "0068234587",
  "nis": "240001",
  "nama_lengkap": "RACHMAD HIDAYAT",
  "tempat_lahir": "Surabaya",
  "tanggal_lahir": "2008-03-12",
  "jurusan_id": 1,
  "jurusan": {
    "id": 1,
    "kode": "TKJ",
    "nama_jurusan": "Teknik Komputer dan Jaringan"
  },
  "kelas": "X-1",
  "gender": "L",
  "status": "Aktif",
  "catatan": "",
  "created_at": "2026-05-11T00:00:00+07:00",
  "updated_at": "2026-05-11T00:00:00+07:00"
}
```

### 10.2 POST `/api/admin/siswa`

Request:

```json
{
  "nisn": "0068234587",
  "nis": "240001",
  "nama_lengkap": "RACHMAD HIDAYAT",
  "tempat_lahir": "Surabaya",
  "tanggal_lahir": "2008-03-12",
  "jurusan_id": 1,
  "kelas": "X-1",
  "gender": "L",
  "status": "Aktif",
  "catatan": ""
}
```

Validation:

| Field | Rule |
|---|---|
| nisn | nullable, string, max 20, unique |
| nis | nullable, string, max 20, unique |
| nama_lengkap | required, string, max 150 |
| tempat_lahir | nullable, string, max 100 |
| tanggal_lahir | nullable, date |
| jurusan_id | required, exists jurusan.id |
| kelas | required, string, max 30 |
| gender | required, enum L/P |
| status | required, enum Aktif/Lulus/Keluar/Mutasi |
| catatan | nullable, string |

## 11. Mutating Endpoint Rule

Semua endpoint `POST`, `PUT`, dan `DELETE` wajib:

- validasi input;
- auth check;
- authorization check minimal;
- mengembalikan error 422 untuk validasi;
- mengembalikan 404 jika data tidak ditemukan;
- mengembalikan 409 untuk konflik unique constraint.

## 12. Breaking Change Rule

Perubahan response shape dianggap breaking change. Breaking change wajib:

1. update dokumen ini;
2. update mapper frontend;
3. update test;
4. update changelog.
