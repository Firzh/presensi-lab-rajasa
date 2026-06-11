<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Middleware;

use Rajasa\PresensiSiswa\Core\HttpException;
use Rajasa\PresensiSiswa\Services\PermissionService;
use Rajasa\PresensiSiswa\Services\UserActivityService;

final class PermissionMiddleware
{
    public function __construct(
        private readonly AuthMiddleware $auth,
        private readonly PermissionService $permissionService,
        // Extra fix: inject activity service untuk log akses ditolak
        private readonly UserActivityService $activityService
    ) {
    }

    /**
     * Extra fix: Catat log access_denied sebelum throw 403.
     * Ini memastikan setiap percobaan akses tanpa izin tercatat di log users.
     */
    public function require(string $permission): void
    {
        $user = $this->auth->user();
        $userId = (int) $user->user_id;

        if (!$this->permissionService->has($userId, $permission)) {
            $this->activityService->record(
                $userId,
                'access_denied',
                'auth',
                "Akses ditolak: tidak memiliki permission '{$permission}'.",
                [
                    'username'   => $user->username,
                    'permission' => $permission,
                ]
            );

            throw new HttpException('Tidak punya akses.', 403);
        }
    }
}