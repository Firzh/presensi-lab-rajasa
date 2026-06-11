<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

use Illuminate\Database\Capsule\Manager as DB;
use Rajasa\PresensiSiswa\Core\HttpException;

final class SettingsService
{
    public function __construct(private readonly UserActivityService $activityService)
    {
    }

    public function dashboard(): array
    {
        $settings = $this->readSettings();

        return [
            'backup_history' => $this->backupHistory(),
            'rombel_schedule' => $this->rombelSchedule($settings),
            'late_rule' => $settings['late_rule'],
        ];
    }

    public function createBackup(?int $userId = null): array
    {
        $this->ensureDirectory($this->backupPath());

        $fileName = 'presensi_backup_' . date('Y-m-d_His') . '.sql';
        $path = $this->backupPath() . DIRECTORY_SEPARATOR . $fileName;

        file_put_contents($path, $this->buildSqlDump());

        $backup = $this->formatBackupFile($path);
        $this->activityService->record($userId, 'create_backup', 'pengaturan', 'Backup database dibuat.');

        return [
            'backup' => $backup,
            'backup_history' => $this->backupHistory(),
        ];
    }

    public function downloadBackup(string $fileName): array
    {
        $safeFileName = basename($fileName);
        $path = $this->backupPath() . DIRECTORY_SEPARATOR . $safeFileName;

        if ($safeFileName === '' || !is_file($path)) {
            throw new HttpException('File backup tidak ditemukan.', 404);
        }

        return [
            'fileName' => $safeFileName,
            'content' => (string) file_get_contents($path),
        ];
    }

