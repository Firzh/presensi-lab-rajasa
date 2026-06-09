<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Feature;

use Illuminate\Database\Capsule\Manager as DB;
use Rajasa\PresensiSiswa\Tests\Support\TestCase;

final class JurusanManagementTest extends TestCase
{
    public function test_jurusan_list_requires_token(): void
    {
        $response = $this->runApp('GET', '/api/jurusan');

        $this->assertSame(401, $response['__status_code']);
        $this->assertFalse($response['success']);
    }

    public function test_jurusan_list_returns_database_items(): void
    {
        $token = $this->loginAndGetToken();

        $response = $this->runApp('GET', '/api/jurusan?page=1&per_page=4', [], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(200, $response['__status_code']);
        $this->assertTrue($response['success']);
        $this->assertSame('Daftar jurusan.', $response['message']);
        $this->assertIsArray($response['data']['items']);
        $this->assertIsArray($response['data']['pagination']);
        $this->assertIsArray($response['data']['options']);

        $first = $response['data']['items'][0];

        $this->assertArrayHasKey('jurusan_id', $first);
        $this->assertArrayHasKey('kode_jurusan', $first);
        $this->assertArrayHasKey('nama_jurusan', $first);
        $this->assertArrayHasKey('total_siswa', $first);
        $this->assertArrayHasKey('total_rombel', $first);
    }

    public function test_jurusan_can_be_created_updated_and_disabled(): void
    {
        $token = $this->loginAndGetToken();
        $kode = 'UT' . random_int(10000, 99999);

        DB::table('jurusan')->where('kode_jurusan', $kode)->delete();

        try {
            $create = $this->runApp('POST', '/api/jurusan', [
                'kode_jurusan' => $kode,
                'nama_jurusan' => 'Unit Test Jurusan',
                'ketua_jurusan' => 'Ketua Test',
                'deskripsi_jurusan' => 'Deskripsi test',
                'status' => 'aktif',
            ], [
                'Authorization' => 'Bearer ' . $token,
            ]);

            $this->assertSame(201, $create['__status_code']);
            $this->assertTrue($create['success']);
            $id = (int) $create['data']['jurusan']['jurusan_id'];

            $update = $this->runApp('PATCH', '/api/jurusan/' . $id, [
                'nama_jurusan' => 'Unit Test Jurusan Updated',
                'status' => 'aktif',
            ], [
                'Authorization' => 'Bearer ' . $token,
            ]);

            // if ($update['__status_code'] !== 200) {
            //     fwrite(STDERR, PHP_EOL . json_encode($update, JSON_PRETTY_PRINT) . PHP_EOL);
            // }

            $this->assertSame(200, $update['__status_code']);
            $this->assertSame('Unit Test Jurusan Updated', $update['data']['jurusan']['nama_jurusan']);

            $delete = $this->runApp('DELETE', '/api/jurusan/' . $id, [], [
                'Authorization' => 'Bearer ' . $token,
            ]);

            $this->assertSame(200, $delete['__status_code']);
            $this->assertSame('nonaktif', $delete['data']['jurusan']['status']);
        } finally {
            DB::table('jurusan')->where('kode_jurusan', $kode)->delete();
        }
    }
}