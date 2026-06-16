<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

use Rajasa\PresensiSiswa\Core\HttpException;
use Illuminate\Database\Capsule\Manager as DB;

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

        public function preview(?array $uploadedFile, string $filePathInput): array
    {
        $file = $this->resolveFileInput($uploadedFile, $filePathInput);
        $rows = $this->reader->rows($file['path'], $file['name']);
        $detected = $this->detector->detect($rows);

        if ($detected['type'] === 'unknown') {
            throw new HttpException('Kategori import tidak dapat ditentukan.', 422, $detected);
        }

        if ($detected['status'] === 'disabled') {
            throw new HttpException('Import ' . $detected['type'] . ' belum diaktifkan.', 422, $detected);
        }

        $canonicalRows = $this->mapper->canonicalSiswaRows(
            $rows,
            (int) $detected['header_row_index'],
            $detected['fields']
        );

        $incomingRows = [];
        $nisns = [];
        $invalidRows = 0;

        for ($i = 1; $i < count($canonicalRows); $i++) {
            $row = $canonicalRows[$i];
            $nisn = $this->normalizePreviewNisn($row[0] ?? '');
            $nama = $this->normalizePreviewText($row[1] ?? '');
            $kelas = $this->normalizePreviewText($row[2] ?? '');

            if ($nisn === '' || $nama === '' || $kelas === '') {
                $invalidRows++;
                continue;
            }

            $incomingRows[] = [
                'row_number' => $i + 1,
                'nisn' => $nisn,
                'nama' => strtoupper($nama),
                'kelas' => $kelas,
            ];
            $nisns[] = $nisn;
        }

        $existingRows = [];
        if ($nisns !== []) {
            DB::table('siswa as s')
                ->leftJoin('rombel as r', 'r.rombel_id', '=', 's.rombel_id_aktif')
                ->whereIn('s.nisn', array_values(array_unique($nisns)))
                ->get([
                    's.siswa_id',
                    's.nisn',
                    's.nama_lengkap',
                    's.kelas_aktif',
                    'r.label_rombel',
                ])
                ->each(function (object $row) use (&$existingRows): void {
                    $existingRows[(string) $row->nisn] = (array) $row;
                });
        }

        $overwriteDetails = [];
        $createRows = 0;
        $overwriteRows = 0;

        foreach ($incomingRows as $row) {
            $existing = $existingRows[$row['nisn']] ?? null;

            if (!$existing) {
                $createRows++;
                continue;
            }

            $overwriteRows++;
            $oldName = (string) ($existing['nama_lengkap'] ?? '');
            $oldClass = (string) (($existing['label_rombel'] ?? '') ?: ($existing['kelas_aktif'] ?? ''));
            $changes = [];

            if (strtoupper($oldName) !== strtoupper($row['nama'])) {
                $changes[] = ['field' => 'nama', 'old' => $oldName, 'new' => $row['nama']];
            }

            if (strtoupper($oldClass) !== strtoupper($row['kelas'])) {
                $changes[] = ['field' => 'kelas', 'old' => $oldClass, 'new' => $row['kelas']];
            }

            if ($changes === []) {
                $changes[] = ['field' => 'status', 'old' => 'Ada di database', 'new' => 'Akan ditulis ulang'];
            }

            $overwriteDetails[] = [
                'target' => 'NISN ' . $row['nisn'],
                'nisn' => $row['nisn'],
                'old_label' => trim($oldName . ' · ' . $oldClass, ' ·'),
                'new_label' => $row['nama'] . ' · ' . $row['kelas'],
                'changes' => $changes,
            ];
        }

        return [
            'detected_type' => 'siswa',
            'summary' => [
                'total_rows' => count($incomingRows),
                'create_rows' => $createRows,
                'overwrite_rows' => $overwriteRows,
                'invalid_rows' => $invalidRows,
            ],
            'overwrite_details' => $overwriteDetails,
        ];
    }

    private function normalizePreviewNisn(string $value): string
    {
        return preg_replace('/\D+/', '', trim($value)) ?? '';
    }

    private function normalizePreviewText(string $value): string
    {
        return trim(preg_replace('/\s+/', ' ', $value) ?? '');
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