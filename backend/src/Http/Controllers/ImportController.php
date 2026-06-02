<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\HttpException;
use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\AuthMiddleware;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\ImportAutoDetectService;
use Rajasa\PresensiSiswa\Services\ImportColumnMapper;
use Rajasa\PresensiSiswa\Services\ImportFileReaderService;
use Rajasa\PresensiSiswa\Services\ScanReadinessImportService;

final class ImportController
{
    public function __construct(
        private readonly Request $request,
        private readonly AuthMiddleware $auth,
        private readonly PermissionMiddleware $permission,
        private readonly ImportFileReaderService $reader,
        private readonly ImportAutoDetectService $detector,
        private readonly ImportColumnMapper $mapper,
        private readonly ScanReadinessImportService $siswaImporter
    ) {
    }

    public function submit(): void
    {
        $this->permission->require('import.submit');

        $user = $this->auth->user();
        $file = $this->resolveFileInput();
        $rows = $this->reader->rows($file['path'], $file['name']);
        $detected = $this->detector->detect($rows);

        if ($detected['type'] === 'unknown') {
            throw new HttpException('Kategori import tidak dapat ditentukan.', 422, $detected);
        }

        if ($detected['status'] === 'disabled') {
            throw new HttpException(
                'Import ' . $detected['type'] . ' belum diaktifkan pada Tahap 10.1.',
                422,
                [
                    'detected_type' => $detected['type'],
                    'status' => 'disabled',
                ]
            );
        }

        $canonicalRows = $this->mapper->canonicalSiswaRows(
            $rows,
            (int) $detected['header_row_index'],
            $detected['fields']
        );

        $csvPath = $this->reader->writeCsv($canonicalRows);

        try {
            $result = $this->siswaImporter->importFromPath($csvPath, (int) $user->user_id);
        } finally {
            if (is_file($csvPath)) {
                unlink($csvPath);
            }
        }

        Response::success('Import siswa selesai.', [
            'detected_type' => 'siswa',
            ...$result,
        ], 201);
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

    private function resolveFileInput(): array
    {
        $uploaded = $this->request->file('file');

        if ($uploaded && ($uploaded['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
            return [
                'path' => (string) $uploaded['tmp_name'],
                'name' => (string) ($uploaded['name'] ?? ''),
            ];
        }

        $filePath = trim((string) $this->request->input('file_path', ''));

        if ($filePath !== '') {
            return [
                'path' => $filePath,
                'name' => basename($filePath),
            ];
        }

        throw new HttpException('File import wajib dikirim.', 422);
    }
}