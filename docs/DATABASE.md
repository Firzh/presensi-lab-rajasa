# Database

Dokumen ini menjelaskan database MVP Presensi Siswa Rajasa sampai tahap terbaru di branch `alfy/backend-presensi-scan`.

## Lokasi File

```text
backend/database/schema/prototype-db-3.9.sql
backend/database/seeds/seed_permissions_mvp_presensi_qr.sql
backend/database/seeds/seed_akun_demo_mvp_presensi_qr.sql
```

Reset database demo:

```bash
./scripts/db-reset-demo.sh
```

Import data siswa real:

```bash
./scripts/import-scan-readiness.sh backend/database/data/data-siswa.csv
```

## Prinsip Database

1. Database fokus pada presensi siswa berbasis QR.
2. Schema dan seed dipisah.
3. Data audit dan histori dijaga dengan foreign key `RESTRICT`.
4. Trigger dipakai hanya untuk guard rail yang tidak cocok dengan `CHECK`.
5. Tabel `siswa_qr` dipakai untuk lookup payload QR, bukan untuk membuat gambar QR.
6. Ruang tidak memakai tabel khusus. Ruang disimpan sebagai snapshot sesi.
7. Presensi final siswa tersimpan di `presensi_jam_siswa`.
8. Semua percobaan scan tercatat di `presensi_scan_log`.
9. Semua percobaan edit presensi di `presensi_edit_log`.

## Kelompok Tabel

