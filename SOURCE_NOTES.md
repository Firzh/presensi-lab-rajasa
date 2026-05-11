# Source Notes

Paket dokumentasi ini disusun berdasarkan review terhadap:

- gaya dokumentasi dan kontrak repo `Firzh/selfdev`;
- struktur repo `Firzh/presensi-lab-rajasa` branch `development`;
- branch aktif Presensi seperti `alfy/manajemen-data-ruangan`, `alfy/manajemen-data-jurusan`, `alfy/manajemen-data-siswa`, `fashich/dashboard-siswa-page`, dan `alfy/landing-page`;
- isi `dev_plan_new.zip` yang berisi empat fase refactor Presensi.

Catatan penting:

- Paket ini tidak menyalin implementasi SelfDev. Paket ini meniru gaya contract-first dan documentation-gated development.
- Presensi berbeda dari SelfDev karena Presensi membutuhkan endpoint mutasi CRUD. Karena itu, kontrak Presensi tidak dibuat read-only seperti SelfDev.
- Backend Presensi dikunci sebagai custom PHP API karena dependency yang tersedia mengarah ke FastRoute, PHP-DI, Illuminate Database, dan Dotenv.
