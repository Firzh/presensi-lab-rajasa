<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\AuthMiddleware;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\PresensiSessionService;
use Rajasa\PresensiSiswa\Services\PresensiSessionTimeoutService;
use Rajasa\PresensiSiswa\Services\PresensiSessionWarningService;

final class PresensiSesiController
{
    public function __construct(
        private readonly Request $request,
        private readonly AuthMiddleware $auth,
        private readonly PermissionMiddleware $permission,
        private readonly PresensiSessionService $service,
        private readonly PresensiSessionTimeoutService $timeout,
        private readonly PresensiSessionWarningService $warningService
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

        Response::success(
            'Cek warning sesi selesai.',
            $this->warningService->check($this->request->body())
        );
    }
}