| Kelompok        | Tabel utama                                                                                          | Fungsi                                 |
| --------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------- |
| IAM             | `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `user_permissions`                | Login, role, permission                |
| Master akademik | `tahun_ajaran`, `jurusan`, `rombel`, `jam_pembelajaran`                                              | Data dasar akademik                    |
| Siswa           | `siswa`, `penempatan_siswa_rombel`, `siswa_qr`                                                       | Data siswa, rombel aktif, referensi QR |
| Import          | `import_jobs`, `import_row_logs`                                                                     | Audit import CSV                       |
| Presensi        | `presensi_sesi`, `presensi_sesi_jam`, `presensi_jam_siswa`, `presensi_scan_log`, `presensi_edit_log` | Sesi, jam, hasil presensi, log scan    |
| Sistem          | `system_error_logs`, tabel pendukung lain                                                            | Audit teknis dan guard data            |

## Seed Demo

Seed akun demo menambahkan user dan permission minimal untuk demo.

Akun utama:

```text
username: admin.demo
password: Rajasa@123
```

Seed demo juga berisi data siswa demo, termasuk:

```text
Siswa Demo X TKJ 1
Siswa Warning Demo X TKJ 2
```

Catatan validasi:

- Seed demo tidak di-exclude dari database.
- Jika setelah reset dan import total siswa menjadi `1393`, itu valid karena `1391` dari CSV real ditambah `2` siswa demo.
- Label seed demo seperti `X-TKJ-1` dan `X-TKJ-2` boleh muncul sebagai data seed lama.
- Mapping import real tetap dinilai dari data CSV, misalnya `10 TKRO 1` sampai `10 TKRO 5`.

## Import CSV Siswa

Endpoint import membaca file CSV minimal:

| Kolom CSV | Wajib | Masuk ke                                                            |
| --------- | ----: | ------------------------------------------------------------------- |
| `NISN`    |    Ya | `siswa.nisn`, `siswa_qr.payload_nisn`                               |
| `NAMA`    |    Ya | `siswa.nama_lengkap`, `siswa_qr.payload_nama`                       |
| `KELAS`   |    Ya | `siswa.kelas_aktif`, `rombel`, `jurusan`, `penempatan_siswa_rombel` |
| `N`       | Tidak | Diabaikan                                                           |

Contoh:

```csv
N,NISN,NAMA,KELAS
1,0096672112,AISYAH LISTYA NARISTA,10 AKL
2,0088556888,MUHAMMAD SOBRI,12 TKRO 1
```

NISN wajib diperlakukan sebagai string agar nol depan tidak hilang.

## Parsing KELAS dan Rombel

Input `KELAS` dari CSV diparse menjadi tingkat, jurusan, dan nomor rombel.

Contoh:

| KELAS       | tingkat_angka | tingkatan | kode jurusan | nomor_rombel | label_rombel |
| ----------- | ------------: | --------- | ------------ | -----------: | ------------ |
| `10 AKL`    |            10 | `X`       | `AKL`        |            1 | `10 AKL`     |
| `10 TKRO 1` |            10 | `X`       | `TKRO`       |            1 | `10 TKRO 1`  |
| `10 TKRO 5` |            10 | `X`       | `TKRO`       |            5 | `10 TKRO 5`  |
| `12 TKJ 4`  |            12 | `XII`     | `TKJ`        |            4 | `12 TKJ 4`   |

Aturan terbaru:

- Kelas bernomor tidak boleh collapse ke satu rombel.
- `10 TKRO 1`, `10 TKRO 2`, `10 TKRO 3`, `10 TKRO 4`, dan `10 TKRO 5` wajib punya `rombel_id` berbeda.
- `label_rombel` dan `label_rombel_raw` menyimpan label kelas dari CSV.
- `display_mode` bernilai `dengan_nomor` jika kelas punya nomor rombel, dan `tanpa_nomor` jika tidak.
- `is_inferred_from_import = 1` untuk rombel hasil import.

## Tabel `jurusan`

Fungsi: menyimpan jurusan dari hasil import dan seed.

Kolom penting:

| Kolom          | Fungsi                                    |
| -------------- | ----------------------------------------- |
| `jurusan_id`   | Primary key                               |
| `kode_jurusan` | Kode singkat seperti `TKJ`, `TKRO`, `AKL` |
| `nama_jurusan` | Nama jurusan                              |
| `status`       | `aktif` atau `nonaktif`                   |

## Tabel `rombel`

Fungsi: menyimpan kelas/rombel aktif berdasarkan tahun ajaran, tingkat, jurusan, dan nomor rombel.

Kolom penting:

| Kolom                     | Fungsi                                       |
| ------------------------- | -------------------------------------------- |
| `rombel_id`               | Primary key                                  |
| `tahun_ajaran_id`         | Tahun ajaran                                 |
| `tingkatan`               | `X`, `XI`, `XII`, `XIII`                     |
| `tingkat_angka`           | 10, 11, 12, 13                               |
| `jurusan_id`              | Relasi ke `jurusan`                          |
| `nomor_rombel`            | Nomor rombel                                 |
| `label_rombel`            | Label tampil, contoh `12 TKRO 1`             |
| `label_rombel_raw`        | Label asli dari import                       |
| `display_mode`            | `tanpa_nomor`, `dengan_nomor`, atau `custom` |
| `is_inferred_from_import` | Penanda rombel dibentuk dari import          |
| `status`                  | `aktif` atau `nonaktif`                      |

Dipakai oleh:

- dropdown rombel dinamis di `/dev/scan`,
- pembuatan sesi rombel,
- validasi beda rombel saat scan QR.

## Tabel `siswa`

Fungsi: menyimpan data induk siswa.

Kolom penting:

| Kolom              | Fungsi                     |
| ------------------ | -------------------------- |
| `siswa_id`         | Primary key                |
| `nisn`             | Kunci siswa dan QR         |
| `nama_lengkap`     | Nama siswa                 |
| `jurusan_id_aktif` | Jurusan aktif hasil import |
| `rombel_id_aktif`  | Rombel aktif hasil import  |
| `kelas_aktif`      | Label kelas dari CSV       |
| `status`           | Status siswa               |

Aturan:

- `nisn` unik dan string.
- `rombel_id_aktif` wajib cocok dengan kelas hasil import.
- `kelas_aktif` tetap menyimpan label sumber, bukan label hasil format ulang.

## Tabel `penempatan_siswa_rombel`

Fungsi: menyimpan relasi siswa ke rombel aktif per tahun ajaran dan semester.

Kolom penting:

| Kolom             | Fungsi                      |
| ----------------- | --------------------------- |
| `siswa_id`        | Siswa                       |
| `rombel_id`       | Rombel                      |
| `tahun_ajaran_id` | Tahun ajaran                |
| `semester`        | Semester                    |
| `tanggal_mulai`   | Awal penempatan             |
| `tanggal_selesai` | Akhir penempatan            |
| `is_aktif`        | Status aktif                |
| `aktif_siswa_id`  | Penanda siswa aktif terkait |

## Tabel `siswa_qr`

Fungsi: referensi lookup payload QR hasil scan.

Kolom penting:

| Kolom                | Fungsi                   |
| -------------------- | ------------------------ |
| `siswa_qr_id`        | Primary key              |
| `siswa_id`           | Pemilik QR               |
| `payload_raw`        | Payload sumber           |
| `payload_normalized` | Payload untuk pencocokan |
| `payload_nama`       | Nama dari payload        |
| `payload_nisn`       | NISN dari payload        |

Contoh:

```text
payload_raw        = AISYAH LISTYA NARISTA|0096672112
payload_normalized = aisyahlistyanarista0096672112
payload_nama       = AISYAH LISTYA NARISTA
payload_nisn       = 0096672112
```

Catatan:

- Tidak ada kolom `payload_hash`.
- Tidak ada kolom `qr_uuid`.
- Tidak ada kolom `is_active`.
- Lookup memakai NISN dan normalized payload yang tersedia.

## Tabel `import_jobs`

Fungsi: mencatat ringkasan proses import.

Kolom penting:

| Kolom               | Fungsi                                                |
| ------------------- | ----------------------------------------------------- |
| `import_id`         | Primary key                                           |
| `import_code`       | UUID import                                           |
| `import_type`       | Jenis import, misalnya `siswa`                        |
| `original_filename` | Nama file                                             |
| `status`            | `draft`, `diproses`, `selesai`, `gagal`, `dibatalkan` |
| `total_rows`        | Total baris                                           |
| `valid_rows`        | Baris valid                                           |
| `error_rows`        | Baris error                                           |
| `inserted_rows`     | Data baru                                             |
| `updated_rows`      | Data update                                           |

## Tabel `import_row_logs`

Fungsi: mencatat baris import yang error, warning, skipped, inserted, atau updated.

Kolom penting:

| Kolom                 | Fungsi           |
| --------------------- | ---------------- |
| `row_number`          | Nomor baris CSV  |
| `row_status`          | Status baris     |
| `source_payload_json` | Isi baris sumber |
| `message`             | Pesan validasi   |

## Tabel `presensi_sesi`

Fungsi: menyimpan sesi presensi.

Kolom penting:

| Kolom                  | Fungsi                             |
| ---------------------- | ---------------------------------- |
| `presensi_sesi_id`     | Primary key                        |
| `session_uuid`         | UUID sesi                          |
| `mode_presensi`        | `rombel` atau `piket`              |
| `rombel_id`            | Rombel sesi, `NULL` untuk piket    |
| `tahun_ajaran_id`      | Tahun ajaran                       |
| `semester`             | Semester                           |
| `tanggal`              | Tanggal sesi                       |
| `status`               | `aktif`, `suspended`, `selesai`    |
| `ruang_pilihan`        | `kelas`, `lab-tkj-*`, atau `piket` |
| `ruang_label_snapshot` | Label ruang historis               |
| `opened_by_user_id`    | Pembuka sesi                       |
| `closed_by_user_id`    | Penutup sesi                       |

Pilihan `ruang_pilihan`:

```text
kelas
lab-tkj-1
lab-tkj-2
lab-tkj-3
lab-tkj-4
piket
```

Label snapshot:

| ruang_pilihan | ruang_label_snapshot   |
| ------------- | ---------------------- |
| `kelas`       | `Kelas {label_rombel}` |
| `lab-tkj-1`   | `LAB-TKJ-1`            |
| `lab-tkj-2`   | `LAB-TKJ-2`            |
| `lab-tkj-3`   | `LAB-TKJ-3`            |
| `lab-tkj-4`   | `LAB-TKJ-4`            |
| `piket`       | `Piket`                |

## Tabel `presensi_sesi_jam`

Fungsi: menyimpan daftar jam dalam satu sesi.

Kolom penting:

| Kolom              | Fungsi             |
| ------------------ | ------------------ |
| `presensi_sesi_id` | ID sesi            |
| `jam_id`           | Jam pembelajaran   |
| `urutan`           | Urutan pilihan jam |

Aturan:

- Satu sesi bisa punya 1 sampai 3 jam.
- Jam harus berurutan.
- UI demo memakai multiple-select dropdown untuk memilih jam.
- Mode piket dapat memakai lebih dari satu jam, misalnya jam 1 dan 2.
- Backend tetap menerima `jam_ids` dalam bentuk array.

## Tabel `presensi_jam_siswa`

Fungsi: menyimpan status presensi final siswa per tanggal dan jam.

Unique key utama:

```text
tanggal
siswa_id
jam_id
```

Kolom penting:

| Kolom              | Fungsi                                         |
| ------------------ | ---------------------------------------------- |
| `presensi_id`      | Primary key                                    |
| `tanggal`          | Tanggal presensi                               |
| `siswa_id`         | Siswa                                          |
| `jam_id`           | Jam pembelajaran                               |
| `status`           | `alpha`, `hadir`, `terlambat`, `izin`, `sakit` |
| `mode_presensi`    | `rombel` atau `piket`                          |
| `presensi_sesi_id` | Sesi asal                                      |
| `scan_log_id`      | Log scan yang mengubah presensi                |
| `input_by_user_id` | User input                                     |
| `scanned_at`       | Waktu scan                                     |

Aturan:

- Saat sesi rombel dibuat, sistem membuat baris awal `alpha` untuk siswa dalam rombel.
- Scan berhasil mode `rombel` mengubah `alpha` menjadi `hadir`.
- Scan berhasil mode `piket` menghasilkan `terlambat`.
- Scan duplicate tidak mengubah status lagi.
- `scan_log_id` terisi jika perubahan berasal dari scan.

## Tabel `presensi_edit_log`

Fungsi: mencatat audit setiap perubahan presensi manual.

Kolom utama:

| Kolom               | Fungsi                    |
| ------------------- | ------------------------- |
| `presensi_id`       | Data presensi yang diedit |
| `field_name`        | Field yang berubah        |
| `old_value`         | Nilai sebelum edit        |
| `new_value`         | Nilai sesudah edit        |
| `edited_by_user_id` | User editor               |
| `edited_at`         | Waktu edit                |
| `alasan_edit`       | Alasan perubahan          |

### Edit Manual

Tahap 9 memakai tabel ini untuk perubahan status presensi manual.

Kolom yang dipakai:

| Kolom               | Fungsi                  |
| ------------------- | ----------------------- |
| `status`            | Status baru hasil edit  |
| `mode_presensi`     | Diubah menjadi `manual` |
| `edited_by_user_id` | User yang mengedit      |
| `edited_at`         | Waktu edit              |
| `keterangan`        | Alasan edit             |

## Tabel `presensi_scan_log`

Fungsi: mencatat semua percobaan scan.

Kolom penting:

| Kolom                 | Fungsi                                      |
| --------------------- | ------------------------------------------- |
| `scan_log_id`         | Primary key                                 |
| `client_request_uuid` | ID request client jika ada                  |
| `presensi_sesi_id`    | Sesi terkait                                |
| `tanggal`             | Tanggal scan                                |
| `payload_raw`         | Payload asli                                |
| `payload_normalized`  | Payload normalisasi                         |
| `payload_nama`        | Nama hasil parser                           |
| `payload_nisn`        | NISN hasil parser                           |
| `status_scan`         | `berhasil`, `warning`, `invalid`, `ditolak` |
| `warning_reason`      | Alasan warning                              |
| `siswa_id`            | Siswa hasil lookup                          |
| `selected_rombel_id`  | Rombel sesi                                 |
| `actual_rombel_id`    | Rombel aktif siswa                          |
| `created_at`          | Waktu log                                   |

Status scan:

| status_scan | Arti                              | Efek ke `presensi_jam_siswa`   |
| ----------- | --------------------------------- | ------------------------------ |
| `berhasil`  | QR valid dan aturan terpenuhi     | Mengubah atau membuat presensi |
| `warning`   | QR valid tetapi beda rombel       | Tidak membuat hadir            |
| `invalid`   | QR tidak cocok dengan `siswa_qr`  | Tidak membuat presensi         |
| `ditolak`   | Siswa sudah presensi pada jam itu | Tidak mengubah presensi        |

Warning reason utama:

```text
siswa_tidak_sesuai_rombel
```

## Alur Scan QR

1. User membuat sesi.
2. User scan QR siswa.
3. Parser membaca payload Google Form atau payload plain.
4. Sistem mengambil nama dan NISN.
5. Sistem mencocokkan ke `siswa_qr`.
6. Sistem mengambil data siswa.
7. Sistem validasi status sesi harus `aktif`.
8. Sistem validasi rombel jika mode `rombel`.
9. Sistem tulis `presensi_scan_log`.
10. Jika valid, sistem update atau buat `presensi_jam_siswa`.

## Parser QR

QR asli umumnya berbentuk URL Google Form.

Contoh:

```text
https://docs.google.com/forms/.../formResponse?entry.1743651050=RENDY+PRAWIRA&entry.178375719=0099662619
```

Aturan parser terbaru:

- Tidak bergantung pada `entry.*` tertentu.
- Semua parameter `entry.*` dibaca dinamis.
- Nilai yang berisi huruf dipakai sebagai nama.
- Nilai angka 8 sampai 20 digit dipakai sebagai NISN.
- `+` dibaca sebagai spasi.
- NISN tetap string.

## Guard Duplicate Sesi

Guard berada di backend.

| Guard  | Aturan                                                                                          |
| ------ | ----------------------------------------------------------------------------------------------- |
| Rombel | Rombel yang sama tidak boleh punya sesi `aktif` atau `suspended` pada tanggal dan jam yang sama |
| Lab    | Lab yang sama tidak boleh dipakai sesi `aktif` atau `suspended` pada tanggal dan jam yang sama  |
| Jam    | Jam harus 1 sampai 3 dan berurutan                                                              |

Jika sesi lama sudah `selesai`, sesi baru boleh dibuat.

## Guard Duplicate Scan

Jika siswa sudah tidak `alpha` pada tanggal dan jam yang sama:

- scan dicatat ke `presensi_scan_log`,
- `status_scan = ditolak`,
- `affected_rows = 0`,
- `presensi_jam_siswa` tidak berubah.

## Validasi DB

Cek import dan mapping:

```bash
./scripts/check-import-table-fill.sh
```

Cek apakah ada presensi berhasil setelah fresh import:

```bash
./scripts/check-successful-attendance.sh
```

Cek scan terakhir:

```sql
SELECT
  scan_log_id,
  presensi_sesi_id,
  payload_nama,
  payload_nisn,
  status_scan,
  warning_reason,
  siswa_id,
  selected_rombel_id,
  actual_rombel_id,
  created_at
