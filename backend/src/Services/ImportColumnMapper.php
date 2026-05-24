<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

final class ImportColumnMapper
{
    private const ALIASES = [
        'nisn' => ['nisn', 'nisnsiswa', 'nomornisn'],
        'nama' => ['nama', 'namasiswa', 'namalengkap', 'namapesertadidik', 'namaguru'],
        'kelas' => ['kelas', 'kelasaktif', 'rombel', 'namarombel'],
        'nip' => ['nip', 'nuptk', 'nipy'],
        'mapel' => ['mapel', 'matapelajaran', 'mapeldiampu'],
        'wali_kelas' => ['walikelas', 'namawalikelas', 'guruwali'],
    ];

    public function mapHeader(array $header): array
    {
        $fields = [];

        foreach ($header as $index => $value) {
            $normalized = $this->normalize((string) $value);

            foreach (self::ALIASES as $canonical => $aliases) {
                if (in_array($normalized, $aliases, true)) {
                    $fields[$canonical] = $index;
                }
            }
        }

        return $fields;
    }

    public function canonicalSiswaRows(array $rows, int $headerIndex, array $fields): array
    {
        $result = [['NISN', 'NAMA', 'KELAS']];

        for ($i = $headerIndex + 1; $i < count($rows); $i++) {
            $row = $rows[$i];

            if ($this->isEmptyRow($row)) {
                continue;
            }

            $result[] = [
                $row[$fields['nisn']] ?? '',
                $row[$fields['nama']] ?? '',
                $row[$fields['kelas']] ?? '',
            ];
        }

        return $result;
    }

    private function normalize(string $value): string
    {
        return strtolower(preg_replace('/[^a-z0-9]+/i', '', trim($value)) ?? '');
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