# Contributing Guide

Dokumen ini mengatur cara kerja kontribusi agar repo Presensi tidak kembali menjadi kumpulan branch fitur yang saling menimpa.

## 1. Branch policy

Gunakan format branch berikut:

```text
contract/<scope>
refactor/<scope>
feature/<scope>
fix/<scope>
docs/<scope>
```

Contoh:

```text
contract/presensi-baseline
refactor/frontend-modularization
feature/admin-data-siswa-api
fix/auth-session-expiry
```

## 2. Merge policy

Sebelum merge ke `development`, PR wajib menjawab:

- kontrak apa yang berubah;
- file dokumentasi apa yang diperbarui;
- endpoint apa yang bertambah/berubah;
- tabel atau kolom apa yang bertambah/berubah;
- route frontend apa yang bertambah/berubah;
- test apa yang sudah dijalankan.

## 3. Larangan kontribusi

Kontributor tidak boleh:

- menambahkan fitur besar langsung ke `app.jsx`;
- menambahkan `fetch` langsung di komponen page tanpa service;
- membuat nama environment baru tanpa memperbarui `ENV_DOCKER_CONTRACT.md`;
- menambahkan endpoint tanpa memperbarui `API_CONTRACT.md`;
- menambahkan tabel/kolom tanpa memperbarui `DATABASE_CONTRACT.md`;
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
