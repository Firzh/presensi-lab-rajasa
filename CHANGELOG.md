# Changelog

Format changelog mengikuti prinsip dokumentasi kontrak. Setiap perubahan harus menjelaskan dampak terhadap frontend, backend, database, API, dan dokumentasi.

## [Unreleased]

### Added

- Menambahkan baseline dokumentasi contract-first untuk proyek Presensi Lab Rajasa.
- Menambahkan kontrak stack backend, frontend, database, dan Docker.
- Menambahkan kontrak branch integration untuk menyatukan branch fitur aktif.
- Menambahkan kontrak API, auth, database, route, error, dan frontend module boundary.
- Menambahkan dev plan fase 0 sampai fase 4.
- Menambahkan test plan untuk kontrak, frontend, backend, database, dan manual acceptance.
- Menambahkan script `scripts/check_docs_contracts.py` untuk memeriksa keberadaan dokumen wajib.

### Changed

- Menetapkan arah backend sebagai custom PHP API dengan FastRoute, PHP-DI, Illuminate Database, dan Dotenv.
- Menetapkan frontend sebagai Preact + Vite, bukan React penuh.
- Menetapkan `VITE_API_BASE_URL` sebagai satu-satunya nama environment frontend untuk base API.
- Menetapkan data bisnis siswa, jurusan, dan ruangan harus dimigrasikan dari `localStorage` ke backend API secara bertahap.

### Deprecated

- Penggunaan `app.jsx` sebagai tempat seluruh fitur, seed data, constants, helper storage, routing, layout, dan halaman.
- Penggunaan `localStorage` sebagai database semu untuk data bisnis utama.
- Penggunaan token palsu yang dibuat frontend saat backend tidak mengembalikan token.
- Komentar dan konfigurasi yang menyebut backend sebagai Laravel apabila stack yang dipilih tetap custom PHP API.

### Removed

- Belum ada penghapusan source code. Paket ini hanya mengatur baseline dokumentasi dan kontrak.

### Security

- Menambahkan security boundary awal untuk auth, session, file sensitif, input validation, dan unsafe frontend token generation.
