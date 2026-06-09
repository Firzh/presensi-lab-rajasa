<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

use Illuminate\Database\Capsule\Manager as DB;
use Rajasa\PresensiSiswa\Core\HttpException;

final class ReportService
{
    private const VALID_STATUSES = ['alpha', 'hadir', 'terlambat', 'izin', 'sakit'];
    private const VALID_MODES = ['rombel', 'piket', 'manual'];

    public function attendance(array $filters): array
    {
        $dateFrom = trim((string) ($filters['date_from'] ?? date('Y-m-d')));
        $dateTo = trim((string) ($filters['date_to'] ?? ''));
        $dateTo = $dateTo !== '' ? $dateTo : $dateFrom;

        $rombelId = trim((string) ($filters['rombel_id'] ?? ''));
        $siswaId = trim((string) ($filters['siswa_id'] ?? ''));
        $jamKe = trim((string) ($filters['jam_ke'] ?? ''));
        $status = trim((string) ($filters['status'] ?? ''));
        $mode = trim((string) ($filters['mode'] ?? ''));

        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 25)));

        $this->validateDate('date_from', $dateFrom);
        $this->validateDate('date_to', $dateTo);
        $this->validateDateRange($dateFrom, $dateTo);
        $this->validateStatus($status);
        $this->validateMode($mode);

        $query = $this->baseQuery()
            ->whereBetween('p.tanggal', [$dateFrom, $dateTo]);

        if ($rombelId !== '') {
            $query->where('p.rombel_id_snapshot', (int) $rombelId);
        }

        if ($siswaId !== '') {
            $query->where('p.siswa_id', (int) $siswaId);
        }

        if ($jamKe !== '') {
            $query->where('j.jam_ke', (int) $jamKe);
        }

        if ($status !== '') {
            $query->where('p.status', $status);
        }

        if ($mode !== '') {
            $query->where('p.mode_presensi', $mode);
        }

        $total = (clone $query)->count();

        $summary = $this->summary(clone $query);

        $items = $query
            ->orderBy('p.tanggal')
            ->orderBy('r.tingkat_angka')
            ->orderBy('r.label_rombel')
            ->orderBy('j.jam_ke')
            ->orderBy('s.nama_lengkap')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get($this->columns())
            ->map(fn (object $row): array => $this->formatRow($row))
            ->values()
            ->all();

        return [
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'rombel_id' => $rombelId !== '' ? (int) $rombelId : null,
                'siswa_id' => $siswaId !== '' ? (int) $siswaId : null,
                'jam_ke' => $jamKe !== '' ? (int) $jamKe : null,
                'status' => $status !== '' ? $status : null,
                'mode' => $mode !== '' ? $mode : null,
            ],
            'summary' => $summary,
            'items' => $items,
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => max(1, (int) ceil($total / $perPage)),
            ],
        ];
    }

    private function baseQuery()
    {
        return DB::table('presensi_jam_siswa as p')
            ->join('siswa as s', 's.siswa_id', '=', 'p.siswa_id')
            ->leftJoin('rombel as r', 'r.rombel_id', '=', 'p.rombel_id_snapshot')
            ->leftJoin('jam_pembelajaran as j', 'j.jam_id', '=', 'p.jam_id')
            ->leftJoin('presensi_sesi as sesi', 'sesi.presensi_sesi_id', '=', 'p.presensi_sesi_id')
            ->leftJoin('users as edit_user', 'edit_user.user_id', '=', 'p.edited_by_user_id');
    }

    private function columns(): array
    {
        return [
            'p.presensi_id',
            'p.tanggal',
            'p.mode_presensi',
            'p.status',
            'p.scanned_at',
            'p.edited_at',
            'p.keterangan',
            'p.scan_log_id',
            'p.presensi_sesi_id',
            's.siswa_id',
            's.nisn',
            's.nama_lengkap',
            's.kelas_aktif',
            'r.rombel_id',
            'r.label_rombel',
            'j.jam_id',
            'j.jam_ke',
            'j.label_jam',
            'sesi.ruang_pilihan',
            'sesi.ruang_label_snapshot',
            'edit_user.username as edited_by_username',
        ];
    }

    private function summary($query): array
    {
        $summary = [
            'total' => 0,
            'hadir' => 0,
            'terlambat' => 0,
            'izin' => 0,
            'sakit' => 0,
            'alpha' => 0,
        ];

        $rows = $query
            ->selectRaw('p.status, COUNT(*) as total')
            ->groupBy('p.status')
            ->get();

        foreach ($rows as $row) {
            $status = (string) $row->status;
            $count = (int) $row->total;

            if (array_key_exists($status, $summary)) {
                $summary[$status] = $count;
            }

            $summary['total'] += $count;
        }

        return $summary;
    }

    private function formatRow(object $row): array
    {
        return [
            'presensi_id' => (int) $row->presensi_id,
            'tanggal' => $row->tanggal,
            'mode' => $row->mode_presensi,
            'jam_ke' => $row->jam_ke !== null ? (int) $row->jam_ke : null,
            'jam' => [
                'jam_id' => $row->jam_id !== null ? (int) $row->jam_id : null,
                'jam_ke' => $row->jam_ke !== null ? (int) $row->jam_ke : null,
                'label_jam' => $row->label_jam,
            ],
            'siswa' => [
                'siswa_id' => (int) $row->siswa_id,
                'nisn' => $row->nisn,
                'nama_lengkap' => $row->nama_lengkap,
                'kelas_aktif' => $row->kelas_aktif,
            ],
            'nama_siswa' => $row->nama_lengkap,
            'nisn' => $row->nisn,
            'rombel' => [
                'rombel_id' => $row->rombel_id !== null ? (int) $row->rombel_id : null,
                'label_rombel' => $row->label_rombel,
            ],
            'status' => $row->status,
            'scanned_at' => $row->scanned_at,
            'edited_at' => $row->edited_at,
            'edited_by_username' => $row->edited_by_username,
            'keterangan' => $row->keterangan,
            'scan_log_id' => $row->scan_log_id !== null ? (int) $row->scan_log_id : null,
            'presensi_sesi_id' => $row->presensi_sesi_id !== null ? (int) $row->presensi_sesi_id : null,
            'ruang_pilihan' => $row->ruang_pilihan,
            'ruang_label_snapshot' => $row->ruang_label_snapshot,
        ];
    }

    private function validateDate(string $field, string $value): void
    {
        $date = \DateTimeImmutable::createFromFormat('Y-m-d', $value);

        if (!$date || $date->format('Y-m-d') !== $value) {
            throw new HttpException('Tanggal tidak valid.', 422, [
                $field => 'Format tanggal harus YYYY-MM-DD.',
            ]);
        }
    }

    private function validateDateRange(string $dateFrom, string $dateTo): void
    {
        if ($dateTo < $dateFrom) {
            throw new HttpException('Rentang tanggal tidak valid.', 422, [
                'date_to' => 'Tanggal akhir tidak boleh lebih kecil dari tanggal awal.',
            ]);
        }
    }

    private function validateStatus(string $status): void
    {
        if ($status !== '' && !in_array($status, self::VALID_STATUSES, true)) {
            throw new HttpException('Status filter tidak valid.', 422, [
                'status' => 'Status harus salah satu dari: ' . implode(', ', self::VALID_STATUSES),
            ]);
        }
    }

    private function validateMode(string $mode): void
    {
        if ($mode !== '' && !in_array($mode, self::VALID_MODES, true)) {
            throw new HttpException('Mode filter tidak valid.', 422, [
                'mode' => 'Mode harus salah satu dari: ' . implode(', ', self::VALID_MODES),
            ]);
        }
    }
}