    public function updateLateRule(array $payload, ?int $userId = null): array
    {
        $settings = $this->readSettings();
        $settings['late_rule'] = [
            'standardTime' => $this->normalizeTime($payload['standardTime'] ?? $payload['standard_time'] ?? '07:00'),
            'toleranceMinutes' => max(0, (int) ($payload['toleranceMinutes'] ?? $payload['tolerance_minutes'] ?? 10)),
            'autoStatus' => filter_var($payload['autoStatus'] ?? $payload['auto_status'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'note' => trim((string) ($payload['note'] ?? '')),
        ];

        $this->writeSettings($settings);
        $this->activityService->record($userId, 'update_late_rule', 'pengaturan', 'Aturan keterlambatan diperbarui.');

        return ['late_rule' => $settings['late_rule']];
    }

    public function updateRombelSchedule(array $payload, ?int $userId = null): array
    {
        $settings = $this->readSettings();
        $schedule = $settings['rombel_schedule'];
        $slots = $this->normalizeSlots($payload['slots'] ?? []);

        $schedule['batch_rombel_ids'] = $this->normalizeIdList($payload['batch_rombel_ids'] ?? []);
        $schedule['selected_rombel_ids'] = $this->normalizeIdList($payload['selected_rombel_ids'] ?? []);
        $schedule['day'] = trim((string) ($payload['day'] ?? $schedule['day'] ?? 'Senin'));
        $schedule['schedule_mode'] = trim((string) ($payload['schedule_mode'] ?? $schedule['schedule_mode'] ?? 'mapel'));
        $schedule['attendance_cutoff'] = $this->normalizeTime($payload['attendance_cutoff'] ?? $schedule['attendance_cutoff'] ?? '07:10');
        $schedule['start_time'] = $this->normalizeTime($payload['start_time'] ?? $schedule['start_time'] ?? '07:00');
        $schedule['slots'] = $slots;

        $settings['rombel_schedule'] = $schedule;
        $this->writeSettings($settings);
        $this->syncJamPembelajaran($slots);
        $this->activityService->record($userId, 'update_rombel_schedule', 'pengaturan', 'Jadwal rombel diperbarui.');

        return ['rombel_schedule' => $this->rombelSchedule($settings)];
    }

    private function rombelSchedule(array $settings): array
    {
        $schedule = $settings['rombel_schedule'];
        $rombelOptions = $this->rombelOptions();
        $allIds = array_map(static fn (array $rombel): string => (string) $rombel['id'], $rombelOptions);

        if ($schedule['batch_rombel_ids'] === []) {
            $schedule['batch_rombel_ids'] = $allIds;
        }

        if ($schedule['selected_rombel_ids'] === []) {
            $schedule['selected_rombel_ids'] = array_slice($schedule['batch_rombel_ids'], 0, 2);
        }

        $dbSlots = $this->slotsFromDatabase();
        if ($dbSlots !== []) {
            $schedule['slots'] = $dbSlots;
            $schedule['start_time'] = $dbSlots[0]['startsAt'] ?? $schedule['start_time'];
        }

        return array_merge($schedule, [
            'rombel_options' => $rombelOptions,
        ]);
    }

    private function rombelOptions(): array
    {
        return DB::table('rombel as r')
            ->join('jurusan as j', 'j.jurusan_id', '=', 'r.jurusan_id')
            ->where('r.status', 'aktif')
            ->orderBy('r.tingkat_angka')
            ->orderBy('j.kode_jurusan')
            ->orderBy('r.nomor_rombel')
            ->get([
                'r.rombel_id',
                'r.label_rombel',
                'r.tingkat_angka',
                'j.kode_jurusan',
            ])
            ->map(function (object $row): array {
                $year = match ((int) $row->tingkat_angka) {
                    10 => '1',
                    11 => '2',
                    12 => '3',
                    default => 'all',
                };

                return [
                    'id' => (string) $row->rombel_id,
                    'label' => $row->label_rombel ?: ('Rombel ' . $row->rombel_id),
                    'jurusan' => $row->kode_jurusan,
                    'year' => $year,
                    'yearLabel' => $year === 'all' ? 'Lainnya' : 'Tahun ke-' . $year,
                ];
            })
            ->values()
            ->all();
    }

    private function slotsFromDatabase(): array
    {
        $rows = DB::table('jam_pembelajaran')
            ->where('tipe_hari', 'normal')
            ->where('status', 'aktif')
            ->orderBy('jam_ke')
            ->get(['jam_id', 'jam_ke', 'label_jam', 'waktu_mulai', 'waktu_selesai']);

        if ($rows->isEmpty()) {
            return [];
        }

        return $rows
            ->map(function (object $row): array {
                $startsAt = $this->formatTime($row->waktu_mulai) ?: '07:00';
                $endsAt = $this->formatTime($row->waktu_selesai) ?: $startsAt;

                return [
                    'id' => 'mapel-' . (int) $row->jam_ke,
                    'type' => 'mapel',
                    'label' => $row->label_jam ?: 'Mapel ' . (int) $row->jam_ke,
                    'duration' => max(1, $this->minutesBetween($startsAt, $endsAt)),
                    'active' => true,
                    'startsAt' => $startsAt,
                    'endsAt' => $endsAt,
                ];
            })
            ->values()
            ->all();
    }

    private function syncJamPembelajaran(array $slots): void
    {
        $mapelSlots = array_values(array_filter($slots, static fn (array $slot): bool => ($slot['type'] ?? 'mapel') === 'mapel'));
        $mapelSlots = array_slice($mapelSlots, 0, 8);

        if ($mapelSlots === []) {
            return;
        }

        foreach ($mapelSlots as $index => $slot) {
            $jamKe = $index + 1;
            DB::table('jam_pembelajaran')->updateOrInsert(
                ['jam_ke' => $jamKe, 'tipe_hari' => 'normal'],
                [
                    'label_jam' => 'Jam ke-' . $jamKe,
                    'waktu_mulai' => $this->normalizeTime($slot['startsAt'] ?? '07:00'),
                    'waktu_selesai' => $this->normalizeTime($slot['endsAt'] ?? '07:40'),
                    'status' => 'aktif',
                ]
            );
        }

        DB::table('jam_pembelajaran')
            ->where('tipe_hari', 'normal')
            ->where('jam_ke', '>', count($mapelSlots))
            ->update(['status' => 'nonaktif']);
    }

    private function buildSqlDump(): string
    {
        $lines = [
            '-- Backup sistem presensi siswa QR',
            '-- Generated at: ' . date('Y-m-d H:i:s'),
            'SET FOREIGN_KEY_CHECKS=0;',
            '',
        ];

        foreach ($this->databaseTables() as $table) {
            $lines[] = '-- Table: `' . $table . '`';
            $createRows = DB::select('SHOW CREATE TABLE `' . str_replace('`', '``', $table) . '`');
            $createData = isset($createRows[0]) ? (array) $createRows[0] : [];
            $createSql = array_values($createData)[1] ?? '';

            if ($createSql !== '') {
                $lines[] = 'DROP TABLE IF EXISTS `' . str_replace('`', '``', $table) . '`;';
                $lines[] = $createSql . ';';
            }

            DB::table($table)
                ->orderByRaw('1')
                ->limit(500)
                ->get()
                ->each(function (object $row) use (&$lines, $table): void {
                    $data = (array) $row;
                    $columns = array_map(static fn (string $column): string => '`' . str_replace('`', '``', $column) . '`', array_keys($data));
                    $values = array_map(fn (mixed $value): string => $this->sqlValue($value), array_values($data));
                    $lines[] = 'INSERT INTO `' . str_replace('`', '``', $table) . '` (' . implode(',', $columns) . ') VALUES (' . implode(',', $values) . ');';
                });

            $lines[] = '';
        }

        $lines[] = 'SET FOREIGN_KEY_CHECKS=1;';

        return implode("\n", $lines) . "\n";
    }

    private function databaseTables(): array
    {
        return array_map(static function (object $row): string {
            $values = array_values((array) $row);

            return (string) ($values[0] ?? '');
        }, DB::select('SHOW FULL TABLES WHERE Table_type = ?', ['BASE TABLE']));
    }

    private function sqlValue(mixed $value): string
    {
        if ($value === null) {
            return 'NULL';
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        return DB::connection()->getPdo()->quote((string) $value);
    }

    private function backupHistory(): array
    {
        $path = $this->backupPath();

        if (!is_dir($path)) {
            return [];
        }

        $files = glob($path . DIRECTORY_SEPARATOR . '*.sql') ?: [];
        usort($files, static fn (string $a, string $b): int => filemtime($b) <=> filemtime($a));

        return array_map(fn (string $file): array => $this->formatBackupFile($file), array_slice($files, 0, 20));
    }

    private function formatBackupFile(string $path): array
    {
        return [
            'id' => pathinfo($path, PATHINFO_FILENAME),
            'fileName' => basename($path),
            'createdAt' => date('d M Y, H:i', filemtime($path) ?: time()),
            'size' => $this->humanFileSize(filesize($path) ?: 0),
            'status' => 'Berhasil',
            'by' => 'Backend',
        ];
    }

    private function humanFileSize(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1) . ' MB';
        }

        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 1) . ' KB';
        }

