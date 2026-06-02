<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

use Rajasa\PresensiSiswa\Core\HttpException;

final class ImportSubmitService
{
    public function __construct(
        private readonly ImportFileReaderService $reader,
        private readonly ImportAutoDetectService $detector,
        private readonly ImportColumnMapper $mapper,
        private readonly ScanReadinessImportService $siswaImporter
    ) {
    }

    public function submit(?array $uploadedFile, string $filePathInput, int $userId): array
    {
        $file = $this->resolveFileInput($uploadedFile, $filePathInput);
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
            $result = $this->siswaImporter->importFromPath($csvPath, $userId);
        } finally {
            if (is_file($csvPath)) {
                unlink($csvPath);
            }
        }

        return [
            'detected_type' => 'siswa',
            ...$result,
        ];
    }

    private function resolveFileInput(?array $uploadedFile, string $filePathInput): array
    {
        if ($uploadedFile && ($uploadedFile['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
            return [
                'path' => (string) $uploadedFile['tmp_name'],
                'name' => (string) ($uploadedFile['name'] ?? ''),
            ];
        }

        $filePath = trim($filePathInput);

        if ($filePath !== '') {
            return [
                'path' => $filePath,
                'name' => basename($filePath),
            ];
        }

        throw new HttpException('File import wajib dikirim.', 422);
    }
}