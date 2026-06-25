<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services\Exporters;

final class AttendanceExportRows
{
    private const MIN_TOTAL_JAM = 8;

    public static function compact(array $data): array
    {
        $groups = [];

        foreach ($data as $row) {
            $tanggal = (string) ($row['tanggal'] ?? '-');
            $nisn = (string) ($row['nisn'] ?? '-');
            $nama = (string) ($row['nama_siswa'] ?? '-');
            $rombel = (string) ($row['rombel'] ?? '-');
            $key = implode('|', [$tanggal, $nisn, $nama, $rombel]);

            if (!isset($groups[$key])) {
                $groups[$key] = [
                    'tanggal' => $tanggal,
                    'nama_siswa' => $nama,
                    'nisn' => $nisn,
                    'rombel' => $rombel,
                    'jam_pelajaran_hadir' => [],
                    'jam_pelajaran_tidak_hadir' => [],
                    'semua_jam' => [],
                ];
            }

            $jamKe = self::normalizeJam($row['jam_ke'] ?? null);
            $status = strtolower((string) ($row['status'] ?? '-'));

            if ($jamKe === '-') {
                continue;
            }

            $groups[$key]['semua_jam'][] = $jamKe;

            if (in_array($status, ['hadir', 'terlambat'], true)) {
                $groups[$key]['jam_pelajaran_hadir'][] = $jamKe;
            }

            if (in_array($status, ['alpha', 'izin', 'sakit'], true)) {
                $groups[$key]['jam_pelajaran_tidak_hadir'][] = $jamKe;
            }
        }

        return array_values(array_map(static function (array $row): array {
            $jamHadir = self::uniqueSortedJam($row['jam_pelajaran_hadir']);
            $jamTidakHadir = self::uniqueSortedJam($row['jam_pelajaran_tidak_hadir']);
            $semuaJam = self::uniqueSortedJam($row['semua_jam']);
            $totalJam = max(self::MIN_TOTAL_JAM, count($semuaJam));
            $jumlahHadir = count($jamHadir);
            $hasTidakHadir = !empty($jamTidakHadir);

            return [
                'tanggal' => $row['tanggal'],
                'nama_siswa' => $row['nama_siswa'],
                'nisn' => $row['nisn'],
                'rombel' => $row['rombel'],
                'kehadiran' => $jumlahHadir . '/' . $totalJam . ' Jam',
                'jam_pelajaran_tidak_hadir' => self::formatJamList($jamTidakHadir),
                'status' => $hasTidakHadir ? 'Tidak Lengkap' : 'Hadir',
            ];
        }, $groups));
    }

    private static function normalizeJam(mixed $value): string
    {
        $jam = trim((string) $value);
        return $jam === '' ? '-' : $jam;
    }

    private static function formatJamList(array $items): string
    {
        return empty($items) ? '-' : implode(', ', $items);
    }

    private static function uniqueSortedJam(array $items): array
    {
        $items = array_values(array_unique(array_filter($items, static fn (string $item): bool => $item !== '-')));
        usort($items, static fn (string $a, string $b): int => (int) $a <=> (int) $b);

        return $items;
    }
}
