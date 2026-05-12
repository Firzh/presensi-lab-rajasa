# Code Quality Review — Presensi Lab Rajasa

## 1. Executive Summary

Presensi Lab Rajasa memiliki potensi menjadi aplikasi sekolah yang rapi, tetapi kondisi saat ini masih menunjukkan pola pengembangan prototipe. Masalah utama bukan hanya kerapian kode, melainkan belum adanya kontrak teknis yang mengikat frontend, backend, database, route, auth, Docker, dan branch integration.

Kualitas kode harus dinilai dari tiga sisi:

1. struktur source code;
2. stabilitas kontrak antarlayer;
3. kemampuan repo untuk menerima kontribusi tim tanpa rusak saat merge.

## 2. Main Finding

Akar masalah terbesar:

```text
Fitur berkembang lebih cepat daripada kontrak.
```

Dampaknya:

- `app.jsx` menjadi tempat terlalu banyak tanggung jawab;
- route dibuat manual dan tersebar;
- data bisnis disimpan di browser;
- auth belum memiliki batas aman;
- backend belum menjadi sumber data utama;
- branch fitur aktif rawan konflik.

## 3. Frontend Review

### 3.1 Masalah

- `app.jsx` terlalu besar.
- Constants, storage key, seed data, route, layout, form, table, dan page bercampur.
- Feature boundary belum ada.
- Service layer belum konsisten.
- API call belum terpusat.
- `localStorage` digunakan seperti database.

### 3.2 Risiko

- setiap fitur baru memperbesar konflik merge;
- perubahan kecil bisa merusak banyak halaman;
- sulit menambah role baru;
- sulit menguji unit kecil;
- data tidak konsisten antar browser.

### 3.3 Rekomendasi

- pecah layout dan UI component;
- pecah fitur siswa, jurusan, dan ruangan;
- gunakan `preact-router`;
- gunakan `apiClient`;
- gunakan mapper;
- hilangkan data bisnis dari `localStorage`.

## 4. Backend Review

### 4.1 Masalah

- backend foundation belum lengkap;
- `public/index.php` harus menjadi front controller;
- route, controller, service, repository belum stabil;
- komentar Docker/Nginx masih mengarah ke Laravel, sedangkan dependency mengarah ke custom PHP API.

### 4.2 Risiko

- tim salah asumsi stack;
- endpoint dibuat tidak seragam;
- response API berbeda-beda;
- validasi tersebar;
- frontend sulit migrasi dari storage ke API.

### 4.3 Rekomendasi

- tetapkan custom PHP API;
- gunakan namespace `Rajasa\PresensiLabBackend\`;
- buat bootstrap FastRoute;
- buat container PHP-DI;
- buat controller/service/repository per domain;
- gunakan response envelope.

## 5. Database Review

### 5.1 Masalah

- schema final belum terkunci;
- data seed frontend belum menjadi seeder database;
- foreign key siswa-jurusan belum dipastikan;
- unique constraint belum menjadi kontrak.

### 5.2 Rekomendasi

- buat migration untuk users, roles, jurusan, ruangan, siswa;
- pakai unique index untuk kode jurusan, kode ruangan, NIS, NISN;
- pakai foreign key `siswa.jurusan_id`;
- migrasi seed frontend menjadi database seeder.

## 6. Auth Review

### 6.1 Masalah

- auth belum dikunci sebagai session atau token;
- frontend tidak boleh membuat token palsu;
- user aktif tidak boleh dianggap valid hanya dari browser storage.

### 6.2 Rekomendasi

- gunakan cookie-based session untuk fase awal;
- buat `POST /api/login`, `POST /api/logout`, dan `GET /api/me`;
- hapus fallback token palsu;
- role berasal dari backend.

## 7. Branch Review

### 7.1 Masalah

Branch fitur aktif membawa implementasi yang saling berbeda.

### 7.2 Rekomendasi

- buat `integration/contract-first-presensi`;
- petakan fitur per branch;
- jangan merge langsung ke `development`;
- review file hotspot secara manual;
- archive branch setelah integrasi selesai.

## 8. Quality Score

| Area | Score | Catatan |
|---|---:|---|
| Frontend structure | 4/10 | Perlu modularisasi besar. |
| Backend structure | 4/10 | Dependency sudah mengarah benar, implementasi belum lengkap. |
| API contract | 3/10 | Perlu dibuat sebelum migrasi. |
| Database contract | 3/10 | Schema harus dikunci. |
| Auth safety | 3/10 | Token palsu harus dilarang. |
| Documentation | 4/10 | Perlu mengikuti pola SelfDev. |
| Expandability | 5/10 | Potensi ada, fondasi belum stabil. |

## 9. Final Recommendation

Jangan migrasi ke NestJS/Prisma sekarang. Masalah utama Presensi bukan bahasa backend, tetapi absennya kontrak. Setelah kontrak, modularisasi, API, dan database stabil, barulah keputusan migrasi stack dapat dinilai secara objektif.
