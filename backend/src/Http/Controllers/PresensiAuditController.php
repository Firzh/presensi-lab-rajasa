<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\PresensiAuditService;

final class PresensiAuditController
{
    public function __construct(
        private readonly PermissionMiddleware $permission,
        private readonly PresensiAuditService $auditService
    ) {
    }

    public function __invoke(): void
    {
        $this->permission->require('attendance.log.read');

        Response::success('Audit presensi terkini.', $this->auditService->latest());
    }
}