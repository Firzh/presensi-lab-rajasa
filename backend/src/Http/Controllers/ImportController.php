<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\AuthMiddleware;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\ImportSubmitService;
use Rajasa\PresensiSiswa\Services\ScanReadinessImportService;

final class ImportController
{
    public function __construct(
        private readonly Request $request,
        private readonly AuthMiddleware $auth,
        private readonly PermissionMiddleware $permission,
        private readonly ImportSubmitService $importSubmitService,
        private readonly ScanReadinessImportService $siswaImporter
    ) {
    }

    public function submit(): void
    {
        $this->permission->require('import.submit');

        $user = $this->auth->user();

        Response::success(
            'Import siswa selesai.',
            $this->importSubmitService->submit(
                $this->request->file('file'),
                (string) $this->request->input('file_path', ''),
                (int) $user->user_id
            ),
            201
        );
    }

    public function jobs(): void
    {
        $this->permission->require('import.read');

        Response::success('Riwayat import.', [
            'jobs' => $this->siswaImporter->jobs(),
        ]);
    }

    public function rows(string $id): void
    {
        $this->permission->require('import.read');

        Response::success('Log baris import.', [
            'rows' => $this->siswaImporter->rowLogs((int) $id),
        ]);
    }
}