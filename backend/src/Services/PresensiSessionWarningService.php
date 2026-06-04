<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

use Illuminate\Database\Capsule\Manager as DB;

final class PresensiSessionWarningService
{
    public function check(array $body): array
    {
        $mode = strtolower(trim((string) ($body['mode_presensi'] ?? 'rombel')));
        $jamIds = array_values(array_filter(array_unique(array_map('intval', $body['jam_ids'] ?? []))));
        $tanggal = date('Y-m-d');

        if ($jamIds === []) {
            return [
                'has_warning' => false,
                'message' => 'Tidak ada warning.',
                'conflicts' => [],
            ];
        }

        if ($mode === 'piket') {
            return [
                'has_warning' => false,
                'message' => 'Mode piket tidak dikunci oleh sesi rombel.',
                'conflicts' => [],
            ];
        }

        $rombelId = (int) ($body['rombel_id'] ?? 0);

        if ($mode === 'rombel' && $rombelId <= 0) {
            return [
                'has_warning' => false,
                'message' => 'Rombel belum dipilih.',
                'conflicts' => [],
            ];
        }

        $conflicts = DB::table('presensi_sesi as s')
            ->join('presensi_sesi_jam as sj', 'sj.presensi_sesi_id', '=', 's.presensi_sesi_id')
            ->leftJoin('rombel as r', 'r.rombel_id', '=', 's.rombel_id')
            ->where('s.tanggal', $tanggal)
            ->where('s.mode_presensi', 'rombel')
            ->where('s.rombel_id', $rombelId)
            ->whereIn('sj.jam_id', $jamIds)
            ->orderByDesc('s.presensi_sesi_id')
            ->get([
                's.presensi_sesi_id',
                's.mode_presensi',
                's.rombel_id',
                'r.label_rombel',
                's.ruang_pilihan',
                's.ruang_label_snapshot',
                's.status',
                'sj.jam_id',
            ])
            ->map(fn (object $row): array => [
                'presensi_sesi_id' => (int) $row->presensi_sesi_id,
                'mode_presensi' => $row->mode_presensi,
                'rombel_id' => $row->rombel_id !== null ? (int) $row->rombel_id : null,
                'label_rombel' => $row->label_rombel,
                'ruang_pilihan' => $row->ruang_pilihan,
                'ruang_label_snapshot' => $row->ruang_label_snapshot,
                'status' => $row->status,
                'jam_id' => (int) $row->jam_id,
            ])
            ->values()
            ->all();

        return [
            'has_warning' => count($conflicts) > 0,
            'message' => count($conflicts) > 0
                ? 'Rombel sudah memiliki sesi pada jam yang dipilih.'
                : 'Tidak ada warning.',
            'conflicts' => $conflicts,
        ];
    }
}