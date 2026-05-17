# Architecture

Dokumen ini menjelaskan arsitektur MVP Presensi Siswa Rajasa.

## Tujuan Sistem

Sistem dibuat untuk mencatat presensi siswa berbasis QR. Presensi dilakukan oleh guru, staff, admin, intern dengan akses khusus, atau user lain yang memiliki permission presensi.

Sistem mendukung dua mode utama:

1. Presensi rombel.
2. Presensi piket untuk siswa terlambat.

## Komponen Utama

```text
Browser
  ↓
Nginx
  ↓
Frontend Vite
  ↓
Backend PHP API
  ↓
MySQL
```

## Backend

Backend memakai PHP 8.2 FPM dan Composer.

Target komponen backend:

```text
backend/
  public/
  bootstrap/
  src/
  routes/
  database/
  tests/
```

Stack backend:

| Komponen            | Fungsi                |
| ------------------- | --------------------- |
| PHP 8.2 FPM         | Runtime backend       |
| Composer            | Dependency manager    |
| FastRoute           | Routing HTTP          |
| PHP-DI              | Dependency injection  |
| Illuminate Database | Database layer        |
| Dotenv              | Environment loader    |
| PHPUnit             | Unit dan feature test |

## Frontend

Frontend memakai Vite.

Frontend bertugas menampilkan:

- halaman login,
- dashboard,
- halaman presensi,
- scanner QR,
- halaman laporan,
- halaman data master,
- halaman import.

## Nginx

Nginx menjadi reverse proxy.

Target routing:

| Path     | Tujuan      |
| -------- | ----------- |
| `/`      | Frontend    |
| `/api/*` | Backend PHP |

## Database

Database memakai MySQL 8.0.

Schema MVP fokus pada:

- user,
- role,
- permission,
- siswa,
- guru atau staff,
- jurusan,
- rombel,
- tahun ajaran,
- penempatan siswa rombel,
- wali kelas,
- QR siswa,
- sesi presensi,
- presensi per jam,
- log scan,
- log edit,
- notifikasi user,
- import,
- error log.

## Auth dan Permission

Sistem memakai role dan permission sederhana.

Tabel inti:

```text
roles
permissions
role_permissions
users
user_roles
user_permissions
```

Tidak memakai:

```text
policies
groups
user_access_tokens
```

Akses custom cukup memakai `user_permissions`.

## Mode Presensi

### Mode Rombel

Dipakai saat guru mengajar di kelas.

Aturan:

- wajib memilih rombel,
- wajib memilih jam pembelajaran,
- maksimal 3 jam,
- jam harus berurutan,
- satu scan berlaku untuk semua jam yang dipilih,
- siswa beda rombel masuk warning.

### Mode Piket

Dipakai untuk siswa terlambat.

Aturan:

- tidak terikat rombel,
- default status presensi adalah terlambat,
- siswa bisa berasal dari semua rombel,
- scan tetap dicatat ke log.

## QR

QR berasal dari vendor.

Sistem tidak membuat QR dinamis.

Isi QR minimal:

```text
nama
NISN
```

Sistem hanya menyimpan dan mencocokkan payload QR.

Tabel terkait:

```text
siswa_qr
presensi_scan_log
```

## Presensi Per Jam

Presensi disimpan per jam pembelajaran.

Contoh:

Guru memilih jam 1, 2, dan 3. Siswa discan satu kali. Sistem membuat tiga data presensi:

```text
jam 1 = hadir
jam 2 = hadir
jam 3 = hadir
```

Tabel utama:

```text
presensi_sesi
presensi_sesi_jam
presensi_jam_siswa
```

## Warning

Warning terjadi saat QR siswa valid, tetapi rombel siswa tidak sesuai dengan rombel sesi.

Warning tidak masuk ke tabel presensi utama.

Warning masuk ke:

```text
presensi_scan_log
```

Wali kelas dapat melihat warning berdasarkan:

```text
rombel
tahun ajaran
semester
```

## Import

Import dipakai untuk data siswa, rombel, guru, atau data akademik lain.

Jika template sesuai, sistem langsung proses.

Jika template tidak sesuai, sistem memakai fallback:

```text
import_column_mappings
```

Jika tetap gagal, error dicatat ke:

```text
import_row_logs
system_error_logs
```

## Non Scope MVP

Fitur berikut tidak masuk MVP:

- ESP32,
- ruangan,
- plotting rombel,
- presensi berbasis lokasi ruang,
- policy engine,
- group engine,
- arsip media,
- notifikasi kompleks,
- multi sekolah,
- integrasi orang tua,
- queue worker,
- Redis,
- Laravel penuh.
