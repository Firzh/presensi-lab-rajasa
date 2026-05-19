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

## Prinsip Database

1. Fokus pada presensi siswa QR.
2. Tidak memakai tabel ruangan lama.
3. Tidak memakai perangkat ESP32.
4. Tidak memakai plotting rombel.
5. Schema dan seed dipisah.
6. Data audit dan histori dijaga dengan `RESTRICT`.
7. Trigger dipakai hanya untuk aturan yang tidak cocok memakai `CHECK`.

## Tabel yang Dipakai Tahap 7

Tahap 7 memakai tabel:

```text
siswa
jurusan
rombel
penempatan_siswa_rombel
siswa_qr
import_jobs
import_row_logs
```

## Import CSV Minimal

Data CSV minimal:

| Kolom CSV | Tujuan |
|---|---|
| `NISN` | `siswa.nisn`, `siswa_qr.payload_nisn` |
| `NAMA` | `siswa.nama_lengkap`, `siswa_qr.payload_nama` |
| `KELAS` | `siswa.kelas_aktif`, `rombel`, `jurusan`, `penempatan_siswa_rombel` |

Kolom `N` hanya nomor urut dan tidak masuk database.

## Parsing KELAS

Contoh:

```text
10 AKL
10 MP
12 TP 2
```

Aturan:

| Bagian | Hasil |
|---|---|
| Angka pertama | `tingkat_angka` |
| `10` | `X` |
| `11` | `XI` |
| `12` | `XII` |
| `13` | `XIII` |
| Kode setelah angka | kode jurusan |
| Nomor setelah jurusan | belum dipakai sebagai nomor rombel pada checkpoint ini |

Catatan:

- Untuk MVP, `nomor_rombel` default masih `1`.
- `is_nomor_rombel_inferred = 1`.
- `display_mode = tanpa_nomor`.
- `label_rombel` menyimpan nilai kelas mentah, contoh `12 TP 2`.

## Tabel `siswa`

Tahap 7 mengisi atau update:

| Kolom | Isi |
|---|---|
| `nisn` | Dari CSV |
| `nama_lengkap` | Dari CSV, dinormalisasi uppercase |
| `jurusan_id_aktif` | Dari parsing `KELAS` |
| `rombel_id_aktif` | Dari parsing `KELAS` |
| `kelas_aktif` | Nilai mentah kolom `KELAS` |
| `status` | `aktif` |

NISN harus diperlakukan sebagai string agar nol depan tidak hilang.

## Tabel `siswa_qr`

`siswa_qr` bukan tabel untuk membuat gambar QR.

Fungsi:

Menyimpan referensi pencocokan payload QR hasil scan dengan siswa.

Isi utama:

| Kolom | Isi |
|---|---|
| `siswa_id` | Pemilik QR |
| `payload_raw` | Gabungan nama dan NISN |
| `payload_normalized` | Payload yang sudah dibersihkan |
| `payload_nama` | Nama dari sumber data |
| `payload_nisn` | NISN dari sumber data |

Contoh:

```text
payload_raw = AISYAH LISTYA NARISTA|0096672112
payload_normalized = aisyahlistyanarista0096672112
payload_nama = AISYAH LISTYA NARISTA
payload_nisn = 0096672112
```

## Tabel Presensi

```text
jam_pembelajaran
presensi_sesi
presensi_sesi_jam
presensi_jam_siswa
presensi_scan_log
presensi_edit_log
```

## Tabel `presensi_sesi`

Fungsi: menyimpan sesi presensi yang dibuat oleh guru, staff, admin, atau user dengan permission khusus.

Kolom penting:

| Kolom | Fungsi |
|---|---|
| `session_uuid` | ID sesi publik/internal yang unik |
| `mode_presensi` | `rombel` atau `piket` |
| `rombel_id` | Rombel yang dipresensi, kosong untuk piket |
| `tahun_ajaran_id` | Tahun ajaran sesi |
| `semester` | Semester sesi |
| `tanggal` | Tanggal sesi |
| `status` | `aktif`, `suspended`, atau `selesai` |
| `ruang_pilihan` | Pilihan ruang sesi |
| `ruang_label_snapshot` | Label ruang yang disimpan sebagai histori |
| `opened_by_user_id` | User yang membuka sesi |
| `closed_by_user_id` | User yang menutup sesi |

Pilihan `ruang_pilihan`:

```text
kelas
lab-tkj-1
lab-tkj-2
lab-tkj-3
lab-tkj-4
piket
```

Aturan label:

| ruang_pilihan | ruang_label_snapshot |
|---|---|
| `kelas` | `Kelas {label_rombel}` |
| `lab-tkj-1` | `LAB-TKJ-1` |
| `lab-tkj-2` | `LAB-TKJ-2` |
| `lab-tkj-3` | `LAB-TKJ-3` |
| `lab-tkj-4` | `LAB-TKJ-4` |
| `piket` | `Piket` |

Catatan:

- Tidak ada tabel ruangan.
- Tidak ada plotting ruangan.
- Ruangan hanya snapshot sesi.
- Bentrok ruang lab dicek di backend, bukan dengan unique key database.
- Kelas dianggap melekat pada rombel.

## Tabel `presensi_sesi_jam`

Fungsi: menyimpan daftar jam pembelajaran yang dipilih pada satu sesi.

Kolom penting:

| Kolom | Fungsi |
|---|---|
| `presensi_sesi_id` | ID sesi |
| `jam_id` | Jam pembelajaran |
| `urutan` | Urutan jam dalam sesi |
| `created_at` | Waktu data dibuat |

Aturan:

- Satu sesi bisa punya 1 sampai 3 jam.
- Jam harus berurutan.
- `urutan` mengikuti urutan pilihan jam.
- Tidak ada kolom ruang di tabel ini.
- Tidak ada unique ruang per tanggal dan jam.

## Guard Duplicate Sesi

Duplicate sesi dicek di backend.

### Guard rombel

Rombel yang sama tidak boleh punya sesi aktif/suspended pada tanggal dan jam yang sama.

Response:

```text
Rombel sudah memiliki sesi aktif pada jam yang dipilih.
```

### Guard lab

Lab yang sama tidak boleh dipakai sesi aktif/suspended pada tanggal dan jam yang sama.

Response:

```text
Ruangan lab sedang digunakan pada jam yang dipilih.
```

Jika sesi lama sudah `selesai`, sesi baru boleh dibuat. Ini mendukung kondisi satu hari memiliki lebih dari satu kloter.

## Tabel `presensi_jam_siswa`

Fungsi: menyimpan presensi utama siswa per tanggal dan jam.

Unique key utama:

```text
tanggal
siswa_id
jam_id
```

Aturan:

- Satu siswa hanya punya satu status pada tanggal dan jam yang sama.
- Saat sesi rombel dibuat, sistem membuat baris awal `alpha` untuk siswa di rombel tersebut.
- Status akan berubah pada tahap scan QR atau edit manual.

Status:

```text
alpha
hadir
terlambat
izin
sakit
```

## Foreign Key Rule

Untuk data histori dan audit, gunakan:

```sql
ON DELETE RESTRICT ON UPDATE RESTRICT
```

Alasan:

- child harus tetap ada,
- audit tidak boleh hilang,
- ID parent tidak seharusnya berubah.
