| Aspek                   | Rencana 10.2                | Rencana 10.3                       | Implementasi saat ini                                                |
| ----------------------- | --------------------------- | ---------------------------------- | -------------------------------------------------------------------- |
| Fokus utama             | Laporan presensi read-only  | Export laporan                     | FE laporan + tombol export sederhana                                 |
| Endpoint laporan khusus | `GET /api/reports/presensi` | dipakai sebagai sumber export      | belum, masih memakai endpoint existing `/api/presensi/jam-siswa`     |
| Export file             | tidak termasuk 10.2         | termasuk 10.3                      | ada di FE, belum backend export                                      |
| Format                  | belum dikerjakan            | CSV, XLSX, PDF, DOCX               | CSV sederhana, XLS berbasis HTML, PDF lewat print, DOC berbasis HTML |
| Permission              | `reports.attendance.read`   | `reports.attendance.export`        | belum final                                                          |
| Test backend export     | belum                       | wajib `AttendanceReportExportTest` | belum ada                                                            |
| Header file resmi       | belum                       | wajib sesuai format file           | belum ada karena export belum dari backend                           |

## 10.2.1

| Komponen     | Definisi Operasional                                 | Batasan                          | Sumber |
| ------------ | ---------------------------------------------------- | -------------------------------- | ------ |
| Tujuan tahap | Menyediakan laporan presensi yang hanya bisa dibaca. | Tidak mengubah data.             |        |
| Fokus utama  | Endpoint laporan presensi read-only.                 | Export belum masuk tahap ini.    |        |
| Output tahap | Data laporan dengan filter dan pagination.           | Bukan file export.               |        |
| Hak akses    | `reports.attendance.read`.                           | Permission export belum dipakai. |        |


## 10.2.2

## 10.2.2 - Backend File Setup Laporan Presensi

Status: DONE

| File                                                | Aksi   | Status | Keterangan |
| --------------------------------------------------- | ------ | ------ | ---------- |
| `backend/routes/api.php`                            | Update | DONE   | Route `GET /api/reports/presensi` sudah terdaftar. |
| `backend/src/Http/Controllers/ReportController.php` | Buat   | DONE   | Controller menerima request laporan dan memakai permission `reports.attendance.read`. |
| `backend/src/Services/ReportService.php`            | Buat   | DONE   | Service menyusun query, filter, summary, items, dan pagination. |
| `backend/tests/Feature/AttendanceReportTest.php`    | Buat   | DONE   | Feature test endpoint laporan sudah lulus. |

Catatan:
Tahap 10.2.2 tidak perlu implementasi ulang karena sudah tercakup pada commit 10.2.1.
Lanjut ke 10.2.3 untuk pendetailan parameter dan kontrak filter endpoint.
10.2.2: DONE, covered by 10.2.1 commit

## 10.2.3

| Komponen       | Definisi Operasional                  | Contoh                                         | Sumber |
| -------------- | ------------------------------------- | ---------------------------------------------- | ------ |
| Endpoint utama | Mengambil laporan presensi read-only. | `GET /api/reports/presensi`                    |        |
| `date_from`    | Tanggal awal laporan.                 | `2026-03-01`                                   |        |
| `date_to`      | Tanggal akhir laporan.                | `2026-03-31`                                   |        |
| `rombel_id`    | Filter berdasarkan rombel.            | `1`                                            |        |
| `siswa_id`     | Filter berdasarkan siswa.             | `12`                                           |        |
| `jam_ke`       | Filter berdasarkan jam presensi.      | `1`                                            |        |
| `status`       | Filter status presensi.               | `hadir`, `alpha`, `izin`, `sakit`, `terlambat` |        |
| `mode`         | Filter mode presensi.                 | `rombel`, `piket`                              |        |
| `page`         | Halaman data.                         | `1`                                            |        |
| `per_page`     | Jumlah data per halaman.              | `25`                                           |        |

## 10.2.4

| Komponen       | Definisi Operasional                  | Contoh                                         | Sumber |
| -------------- | ------------------------------------- | ---------------------------------------------- | ------ |
| Endpoint utama | Mengambil laporan presensi read-only. | `GET /api/reports/presensi`                    |        |
| `date_from`    | Tanggal awal laporan.                 | `2026-03-01`                                   |        |
| `date_to`      | Tanggal akhir laporan.                | `2026-03-31`                                   |        |
| `rombel_id`    | Filter berdasarkan rombel.            | `1`                                            |        |
| `siswa_id`     | Filter berdasarkan siswa.             | `12`                                           |        |
| `jam_ke`       | Filter berdasarkan jam presensi.      | `1`                                            |        |
| `status`       | Filter status presensi.               | `hadir`, `alpha`, `izin`, `sakit`, `terlambat` |        |
| `mode`         | Filter mode presensi.                 | `rombel`, `piket`                              |        |
| `page`         | Halaman data.                         | `1`                                            |        |
| `per_page`     | Jumlah data per halaman.              | `25`                                           |        |

## 10.2.5

| Komponen       | Definisi Operasional                  | Contoh                                         | Sumber |
| -------------- | ------------------------------------- | ---------------------------------------------- | ------ |
| Endpoint utama | Mengambil laporan presensi read-only. | `GET /api/reports/presensi`                    |        |
| `date_from`    | Tanggal awal laporan.                 | `2026-03-01`                                   |        |
| `date_to`      | Tanggal akhir laporan.                | `2026-03-31`                                   |        |
| `rombel_id`    | Filter berdasarkan rombel.            | `1`                                            |        |
| `siswa_id`     | Filter berdasarkan siswa.             | `12`                                           |        |
| `jam_ke`       | Filter berdasarkan jam presensi.      | `1`                                            |        |
| `status`       | Filter status presensi.               | `hadir`, `alpha`, `izin`, `sakit`, `terlambat` |        |
| `mode`         | Filter mode presensi.                 | `rombel`, `piket`                              |        |
| `page`         | Halaman data.                         | `1`                                            |        |
| `per_page`     | Jumlah data per halaman.              | `25`                                           |        |

## 10.2.6

| Validasi     | Bentuk Pelaksanaan                                                      | Hasil yang Diharapkan            | Sumber |
| ------------ | ----------------------------------------------------------------------- | -------------------------------- | ------ |
| Backend test | Jalankan `./scripts/test-backend.sh` dan filter `AttendanceReportTest`. | Endpoint laporan lulus test.     |        |
| Curl manual  | Request ke `GET /api/reports/presensi`.                                 | Response sukses dan terstruktur. |        |
| Isi response | `success`, `summary`, `items`, `pagination`.                            | Semua bagian muncul.             |        |
| Batas scope  | Tidak ada export, PDF, DOCX, perubahan schema.                          | Tetap read-only.                 |        |
