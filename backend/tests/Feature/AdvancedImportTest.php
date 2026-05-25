<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Feature;

use Rajasa\PresensiSiswa\Tests\Support\TestCase;

final class AdvancedImportTest extends TestCase
{
    public function test_one_gate_import_requires_token(): void
    {
        $response = $this->runApp('POST', '/api/import', [
            'file_path' => $this->fixtureCsv(),
        ]);

        $this->assertSame(401, $response['__status_code']);
    }

    public function test_one_gate_import_csv_siswa_success(): void
    {
        $token = $this->loginAndGetToken();

        $response = $this->runApp('POST', '/api/import', [
            'file_path' => $this->fixtureCsv(),
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(201, $response['__status_code'], json_encode($response));
        $this->assertTrue($response['success']);
        $this->assertSame('siswa', $response['data']['detected_type']);
    }

    public function test_one_gate_import_guru_disabled(): void
    {
        $token = $this->loginAndGetToken();

        $response = $this->runApp('POST', '/api/import', [
            'file_path' => $this->writeFixture("NIP,NAMA GURU,MAPEL\n1988,GURU TEST,INFORMATIKA\n", 'guru.csv'),
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(422, $response['__status_code']);
        $this->assertSame('guru', $response['errors']['detected_type']);
        $this->assertSame('disabled', $response['errors']['status']);
    }

    public function test_one_gate_import_wali_kelas_disabled(): void
    {
        $token = $this->loginAndGetToken();

        $response = $this->runApp('POST', '/api/import', [
            'file_path' => $this->writeFixture("KELAS,WALI KELAS\n12 TKRO 1,GURU TEST\n", 'wali.csv'),
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(422, $response['__status_code']);
        $this->assertSame('wali_kelas', $response['errors']['detected_type']);
        $this->assertSame('disabled', $response['errors']['status']);
    }

    private function fixtureCsv(): string
    {
        return $this->writeFixture("NISN,NAMA,KELAS\n7788001122,SISWA ADVANCED IMPORT,12 TEST 1\n", 'siswa.csv');
    }

    private function writeFixture(string $content, string $filename): string
    {
        $path = sys_get_temp_dir() . '/' . uniqid('rajasa-', true) . '-' . $filename;
        file_put_contents($path, $content);
        return $path;
    }
}