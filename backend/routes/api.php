<?php

declare(strict_types=1);

use FastRoute\RouteCollector;
use Rajasa\PresensiLabBackend\Http\Controllers\HealthController;

return function (RouteCollector $route): void {
    $route->get('/api/health', HealthController::class);
};