# Database Contract

## 1. Purpose

Kontrak ini mengatur schema awal database agar backend dan frontend memiliki sumber data yang stabil.

## 2. Database Engine

```text
MySQL 8.0
```

## 3. Naming Rule

- Nama tabel memakai snake_case.
- Nama kolom memakai snake_case.
- Primary key memakai `id` unsigned big integer auto increment.
- Timestamp memakai `created_at` dan `updated_at`.
- Soft delete belum wajib untuk fase awal.

## 4. Core Tables

Tabel awal:

```text
users
roles
role_user
jurusan
ruangan
siswa
```

## 5. `jurusan` Table

```sql
CREATE TABLE jurusan (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(20) NOT NULL UNIQUE,
  nama_jurusan VARCHAR(150) NOT NULL,
  ketua_jurusan VARCHAR(150) NULL,
  status ENUM('Aktif', 'Nonaktif') NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);
```

Indexes:

```sql
CREATE INDEX idx_jurusan_status ON jurusan(status);
CREATE INDEX idx_jurusan_nama ON jurusan(nama_jurusan);
```

## 6. `ruangan` Table

```sql
CREATE TABLE ruangan (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  jenis_ruangan ENUM('Kelas', 'Lab', 'Rombel', 'Workshop') NOT NULL,
  kode VARCHAR(50) NOT NULL UNIQUE,
  nama_ruangan VARCHAR(150) NOT NULL,
  kapasitas INT UNSIGNED NOT NULL DEFAULT 1,
  terisi INT UNSIGNED NOT NULL DEFAULT 0,
  lokasi VARCHAR(150) NOT NULL,
  jaringan VARCHAR(150) NULL,
  fasilitas TEXT NULL,
  status ENUM('Aktif', 'Nonaktif') NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);
```

Indexes:

```sql
CREATE INDEX idx_ruangan_jenis_status ON ruangan(jenis_ruangan, status);
CREATE INDEX idx_ruangan_nama ON ruangan(nama_ruangan);
```

## 7. `siswa` Table

```sql
CREATE TABLE siswa (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nisn VARCHAR(20) NULL UNIQUE,
  nis VARCHAR(20) NULL UNIQUE,
  nama_lengkap VARCHAR(150) NOT NULL,
  tempat_lahir VARCHAR(100) NULL,
  tanggal_lahir DATE NULL,
  jurusan_id BIGINT UNSIGNED NOT NULL,
  kelas VARCHAR(30) NOT NULL,
  gender ENUM('L', 'P') NOT NULL,
  status ENUM('Aktif', 'Lulus', 'Keluar', 'Mutasi') NOT NULL DEFAULT 'Aktif',
  catatan TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_siswa_jurusan FOREIGN KEY (jurusan_id) REFERENCES jurusan(id)
);
```

Indexes:

```sql
CREATE INDEX idx_siswa_nama ON siswa(nama_lengkap);
CREATE INDEX idx_siswa_jurusan_kelas ON siswa(jurusan_id, kelas);
CREATE INDEX idx_siswa_status ON siswa(status);
```

## 8. `users` Table

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_lengkap VARCHAR(150) NOT NULL,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('Aktif', 'Nonaktif') NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);
```

## 9. `roles` Table

```sql
CREATE TABLE roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);
```

## 10. `role_user` Table

```sql
CREATE TABLE role_user (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_role_user_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_user_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

## 11. Seed Contract

Seed awal minimal:

### Roles

```text
admin
siswa
```

### Admin User

Buat admin user untuk development. Password harus di-hash, bukan disimpan plain text.

### Jurusan

Seed jurusan boleh mengambil daftar awal dari UI lama, tetapi harus masuk ke database seeder, bukan `localStorage`.

## 12. Migration Rule

Setiap perubahan database wajib:

- punya migration file;
- update dokumen ini;
- update API contract jika field muncul di response/request;
- update frontend mapper jika field muncul di UI;
- update test data.

## 13. Deletion Rule

Untuk fase awal, DELETE boleh hard delete. Sebelum production, evaluasi soft delete untuk data siswa dan presensi.
