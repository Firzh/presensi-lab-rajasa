# Frontend Contract

## 1. Purpose

Kontrak ini mengatur struktur frontend agar kode tidak kembali menjadi monolitik di `app.jsx`.

## 2. Approved Structure

```text
frontend/src/
  main.jsx
  app.jsx
  app.css
  constants/
    routes.js
    storageKeys.js
    options.js
    pagination.js
  lib/
    apiClient.js
    apiError.js
    storage.js
  components/
    layout/
      AppLayout.jsx
      AuthLayout.jsx
      Sidebar.jsx
      Topbar.jsx
    ui/
      Button.jsx
      EmptyPanel.jsx
      EmptyStateRow.jsx
      FilterControl.jsx
      FormField.jsx
      FormInput.jsx
      FormSelect.jsx
      Pagination.jsx
      PageHeading.jsx
  features/
    auth/
      pages/
        LoginPage.jsx
      services/
        authService.js
    siswa/
      pages/
        SiswaListPage.jsx
        SiswaFormPage.jsx
      components/
        SiswaTable.jsx
        SiswaFilters.jsx
        SiswaForm.jsx
      services/
        siswaService.js
      mappers/
        siswaMapper.js
    jurusan/
      pages/
        JurusanListPage.jsx
        JurusanFormPage.jsx
      components/
        JurusanCard.jsx
        JurusanForm.jsx
      services/
        jurusanService.js
      mappers/
        jurusanMapper.js
    ruangan/
      pages/
        RuanganListPage.jsx
        RuanganFormPage.jsx
      components/
        RuanganCard.jsx
        RuanganForm.jsx
      services/
        ruanganService.js
      mappers/
        ruanganMapper.js
  routes/
    AppRouter.jsx
```

## 3. `app.jsx` Responsibility

`app.jsx` hanya boleh berisi:

- import global style;
- provider global bila diperlukan;
- pemanggilan `AppRouter`;
- fallback global sederhana.

`app.jsx` tidak boleh berisi:

- seed siswa;
- seed jurusan;
- seed ruangan;
- seluruh halaman;
- seluruh form;
- seluruh tabel;
- helper storage;
- route manual;
- `fetch` langsung;
- business logic.

## 4. Import Boundary

Aturan import:

```text
features/* boleh import dari lib, constants, components.
features/siswa tidak boleh import langsung dari features/jurusan.
features/jurusan tidak boleh import langsung dari features/ruangan.
components/ui tidak boleh import dari features.
lib tidak boleh import dari components atau features.
routes boleh import pages dari features.
```

## 5. Service Rule

Semua komunikasi API harus lewat service.

Benar:

```text
SiswaListPage → siswaService → apiClient
```

Salah:

```text
SiswaListPage → fetch
```

## 6. Mapper Rule

Frontend boleh memakai camelCase untuk UI, tetapi API dan database menggunakan snake_case.

Mapper wajib dibuat apabila field berbeda.

Contoh:

```js
export function mapSiswaFromApi(row) {
  return {
    id: row.id,
    nisn: row.nisn,
    nis: row.nis,
    namaLengkap: row.nama_lengkap,
    tempatLahir: row.tempat_lahir,
    tanggalLahir: row.tanggal_lahir,
    jurusanId: row.jurusan_id,
    jurusan: row.jurusan?.nama_jurusan,
    kelas: row.kelas,
    gender: row.gender,
    status: row.status,
    catatan: row.catatan,
  }
}
```

## 7. Local Storage Rule

`localStorage` hanya boleh digunakan untuk:

- theme;
- sidebar collapsed state;
- non-sensitive UI preference;
- dev fixture dengan flag eksplisit.

Tidak boleh digunakan untuk:

- data siswa;
- data jurusan;
- data ruangan;
- data presensi;
- password;
- token palsu;
- role palsu.

## 8. Loading and Error Contract

Setiap page yang memanggil API wajib punya:

- loading state;
- empty state;
- error state;
- retry action bila relevan;
- submit loading untuk form.

## 9. Naming Contract

Frontend UI boleh memakai camelCase.

Contoh:

```text
namaLengkap
namaJurusan
namaRuangan
jenisRuangan
tanggalLahir
```

API/database tetap menggunakan snake_case.

## 10. Accessibility Baseline

Minimal:

- form input memiliki label;
- button memiliki teks atau `aria-label`;
- loading tidak hanya ditandai warna;
- error message ditampilkan dekat konteks input;
- navigasi utama dapat dibaca screen reader.
