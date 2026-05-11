# Presensi Lab Rajasa — Contract-First Documentation Pack

Paket ini adalah fondasi dokumentasi teknis untuk proyek `presensi-lab-rajasa` dengan gaya kerja yang meniru kedisiplinan dokumentasi `selfdev`, tetapi disesuaikan dengan kebutuhan aplikasi presensi sekolah.

Tujuan paket ini adalah mengubah Presensi dari repo fitur yang masih rawan konflik menjadi repo yang memiliki:

- kontrak stack;
- kontrak branch dan integrasi;
- kontrak API;
- kontrak auth;
- kontrak database;
- kontrak frontend;
- kontrak route;
- kontrak error;
- kontrak security boundary;
- status implementasi;
- test plan;
- dev plan short term;
- checklist dokumentasi per fase.

## Prinsip utama

Presensi harus dikembangkan dengan prinsip **contract-first, feature-second**.

Artinya, fitur baru tidak boleh langsung masuk ke `app.jsx`, controller, route, atau database tanpa memperbarui kontrak yang relevan terlebih dahulu.

## Cara memakai paket ini

Salin seluruh isi folder ini ke root repo `presensi-lab-rajasa`.

Struktur yang disarankan setelah disalin:

```text
presensi-lab-rajasa/
  README.md
  CHANGELOG.md
  CONTRIBUTING.md
  docs/
    SPECIFICATION.md
    IMPLEMENTATION_STATUS.md
    DEV_PLAN_SHORT_TERM.md
    TEST_PLAN.md
    ARCHITECTURE.md
    CONTRACT_INDEX.md
    contracts/
      STACK_CONTRACT.md
      BRANCH_INTEGRATION_CONTRACT.md
      FRONTEND_CONTRACT.md
      ROUTE_CONTRACT.md
      API_CONTRACT.md
      AUTH_CONTRACT.md
      DATABASE_CONTRACT.md
      ERROR_CONTRACT.md
      ENV_DOCKER_CONTRACT.md
      SECURITY_CONTRACT.md
    dev-plans/
      DEV_PLAN_PHASE_0_CONTRACT_BASELINE.md
      DEV_PLAN_PHASE_1_FRONTEND_STABILIZATION.md
      DEV_PLAN_PHASE_2_FEATURE_MODULARIZATION_ROUTING.md
      DEV_PLAN_PHASE_3_API_BACKEND_FOUNDATION.md
      DEV_PLAN_PHASE_4_DATA_MIGRATION_FINAL_DOCS.md
    reviews/
      CODE_QUALITY_REVIEW.md
  examples/
    api/
      response-envelope.examples.json
  scripts/
    check_docs_contracts.py
```

## Aturan dokumentasi wajib

Setiap 10 commit atau setiap selesai 1 fase implementasi, dokumen berikut wajib diperbarui sebelum fitur baru dilanjutkan:

- `README.md`
- `CHANGELOG.md`
- `docs/SPECIFICATION.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/DEV_PLAN_SHORT_TERM.md`
- `docs/TEST_PLAN.md`
- semua dokumen kontrak yang terdampak di `docs/contracts/`

## Status paket

Paket ini adalah **baseline dokumentasi dan kontrak**, bukan source code implementasi final. Paket ini sengaja dibuat preskriptif agar tim memiliki batas teknis yang jelas sebelum refactor dan migrasi API dilakukan.
