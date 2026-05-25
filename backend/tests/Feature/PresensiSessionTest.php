<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Feature;

use Illuminate\Database\Capsule\Manager as DB;
use Rajasa\PresensiSiswa\Tests\Support\TestCase;

final class PresensiSessionTest extends TestCase
{
    public function test_create_rombel_session_with_kelas_room(): void
    {
        $token = $this->loginAndGetToken();
        $rombelId = $this->firstRombelId();
        $jamIds = $this->firstJamIds(1);

        if (!$rombelId || count($jamIds) < 1) {
            $this->markTestSkipped('Data rombel atau jam pembelajaran demo belum tersedia.');
        }
        $this->cleanupSessionsForRombelJams((int) $rombelId, $jamIds);

        $response = $this->runApp('POST', '/api/presensi/sesi', [
            'mode_presensi' => 'rombel',
            'rombel_id' => $rombelId,
            'jam_ids' => $jamIds,
            'ruang_pilihan' => 'kelas',
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(201, $response['__status_code']);
        $this->assertTrue($response['success']);
        $this->assertSame('Sesi presensi berhasil dibuat.', $response['message']);
        $this->assertSame('kelas', $response['data']['session']['ruang_pilihan']);

        $sessionId = (int) $response['data']['session']['presensi_sesi_id'];

        $this->runApp('POST', "/api/presensi/sesi/{$sessionId}/finish", [], [
            'Authorization' => 'Bearer ' . $token,
        ]);
    }

    public function test_create_session_rejects_duplicate_active_rombel_same_jam(): void
    {
        $token = $this->loginAndGetToken();
        $rombelId = $this->firstRombelId();
        $jamIds = $this->firstJamIds(1);

        if (!$rombelId || count($jamIds) < 1) {
            $this->markTestSkipped('Data rombel atau jam pembelajaran demo belum tersedia.');
        }
        $this->cleanupSessionsForRombelJams((int) $rombelId, $jamIds);

        $first = $this->runApp('POST', '/api/presensi/sesi', [
            'mode_presensi' => 'rombel',
            'rombel_id' => $rombelId,
            'jam_ids' => $jamIds,
            'ruang_pilihan' => 'kelas',
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(201, $first['__status_code']);

        $second = $this->runApp('POST', '/api/presensi/sesi', [
            'mode_presensi' => 'rombel',
            'rombel_id' => $rombelId,
            'jam_ids' => $jamIds,
            'ruang_pilihan' => 'kelas',
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(409, $second['__status_code']);
        $this->assertFalse($second['success']);
        $this->assertSame('Rombel sudah memiliki sesi pada jam yang dipilih.', $second['message']);

        $sessionId = (int) $first['data']['session']['presensi_sesi_id'];

        $this->runApp('POST', "/api/presensi/sesi/{$sessionId}/finish", [], [
            'Authorization' => 'Bearer ' . $token,
        ]);
    }

    public function test_create_session_requires_token(): void
    {
        $response = $this->runApp('POST', '/api/presensi/sesi', [
            'mode_presensi' => 'piket',
            'jam_ids' => [1],
        ]);

        $this->assertSame(401, $response['__status_code']);
        $this->assertFalse($response['success']);
    }

    public function test_create_session_rejects_more_than_three_jams(): void
    {
        $token = $this->loginAndGetToken();
        $rombelId = $this->firstRombelId();

        $response = $this->runApp('POST', '/api/presensi/sesi', [
            'mode_presensi' => 'rombel',
            'rombel_id' => $rombelId,
            'jam_ids' => [1, 2, 3, 4],
            'ruang_pilihan' => 'kelas',
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(422, $response['__status_code']);
        $this->assertFalse($response['success']);
        $this->assertSame('Jam pelajaran maksimal 3 jam.', $response['message']);
    }

    public function test_pause_resume_finish_session(): void
    {
        $token = $this->loginAndGetToken();
        $rombelId = $this->firstRombelId();
        $jamIds = $this->firstJamIds(1);

        if (!$rombelId || count($jamIds) < 1) {
            $this->markTestSkipped('Data rombel atau jam pembelajaran demo belum tersedia.');
        }
        $this->cleanupSessionsForRombelJams((int) $rombelId, $jamIds);

        $create = $this->runApp('POST', '/api/presensi/sesi', [
            'mode_presensi' => 'rombel',
            'rombel_id' => $rombelId,
            'jam_ids' => $jamIds,
            'ruang_pilihan' => 'lab-tkj-1',
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $sessionId = (int) $create['data']['session']['presensi_sesi_id'];

        $pause = $this->runApp('POST', "/api/presensi/sesi/{$sessionId}/pause", [], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(200, $pause['__status_code']);

        $resume = $this->runApp('POST', "/api/presensi/sesi/{$sessionId}/resume", [], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(200, $resume['__status_code']);

        $finish = $this->runApp('POST', "/api/presensi/sesi/{$sessionId}/finish", [], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(200, $finish['__status_code']);
        $this->assertTrue($finish['success']);
    }

    public function test_check_warning_ignores_finished_rombel_session_for_piket_mode(): void
    {
        $token = $this->loginAndGetToken();
        $rombelId = $this->firstRombelId();
        $jamIds = $this->firstJamIds(2);

        if (!$rombelId || count($jamIds) < 2) {
            $this->markTestSkipped('Data rombel atau jam pembelajaran demo belum tersedia.');
        }

        $this->cleanupSessionsForRombelJams((int) $rombelId, $jamIds);

        $create = $this->runApp('POST', '/api/presensi/sesi', [
            'mode_presensi' => 'rombel',
            'rombel_id' => $rombelId,
            'jam_ids' => $jamIds,
            'ruang_pilihan' => 'kelas',
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(201, $create['__status_code'], json_encode($create, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $sessionId = (int) $create['data']['session']['presensi_sesi_id'];

        $finish = $this->runApp('POST', "/api/presensi/sesi/{$sessionId}/finish", [], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(200, $finish['__status_code'], json_encode($finish, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $check = $this->runApp('POST', '/api/presensi/sesi/check-warning', [
            'mode_presensi' => 'piket',
            'jam_ids' => $jamIds,
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(200, $check['__status_code'], json_encode($check, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->assertFalse($check['data']['has_warning']);
        $this->assertSame([], $check['data']['conflicts']);
    }

    public function test_check_warning_counts_finished_rombel_session_on_same_rombel_and_same_jam(): void
    {
        $token = $this->loginAndGetToken();
        $rombelId = $this->firstRombelId();
        $jamIds = $this->firstJamIds(1);

        if (!$rombelId || count($jamIds) < 1) {
            $this->markTestSkipped('Data rombel atau jam pembelajaran demo belum tersedia.');
        }
        $this->cleanupSessionsForRombelJams((int) $rombelId, $jamIds);

        $this->cleanupSessionsForRombelJams((int) $rombelId, $jamIds);

        $create = $this->runApp('POST', '/api/presensi/sesi', [
            'mode_presensi' => 'rombel',
            'rombel_id' => $rombelId,
            'jam_ids' => $jamIds,
            'ruang_pilihan' => 'kelas',
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(201, $create['__status_code'], json_encode($create, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $sessionId = (int) $create['data']['session']['presensi_sesi_id'];

        $finish = $this->runApp('POST', "/api/presensi/sesi/{$sessionId}/finish", [], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(200, $finish['__status_code'], json_encode($finish, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $check = $this->runApp('POST', '/api/presensi/sesi/check-warning', [
            'mode_presensi' => 'rombel',
            'rombel_id' => $rombelId,
            'jam_ids' => $jamIds,
            'ruang_pilihan' => 'kelas',
        ], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $this->assertSame(200, $check['__status_code'], json_encode($check, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->assertTrue($check['data']['has_warning']);
        $this->assertNotEmpty($check['data']['conflicts']);
    }

    private function cleanupSessionsForRombelJams(int $rombelId, array $jamIds): void
    {
        if ($rombelId <= 0 || $jamIds === []) {
            return;
        }

        $sessionIds = DB::table('presensi_sesi as ps')
            ->join('presensi_sesi_jam as psj', 'psj.presensi_sesi_id', '=', 'ps.presensi_sesi_id')
            ->where('ps.tanggal', date('Y-m-d'))
            ->where('ps.mode_presensi', 'rombel')
            ->where('ps.rombel_id', $rombelId)
            ->whereIn('psj.jam_id', $jamIds)
            ->pluck('ps.presensi_sesi_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        if ($sessionIds === []) {
            return;
        }

        DB::table('presensi_jam_siswa')->whereIn('presensi_sesi_id', $sessionIds)->delete();
        DB::table('presensi_scan_log')->whereIn('presensi_sesi_id', $sessionIds)->delete();
        DB::table('presensi_sesi_jam')->whereIn('presensi_sesi_id', $sessionIds)->delete();
        DB::table('presensi_sesi')->whereIn('presensi_sesi_id', $sessionIds)->delete();
    }

    private function firstRombelId(): ?int
    {
        return DB::table('rombel')
            ->orderBy('rombel_id')
            ->value('rombel_id');
    }

    private function firstJamIds(int $limit): array
    {
        return DB::table('jam_pembelajaran')
            ->orderBy('jam_id')
            ->limit($limit)
            ->pluck('jam_id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }
}