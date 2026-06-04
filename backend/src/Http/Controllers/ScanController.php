<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\HttpException;
use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\AuthMiddleware;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\PresensiScanService;
use Rajasa\PresensiSiswa\Services\ScanReadinessImportService;

final class ScanController
{
    public function __construct(
        private readonly Request $request,
        private readonly AuthMiddleware $auth,
        private readonly PermissionMiddleware $permission,
        private readonly PresensiScanService $scanService,
        private readonly ScanReadinessImportService $importService
    ) {
    }

    public function scan(): void
    {
        $this->permission->require('attendance.scan');

        $user = $this->auth->user();

        Response::success(
            'Scan QR diproses.',
            $this->scanService->scan($this->request->body(), (int) $user->user_id),
            201
        );
    }

    public function importReadiness(): void
    {
        $this->permission->require('import.submit');

        $user = $this->auth->user();

        $filePath = $this->resolveFilePath();

        Response::success(
            'Import scan readiness selesai.',
            $this->importService->importFromPath($filePath, (int) $user->user_id),
            201
        );
    }

    private function resolveFilePath(): string
    {
        $uploaded = $this->request->file('file');

        if ($uploaded && ($uploaded['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
            return (string) $uploaded['tmp_name'];
        }

        $filePath = (string) $this->request->input('file_path', '');

        if ($filePath !== '') {
            return $filePath;
        }

        throw new HttpException('File import wajib dikirim.', 422);
    }
}