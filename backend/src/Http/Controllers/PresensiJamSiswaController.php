<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\PresensiJamSiswaService;

final class PresensiJamSiswaController
{
    public function __construct(
        private readonly Request $request,
        private readonly PermissionMiddleware $permission,
        private readonly PresensiJamSiswaService $presensiJamSiswaService
    ) {
    }

    public function __invoke(): void
    {
        $this->permission->require('attendance.manual.read');

        Response::success(
            'Daftar presensi siswa.',
            $this->presensiJamSiswaService->list([
                'tanggal' => $this->request->input('tanggal', date('Y-m-d')),
                'rombel_id' => $this->request->input('rombel_id', ''),
                'jam_id' => $this->request->input('jam_id', ''),
                'status' => $this->request->input('status', ''),
                'q' => $this->request->input('q', ''),
            ])
        );
    }
}