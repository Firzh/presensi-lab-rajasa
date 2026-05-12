# Test Plan

## 1. Purpose

Test plan ini memastikan refactor dan migrasi Presensi tidak hanya “jalan di browser”, tetapi juga sesuai kontrak.

## 2. Test Layers

| Layer | Target |
|---|---|
| Documentation contract test | Dokumen wajib tersedia. |
| Frontend build test | Frontend dapat dibuild. |
| Frontend module test | Import boundary dan service pattern terjaga. |
| Backend dependency test | Composer install dan autoload valid. |
| Backend route test | Endpoint health/auth/domain tersedia. |
| API contract test | Response envelope sesuai. |
| Database contract test | Tabel dan constraint sesuai. |
| Manual acceptance test | User flow berjalan. |

## 3. Documentation Contract Test

Jalankan:

```bash
python scripts/check_docs_contracts.py
```

Test lolos apabila semua dokumen wajib tersedia.

## 4. Frontend Build Test

Jalankan:

```bash
cd frontend
npm install
npm run build
```

Acceptance:

- build sukses;
- tidak ada import error;
- tidak ada route component yang hilang.

## 5. Frontend Lint and Format Test

Setelah fase 1:

```bash
cd frontend
npm run lint
npm run format:check
```

Acceptance:

- lint tidak error;
- formatting konsisten.

## 6. Backend Dependency Test

Jalankan:

```bash
cd backend
composer install
composer dump-autoload
```

Acceptance:

- dependency terinstal;
- namespace `Rajasa\PresensiLabBackend\` valid;
- autoload tidak error.

## 7. Backend Health Test

Jalankan setelah backend route tersedia:

```bash
curl http://localhost:8080/api/health
```

Expected:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "service": "presensi-lab-backend",
    "status": "healthy"
  },
  "meta": {}
}
```

## 8. API Contract Tests

Minimal test:

```text
GET /api/health returns envelope
POST /api/login invalid credential returns 401
GET /api/me without session returns 401
GET /api/admin/jurusan returns list envelope
POST /api/admin/jurusan invalid payload returns 422
GET /api/admin/ruangan returns list envelope
POST /api/admin/ruangan invalid payload returns 422
GET /api/admin/siswa returns list envelope
POST /api/admin/siswa invalid payload returns 422
```

## 9. Database Contract Tests

Minimal cek:

```sql
SHOW TABLES;
SHOW INDEX FROM jurusan;
SHOW INDEX FROM ruangan;
SHOW INDEX FROM siswa;
```

Acceptance:

- tabel inti tersedia;
- unique index tersedia;
- foreign key siswa ke jurusan tersedia;
- enum/status sesuai kontrak.

## 10. Manual Acceptance Tests

### 10.1 Login

- buka `/login`;
- input credential valid;
- berhasil masuk dashboard admin;
- refresh halaman;
- session tetap valid apabila backend mengizinkan;
- logout berhasil.

### 10.2 Data Jurusan

- buka daftar jurusan;
- data muncul dari API;
- tambah jurusan;
- edit jurusan;
- validasi kode duplikat muncul;
- hapus jurusan jika tidak dipakai siswa.

### 10.3 Data Ruangan

- buka daftar ruangan;
- tambah ruangan;
- edit ruangan;
- validasi kapasitas tampil;
- data tetap ada setelah refresh.

### 10.4 Data Siswa

- buka daftar siswa;
- filter berdasarkan keyword;
- tambah siswa dengan jurusan valid;
- edit siswa;
- validasi NIS/NISN duplikat muncul;
- data tetap ada setelah refresh.

## 11. Regression Checklist

Setiap PR wajib cek:

- [ ] login masih berjalan;
- [ ] sidebar route aktif benar;
- [ ] data siswa list berjalan;
- [ ] data jurusan list berjalan;
- [ ] data ruangan list berjalan;
- [ ] create/edit tidak crash;
- [ ] refresh halaman tidak kehilangan data;
- [ ] tidak ada token palsu;
- [ ] tidak ada fetch langsung di page baru;
- [ ] dokumentasi terkait diperbarui.

## 12. Exit Criteria

Siklus stabilisasi selesai apabila:

- documentation contract test lolos;
- frontend build lolos;
- backend dependency test lolos;
- health endpoint valid;
- CRUD jurusan/ruangan/siswa berjalan;
- data tidak lagi bersumber dari `localStorage`;
- implementation status sinkron.
