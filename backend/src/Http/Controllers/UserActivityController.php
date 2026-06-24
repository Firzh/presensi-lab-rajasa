<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\UserActivityService;

final class UserActivityController
{
    public function __construct(
        private readonly Request $request,
        private readonly PermissionMiddleware $permission,
        private readonly UserActivityService $activityService
    ) {
    }

    public function index(): void
    {
        $this->permission->require('user_activities.read');

        Response::success('Daftar log users.', $this->activityService->list([
            'q' => $this->request->input('q', ''),
            'action' => $this->request->input('action', ''),
            'status' => $this->request->input('status', ''),
            'page' => $this->request->input('page', 1),
            'per_page' => $this->request->input('per_page', 10),
        ]));
    }
}
