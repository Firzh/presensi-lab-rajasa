# Security Contract

## 1. Purpose

Kontrak ini menetapkan batas keamanan awal agar Presensi tidak mengembangkan fitur yang rentan sejak fase refactor.

## 2. Authentication Boundary

- Frontend tidak boleh membuat token palsu.
- Frontend tidak boleh percaya pada role dari localStorage.
- Backend harus menjadi sumber kebenaran login dan role.
- Endpoint mutasi wajib memeriksa session.

## 3. Password Boundary

- Password tidak boleh disimpan plain text.
- Password harus di-hash dengan `password_hash()`.
- Password tidak boleh dikembalikan dalam response API.
- Seeder admin harus memakai hash.

## 4. Input Validation Boundary

Endpoint mutasi wajib validasi:

- required fields;
- enum values;
- max length;
- numeric range;
- foreign key existence;
- unique constraint.

## 5. Sensitive File Boundary

Nginx harus menolak akses ke:

```text
.env
.git
composer.json
composer.lock
node_modules
vendor
```

File tersebut tidak boleh terbuka sebagai static file.

## 6. Error Boundary

- Stack trace tidak boleh dikirim ke frontend.
- SQL error detail tidak boleh dikirim ke frontend.
- Error production harus generic.
- Error local boleh dicatat di log, bukan response API.

## 7. Data Boundary

Data siswa adalah data sensitif operasional sekolah. Jangan tampilkan field yang tidak dibutuhkan UI.

## 8. CORS and Credential Boundary

Jika frontend dan backend beda origin:

- CORS harus membatasi origin development yang valid;
- credentials hanya boleh aktif untuk origin tepercaya;
- cookie session harus mengikuti pengaturan SameSite yang sesuai.

## 9. File Upload Boundary

Upload foto, Excel, atau dokumen belum masuk fase awal. Jangan membuka upload endpoint sebelum ada kontrak validasi file.

## 10. Future Security Review

Sebelum production, wajib ada review:

- session fixation;
- CSRF;
- XSS;
- SQL injection;
- authorization bypass;
- direct object reference;
- upload validation;
- logging sensitive data.
