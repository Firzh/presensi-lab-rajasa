# Contract Index

Dokumen ini menjadi daftar pusat semua kontrak teknis Presensi Lab Rajasa.

| Kontrak | File | Tujuan |
|---|---|---|
| Stack Contract | `docs/contracts/STACK_CONTRACT.md` | Mengunci pilihan teknologi agar tidak ambigu. |
| Branch Integration Contract | `docs/contracts/BRANCH_INTEGRATION_CONTRACT.md` | Mengatur cara menyatukan branch fitur aktif. |
| Frontend Contract | `docs/contracts/FRONTEND_CONTRACT.md` | Mengatur struktur modul, batas import, service, dan mapper. |
| Route Contract | `docs/contracts/ROUTE_CONTRACT.md` | Mengatur route frontend dan route API yang valid. |
| API Contract | `docs/contracts/API_CONTRACT.md` | Mengatur endpoint, payload, response, pagination, dan CRUD. |
| Auth Contract | `docs/contracts/AUTH_CONTRACT.md` | Mengatur login, logout, session, token, role, dan larangan token palsu. |
| Database Contract | `docs/contracts/DATABASE_CONTRACT.md` | Mengatur tabel, kolom, relasi, constraint, dan seed awal. |
| Error Contract | `docs/contracts/ERROR_CONTRACT.md` | Mengatur format error frontend dan backend. |
| Env & Docker Contract | `docs/contracts/ENV_DOCKER_CONTRACT.md` | Mengatur environment variable, container, port, dan Nginx. |
| Security Contract | `docs/contracts/SECURITY_CONTRACT.md` | Mengatur batas keamanan awal sistem. |

## Aturan perubahan kontrak

Perubahan kontrak harus dilakukan sebelum atau bersamaan dengan perubahan implementasi.

Urutan yang benar:

```text
1. Ubah kontrak.
2. Ubah implementasi.
3. Ubah test.
4. Ubah implementation status.
5. Catat di changelog.
```

Urutan yang salah:

```text
1. Ubah implementasi.
2. Merge.
3. Dokumentasi menyusul nanti.
```

## Frontend Tailwind

- `docs/contracts/FRONTEND_TAILWIND_CONTRACT.md` — Tailwind CDN setup contract for 31c-2.
