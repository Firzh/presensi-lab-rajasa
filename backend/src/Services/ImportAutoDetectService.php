<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

final class ImportAutoDetectService
{
    public function __construct(private readonly ImportColumnMapper $mapper)
    {
    }

    public function detect(array $rows): array
    {
        foreach (array_slice($rows, 0, 10, true) as $index => $row) {
            if ($this->isEmptyRow($row)) {
                continue;
            }

            $fields = $this->mapper->mapHeader($row);

            if (isset($fields['nisn'], $fields['nama'], $fields['kelas'])) {
                return [
                    'type' => 'siswa',
                    'status' => 'enabled',
                    'header_row_index' => $index,
                    'fields' => $fields,
                ];
            }

            if (isset($fields['nip'], $fields['nama'])) {
                return [
                    'type' => 'guru',
                    'status' => 'disabled',
                    'header_row_index' => $index,
                    'fields' => $fields,
                ];
            }

            if (isset($fields['kelas'], $fields['wali_kelas'])) {
                return [
                    'type' => 'wali_kelas',
                    'status' => 'disabled',
                    'header_row_index' => $index,
                    'fields' => $fields,
                ];
            }
        }

        return [
            'type' => 'unknown',
            'status' => 'rejected',
            'header_row_index' => null,
            'fields' => [],
        ];
    }

    private function isEmptyRow(array $row): bool
    {
        foreach ($row as $value) {
            if (trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }
}