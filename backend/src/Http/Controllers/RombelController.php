<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\RombelService;

final class RombelController
{
    public function __construct(
        private readonly PermissionMiddleware $permission,
        private readonly RombelService $rombelService
    ) {
    }

    public function __invoke(): void
    {
        $this->permission->require('attendance.session.read');

        Response::success('Daftar rombel aktif.', [
            'rombel' => $this->rombelService->activeOptions(),
        ]);
    }
}