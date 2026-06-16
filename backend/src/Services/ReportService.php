<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

use Illuminate\Database\Capsule\Manager as DB;

final class ReportService
{
    public function getAttendanceReport(array $filters): array
    {
        $dateFrom = trim((string) ($filters['date_from'] ?? date('Y-m-d')));
        $dateTo = trim((string) ($filters['date_to'] ?? date('Y-m-d')));
        $rombelId = trim((string) ($filters['rombel_id'] ?? ''));
        $siswaId = trim((string) ($filters['siswa_id'] ?? ''));
        $jamKe = trim((string) ($filters['jam_ke'] ?? ''));
        $status = trim((string) ($filters['status'] ?? ''));
        $mode = trim((string) ($filters['mode'] ?? ''));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $rawPerPage = (int) ($filters['per_page'] ?? 25);
        $isExportAll = $rawPerPage === 0;

        $perPage = $isExportAll
            ? 0
            : min(1000, max(1, $rawPerPage));

        $query = DB::table('presensi_jam_siswa as p')
            ->join('siswa as s', 's.siswa_id', '=', 'p.siswa_id')
            ->leftJoin('rombel as r', 'r.rombel_id', '=', 'p.rombel_id_snapshot')
            ->leftJoin('jam_pembelajaran as j', 'j.jam_id', '=', 'p.jam_id')
            ->leftJoin('presensi_sesi as ps', 'ps.presensi_sesi_id', '=', 'p.presensi_sesi_id')
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

        $summaryQuery = clone $query;
        $summaryRows = $summaryQuery->select('p.status', DB::raw('count(*) as total'))->groupBy('p.status')->get();

        $summary = [
            'total' => 0,
            'hadir' => 0,
            'terlambat' => 0,
            'izin' => 0,
            'sakit' => 0,
            'alpha' => 0,
        ];

        foreach ($summaryRows as $row) {
            $stat = strtolower($row->status);
            $total = (int) $row->total;
            if (array_key_exists($stat, $summary)) {
                $summary[$stat] += $total;
            }
            $summary['total'] += $total;
        }

        $totalRows = $summary['total'];

        $rowsQuery = $query
            ->orderBy('p.tanggal', 'desc')
            ->orderBy('r.tingkat_angka')
            ->orderBy('r.label_rombel')
            ->orderBy('j.jam_ke')
            ->orderBy('s.nama_lengkap');

        if (!$isExportAll) {
            $rowsQuery
                ->offset(($page - 1) * $perPage)
                ->limit($perPage);
        }

        $rows = $rowsQuery
            ->get([
                'p.presensi_id',
                'p.tanggal',
                'p.siswa_id',
                's.nisn',
                's.nama_lengkap',
                's.kelas_aktif',
                'p.rombel_id_snapshot',
                'r.label_rombel',
                'p.jam_id',
                'j.jam_ke',
                'j.label_jam',
                'p.status',
                'p.mode_presensi',
                'p.presensi_sesi_id',
                'ps.ruang_label_snapshot as ruangan',
                'p.scan_log_id',
                'p.scanned_at',
                'p.edited_at',
            ])
            ->map(fn (object $row): array => [
                'presensi_id' => $row->presensi_id,
                'scan_log_id' => $row->scan_log_id,
                'tanggal' => $row->tanggal,
                'mode_presensi' => $row->mode_presensi,
                'jam_ke' => $row->jam_ke,
                'nama_siswa' => $row->nama_lengkap,
                'nisn' => $row->nisn,
                'rombel' => $row->label_rombel ?? $row->kelas_aktif,
                'ruangan' => $row->ruangan ?? '-',
                'status' => $row->status,
                'scanned_at' => $row->scanned_at,
                'validasi' => 'perlu dicek',
            ])
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
            'items' => $rows,
            'pagination' => [
                'page' => $page,
                'per_page' => $isExportAll ? $totalRows : $perPage,
                'total' => $totalRows,
            ],
        ];
    }
}
