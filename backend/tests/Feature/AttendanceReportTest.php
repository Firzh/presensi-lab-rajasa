<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Feature;

use Illuminate\Database\Capsule\Manager as DB;
use Rajasa\PresensiSiswa\Tests\Support\TestCase;

final class AttendanceReportTest extends TestCase
{
    public function test_attendance_report_requires_token(): void
    {
        $response = $this->runApp('GET', '/api/reports/presensi');

        $this->assertSame(401, $response['__status_code']);
        $this->assertFalse($response['success']);
    }

    public function test_attendance_report_returns_summary_items_and_pagination(): void
    {
        $token = $this->loginAndGetToken();
        $fixture = $this->createFixture();

        try {
            $response = $this->runApp(
                'GET',
                '/api/reports/presensi?date_from=' . $fixture['tanggal'] . '&date_to=' . $fixture['tanggal'] . '&rombel_id=' . $fixture['rombel_id'] . '&per_page=10',
                [],
                ['Authorization' => 'Bearer ' . $token]
            );

            $this->assertSame(
                200,
                $response['__status_code'],
                json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            );
            $this->assertTrue($response['success']);
            $this->assertSame('Laporan presensi berhasil diambil.', $response['message']);

            $this->assertArrayHasKey('filters', $response['data']);
            $this->assertArrayHasKey('summary', $response['data']);
            $this->assertArrayHasKey('items', $response['data']);
            $this->assertArrayHasKey('pagination', $response['data']);

            $this->assertSame(2, $response['data']['summary']['total']);
            $this->assertSame(1, $response['data']['summary']['hadir']);
            $this->assertSame(1, $response['data']['summary']['alpha']);
            $this->assertCount(2, $response['data']['items']);

            $first = $response['data']['items'][0];

            $this->assertArrayHasKey('presensi_id', $first);
            $this->assertArrayHasKey('tanggal', $first);
            $this->assertArrayHasKey('mode', $first);
            $this->assertArrayHasKey('jam_ke', $first);
            $this->assertArrayHasKey('siswa', $first);
            $this->assertArrayHasKey('rombel', $first);
            $this->assertArrayHasKey('status', $first);
            $this->assertArrayHasKey('scanned_at', $first);
            $this->assertArrayHasKey('edited_at', $first);

            $this->assertSame(1, $response['data']['pagination']['page']);
            $this->assertSame(10, $response['data']['pagination']['per_page']);
            $this->assertSame(2, $response['data']['pagination']['total']);
        } finally {
            $this->cleanupFixture($fixture);
        }
    }

    public function test_attendance_report_can_filter_status(): void
    {
        $token = $this->loginAndGetToken();
        $fixture = $this->createFixture();

        try {
            $response = $this->runApp(
                'GET',
                '/api/reports/presensi?date_from=' . $fixture['tanggal'] . '&date_to=' . $fixture['tanggal'] . '&rombel_id=' . $fixture['rombel_id'] . '&status=hadir',
                [],
                ['Authorization' => 'Bearer ' . $token]
            );

            $this->assertSame(200, $response['__status_code']);
            $this->assertSame(1, $response['data']['summary']['total']);
            $this->assertSame(1, $response['data']['summary']['hadir']);
            $this->assertCount(1, $response['data']['items']);
            $this->assertSame('hadir', $response['data']['items'][0]['status']);
        } finally {
            $this->cleanupFixture($fixture);
        }
    }

    public function test_attendance_report_can_filter_siswa_jam_and_mode(): void
    {
        $token = $this->loginAndGetToken();
        $fixture = $this->createFixture();

        try {
            $response = $this->runApp(
                'GET',
                '/api/reports/presensi?date_from=' . $fixture['tanggal']
                    . '&date_to=' . $fixture['tanggal']
                    . '&siswa_id=' . $fixture['siswa_ids'][0]
                    . '&jam_ke=' . $fixture['jam_ke']
                    . '&mode=manual',
                [],
                ['Authorization' => 'Bearer ' . $token]
            );

            $this->assertSame(200, $response['__status_code']);
            $this->assertSame(1, $response['data']['summary']['total']);
            $this->assertCount(1, $response['data']['items']);
            $this->assertSame($fixture['siswa_ids'][0], $response['data']['items'][0]['siswa']['siswa_id']);
            $this->assertSame($fixture['jam_ke'], $response['data']['items'][0]['jam_ke']);
            $this->assertSame('manual', $response['data']['items'][0]['mode']);
        } finally {
            $this->cleanupFixture($fixture);
        }
    }

    public function test_attendance_report_rejects_invalid_status(): void
    {
        $token = $this->loginAndGetToken();

        $response = $this->runApp(
            'GET',
            '/api/reports/presensi?status=tidak_valid',
            [],
            ['Authorization' => 'Bearer ' . $token]
        );

        $this->assertSame(422, $response['__status_code']);
        $this->assertFalse($response['success']);
        $this->assertSame('Status filter tidak valid.', $response['message']);
    }

    public function test_attendance_report_rejects_invalid_mode(): void
    {
        $token = $this->loginAndGetToken();

        $response = $this->runApp(
            'GET',
            '/api/reports/presensi?mode=salah',
            [],
            ['Authorization' => 'Bearer ' . $token]
        );

        $this->assertSame(422, $response['__status_code']);
        $this->assertFalse($response['success']);
        $this->assertSame('Mode filter tidak valid.', $response['message']);
    }

    public function test_attendance_report_rejects_invalid_date_format(): void
    {
        $token = $this->loginAndGetToken();

        $response = $this->runApp(
            'GET',
            '/api/reports/presensi?date_from=2026-99-99',
            [],
            ['Authorization' => 'Bearer ' . $token]
        );

        $this->assertSame(422, $response['__status_code']);
        $this->assertFalse($response['success']);
        $this->assertSame('Tanggal tidak valid.', $response['message']);
    }

