# Contributing Guide

Dokumen ini menjelaskan aturan kontribusi untuk project Presensi Siswa Rajasa.

## 0. Project User Pemission

Sebelum menjalankan Docker di Linux, salin `.env.example` ke `.env`, lalu sesuaikan UID dan GID:

```bash
cp .env.example .env
sed -i "s/^UID=.*/UID=$(id -u)/" .env
sed -i "s/^GID=.*/GID=$(id -g)/" .env
```

lalu cek

```bash
grep -E "^(UID|GID)=" .env
```

## 1. Branch policy

Semua branch development memakai prefix:

```text
contributor_name/
```

Contoh:

```text
alfy/backend-boilerplate
alfy/backend-phpunit
fashich/dashboard-siswa
mahdi/...
```

## 1.1 Branch Utama

| Branch        | Fungsi                           |
| ------------- | -------------------------------- |
| `development` | Integrasi fitur aktif            |
| `alfy/*`      | Branch kerja per fitur           |
| `main`        | Rilis stabil jika sudah tersedia |

## 2. Alur Kerja

1. Pull branch `development`.
2. Buat branch baru dengan prefix.
3. Kerjakan satu scope kecil.
4. Jalankan test jika tersedia.
5. Commit dengan pesan jelas.
6. Buat pull request ke `development`.

Contoh:

```bash
git checkout development
git pull origin development
git checkout -b alfy/backend-boilerplate
```

## 2.1 Tipe Commit

| Type       | Fungsi                                   |
| ---------- | ---------------------------------------- |
| `chore`    | Perubahan struktur, konfigurasi, cleanup |
| `feat`     | Fitur baru                               |
| `fix`      | Perbaikan bug                            |
| `test`     | Penambahan atau perbaikan test           |
| `docs`     | Perubahan dokumentasi                    |
| `refactor` | Perapihan kode tanpa mengubah perilaku   |
| `db`       | Perubahan schema atau seed database      |

## 2.2 Merge policy

Sebelum merge ke `development`, PR wajib menjawab:

- kontrak apa yang berubah;
- file dokumentasi apa yang diperbarui;
- endpoint apa yang bertambah/berubah;
- tabel atau kolom apa yang bertambah/berubah;
- route frontend apa yang bertambah/berubah;
- test apa yang sudah dijalankan.

## 2.3 Aturan Dokumentasi

Dokumentasi harus mengikuti kode nyata.

Jangan menjadikan catatan lama sebagai sumber utama jika sudah tidak sesuai implementasi.

File dokumentasi utama:

```text
README.md
CHANGELOG.md
CONTRIBUTING.md
docs/ARCHITECTURE.md
docs/API.md
docs/DATABASE.md
docs/TESTING.md
```

Jika endpoint berubah, update `docs/API.md`.

Jika schema berubah, update `docs/DATABASE.md`.

Jika struktur project berubah, update `docs/ARCHITECTURE.md`.

## 2.4 Aturan Backend

Backend diarahkan menjadi Composer based PHP app yang ringan.

Gunakan:

- FastRoute untuk routing,
- PHP-DI untuk dependency injection,
- Illuminate Database untuk query dan model,
- PHPUnit untuk test.

Jangan menambah Laravel penuh, policy engine, group engine, queue, Redis, atau service berat lain tanpa kebutuhan MVP yang jelas.

## 2.5 Aturan Database

Schema dan seed harus dipisah.

Schema tidak boleh berisi akun demo.

Urutan file database:

```text
1. schema
2. seed permission MVP
3. seed akun demo
```

Seed permission harus idempotent agar aman dijalankan ulang.

## 2.6 Aturan Testing

Setiap fitur backend wajib memiliki test.

Minimal:

1. unit test untuk logic utama,
2. feature test untuk endpoint,
3. test untuk error case.

Feature test tidak boleh memakai database development.

## 2.7Sebelum Pull Request

Pastikan:

- branch sudah up to date dari `development`,
- tidak ada file sampah,
- tidak ada credential asli,
- `.env` tidak ikut commit,
- dokumentasi sesuai perubahan,
- test yang tersedia sudah dijalankan.

Contoh cek:

```bash
git status
docker compose config
```

## 3. Larangan kontribusi

Kontributor tidak boleh:

- menambahkan fitur besar langsung ke `app.jsx`;
- menambahkan `fetch` langsung di komponen page tanpa service;
- membuat token login palsu di frontend;
- menyimpan data bisnis utama di `localStorage` sebagai sumber utama;
- mencampur istilah Laravel jika backend tetap custom PHP API.

## 4. Definition of Done

Sebuah perubahan dianggap selesai apabila:

1. kode berjalan;
2. build frontend berhasil;
3. dependency backend dapat diinstal;
4. endpoint terkait sesuai kontrak;
5. dokumentasi terkait diperbarui;
6. tidak ada data bisnis baru yang hanya hidup di browser;
7. reviewer dapat memahami dampak perubahan tanpa membaca seluruh source code.
