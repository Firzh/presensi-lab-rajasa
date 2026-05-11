# Auth Contract

## 1. Purpose

Kontrak ini mengatur login, logout, session, role, dan larangan praktik auth palsu di frontend.

## 2. Current Auth Mode

Mode awal yang disarankan:

```text
Cookie-based session
```

Alasan:

- lebih sederhana untuk aplikasi sekolah internal;
- frontend tidak perlu menyimpan token;
- sesuai pola request `credentials: include` yang sudah muncul di kode fitur;
- mengurangi risiko token palsu di browser.

## 3. Required Endpoints

```text
POST /api/login
POST /api/logout
GET  /api/me
```

## 4. Session Rule

Jika memakai cookie session:

- backend membuat session setelah login berhasil;
- cookie harus `HttpOnly` apabila memungkinkan;
- frontend harus memanggil API dengan `credentials: 'include'`;
- frontend tidak boleh membuat token sendiri;
- frontend tidak boleh menganggap user login hanya karena ada data user di `localStorage`.

## 5. Frontend Auth State Rule

Frontend boleh menyimpan state user aktif di memory state.

`localStorage` hanya boleh menyimpan preferensi non-sensitive. Menyimpan data user untuk auto-login tidak boleh dijadikan sumber kebenaran.

Saat aplikasi dibuka:

```text
App start → GET /api/me → set auth user if valid → otherwise redirect login
```

## 6. Forbidden Pattern

Dilarang keras:

```js
const token = result.token || `session_${Date.now()}`
```

Alasan:

- token palsu membuat frontend merasa authenticated padahal backend belum mengesahkan sesi;
- role dan akses bisa terlihat valid tanpa kontrol server;
- bug auth menjadi sulit dideteksi.

## 7. User Shape

User aktif minimal:

```json
{
  "id": 1,
  "nama_lengkap": "Administrator Utama",
  "username": "admin",
  "primary_role_slug": "admin",
  "primary_role_name": "Admin Operator"
}
```

## 8. Role Contract

Role awal:

| Slug | Name | Access |
|---|---|---|
| admin | Admin Operator | Dashboard admin, data siswa, jurusan, ruangan |
| siswa | Siswa | Dashboard siswa |

Role tambahan harus didokumentasikan sebelum dipakai.

## 9. Auth Error Contract

Belum login:

```json
{
  "success": false,
  "message": "Unauthenticated.",
  "errors": {},
  "meta": {}
}
```

HTTP status: `401`.

Tidak punya akses:

```json
{
  "success": false,
  "message": "Forbidden.",
  "errors": {},
  "meta": {}
}
```

HTTP status: `403`.

## 10. Logout Rule

Logout harus:

- menghapus session backend;
- mengembalikan response sukses;
- frontend membersihkan state user;
- frontend redirect ke `/login`.

## 11. Future Token Mode

Jika nanti ingin memakai Bearer token, buat RFC terlebih dahulu. Jangan mencampur cookie session dan token mode tanpa keputusan resmi.
