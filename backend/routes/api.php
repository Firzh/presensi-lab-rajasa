<?php

declare(strict_types=1);

use FastRoute\RouteCollector;
use Rajasa\PresensiSiswa\Http\Controllers\AuthLoginController;
use Rajasa\PresensiSiswa\Http\Controllers\AuthLogoutController;
use Rajasa\PresensiSiswa\Http\Controllers\HealthController;
use Rajasa\PresensiSiswa\Http\Controllers\MeController;
use Rajasa\PresensiSiswa\Http\Controllers\PresensiSesiActiveController;
use Rajasa\PresensiSiswa\Http\Controllers\PresensiSesiCreateController;
use Rajasa\PresensiSiswa\Http\Controllers\PresensiSesiFinishController;
use Rajasa\PresensiSiswa\Http\Controllers\PresensiSesiPauseController;
use Rajasa\PresensiSiswa\Http\Controllers\PresensiSesiResumeController;

return function (RouteCollector $route): void {
    $route->get('/api/health', HealthController::class);

    $route->post('/api/auth/login', AuthLoginController::class);
    $route->post('/api/auth/logout', AuthLogoutController::class);
    $route->get('/api/me', MeController::class);

    $route->post('/api/presensi/sesi', PresensiSesiCreateController::class);
    $route->get('/api/presensi/sesi/aktif', PresensiSesiActiveController::class);
    $route->post('/api/presensi/sesi/{id:\d+}/pause', PresensiSesiPauseController::class);
    $route->post('/api/presensi/sesi/{id:\d+}/resume', PresensiSesiResumeController::class);
    $route->post('/api/presensi/sesi/{id:\d+}/finish', PresensiSesiFinishController::class);
};