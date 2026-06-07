<?php

declare(strict_types=1);

use FastRoute\RouteCollector;
use Rajasa\PresensiSiswa\Http\Controllers\AuthController;
use Rajasa\PresensiSiswa\Http\Controllers\HealthController;
use Rajasa\PresensiSiswa\Http\Controllers\ImportController;
use Rajasa\PresensiSiswa\Http\Controllers\MeController;
use Rajasa\PresensiSiswa\Http\Controllers\ScanController;
use Rajasa\PresensiSiswa\Http\Controllers\PresensiAuditController;
use Rajasa\PresensiSiswa\Http\Controllers\PresensiEditReasonController;
use Rajasa\PresensiSiswa\Http\Controllers\PresensiJamSiswaController;
use Rajasa\PresensiSiswa\Http\Controllers\PresensiManualEditController;
use Rajasa\PresensiSiswa\Http\Controllers\PresensiSesiController;
use Rajasa\PresensiSiswa\Http\Controllers\RombelController;

use Rajasa\PresensiSiswa\Http\Controllers\SiswaController;

return function (RouteCollector $route): void {
    $route->get('/api/health', HealthController::class);

    $route->post('/api/auth/login', [AuthController::class, 'login']);
    $route->post('/api/auth/logout', [AuthController::class, 'logout']);
    $route->get('/api/me', MeController::class);

    $route->get('/api/rombel/options', RombelController::class);
    $route->get('/api/siswa', [SiswaController::class, 'index']);

    $route->post('/api/presensi/sesi', [PresensiSesiController::class, 'create']);
    $route->get('/api/presensi/sesi/aktif', [PresensiSesiController::class, 'active']);
    $route->post('/api/presensi/sesi/check-warning', [PresensiSesiController::class, 'checkWarning']);
    $route->post('/api/presensi/sesi/{id:\d+}/pause', [PresensiSesiController::class, 'pause']);
    $route->post('/api/presensi/sesi/{id:\d+}/resume', [PresensiSesiController::class, 'resume']);
    $route->post('/api/presensi/sesi/{id:\d+}/finish', [PresensiSesiController::class, 'finish']);
    $route->post('/api/presensi/sesi/{id:\d+}/heartbeat', [PresensiSesiController::class, 'heartbeat']);

    $route->post('/api/import', [ImportController::class, 'submit']);
    $route->get('/api/import/jobs', [ImportController::class, 'jobs']);
    $route->get('/api/import/jobs/{id:\d+}/rows', [ImportController::class, 'rows']);

    $route->post('/api/import/scan-readiness', [ScanController::class, 'importReadiness']);
    $route->post('/api/presensi/scan', [ScanController::class, 'scan']);
    $route->get('/api/presensi/audit/latest', PresensiAuditController::class);
    $route->get('/api/presensi/jam-siswa', PresensiJamSiswaController::class);
    $route->patch('/api/presensi/jam-siswa/{id:\d+}', PresensiManualEditController::class);
    $route->get('/api/presensi/edit-reasons', PresensiEditReasonController::class);
};