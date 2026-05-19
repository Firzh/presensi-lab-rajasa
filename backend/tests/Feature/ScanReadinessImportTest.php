<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Feature;

use Illuminate\Database\Capsule\Manager as DB;
use Rajasa\PresensiSiswa\Tests\Support\TestCase;

final class ScanReadinessImportTest extends TestCase
{
    public function test_scan_readiness_import_creates_students_and_qr_reference(): void
    {
        $token = $this->loginAndGetToken();

        $file = $this->makeCsv([
            ['N', 'NISN', 'NAMA', 'KELAS'],
            ['1', '0096672112', 'AISYAH LISTYA NARISTA', '10 AKL'],
            ['2', '0106325606', 'AISYAH NUR AMALINA', '10 AKL'],
        ]);

        $response = $this->runApp('POST', '/api/import/scan-readiness', [
            'file_path' => $file,
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(
            201,
            $response['__status_code'],
            json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
        $this->assertTrue($response['success']);
        $this->assertSame(2, $response['data']['summary']['success_rows']);

        $this->assertTrue(DB::table('siswa')->where('nisn', '0096672112')->exists());

        if (DB::connection()->getSchemaBuilder()->hasTable('siswa_qr')) {
            $this->assertTrue(DB::table('siswa_qr')->where('payload_nisn', '0096672112')->exists());
        }
    }

    public function test_scan_readiness_import_logs_invalid_rows(): void
    {
        $token = $this->loginAndGetToken();

        $file = $this->makeCsv([
            ['N', 'NISN', 'NAMA', 'KELAS'],
            ['1', '', 'TANPA NISN', '10 AKL'],
            ['2', '0123456789', 'VALID SISWA', '10 AKL'],
        ]);

        $response = $this->runApp('POST', '/api/import/scan-readiness', [
            'file_path' => $file,
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(
            201,
            $response['__status_code'],
            json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
        $this->assertSame(1, $response['data']['summary']['success_rows']);
        $this->assertSame(1, $response['data']['summary']['failed_rows']);
    }

    public function test_scan_readiness_import_requires_token(): void
    {
        $file = $this->makeCsv([
            ['NISN', 'NAMA', 'KELAS'],
            ['0096672112', 'AISYAH LISTYA NARISTA', '10 AKL'],
        ]);

        $response = $this->runApp('POST', '/api/import/scan-readiness', [
            'file_path' => $file,
        ]);

        $this->assertSame(401, $response['__status_code']);
        $this->assertFalse($response['success']);
    }

    private function importCsvPath(): string
    {
        $files = glob(__DIR__ . '/../../database/data/*.csv');

        if (!$files || count($files) === 0) {
            $this->markTestSkipped('File CSV import belum tersedia di backend/database/data/.');
        }

        return $files[0];
    }

    private function makeCsv(array $rows): string
    {
        $file = tempnam(sys_get_temp_dir(), 'scan-readiness-') . '.csv';

        $handle = fopen($file, 'wb');

        if ($handle === false) {
            $this->fail('Gagal membuat file CSV test.');
        }

        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }

        fclose($handle);

        return $file;
    }
}