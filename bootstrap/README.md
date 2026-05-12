# Bootstrap Contract-First Presensi Lab Rajasa

Folder ini berisi entry implementasi untuk pola kerja contract-first.

## File utama

- `bootstrap_implementasi_contract_first.sh`
- `tests/test_contract_first_baseline.sh`
- `reports/contract_first_bootstrap_report.md`

## Mode

```bash
bash ./bootstrap/bootstrap_implementasi_contract_first.sh --dry-run
bash ./bootstrap/bootstrap_implementasi_contract_first.sh --debug-run
bash ./bootstrap/bootstrap_implementasi_contract_first.sh --test-only
```

## Aturan branch

Semua branch implementasi baru wajib memakai prefix:

```text
alfy/...
```

## Scope bootstrap

Bootstrap ini tidak mengekstrak ZIP dokumentasi. Dokumentasi contract-first dimasukkan manual dari `presensi_contract_pack.zip` di root repo sebelum bootstrap dijalankan.