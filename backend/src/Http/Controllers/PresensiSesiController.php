<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Illuminate\Database\Capsule\Manager as DB;
use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\AuthMiddleware;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\PresensiSessionService;
use Rajasa\PresensiSiswa\Services\PresensiSessionTimeoutService;

final class PresensiSesiController
{
    public function __construct(
        private readonly Request $request,
        private readonly AuthMiddleware $auth,
        private readonly PermissionMiddleware $permission,
        private readonly PresensiSessionService $service,
        private readonly PresensiSessionTimeoutService $timeout
    ) {
    }

    public function create(): void
    {
        $this->timeout->expireInactiveSessions();
        $this->permission->require('attendance.session.create');

        $user = $this->auth->user();

        Response::success(
            'Sesi presensi berhasil dibuat.',
            $this->service->create($this->request->body(), (int) $user->user_id),
            201
        );
    }

    public function active(): void
    {
        $this->timeout->expireInactiveSessions();
        $this->permission->require('attendance.session.read');

        $user = $this->auth->user();

        Response::success('Sesi aktif.', [
            'sessions' => $this->service->activeForUser((int) $user->user_id),
        ]);
    }

    public function pause(string $id): void
    {
        $this->permission->require('attendance.session.update');

        $user = $this->auth->user();

        Response::success(
            'Sesi presensi dijeda.',
            $this->service->pause((int) $id, (int) $user->user_id)
        );
    }

    public function resume(string $id): void
    {
        $this->permission->require('attendance.session.update');

        $user = $this->auth->user();

        Response::success(
            'Sesi presensi dilanjutkan.',
            $this->service->resume((int) $id, (int) $user->user_id)
        );
    }

    public function finish(string $id): void
    {
        $this->permission->require('attendance.session.update');

        $user = $this->auth->user();

        Response::success(
            'Sesi presensi selesai.',
            $this->service->finish((int) $id, (int) $user->user_id)
        );
    }

    public function heartbeat(string $id): void
    {
        $this->permission->require('attendance.session.update');

        Response::success('Heartbeat sesi presensi diterima.', [
            'session' => $this->timeout->heartbeat((int) $id),
        ]);
    }

    public function checkWarning(): void
    {
        $this->permission->require('attendance.session.create');

        $body = $this->request->body();

        $mode = strtolower(trim((string) ($body['mode_presensi'] ?? 'rombel')));
        $jamIds = array_values(array_filter(array_unique(array_map('intval', $body['jam_ids'] ?? []))));
        $tanggal = date('Y-m-d');

        if ($jamIds === []) {
            Response::success('Cek warning sesi selesai.', [
                'has_warning' => false,
                'message' => 'Tidak ada warning.',
                'conflicts' => [],
            ]);
            return;
        }

        if ($mode === 'piket') {
            Response::success('Cek warning sesi selesai.', [
                'has_warning' => false,
                'message' => 'Mode piket tidak dikunci oleh sesi rombel.',
                'conflicts' => [],
            ]);
            return;
        }

        $rombelId = (int) ($body['rombel_id'] ?? 0);

        if ($mode === 'rombel' && $rombelId <= 0) {
            Response::success('Cek warning sesi selesai.', [
                'has_warning' => false,
                'message' => 'Rombel belum dipilih.',
                'conflicts' => [],
            ]);
            return;
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

        Response::success('Cek warning sesi selesai.', [
            'has_warning' => count($conflicts) > 0,
            'message' => count($conflicts) > 0
                ? 'Rombel sudah memiliki sesi pada jam yang dipilih.'
                : 'Tidak ada warning.',
            'conflicts' => $conflicts,
        ]);
    }
}