        return $bytes . ' B';
    }

    private function readSettings(): array
    {
        $defaults = $this->defaultSettings();
        $path = $this->settingsFile();

        if (!is_file($path)) {
            return $defaults;
        }

        $decoded = json_decode((string) file_get_contents($path), true);

        if (!is_array($decoded)) {
            return $defaults;
        }

        return array_replace_recursive($defaults, $decoded);
    }

    private function writeSettings(array $settings): void
    {
        $this->ensureDirectory(dirname($this->settingsFile()));
        file_put_contents(
            $this->settingsFile(),
            json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
    }

    private function normalizeSlots(array $slots): array
    {
        return array_values(array_map(function (mixed $slot, int $index): array {
            $slot = is_array($slot) ? $slot : [];
            $type = ($slot['type'] ?? 'mapel') === 'break' ? 'break' : 'mapel';
            $label = trim((string) ($slot['label'] ?? ($type === 'break' ? 'Istirahat' : 'Mapel') . ' ' . ($index + 1)));

            return [
                'id' => trim((string) ($slot['id'] ?? $type . '-' . ($index + 1))),
                'type' => $type,
                'label' => $label,
                'duration' => max(1, (int) ($slot['duration'] ?? 40)),
                'active' => filter_var($slot['active'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'startsAt' => $this->normalizeTime($slot['startsAt'] ?? '07:00'),
                'endsAt' => $this->normalizeTime($slot['endsAt'] ?? '07:40'),
            ];
        }, $slots, array_keys($slots)));
    }

    private function normalizeIdList(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        return array_values(array_unique(array_filter(array_map(static function (mixed $item): string {
            return trim((string) $item);
        }, $value), static fn (string $item): bool => $item !== '')));
    }

    private function normalizeTime(mixed $value): string
    {
        $time = trim((string) $value);

        if (preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $time) !== 1) {
            throw new HttpException('Format waktu tidak valid.', 422, ['time' => 'Format waktu harus HH:mm.']);
        }

        return substr($time, 0, 5);
    }

    private function formatTime(mixed $value): ?string
    {
        if (!$value) {
            return null;
        }

        return substr((string) $value, 0, 5);
    }

    private function minutesBetween(string $start, string $end): int
    {
        [$startHour, $startMinute] = array_map('intval', explode(':', $start));
        [$endHour, $endMinute] = array_map('intval', explode(':', $end));
        $diff = ($endHour * 60 + $endMinute) - ($startHour * 60 + $startMinute);

        return $diff > 0 ? $diff : 1;
    }

    private function defaultSettings(): array
    {
        return [
            'late_rule' => [
                'standardTime' => '07:00',
                'toleranceMinutes' => 10,
                'autoStatus' => true,
                'note' => 'Lewat dari batas toleransi otomatis dihitung Terlambat.',
            ],
            'rombel_schedule' => [
                'batch_rombel_ids' => [],
                'selected_rombel_ids' => [],
                'day' => 'Senin',
                'schedule_mode' => 'mapel',
                'attendance_cutoff' => '07:10',
                'start_time' => '07:00',
                'slots' => [],
            ],
        ];
    }

    private function settingsFile(): string
    {
        return dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'settings' . DIRECTORY_SEPARATOR . 'presensi-settings.json';
    }

    private function backupPath(): string
    {
        return dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'backups';
    }

    private function ensureDirectory(string $path): void
    {
        if (!is_dir($path) && !mkdir($path, 0775, true) && !is_dir($path)) {
            throw new HttpException('Direktori storage tidak bisa dibuat.', 500);
        }
    }
}
