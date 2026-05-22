<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Rajasa\PresensiSiswa\Services\ImportColumnMapper;

final class ImportColumnMapperTest extends TestCase
{
    public function test_maps_flexible_siswa_headers(): void
    {
        $mapper = new ImportColumnMapper();

        $fields = $mapper->mapHeader(['No', 'NISN Siswa', 'Nama Lengkap', 'Kelas Aktif']);

        $this->assertSame(1, $fields['nisn']);
        $this->assertSame(2, $fields['nama']);
        $this->assertSame(3, $fields['kelas']);
    }

    public function test_canonical_siswa_rows(): void
    {
        $mapper = new ImportColumnMapper();

        $rows = [
            ['NISN Siswa', 'Nama Lengkap', 'Rombel'],
            ['0088556888', 'MUHAMMAD SOBRI', '12 TKRO 1'],
        ];

        $result = $mapper->canonicalSiswaRows($rows, 0, [
            'nisn' => 0,
            'nama' => 1,
            'kelas' => 2,
        ]);

        $this->assertSame([['NISN', 'NAMA', 'KELAS'], ['0088556888', 'MUHAMMAD SOBRI', '12 TKRO 1']], $result);
    }
}