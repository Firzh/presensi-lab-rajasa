<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Rajasa\PresensiSiswa\Services\ImportAutoDetectService;
use Rajasa\PresensiSiswa\Services\ImportColumnMapper;

final class ImportAutoDetectServiceTest extends TestCase
{
    public function test_detects_siswa_import(): void
    {
        $service = new ImportAutoDetectService(new ImportColumnMapper());

        $result = $service->detect([
            ['NISN', 'NAMA', 'KELAS'],
            ['0088556888', 'MUHAMMAD SOBRI', '12 TKRO 1'],
        ]);

        $this->assertSame('siswa', $result['type']);
        $this->assertSame('enabled', $result['status']);
    }

    public function test_detects_guru_as_disabled(): void
    {
        $service = new ImportAutoDetectService(new ImportColumnMapper());

        $result = $service->detect([
            ['NIP', 'NAMA GURU', 'MAPEL'],
        ]);

        $this->assertSame('guru', $result['type']);
        $this->assertSame('disabled', $result['status']);
    }

    public function test_detects_wali_kelas_as_disabled(): void
    {
        $service = new ImportAutoDetectService(new ImportColumnMapper());

        $result = $service->detect([
            ['KELAS', 'WALI KELAS'],
        ]);

        $this->assertSame('wali_kelas', $result['type']);
        $this->assertSame('disabled', $result['status']);
    }

    public function test_rejects_unknown_import(): void
    {
        $service = new ImportAutoDetectService(new ImportColumnMapper());

        $result = $service->detect([
            ['ABC', 'DEF'],
        ]);

        $this->assertSame('unknown', $result['type']);
        $this->assertSame('rejected', $result['status']);
    }
}