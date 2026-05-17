<?php

declare(strict_types=1);

namespace Rajasa\PresensiLabBackend\Http\Controllers;

use Rajasa\PresensiLabBackend\Core\Response;

final class HealthController
{
    public function __invoke(): void
    {
        Response::success('Backend API is running', [
            'service' => 'presensi-siswa-api',
            'status' => 'ok',
        ]);
    }
}