# Changelog

Semua perubahan penting dalam project ini dicatat di file ini.

Format mengikuti pola sederhana:

```text
Added
Changed
Fixed
Removed
```

## [Unreleased]

### Added

- Menambahkan baseline dokumentasi baru untuk MVP presensi siswa QR.
- Menambahkan dokumen arsitektur project.
- Menambahkan dokumen API MVP.
- Menambahkan dokumen database MVP.
- Menambahkan aturan kontribusi project.

### Changed

- Mengubah fokus project dari presensi lab menjadi presensi siswa berbasis rombel, piket, dan jam pembelajaran.
- Menyesuaikan dokumentasi agar mengacu pada struktur kode, konfigurasi, dan schema database yang aktif.
- Menetapkan prefix branch project dengan format `alfy/*`.

### Removed

- Menghapus ketergantungan dokumentasi pada contract-first documentation pack lama.
- Menghapus acuan terhadap folder root `bootstrap/` lama yang bukan bootstrap aplikasi backend.
- Menghapus acuan terhadap scope lama seperti ruangan, perangkat ESP32, plotting rombel, policy engine, group engine, arsip, dan notifikasi kompleks.

## [0.1.0] - Baseline MVP

### Added

- Baseline environment Docker.
- Backend PHP 8.2 FPM.
- Frontend Vite.
- MySQL 8.0.
- Nginx reverse proxy.
- Rancangan schema database MVP presensi siswa QR.
- Pemisahan rencana schema dan seed database.
