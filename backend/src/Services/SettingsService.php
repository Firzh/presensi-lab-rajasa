<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

use Illuminate\Database\Capsule\Manager as DB;
use Rajasa\PresensiSiswa\Core\HttpException;

final class SettingsService
{
    private array $columnsCache = [];
    private array $primaryKeyCache = [];
    private array $generatedColumnCache = [];

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

        public function previewBackupImport(?array $uploadedFile, string $filePathInput): array
    {
        $file = $this->resolveBackupImportFile($uploadedFile, $filePathInput);

        return $this->scanBackupFile($file['path']);
    }

    public function importBackupDataOnly(?array $uploadedFile, string $filePathInput, ?int $userId = null): array
    {
        $file = $this->resolveBackupImportFile($uploadedFile, $filePathInput);
        $summary = [
            'total_insert_rows' => 0,
            'insert_rows' => 0,
            'overwrite_rows' => 0,
            'skipped_rows' => 0,
            'skipped_tables' => [],
        ];

        DB::connection()->transaction(function () use ($file, &$summary): void {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            try {
                foreach ($this->insertStatementsFromFile($file['path']) as $statement) {
                    $parsed = $this->parseInsertStatement($statement);
                    if (!$parsed || !$this->tableExists($parsed['table'])) {
                        $summary['skipped_rows']++;
                        if ($parsed) {
                            $summary['skipped_tables'][$parsed['table']] = true;
                        }
                        continue;
                    }

                    $normalized = $this->normalizeInsertPayload($parsed);
                    if (!$normalized) {
                        $summary['skipped_rows']++;
                        continue;
                    }

                    $summary['total_insert_rows']++;
                    $exists = $this->rowExistsByPrimaryKey($normalized['table'], $normalized['data']);
                    $exists ? $summary['overwrite_rows']++ : $summary['insert_rows']++;

                    DB::statement($this->buildUpsertSql($normalized['table'], $normalized['data']));
                }
            } finally {
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            }
        });

        $summary['skipped_tables'] = array_keys($summary['skipped_tables']);
        $this->activityService->record($userId, 'import_backup', 'pengaturan', 'Import backup data-only diproses.');

        return [
            'mode' => 'data_only',
            'summary' => $summary,
        ];
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
                ->chunk(500, function ($rows) use (&$lines, $table): void {
                    foreach ($rows as $row) {
                        $data = array_intersect_key((array) $row, array_flip($this->writableColumns($table)));
                        $columns = array_map(static fn (string $column): string => '`' . str_replace('`', '``', $column) . '`', array_keys($data));
                        $values = array_map(fn (mixed $value): string => $this->sqlValue($value), array_values($data));

                        $lines[] = 'INSERT INTO `' . str_replace('`', '``', $table) . '` (' . implode(',', $columns) . ') VALUES (' . implode(',', $values) . ');';
                    }
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

        private function resolveBackupImportFile(?array $uploadedFile, string $filePathInput): array
    {
        if ($uploadedFile && ($uploadedFile['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
            $name = (string) ($uploadedFile['name'] ?? '');
            if (strtolower(pathinfo($name, PATHINFO_EXTENSION)) !== 'sql') {
                throw new HttpException('File backup harus berformat .sql.', 422);
            }

            return [
                'path' => (string) $uploadedFile['tmp_name'],
                'name' => $name,
            ];
        }

        $filePath = trim($filePathInput);
        if ($filePath !== '') {
            return [
                'path' => $filePath,
                'name' => basename($filePath),
            ];
        }

        throw new HttpException('File backup wajib dikirim.', 422);
    }

    private function scanBackupFile(string $path): array
    {
        if (!is_file($path)) {
            throw new HttpException('File backup tidak ditemukan.', 422);
        }

        $summary = [
            'total_insert_rows' => 0,
            'insert_rows' => 0,
            'overwrite_rows' => 0,
            'invalid_rows' => 0,
            'skipped_rows' => 0,
            'details_truncated' => false,
        ];
        $tables = [];
        $overwriteDetails = [];
        $detailLimit = 1000;

        foreach ($this->insertStatementsFromFile($path) as $statement) {
            $parsed = $this->parseInsertStatement($statement);
            if (!$parsed || !$this->tableExists($parsed['table'])) {
                $summary['skipped_rows']++;
                continue;
            }

            $normalized = $this->normalizeInsertPayload($parsed);
            if (!$normalized) {
                $summary['invalid_rows']++;
                continue;
            }

            $table = $normalized['table'];
            $summary['total_insert_rows']++;
            $tables[$table] ??= ['table' => $table, 'total_rows' => 0, 'insert_rows' => 0, 'overwrite_rows' => 0];
            $tables[$table]['total_rows']++;

            $existing = $this->existingRowByPrimaryKey($table, $normalized['data']);
            if ($existing) {
                $summary['overwrite_rows']++;
                $tables[$table]['overwrite_rows']++;

                if (count($overwriteDetails) < $detailLimit) {
                    $overwriteDetails[] = $this->formatBackupOverwriteDetail($table, $normalized['data'], $existing);
                } else {
                    $summary['details_truncated'] = true;
                }
            } else {
                $summary['insert_rows']++;
                $tables[$table]['insert_rows']++;
            }
        }

        return [
            'mode' => 'data_only',
            'summary' => $summary,
            'tables' => array_values($tables),
            'overwrite_details' => $overwriteDetails,
        ];
    }

    private function insertStatementsFromFile(string $path): \Generator
    {
        $handle = fopen($path, 'rb');
        if (!$handle) {
            throw new HttpException('File backup tidak bisa dibaca.', 422);
        }

        $buffer = '';
        while (($line = fgets($handle)) !== false) {
            $trimmed = trim($line);
            if ($buffer === '' && !str_starts_with($trimmed, 'INSERT INTO ')) {
                continue;
            }

            $buffer .= $line;
            if (str_ends_with(rtrim($line), ';')) {
                yield trim($buffer);
                $buffer = '';
            }
        }

        fclose($handle);
    }

    private function parseInsertStatement(string $statement): ?array
    {
        if (preg_match('/^INSERT\s+INTO\s+`([^`]+)`\s*\((.+)\)\s+VALUES\s*\((.*)\);$/is', $statement, $matches) !== 1) {
            return null;
        }

        $columns = array_map(static function (string $column): string {
            return trim(str_replace('`', '', $column));
        }, explode(',', $matches[2]));

        $values = $this->splitSqlValues($matches[3]);

        if (count($columns) !== count($values)) {
            return null;
        }

        return [
            'table' => $matches[1],
            'columns' => $columns,
            'values' => array_map(fn (string $value): mixed => $this->parseSqlLiteral($value), $values),
        ];
    }

    private function splitSqlValues(string $input): array
    {
        $values = [];
        $current = '';
        $inString = false;
        $escaped = false;
        $length = strlen($input);

        for ($i = 0; $i < $length; $i++) {
            $char = $input[$i];

            if ($escaped) {
                $current .= $char;
                $escaped = false;
                continue;
            }

            if ($char === '\\' && $inString) {
                $current .= $char;
                $escaped = true;
                continue;
            }

            if ($char === "'") {
                $inString = !$inString;
                $current .= $char;
                continue;
            }

            if ($char === ',' && !$inString) {
                $values[] = trim($current);
                $current = '';
                continue;
            }

            $current .= $char;
        }

        $values[] = trim($current);

        return $values;
    }

    private function parseSqlLiteral(string $value): mixed
    {
        $value = trim($value);
        if (strcasecmp($value, 'NULL') === 0) {
            return null;
        }

        if (str_starts_with($value, "'") && str_ends_with($value, "'")) {
            $inner = substr($value, 1, -1);
            return strtr($inner, [
                "\\0" => "\0",
                "\\n" => "\n",
                "\\r" => "\r",
                "\\t" => "\t",
                "\\Z" => chr(26),
                "\\'" => "'",
                '\\"' => '"',
                "\\\\" => "\\",
                "''" => "'",
            ]);
        }

        if (is_numeric($value)) {
            return str_contains($value, '.') ? (float) $value : (int) $value;
        }

        return $value;
    }

    private function normalizeInsertPayload(array $parsed): ?array
    {
        $table = (string) $parsed['table'];
        $writableColumns = $this->writableColumns($table);
        $data = [];

        foreach ($parsed['columns'] as $index => $column) {
            if (in_array($column, $writableColumns, true)) {
                $data[$column] = $parsed['values'][$index] ?? null;
            }
        }

        return $data === [] ? null : ['table' => $table, 'data' => $data];
    }

    private function buildUpsertSql(string $table, array $data): string
    {
        $columns = array_keys($data);
        $primaryKeys = $this->primaryKeyColumns($table);
        $updateColumns = array_values(array_diff($columns, $primaryKeys));

        if ($updateColumns === []) {
            $updateColumns = [$columns[0]];
        }

        $quotedColumns = array_map(fn (string $column): string => '`' . str_replace('`', '``', $column) . '`', $columns);
        $values = array_map(fn (mixed $value): string => $this->sqlValue($value), array_values($data));
        $updates = array_map(
            fn (string $column): string => '`' . str_replace('`', '``', $column) . '`=VALUES(`' . str_replace('`', '``', $column) . '`)',
            $updateColumns
        );

        return 'INSERT INTO `' . str_replace('`', '``', $table) . '` (' . implode(',', $quotedColumns) . ') VALUES (' . implode(',', $values) . ') ON DUPLICATE KEY UPDATE ' . implode(',', $updates);
    }

    private function rowExistsByPrimaryKey(string $table, array $data): bool
    {
        return $this->existingRowByPrimaryKey($table, $data) !== null;
    }

    private function existingRowByPrimaryKey(string $table, array $data): ?array
    {
        $primaryKeys = $this->primaryKeyColumns($table);
        if ($primaryKeys === []) {
            return null;
        }

        $query = DB::table($table);
        foreach ($primaryKeys as $column) {
            if (!array_key_exists($column, $data)) {
                return null;
            }
            $query->where($column, $data[$column]);
        }

        $row = $query->first();
        return $row ? (array) $row : null;
    }

    private function formatBackupOverwriteDetail(string $table, array $incoming, array $existing): array
    {
        $primaryKeys = $this->primaryKeyColumns($table);
        $target = $table;
        if ($primaryKeys !== []) {
            $target .= ' #' . implode(',', array_map(fn (string $column): string => $column . '=' . (string) ($incoming[$column] ?? ''), $primaryKeys));
        }

        $changes = [];
        foreach ($incoming as $column => $newValue) {
            $oldValue = $existing[$column] ?? null;
            if ((string) $oldValue !== (string) $newValue) {
                $changes[] = [
                    'field' => $column,
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }

            if (count($changes) >= 6) {
                break;
            }
        }

        return [
            'table' => $table,
            'target' => $target,
            'old_label' => $this->compactRowLabel($existing),
            'new_label' => $this->compactRowLabel($incoming),
            'changes' => $changes ?: [[
                'field' => 'status',
                'old' => 'Ada di database',
                'new' => 'Akan ditulis ulang',
            ]],
        ];
    }

    private function compactRowLabel(array $row): string
    {
        foreach (['nama_lengkap', 'label_rombel', 'username', 'email', 'payload_nama', 'import_code'] as $column) {
            if (isset($row[$column]) && trim((string) $row[$column]) !== '') {
                return (string) $row[$column];
            }
        }

        $pairs = [];
        foreach (array_slice($row, 0, 3, true) as $key => $value) {
            $pairs[] = $key . '=' . (string) $value;
        }

        return implode(', ', $pairs);
    }

    private function tableExists(string $table): bool
    {
        return DB::connection()->getSchemaBuilder()->hasTable($table);
    }

    private function columns(string $table): array
    {
        if (!isset($this->columnsCache[$table])) {
            $this->columnsCache[$table] = DB::connection()->getSchemaBuilder()->getColumnListing($table);
        }

        return $this->columnsCache[$table];
    }

    private function generatedColumns(string $table): array
    {
        if (!isset($this->generatedColumnCache[$table])) {
            $database = (string) DB::connection()->getDatabaseName();
            $this->generatedColumnCache[$table] = DB::table('information_schema.COLUMNS')
                ->where('TABLE_SCHEMA', $database)
                ->where('TABLE_NAME', $table)
                ->where(function ($query): void {
                    $query->where('EXTRA', 'like', '%GENERATED%')
                        ->orWhere('GENERATION_EXPRESSION', '<>', '');
                })
                ->pluck('COLUMN_NAME')
                ->map(fn ($column): string => (string) $column)
                ->all();
        }

        return $this->generatedColumnCache[$table];
    }

    private function writableColumns(string $table): array
    {
        return array_values(array_diff($this->columns($table), $this->generatedColumns($table)));
    }

    private function primaryKeyColumns(string $table): array
    {
        if (!isset($this->primaryKeyCache[$table])) {
            $this->primaryKeyCache[$table] = DB::table('information_schema.KEY_COLUMN_USAGE')
                ->where('TABLE_SCHEMA', (string) DB::connection()->getDatabaseName())
                ->where('TABLE_NAME', $table)
                ->where('CONSTRAINT_NAME', 'PRIMARY')
                ->orderBy('ORDINAL_POSITION')
                ->pluck('COLUMN_NAME')
                ->map(fn ($column): string => (string) $column)
                ->all();
        }

        return $this->primaryKeyCache[$table];
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
