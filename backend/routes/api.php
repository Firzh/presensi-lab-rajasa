<?php

declare(strict_types=1);

use FastRoute\RouteCollector;
use Rajasa\PresensiSiswa\Http\Controllers\AuthLoginController;
use Rajasa\PresensiSiswa\Http\Controllers\AuthLogoutController;
use Rajasa\PresensiSiswa\Http\Controllers\HealthController;
use Rajasa\PresensiSiswa\Http\Controllers\MeController;

return function (RouteCollector $route): void {
    $route->get('/api/health', HealthController::class);

    $route->post('/api/auth/login', AuthLoginController::class);
    $route->post('/api/auth/logout', AuthLogoutController::class);

    $route->get('/api/me', MeController::class);
};