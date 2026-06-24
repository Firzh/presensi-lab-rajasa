<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

use Illuminate\Database\Capsule\Manager as DB;

final class SiswaService
{
    private const DEFAULT_PER_PAGE = 10;
    private const MAX_PER_PAGE = 100;

    public function list(array $filters): array
    {
        $keyword = trim((string) ($filters['q'] ?? ''));
        $jurusanId = trim((string) ($filters['jurusan_id'] ?? ''));
        $rombelId = trim((string) ($filters['rombel_id'] ?? ''));
        $status = trim((string) ($filters['status'] ?? ''));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(self::MAX_PER_PAGE, max(1, (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE)));

        $query = DB::table('siswa as s')
            ->leftJoin('jurusan as j', 'j.jurusan_id', '=', 's.jurusan_id_aktif')
            ->leftJoin('rombel as r', 'r.rombel_id', '=', 's.rombel_id_aktif');

        if ($keyword !== '') {
            $query->where(function ($query) use ($keyword): void {
                $query
                    ->where('s.nisn', 'like', '%' . $keyword . '%')
                    ->orWhere('s.nis', 'like', '%' . $keyword . '%')
                    ->orWhere('s.nama_lengkap', 'like', '%' . $keyword . '%');
            });
        }

        if ($jurusanId !== '') {
            $query->where('s.jurusan_id_aktif', (int) $jurusanId);
        }

        if ($rombelId !== '') {
            $query->where('s.rombel_id_aktif', (int) $rombelId);
        }

        if ($status !== '') {
            $query->where('s.status', strtolower($status));
        }

        $total = (clone $query)->count('s.siswa_id');
        $offset = ($page - 1) * $perPage;

        $items = $query
            ->orderBy('r.tingkat_angka')
            ->orderBy('j.kode_jurusan')
            ->orderBy('r.nomor_rombel')
            ->orderBy('s.nama_lengkap')
            ->offset($offset)
            ->limit($perPage)
            ->get([
                's.siswa_id',
                's.nisn',
                's.nis',
                's.nama_lengkap',
                's.jenis_kelamin',
                's.angkatan',
                's.jurusan_id_aktif',
                's.rombel_id_aktif',
                's.kelas_aktif',
                's.status',
                'j.kode_jurusan',
                'j.nama_jurusan',
                'r.label_rombel',
                'r.label_rombel_raw',
            ])
            ->map(fn (object $row): array => $this->formatSiswa($row))
            ->values()
            ->all();

        return [
            'items' => $items,
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => (int) $total,
                'total_pages' => max(1, (int) ceil(((int) $total) / $perPage)),
            ],
            'filters' => [
                'q' => $keyword !== '' ? $keyword : null,
                'jurusan_id' => $jurusanId !== '' ? (int) $jurusanId : null,
                'rombel_id' => $rombelId !== '' ? (int) $rombelId : null,
                'status' => $status !== '' ? strtolower($status) : null,
            ],
            'options' => [
                'jurusan' => $this->jurusanOptions(),
                'rombel' => $this->rombelOptions(),
                'statuses' => $this->statusOptions(),
            ],
        ];
    }

    private function jurusanOptions(): array
    {
        return DB::table('jurusan')
            ->where('status', 'aktif')
            ->orderBy('kode_jurusan')
            ->get(['jurusan_id', 'kode_jurusan', 'nama_jurusan'])
            ->map(fn (object $row): array => [
                'jurusan_id' => (int) $row->jurusan_id,
                'kode_jurusan' => $row->kode_jurusan,
                'nama_jurusan' => $row->nama_jurusan,
            ])
            ->values()
            ->all();
    }

    private function rombelOptions(): array
    {
        return DB::table('rombel as r')
            ->leftJoin('jurusan as j', 'j.jurusan_id', '=', 'r.jurusan_id')
            ->where('r.status', 'aktif')
            ->orderBy('r.tingkat_angka')
            ->orderBy('j.kode_jurusan')
            ->orderBy('r.nomor_rombel')
            ->get([
                'r.rombel_id',
                'r.label_rombel',
                'r.label_rombel_raw',
                'r.tingkatan',
                'r.jurusan_id',
                'j.kode_jurusan',
            ])
            ->map(fn (object $row): array => [
                'rombel_id' => (int) $row->rombel_id,
                'label' => $this->rombelLabel($row),
                'label_rombel' => $row->label_rombel,
                'label_rombel_raw' => $row->label_rombel_raw,
                'tingkatan' => $row->tingkatan,
                'jurusan_id' => (int) $row->jurusan_id,
                'kode_jurusan' => $row->kode_jurusan,
            ])
            ->values()
            ->all();
    }

    private function statusOptions(): array
    {
        return [
            ['value' => 'aktif', 'label' => 'Aktif'],
            ['value' => 'lulus', 'label' => 'Lulus'],
            ['value' => 'mutasi', 'label' => 'Mutasi'],
            ['value' => 'keluar', 'label' => 'Keluar'],
            ['value' => 'nonaktif', 'label' => 'Nonaktif'],
        ];
    }

    private function formatSiswa(object $row): array
    {
        return [
            'id' => (int) $row->siswa_id,
            'siswa_id' => (int) $row->siswa_id,
            'nisn' => $row->nisn,
            'nis' => $row->nis,
            'nama' => $row->nama_lengkap,
            'nama_lengkap' => $row->nama_lengkap,
            'jurusan_id' => $row->jurusan_id_aktif !== null ? (int) $row->jurusan_id_aktif : null,
            'rombel_id' => $row->rombel_id_aktif !== null ? (int) $row->rombel_id_aktif : null,
            'jurusan' => $row->kode_jurusan,
            'nama_jurusan' => $row->nama_jurusan,
            'kelas' => $row->label_rombel ?: ($row->kelas_aktif ?: $row->label_rombel_raw),
            'kelas_aktif' => $row->kelas_aktif,
            'gender' => $row->jenis_kelamin,
            'jenis_kelamin' => $row->jenis_kelamin,
            'status' => $row->status,
            'status_label' => ucfirst((string) $row->status),
            'angkatan' => $row->angkatan !== null ? (int) $row->angkatan : null,
        ];
    }

    private function rombelLabel(object $row): string
    {
        $label = trim((string) ($row->label_rombel ?? ''));

        if ($label !== '') {
            return $label;
        }

        $raw = trim((string) ($row->label_rombel_raw ?? ''));

        return $raw !== '' ? $raw : 'Rombel #' . (int) $row->rombel_id;
    }
}