    public function test_attendance_report_rejects_invalid_date_range(): void
    {
        $token = $this->loginAndGetToken();

        $response = $this->runApp(
            'GET',
            '/api/reports/presensi?date_from=2026-06-10&date_to=2026-06-09',
            [],
            ['Authorization' => 'Bearer ' . $token]
        );

        $this->assertSame(422, $response['__status_code']);
        $this->assertFalse($response['success']);
        $this->assertSame('Rentang tanggal tidak valid.', $response['message']);
    }

    public function test_attendance_report_caps_per_page_to_one_hundred(): void
    {
        $token = $this->loginAndGetToken();
        $fixture = $this->createFixture();

        try {
            $response = $this->runApp(
                'GET',
                '/api/reports/presensi?date_from=' . $fixture['tanggal']
                    . '&date_to=' . $fixture['tanggal']
                    . '&rombel_id=' . $fixture['rombel_id']
                    . '&per_page=999',
                [],
                ['Authorization' => 'Bearer ' . $token]
            );

            $this->assertSame(200, $response['__status_code']);
            $this->assertSame(100, $response['data']['pagination']['per_page']);
            $this->assertSame(2, $response['data']['pagination']['total']);
        } finally {
            $this->cleanupFixture($fixture);
        }
    }

    private function createFixture(): array
    {
        $now = date('Y-m-d H:i:s');
        $tanggal = date('Y-m-d');

        $tahunAjaranId = (int) DB::table('tahun_ajaran')->value('tahun_ajaran_id');

        if ($tahunAjaranId === 0) {
            $tahunAjaranId = (int) DB::table('tahun_ajaran')->insertGetId([
                'kode_tahun_ajaran' => '2026/2027',
                'nama_tahun_ajaran' => '2026/2027',
                'tanggal_mulai' => '2026-07-01',
                'tanggal_selesai' => '2027-06-30',
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $kodeJurusan = 'RPT' . bin2hex(random_bytes(4));

        $jurusanId = (int) DB::table('jurusan')->insertGetId([
            'kode_jurusan' => $kodeJurusan,
            'nama_jurusan' => 'Jurusan Test Report',
            'status' => 'aktif',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $rombelId = (int) DB::table('rombel')->insertGetId([
            'tahun_ajaran_id' => $tahunAjaranId,
            'tingkatan' => 'X',
            'tingkat_angka' => 10,
            'jurusan_id' => $jurusanId,
            'nomor_rombel' => 1,
            'is_nomor_rombel_inferred' => 1,
            'label_rombel' => '10 REPORT 1',
            'label_rombel_raw' => '10 REPORT 1',
            'display_mode' => 'dengan_nomor',
            'is_inferred_from_import' => 1,
            'status' => 'aktif',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $jam = DB::table('jam_pembelajaran')
            ->select(['jam_id', 'jam_ke'])
            ->orderBy('jam_ke')
            ->first();

        $jamId = (int) $jam->jam_id;
        $jamKe = (int) $jam->jam_ke;

        $siswaAId = (int) DB::table('siswa')->insertGetId([
            'nisn' => (string) random_int(8000000000, 8999999999),
            'nama_lengkap' => 'SISWA TEST REPORT A',
            'angkatan' => 2026,
            'jurusan_id_aktif' => $jurusanId,
            'rombel_id_aktif' => $rombelId,
            'kelas_aktif' => '10 REPORT 1',
            'status' => 'aktif',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $siswaBId = (int) DB::table('siswa')->insertGetId([
            'nisn' => (string) random_int(9000000000, 9999999999),
            'nama_lengkap' => 'SISWA TEST REPORT B',
            'angkatan' => 2026,
            'jurusan_id_aktif' => $jurusanId,
            'rombel_id_aktif' => $rombelId,
            'kelas_aktif' => '10 REPORT 1',
            'status' => 'aktif',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $presensiAId = (int) DB::table('presensi_jam_siswa')->insertGetId([
            'tanggal' => $tanggal,
            'siswa_id' => $siswaAId,
            'rombel_id_snapshot' => $rombelId,
            'tahun_ajaran_id_snapshot' => $tahunAjaranId,
            'semester_snapshot' => 'ganjil',
            'jam_id' => $jamId,
            'status' => 'hadir',
            'mode_presensi' => 'manual',
            'scanned_at' => $now,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $presensiBId = (int) DB::table('presensi_jam_siswa')->insertGetId([
            'tanggal' => $tanggal,
            'siswa_id' => $siswaBId,
            'rombel_id_snapshot' => $rombelId,
            'tahun_ajaran_id_snapshot' => $tahunAjaranId,
            'semester_snapshot' => 'ganjil',
            'jam_id' => $jamId,
            'status' => 'alpha',
            'mode_presensi' => 'manual',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        return [
            'tanggal' => $tanggal,
            'jurusan_id' => $jurusanId,
            'rombel_id' => $rombelId,
            'siswa_ids' => [$siswaAId, $siswaBId],
            'presensi_ids' => [$presensiAId, $presensiBId],
            'jam_ke' => $jamKe,
        ];
    }

    private function cleanupFixture(array $fixture): void
    {
        DB::table('presensi_edit_log')->whereIn('presensi_id', $fixture['presensi_ids'])->delete();
        DB::table('presensi_jam_siswa')->whereIn('presensi_id', $fixture['presensi_ids'])->delete();
        DB::table('siswa')->whereIn('siswa_id', $fixture['siswa_ids'])->delete();
        DB::table('rombel')->where('rombel_id', $fixture['rombel_id'])->delete();
        DB::table('jurusan')->where('jurusan_id', $fixture['jurusan_id'])->delete();
    }
}