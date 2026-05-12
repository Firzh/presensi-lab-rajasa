# Error Contract

## 1. Purpose

Kontrak ini mengatur bentuk error backend dan cara frontend menampilkannya.

## 2. Backend Error Envelope

Semua error API wajib memakai format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {},
  "meta": {}
}
```

## 3. Validation Error

HTTP status: `422`.

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "nama_lengkap": ["Nama lengkap wajib diisi."],
    "jurusan_id": ["Jurusan tidak valid."]
  },
  "meta": {}
}
```

## 4. Not Found Error

HTTP status: `404`.

```json
{
  "success": false,
  "message": "Data tidak ditemukan.",
  "errors": {},
  "meta": {}
}
```

## 5. Conflict Error

HTTP status: `409`.

```json
{
  "success": false,
  "message": "Data sudah digunakan.",
  "errors": {
    "kode": ["Kode sudah digunakan."]
  },
  "meta": {}
}
```

## 6. Server Error

HTTP status: `500`.

```json
{
  "success": false,
  "message": "Terjadi kesalahan server.",
  "errors": {},
  "meta": {}
}
```

Stack trace tidak boleh dikirim ke frontend.

## 7. Frontend Error Display

Frontend wajib membedakan:

- global page error;
- field validation error;
- submit error;
- network error;
- unauthenticated error;
- forbidden error.

## 8. apiClient Error Shape

`apiClient` harus mengubah error API menjadi object konsisten:

```js
{
  name: 'ApiError',
  status: 422,
  message: 'Validation failed',
  errors: {
    nama_lengkap: ['Nama lengkap wajib diisi.']
  },
  raw: {}
}
```

## 9. Network Error

Jika server tidak bisa dihubungi, frontend menampilkan pesan:

```text
Tidak bisa menghubungi server. Periksa koneksi atau jalankan backend.
```

## 10. Retry Rule

Retry button wajib tersedia untuk halaman list. Retry tidak wajib untuk submit form.
