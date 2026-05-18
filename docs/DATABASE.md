# Database

Dokumen ini menjelaskan database MVP Presensi Siswa Rajasa.

## Lokasi File

```text
backend/database/schema/prototype-db-3.9.sql
backend/database/seeds/seed_permissions_mvp_presensi_qr.sql
backend/database/seeds/seed_akun_demo_mvp_presensi_qr.sql
```

## Reset Database Demo

```bash
./scripts/db-reset-demo.sh
```

Script ini menjalankan:

1. `db-fresh.sh`
2. `db-seed-permissions.sh`
3. `db-seed-demo.sh`

## Prinsip Database

1. Fokus pada presensi siswa QR.
2. Tidak memakai ruangan.
3. Tidak memakai perangkat ESP32.
4. Tidak memakai plotting rombel.
5. Tidak memakai policy engine.
6. Tidak memakai group engine.
7. Schema dan seed dipisah.
8. Data audit dan histori dijaga dengan `RESTRICT`.
9. Trigger dipakai hanya untuk aturan yang tidak cocok memakai `CHECK`.
10. Tahun ajaran menjadi konteks akademik utama.

## Kelompok Tabel

### IAM Sederhana

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
- permission role,
- permission custom user.

Kolom permission utama:

```text
permissions.perm_slug
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
- menyimpan guru/staff,
- menyimpan wali kelas,
- menyimpan histori penempatan siswa.

### QR Siswa

```text
siswa_qr
```

Aturan:

- satu siswa punya satu QR,
- QR statis,
- payload minimal berisi nama dan NISN,
- tidak ada status aktif/nonaktif QR.

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
- fallback mapping kolom,
- log error per baris.

### Notifikasi dan Error

```text
notifikasi_user
system_error_logs
user_activities
```

## Tahun Ajaran

Tahun ajaran dipakai untuk:

- rombel,
- penempatan siswa,
- wali kelas,
- sesi presensi,
- import.

Aturan otomatis:

```text
Januari sampai Juni  = tahun lalu / tahun ini
Juli sampai Desember = tahun ini / tahun depan
```

Master `tahun_ajaran` harus tersedia sebelum import rombel.

## Foreign Key Rule

Untuk data histori dan audit, gunakan:

```sql
ON DELETE RESTRICT ON UPDATE RESTRICT
```

Contoh:

- `presensi_jam_siswa`,
- `presensi_scan_log`,
- `presensi_edit_log`,
- `penempatan_siswa_rombel`,
- `user_roles`,
- `user_permissions`.

Alasan:

- child harus tetap ada,
- audit tidak boleh hilang,
- ID parent tidak seharusnya berubah.

`SET NULL` hanya dipakai jika relasi benar-benar opsional dan bukan audit.

## Trigger

Trigger dipakai karena beberapa `CHECK` ditolak MySQL jika membaca kolom yang juga dipakai foreign key.

Contoh:

```text
users.siswa_id
users.guru_id
presensi_sesi.rombel_id
rombel.tahun_ajaran_id
```

Contoh aturan trigger:

```text
mode rombel wajib punya rombel_id
mode piket tidak boleh punya rombel_id
user siswa wajib punya siswa_id
user guru/staff/admin wajib punya guru_id
```

## Status Presensi

```text
alpha
hadir
terlambat
izin
sakit
```

| Status | Arti |
|---|---|
| `alpha` | Belum presensi |
| `hadir` | Hadir melalui sesi rombel |
| `terlambat` | Hadir melalui piket |
| `izin` | Diubah manual |
| `sakit` | Diubah manual |

## Status Scan

```text
berhasil
warning
invalid
ditolak
error
```

| Status | Arti |
|---|---|
| `berhasil` | QR valid dan sesuai sesi |
| `warning` | QR valid tetapi rombel tidak sesuai |
| `invalid` | Payload tidak ditemukan |
| `ditolak` | Ditolak aturan sistem |
| `error` | Error teknis |

## Warning

Warning masuk ke:

```text
presensi_scan_log
```

Warning tidak langsung masuk ke:

```text
presensi_jam_siswa
```

View wali kelas harus mencocokkan:

```text
rombel
tahun_ajaran
semester
```

## Anti Presensi Ganda

Presensi ganda dicegah dengan unique key:

```text
tanggal
siswa_id
jam_id
```

Satu siswa tidak boleh punya dua status presensi pada tanggal dan jam yang sama.

## Seed

Seed permission:

```text
backend/database/seeds/seed_permissions_mvp_presensi_qr.sql
```

Seed akun demo:

```text
backend/database/seeds/seed_akun_demo_mvp_presensi_qr.sql
```

Akun demo harus mengisi `user_type` dengan benar:

| Username | user_type |
|---|---|
| `admin.demo` | admin |
| `guru.demo` | guru |
| `staff.demo` | staff |
| `intern.demo` | intern |
| `siswa.demo` | siswa |
