<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

use PhpOffice\PhpSpreadsheet\IOFactory;
use Rajasa\PresensiSiswa\Core\HttpException;

final class ImportFileReaderService
{
    public function rows(string $filePath, ?string $originalName = null): array
    {
        if (!is_file($filePath)) {
            throw new HttpException('File import tidak ditemukan.', 422);
        }

        $extension = strtolower(pathinfo($originalName ?: $filePath, PATHINFO_EXTENSION));

        return match ($extension) {
            'csv', 'txt', '' => $this->readCsv($filePath),
            'xlsx' => $this->readXlsx($filePath),
            default => throw new HttpException('Format file import belum didukung.', 422, [
                'extension' => $extension,
            ]),
        };
    }

    public function writeCsv(array $rows): string
    {
        $path = tempnam(sys_get_temp_dir(), 'rajasa-import-') . '.csv';
        $handle = fopen($path, 'wb');

        foreach ($rows as $row) {
            fputcsv($handle, array_map(fn ($value) => (string) $value, $row));
        }

        fclose($handle);

        return $path;
    }

    private function readCsv(string $filePath): array
    {
        $rows = [];
        $handle = fopen($filePath, 'rb');

        if (!$handle) {
            throw new HttpException('File CSV gagal dibuka.', 422);
        }

        while (($row = fgetcsv($handle, 0, ',')) !== false) {
            if (count($row) === 1 && str_contains((string) $row[0], ';')) {
                $row = str_getcsv((string) $row[0], ';');
            }

            $rows[] = array_map(fn ($value) => trim((string) $value), $row);
        }

        fclose($handle);

        return $rows;
    }

    private function readXlsx(string $filePath): array
    {
        $sheet = IOFactory::load($filePath)->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, false);

        return array_map(
            fn (array $row): array => array_map(fn ($value) => trim((string) $value), $row),
            $rows
        );
    }
}