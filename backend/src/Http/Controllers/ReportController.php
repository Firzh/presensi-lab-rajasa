<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\ReportService;

final class ReportController
{
    public function __construct(
        private readonly Request $request,
        private readonly PermissionMiddleware $permission,
        private readonly ReportService $reportService
    ) {
    }

    public function __invoke(): void
    {
        $this->permission->require('reports.attendance.read');

        Response::success(
            'Laporan presensi berhasil diambil.',
            $this->reportService->attendance([
                'date_from' => $this->request->input('date_from', date('Y-m-d')),
                'date_to' => $this->request->input('date_to', ''),
                'rombel_id' => $this->request->input('rombel_id', ''),
                'siswa_id' => $this->request->input('siswa_id', ''),
                'jam_ke' => $this->request->input('jam_ke', ''),
                'status' => $this->request->input('status', ''),
                'mode' => $this->request->input('mode', ''),
                'page' => $this->request->input('page', 1),
                'per_page' => $this->request->input('per_page', 25),
            ])
        );
    }
}