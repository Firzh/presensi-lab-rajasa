# Database

Dokumen ini menjelaskan rancangan database MVP Presensi Siswa Rajasa.

## Prinsip Database

Database dibuat ramping dan fokus pada kebutuhan presensi siswa QR.

Prinsip utama:

1. Presensi berbasis siswa, rombel, jam pembelajaran, dan sesi.
2. Tidak memakai ruangan.
3. Tidak memakai perangkat ESP32.
4. Tidak memakai plotting rombel.
5. Tidak memakai policy engine.
6. Tidak memakai group engine.
7. Schema dan seed dipisah.
8. Semua edit presensi dicatat.
9. Warning scan dicatat di log.
10. Tahun ajaran menjadi konteks akademik utama.

## Lokasi File

Target lokasi file database:

```text
backend/database/schema/
backend/database/seeds/
```

Urutan eksekusi:

```text
1. backend/database/schema/prototype-db-3.9.sql
2. backend/database/seeds/seed_permissions_mvp_presensi_qr.sql
3. backend/database/seeds/seed_akun_demo_mvp_presensi_qr.sql
```

## Kelompok Tabel

### IAM sederhana

```text
roles
permissions
role_permissions
users
user_roles
user_permissions
```

Fungsi:

- login user,
- role user,
- permission custom,
- akses guru, staff, admin, intern, dan siswa.

Tidak digunakan:

```text
policies
policy_permissions
role_policies
user_policies
groups
group_users
group_roles
group_policies
user_access_tokens
```

### Master Akademik

```text
tahun_ajaran
jurusan
rombel
siswa
guru_staff
penempatan_siswa_rombel
rombel_wali_kelas
siswa_mutasi
```

Fungsi:

- menyimpan siswa,
- menyimpan rombel,
- menyimpan jurusan,
- menyimpan guru atau staff,
- menyimpan wali kelas,
- menyimpan histori penempatan siswa,
- menyimpan konteks tahun ajaran.

### QR Siswa

```text
siswa_qr
```

Fungsi:

- menyimpan payload QR statis dari vendor,
- mencocokkan QR dengan siswa,
- mencegah satu QR dipakai lebih dari satu siswa.

Aturan:

- satu siswa hanya punya satu QR,
- QR bersifat statis,
- payload minimal berisi nama dan NISN,
- tidak ada status aktif atau nonaktif QR.

### Presensi

```text
jam_pembelajaran
presensi_sesi
presensi_sesi_jam
presensi_jam_siswa
presensi_scan_log
presensi_edit_log
```

Fungsi:

- membuat sesi presensi,
- menyimpan jam yang dipilih,
- menyimpan presensi per siswa per jam,
- menyimpan log scan,
- menyimpan log edit manual.

### Import

```text
import_jobs
import_column_mappings
import_row_logs
```

Fungsi:

- mencatat proses import,
- menyimpan fallback mapping kolom,
- mencatat error per baris.

### Notifikasi dan Error

```text
notifikasi_user
system_error_logs
user_activities
```

Fungsi:

- notifikasi user,
- error teknis sistem,
- aktivitas penting user.

## Tahun Ajaran

Tahun ajaran dipakai sebagai konteks utama data akademik dan presensi.

Tabel yang wajib terikat tahun ajaran:

```text
rombel
penempatan_siswa_rombel
rombel_wali_kelas
presensi_sesi
import_jobs
```

Aturan tahun ajaran otomatis:

```text
Bulan Januari sampai Juni  = tahun lalu / tahun ini
Bulan Juli sampai Desember = tahun ini / tahun depan
```

Contoh:

```text
Mei 2026   = 2025/2026
Juli 2026  = 2026/2027
```

Trigger `rombel` boleh mengisi `tahun_ajaran_id` otomatis jika field kosong. Namun master `tahun_ajaran` tetap harus tersedia lebih dulu.

## Mode Presensi

### Rombel

Aturan:

- `mode_presensi = rombel`,
- `rombel_id` wajib,
- jam pembelajaran wajib,
- maksimal 3 jam,
- jam harus berurutan.

### Piket

Aturan:

- `mode_presensi = piket`,
- `rombel_id` harus kosong,
- siswa lintas rombel boleh discan,
- status default adalah terlambat.

## Status Presensi

Status utama:

```text
alpha
hadir
terlambat
izin
sakit
```

Keterangan:

| Status      | Arti                     |
| ----------- | ------------------------ |
| `alpha`     | Belum presensi           |
| `hadir`     | Hadir pada sesi rombel   |
| `terlambat` | Hadir melalui mode piket |
| `izin`      | Diubah manual            |
| `sakit`     | Diubah manual            |

## Status Scan

Status scan:

```text
berhasil
warning
invalid
ditolak
error
```

Keterangan:

| Status     | Arti                                 |
| ---------- | ------------------------------------ |
| `berhasil` | QR valid dan sesuai aturan sesi      |
| `warning`  | QR valid, tetapi rombel tidak sesuai |
| `invalid`  | Payload QR tidak ditemukan           |
| `ditolak`  | Scan ditolak oleh aturan sistem      |
| `error`    | Ada kegagalan teknis                 |

## Warning

Warning terjadi jika siswa dari rombel lain terscan pada mode rombel.

Data warning masuk ke:

```text
presensi_scan_log
```

Data warning tidak masuk ke:

```text
presensi_jam_siswa
```

Warning untuk wali kelas dicocokkan berdasarkan:

```text
rombel
tahun_ajaran
semester
```

## Anti Presensi Ganda

Presensi ganda dicegah dengan kombinasi:

```text
tanggal
siswa_id
jam_pembelajaran
```

Satu siswa tidak boleh memiliki dua status presensi pada tanggal dan jam yang sama.

## Edit Manual

Edit manual presensi hanya boleh dilakukan oleh user yang memiliki permission.

Semua edit wajib masuk ke:

```text
presensi_edit_log
```

Data yang dicatat:

- field yang diubah,
- nilai lama,
- nilai baru,
- user yang mengubah,
- waktu edit,
- alasan edit.

## Import Column Mapping

`import_column_mappings` dipakai sebagai fallback jika nama kolom file import tidak sesuai template standar.

Contoh:

| Kolom File           | Field Sistem |
| -------------------- | ------------ |
| Nomor Induk Nasional | nisn         |
| Nama Peserta Didik   | nama_lengkap |
| Kelas                | rombel       |

Jika mapping tetap gagal, error dicatat ke `import_row_logs` atau `system_error_logs` sesuai jenis error.

## Error Log

Gunakan:

```text
import_row_logs
```

untuk error data import.

Gunakan:

```text
system_error_logs
```

untuk error teknis sistem.

Contoh error teknis:

- query gagal,
- koneksi database gagal,
- file gagal dibaca,
- exception tidak terduga.