FROM presensi_scan_log
ORDER BY scan_log_id DESC
LIMIT 10;
```

Cek presensi hasil scan:

```sql
SELECT
  p.presensi_id,
  p.presensi_sesi_id,
  p.scan_log_id,
  p.siswa_id,
  s.nisn,
  s.nama_lengkap,
  s.kelas_aktif,
  p.tanggal,
  p.jam_id,
  p.status,
  p.mode_presensi,
  p.scanned_at
FROM presensi_jam_siswa p
LEFT JOIN siswa s ON s.siswa_id = p.siswa_id
WHERE p.scan_log_id IS NOT NULL
ORDER BY p.presensi_id DESC
LIMIT 10;
```

## Permission Tahap 9

Permission manual edit disimpan di tabel `permissions`.

Permission baru:

```text
attendance.manual.read
attendance.manual.update
attendance.manual.audit.read
attendance.edit_reasons.read
```

## Foreign Key Rule

Gunakan:

```sql
ON DELETE RESTRICT ON UPDATE RESTRICT
```

Alasan:

- data audit tidak hilang,
- child tetap konsisten,
- histori presensi tidak rusak,
- ID parent tidak seharusnya berubah.

## Non Scope Database MVP

Tidak masuk scope database MVP saat ini:

- ESP32,
- tabel ruang final,
- plotting ruang,
- absensi berbasis perangkat fisik,
- queue worker,
- multi sekolah,
- integrasi orang tua,
- laporan final produksi.
