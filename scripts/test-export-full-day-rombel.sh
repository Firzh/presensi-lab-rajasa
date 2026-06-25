#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# Uji export laporan untuk tepat 1 rombel pada tepat 1 tanggal,
# dengan seluruh siswa aktif memiliki data Jam ke-1 sampai Jam ke-8.
#
# Jalankan dari root project:
#   ./scripts/test-export-full-day-rombel.sh
#
# Target opsional:
#   TEST_DATE=2026-06-17 ROMBEL_ID=3 ./scripts/test-export-full-day-rombel.sh
#
# Override opsional:
#   API_BASE=http://localhost:8080 LOGIN_USER=admin.demo LOGIN_PASSWORD='Rajasa@123' ./scripts/test-export-full-day-rombel.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf '[PASS] %s\n' "$1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf '[FAIL] %s\n' "$1" >&2
}

warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  printf '[WARN] %s\n' "$1"
}

die() {
  printf '[PREREQUISITE FAILED] %s\n' "$1" >&2
  exit 2
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Command '$1' tidak tersedia."
}

env_value() {
  local key="$1"
  sed -n "s/^${key}=//p" .env | tail -n 1 | tr -d '\r'
}

mysql_query() {
  local sql="$1"
  docker compose exec -T \
    -e MYSQL_PWD="$DB_PASSWORD_VALUE" \
    db mysql -u"$DB_USERNAME_VALUE" "$DB_DATABASE_VALUE" -N -B -e "$sql" | tr -d '\r'
}

header_value() {
  local file="$1"
  local name="$2"
  awk -v wanted="$name" '
    BEGIN { IGNORECASE=1 }
    $0 ~ "^" wanted ":" {
      sub(/^[^:]+:[[:space:]]*/, "", $0)
      sub(/\r$/, "", $0)
      value=$0
    }
    END { print value }
  ' "$file"
}

require_command docker
require_command curl
require_command sed
require_command awk
require_command grep
require_command wc
require_command od

[[ -f .env ]] || die "File .env tidak ditemukan di root project."
[[ -f docker-compose.yml ]] || die "docker-compose.yml tidak ditemukan di root project."
[[ -d backend ]] || die "Folder backend tidak ditemukan di root project."

DB_DATABASE_VALUE="${DB_DATABASE:-$(env_value DB_DATABASE)}"
DB_USERNAME_VALUE="${DB_USERNAME:-$(env_value DB_USERNAME)}"
DB_PASSWORD_VALUE="${DB_PASSWORD:-$(env_value DB_PASSWORD)}"
NGINX_PORT_VALUE="${NGINX_PORT:-$(env_value NGINX_PORT)}"
APP_URL_VALUE="${APP_URL:-$(env_value APP_URL)}"

DB_USERNAME_VALUE="${DB_USERNAME_VALUE:-root}"
NGINX_PORT_VALUE="${NGINX_PORT_VALUE:-8080}"
API_BASE="${API_BASE:-${APP_URL_VALUE:-http://localhost:${NGINX_PORT_VALUE}}}"
API_BASE="${API_BASE%/}"
LOGIN_USER="${LOGIN_USER:-admin.demo}"
LOGIN_PASSWORD="${LOGIN_PASSWORD:-Rajasa@123}"

[[ -n "$DB_DATABASE_VALUE" ]] || die "DB_DATABASE kosong di .env."

docker compose exec -T db true >/dev/null 2>&1 || die "Container db belum berjalan. Jalankan: docker compose up -d"
docker compose exec -T backend true >/dev/null 2>&1 || die "Container backend belum berjalan. Jalankan: docker compose up -d"

HEALTH_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "$API_BASE/api/health" || true)"
[[ "$HEALTH_CODE" == "200" ]] || die "Health endpoint gagal. URL=$API_BASE/api/health HTTP=$HEALTH_CODE"

TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
OUTPUT_HOST="backend/storage/test-export-full-day/$TIMESTAMP"
OUTPUT_CONTAINER="storage/test-export-full-day/$TIMESTAMP"
mkdir -p "$OUTPUT_HOST"

FILTER_SQL=""
if [[ -n "${TEST_DATE:-}" || -n "${ROMBEL_ID:-}" ]]; then
  [[ -n "${TEST_DATE:-}" && -n "${ROMBEL_ID:-}" ]] || die "TEST_DATE dan ROMBEL_ID wajib diisi bersamaan."
  [[ "$TEST_DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || die "Format TEST_DATE harus YYYY-MM-DD."
  [[ "$ROMBEL_ID" =~ ^[0-9]+$ ]] || die "ROMBEL_ID harus berupa angka."
  FILTER_SQL="AND a.tanggal = '${TEST_DATE}' AND a.rombel_id = ${ROMBEL_ID}"
fi

CANDIDATE_SQL="
WITH placement_roster AS (
  SELECT rombel_id, COUNT(DISTINCT siswa_id) AS total
  FROM penempatan_siswa_rombel
  WHERE is_aktif = 1
  GROUP BY rombel_id
),
fallback_roster AS (
  SELECT rombel_id_aktif AS rombel_id, COUNT(DISTINCT siswa_id) AS total
  FROM siswa
  WHERE status = 'aktif' AND rombel_id_aktif IS NOT NULL
  GROUP BY rombel_id_aktif
),
roster AS (
  SELECT
    r.rombel_id,
    COALESCE(NULLIF(pr.total, 0), fr.total, 0) AS expected_students
  FROM rombel r
  LEFT JOIN placement_roster pr ON pr.rombel_id = r.rombel_id
  LEFT JOIN fallback_roster fr ON fr.rombel_id = r.rombel_id
),
per_student AS (
  SELECT
    p.tanggal,
    p.rombel_id_snapshot AS rombel_id,
    p.siswa_id,
    COUNT(*) AS row_count,
    COUNT(DISTINCT j.jam_ke) AS hour_count,
    MIN(j.jam_ke) AS min_hour,
    MAX(j.jam_ke) AS max_hour
  FROM presensi_jam_siswa p
  JOIN jam_pembelajaran j ON j.jam_id = p.jam_id
  WHERE p.rombel_id_snapshot IS NOT NULL
  GROUP BY p.tanggal, p.rombel_id_snapshot, p.siswa_id
),
valid_students AS (
  SELECT tanggal, rombel_id, COUNT(*) AS valid_student_count
  FROM per_student
  WHERE row_count = 8
    AND hour_count = 8
    AND min_hour = 1
    AND max_hour = 8
  GROUP BY tanggal, rombel_id
),
attendance AS (
  SELECT
    p.tanggal,
    p.rombel_id_snapshot AS rombel_id,
    COUNT(*) AS row_count,
    COUNT(DISTINCT p.siswa_id) AS attendance_students,
    COUNT(DISTINCT j.jam_ke) AS hour_count,
    MIN(j.jam_ke) AS min_hour,
    MAX(j.jam_ke) AS max_hour,
    MAX(COALESCE(NULLIF(r.label_rombel, ''), NULLIF(s.kelas_aktif, ''), CONCAT('Rombel ', p.rombel_id_snapshot))) AS rombel_label
  FROM presensi_jam_siswa p
  JOIN siswa s ON s.siswa_id = p.siswa_id
  JOIN jam_pembelajaran j ON j.jam_id = p.jam_id
  LEFT JOIN rombel r ON r.rombel_id = p.rombel_id_snapshot
  WHERE p.rombel_id_snapshot IS NOT NULL
  GROUP BY p.tanggal, p.rombel_id_snapshot
)
SELECT
  a.tanggal,
  a.rombel_id,
  a.rombel_label,
  ro.expected_students,
  a.attendance_students,
  a.row_count
FROM attendance a
JOIN roster ro ON ro.rombel_id = a.rombel_id
JOIN valid_students vs
  ON vs.tanggal = a.tanggal
 AND vs.rombel_id = a.rombel_id
WHERE ro.expected_students > 0
  AND a.attendance_students = ro.expected_students
  AND vs.valid_student_count = ro.expected_students
  AND a.hour_count = 8
  AND a.min_hour = 1
  AND a.max_hour = 8
  AND a.row_count = ro.expected_students * 8
  $FILTER_SQL
ORDER BY a.tanggal DESC, a.rombel_id
LIMIT 1;
"

CANDIDATE="$(mysql_query "$CANDIDATE_SQL")"

if [[ -z "$CANDIDATE" ]]; then
  printf '\nTidak ditemukan data yang memenuhi prasyarat berikut:\n' >&2
  printf '1. Tepat 1 tanggal dan 1 rombel.\n' >&2
  printf '2. Jumlah siswa pada presensi sama dengan roster aktif.\n' >&2
  printf '3. Setiap siswa memiliki tepat 8 record.\n' >&2
  printf '4. Setiap siswa memiliki Jam ke-1 sampai Jam ke-8 tanpa jam yang hilang.\n\n' >&2

  printf 'Kandidat terdekat:\n' >&2
  mysql_query "
    SELECT
      p.tanggal,
      p.rombel_id_snapshot,
      COALESCE(NULLIF(r.label_rombel, ''), CONCAT('Rombel ', p.rombel_id_snapshot)) AS rombel,
      COUNT(DISTINCT p.siswa_id) AS siswa,
      COUNT(DISTINCT j.jam_ke) AS jumlah_jam,
      COUNT(*) AS jumlah_record
    FROM presensi_jam_siswa p
    JOIN jam_pembelajaran j ON j.jam_id = p.jam_id
    LEFT JOIN rombel r ON r.rombel_id = p.rombel_id_snapshot
    WHERE p.rombel_id_snapshot IS NOT NULL
    GROUP BY p.tanggal, p.rombel_id_snapshot, r.label_rombel
    ORDER BY p.tanggal DESC, jumlah_jam DESC, jumlah_record DESC
    LIMIT 10;
  " >&2 || true

  die "Buat atau pilih satu rombel dengan presensi lengkap 8 jam, lalu jalankan ulang."
fi

IFS=$'\t' read -r TARGET_DATE TARGET_ROMBEL_ID TARGET_ROMBEL_LABEL EXPECTED_STUDENTS ACTUAL_STUDENTS EXPECTED_ROWS <<< "$CANDIDATE"

printf '=== Full-Day Rombel Export Audit ===\n'
printf 'Project root     : %s\n' "$PROJECT_ROOT"
printf 'API base         : %s\n' "$API_BASE"
printf 'Tanggal          : %s\n' "$TARGET_DATE"
printf 'Rombel ID        : %s\n' "$TARGET_ROMBEL_ID"
printf 'Rombel           : %s\n' "$TARGET_ROMBEL_LABEL"
printf 'Siswa roster     : %s\n' "$EXPECTED_STUDENTS"
printf 'Expected records : %s (%s siswa x 8 jam)\n' "$EXPECTED_ROWS" "$EXPECTED_STUDENTS"
printf 'Output           : %s\n\n' "$OUTPUT_HOST"

[[ "$ACTUAL_STUDENTS" == "$EXPECTED_STUDENTS" ]] && pass "Jumlah siswa presensi sama dengan roster aktif: $EXPECTED_STUDENTS" || fail "Siswa presensi=$ACTUAL_STUDENTS, roster=$EXPECTED_STUDENTS"
[[ "$EXPECTED_ROWS" == $((EXPECTED_STUDENTS * 8)) ]] && pass "Database lengkap: $EXPECTED_ROWS record untuk 8 jam" || fail "Jumlah record database tidak sama dengan siswa x 8"

SUMMARY_LINE="$(mysql_query "
SELECT
  SUM(status = 'hadir'),
  SUM(status = 'terlambat'),
  SUM(status = 'izin'),
  SUM(status = 'sakit'),
  SUM(status = 'alpha'),
  COUNT(*)
FROM presensi_jam_siswa
WHERE tanggal = '${TARGET_DATE}'
  AND rombel_id_snapshot = ${TARGET_ROMBEL_ID};
")"
IFS=$'\t' read -r EXPECTED_HADIR EXPECTED_TERLAMBAT EXPECTED_IZIN EXPECTED_SAKIT EXPECTED_ALPHA DB_TOTAL <<< "$SUMMARY_LINE"

[[ "$DB_TOTAL" == "$EXPECTED_ROWS" ]] && pass "DB summary total=$DB_TOTAL" || fail "DB summary total=$DB_TOTAL, expected=$EXPECTED_ROWS"

LOGIN_PAYLOAD="$(docker compose exec -T backend php -r 'echo json_encode(["username" => $argv[1], "password" => $argv[2]], JSON_UNESCAPED_SLASHES);' "$LOGIN_USER" "$LOGIN_PASSWORD" | tr -d '\r')"
LOGIN_CODE="$(curl -sS -o "$OUTPUT_HOST/login.json" -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -X POST "$API_BASE/api/auth/login" \
  --data "$LOGIN_PAYLOAD" || true)"

[[ "$LOGIN_CODE" == "200" ]] || die "Login gagal. HTTP=$LOGIN_CODE. Cek $OUTPUT_HOST/login.json"

TOKEN="$(docker compose exec -T -e LOGIN_FILE="$OUTPUT_CONTAINER/login.json" backend php <<'PHP' | tr -d '\r'
<?php
$data = json_decode((string) file_get_contents((string) getenv('LOGIN_FILE')), true);
echo (string) ($data['data']['token'] ?? '');
PHP
)"
[[ -n "$TOKEN" ]] || die "Token tidak ditemukan pada response login."
pass "Login dan token Bearer berhasil"

HAS_PERMISSION="$(docker compose exec -T -e LOGIN_FILE="$OUTPUT_CONTAINER/login.json" backend php <<'PHP' | tr -d '\r'
<?php
$data = json_decode((string) file_get_contents((string) getenv('LOGIN_FILE')), true);
$permissions = $data['data']['permissions'] ?? [];
echo in_array('reports.attendance.export', $permissions, true) ? '1' : '0';
PHP
)"
[[ "$HAS_PERMISSION" == "1" ]] || die "Akun $LOGIN_USER tidak memiliki permission reports.attendance.export."
pass "Permission reports.attendance.export tersedia"

REPORT_CODE="$(curl -sS \
  --get "$API_BASE/api/reports/presensi" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/json' \
  -o "$OUTPUT_HOST/report.json" \
  -w '%{http_code}' \
  --data-urlencode "date_from=$TARGET_DATE" \
  --data-urlencode "date_to=$TARGET_DATE" \
  --data-urlencode "rombel_id=$TARGET_ROMBEL_ID" \
  --data-urlencode 'page=1' \
  --data-urlencode 'per_page=1000' || true)"

[[ "$REPORT_CODE" == "200" ]] && pass "Report API HTTP 200" || fail "Report API HTTP $REPORT_CODE"

if docker compose exec -T \
  -e REPORT_FILE="$OUTPUT_CONTAINER/report.json" \
  -e EXPECTED_DATE="$TARGET_DATE" \
  -e EXPECTED_ROMBEL="$TARGET_ROMBEL_LABEL" \
  -e EXPECTED_STUDENTS="$EXPECTED_STUDENTS" \
  -e EXPECTED_ROWS="$EXPECTED_ROWS" \
  -e EXPECTED_HADIR="$EXPECTED_HADIR" \
  -e EXPECTED_TERLAMBAT="$EXPECTED_TERLAMBAT" \
  -e EXPECTED_IZIN="$EXPECTED_IZIN" \
  -e EXPECTED_SAKIT="$EXPECTED_SAKIT" \
  -e EXPECTED_ALPHA="$EXPECTED_ALPHA" \
  backend php <<'PHP'
<?php
$file = (string) getenv('REPORT_FILE');
$data = json_decode((string) file_get_contents($file), true);
if (!is_array($data) || ($data['success'] ?? false) !== true) {
    file_put_contents('php://stderr', "Response report bukan success JSON.\n");
    exit(1);
}

$report = $data['data'] ?? [];
$items = $report['items'] ?? [];
$summary = $report['summary'] ?? [];
$expectedRows = (int) getenv('EXPECTED_ROWS');
$expectedStudents = (int) getenv('EXPECTED_STUDENTS');
$expectedDate = (string) getenv('EXPECTED_DATE');
$expectedRombel = (string) getenv('EXPECTED_ROMBEL');

if (count($items) !== $expectedRows) {
    file_put_contents('php://stderr', "items=" . count($items) . ", expected=$expectedRows\n");
    exit(1);
}
if ((int) ($summary['total'] ?? -1) !== $expectedRows) {
    file_put_contents('php://stderr', "summary.total tidak cocok.\n");
    exit(1);
}
if ((int) (($report['pagination']['total'] ?? -1)) !== $expectedRows) {
    file_put_contents('php://stderr', "pagination.total tidak cocok.\n");
    exit(1);
}

$expectedSummary = [
    'hadir' => (int) getenv('EXPECTED_HADIR'),
    'terlambat' => (int) getenv('EXPECTED_TERLAMBAT'),
    'izin' => (int) getenv('EXPECTED_IZIN'),
    'sakit' => (int) getenv('EXPECTED_SAKIT'),
    'alpha' => (int) getenv('EXPECTED_ALPHA'),
];
foreach ($expectedSummary as $status => $count) {
    if ((int) ($summary[$status] ?? -1) !== $count) {
        file_put_contents('php://stderr', "Summary $status tidak cocok.\n");
        exit(1);
    }
}

$students = [];
foreach ($items as $row) {
    if ((string) ($row['tanggal'] ?? '') !== $expectedDate) {
        file_put_contents('php://stderr', "Ada tanggal di luar filter.\n");
        exit(1);
    }
    if ((string) ($row['rombel'] ?? '') !== $expectedRombel) {
        file_put_contents('php://stderr', "Ada rombel di luar target: " . ($row['rombel'] ?? '') . "\n");
        exit(1);
    }
    $nisn = (string) ($row['nisn'] ?? '');
    $jam = (int) ($row['jam_ke'] ?? 0);
    if ($nisn === '' || $jam < 1 || $jam > 8) {
        file_put_contents('php://stderr', "NISN atau jam tidak valid.\n");
        exit(1);
    }
    $students[$nisn][$jam] = true;
}

if (count($students) !== $expectedStudents) {
    file_put_contents('php://stderr', "Jumlah siswa unik tidak cocok.\n");
    exit(1);
}
foreach ($students as $nisn => $hours) {
    $actual = array_keys($hours);
    sort($actual);
    if ($actual !== range(1, 8)) {
        file_put_contents('php://stderr', "Jam tidak lengkap untuk NISN $nisn.\n");
        exit(1);
    }
}
PHP
then
  pass "Report API tepat 1 rombel, 1 tanggal, dan setiap siswa memiliki Jam 1-8"
else
  fail "Isi Report API tidak sama dengan database"
fi

for FORMAT in csv xlsx pdf docx; do
  FILE_HOST="$OUTPUT_HOST/laporan-presensi.$FORMAT"
  FILE_CONTAINER="$OUTPUT_CONTAINER/laporan-presensi.$FORMAT"
  HEADER_HOST="$OUTPUT_HOST/header-$FORMAT.txt"

  HTTP_CODE="$(curl -sS \
    --get "$API_BASE/api/reports/presensi/export" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Accept: */*' \
    -D "$HEADER_HOST" \
    -o "$FILE_HOST" \
    -w '%{http_code}' \
    --data-urlencode "date_from=$TARGET_DATE" \
    --data-urlencode "date_to=$TARGET_DATE" \
    --data-urlencode "rombel_id=$TARGET_ROMBEL_ID" \
    --data-urlencode "format=$FORMAT" || true)"

  if [[ "$HTTP_CODE" == "200" ]]; then
    pass "$FORMAT export HTTP 200"
  else
    fail "$FORMAT export HTTP $HTTP_CODE"
    continue
  fi

  FILE_SIZE="$(wc -c < "$FILE_HOST" | tr -d '[:space:]')"
  if [[ "$FILE_SIZE" =~ ^[0-9]+$ ]] && (( FILE_SIZE > 0 )); then
    pass "$FORMAT file tidak kosong, size=$FILE_SIZE"
  else
    fail "$FORMAT file kosong"
    continue
  fi

  CONTENT_DISPOSITION="$(header_value "$HEADER_HOST" 'Content-Disposition')"
  [[ "$CONTENT_DISPOSITION" == *"attachment"* && "$CONTENT_DISPOSITION" == *".$FORMAT"* ]] \
    && pass "$FORMAT Content-Disposition valid" \
    || fail "$FORMAT Content-Disposition tidak valid: $CONTENT_DISPOSITION"

  CONTENT_LENGTH="$(header_value "$HEADER_HOST" 'Content-Length')"
  [[ "$CONTENT_LENGTH" == "$FILE_SIZE" ]] \
    && pass "$FORMAT Content-Length cocok" \
    || fail "$FORMAT Content-Length=$CONTENT_LENGTH, file size=$FILE_SIZE"

  case "$FORMAT" in
    csv)
      MIME="$(header_value "$HEADER_HOST" 'Content-Type')"
      [[ "$MIME" == text/csv* ]] && pass "csv Content-Type valid" || fail "csv Content-Type=$MIME"

      if docker compose exec -T \
        -e EXPORT_FILE="$FILE_CONTAINER" \
        -e EXPECTED_DATE="$TARGET_DATE" \
        -e EXPECTED_ROMBEL="$TARGET_ROMBEL_LABEL" \
        -e EXPECTED_STUDENTS="$EXPECTED_STUDENTS" \
        -e EXPECTED_ROWS="$EXPECTED_ROWS" \
        -e EXPECTED_HADIR="$EXPECTED_HADIR" \
        -e EXPECTED_TERLAMBAT="$EXPECTED_TERLAMBAT" \
        -e EXPECTED_IZIN="$EXPECTED_IZIN" \
        -e EXPECTED_SAKIT="$EXPECTED_SAKIT" \
        -e EXPECTED_ALPHA="$EXPECTED_ALPHA" \
        backend php <<'PHP'
<?php
$file = (string) getenv('EXPORT_FILE');
$handle = fopen($file, 'rb');
if ($handle === false) {
    exit(1);
}
$bom = fread($handle, 3);
if ($bom !== "\xEF\xBB\xBF") {
    file_put_contents('php://stderr', "BOM CSV tidak valid.\n");
    exit(1);
}
$header = fgetcsv($handle);
$expectedHeader = ['Tanggal', 'Siswa', 'NISN', 'Rombel', 'Ruangan', 'Jam Masuk', 'Status'];
if ($header !== $expectedHeader) {
    file_put_contents('php://stderr', "Header CSV tidak cocok.\n");
    exit(1);
}

$expectedDate = (string) getenv('EXPECTED_DATE');
$expectedRombel = (string) getenv('EXPECTED_ROMBEL');
$students = [];
$statusCounts = ['hadir' => 0, 'terlambat' => 0, 'izin' => 0, 'sakit' => 0, 'alpha' => 0];
$rows = 0;
while (($row = fgetcsv($handle)) !== false) {
    if ($row === [null] || $row === []) {
        continue;
    }
    $rows++;
    if ((string) ($row[0] ?? '') !== $expectedDate || (string) ($row[3] ?? '') !== $expectedRombel) {
        file_put_contents('php://stderr', "CSV berisi tanggal atau rombel di luar target.\n");
        exit(1);
    }
    $nisn = (string) ($row[2] ?? '');
    $jam = (int) ($row[5] ?? 0);
    $status = strtolower((string) ($row[6] ?? ''));
    $students[$nisn][$jam] = true;
    if (!array_key_exists($status, $statusCounts)) {
        file_put_contents('php://stderr', "Status CSV tidak dikenal.\n");
        exit(1);
    }
    $statusCounts[$status]++;
}
fclose($handle);

if ($rows !== (int) getenv('EXPECTED_ROWS') || count($students) !== (int) getenv('EXPECTED_STUDENTS')) {
    file_put_contents('php://stderr', "Jumlah row atau siswa CSV tidak cocok.\n");
    exit(1);
}
foreach ($students as $nisn => $hours) {
    $actual = array_keys($hours);
    sort($actual);
    if ($actual !== range(1, 8)) {
        file_put_contents('php://stderr', "CSV: jam tidak lengkap untuk NISN $nisn.\n");
        exit(1);
    }
}
$expected = [
    'hadir' => (int) getenv('EXPECTED_HADIR'),
    'terlambat' => (int) getenv('EXPECTED_TERLAMBAT'),
    'izin' => (int) getenv('EXPECTED_IZIN'),
    'sakit' => (int) getenv('EXPECTED_SAKIT'),
    'alpha' => (int) getenv('EXPECTED_ALPHA'),
];
if ($statusCounts !== $expected) {
    file_put_contents('php://stderr', "Summary status CSV tidak cocok.\n");
    exit(1);
}
PHP
      then
        pass "csv isi tepat: $EXPECTED_ROWS baris, $EXPECTED_STUDENTS siswa, Jam 1-8"
      else
        fail "csv isi tidak sama dengan database"
      fi
      ;;

    xlsx)
      MIME="$(header_value "$HEADER_HOST" 'Content-Type')"
      [[ "$MIME" == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ]] \
        && pass "xlsx Content-Type valid" \
        || fail "xlsx Content-Type=$MIME"

      if docker compose exec -T \
        -e EXPORT_FILE="$FILE_CONTAINER" \
        -e EXPECTED_DATE="$TARGET_DATE" \
        -e EXPECTED_ROMBEL="$TARGET_ROMBEL_LABEL" \
        -e EXPECTED_STUDENTS="$EXPECTED_STUDENTS" \
        -e EXPECTED_ROWS="$EXPECTED_ROWS" \
        -e EXPECTED_HADIR="$EXPECTED_HADIR" \
        -e EXPECTED_TERLAMBAT="$EXPECTED_TERLAMBAT" \
        -e EXPECTED_IZIN="$EXPECTED_IZIN" \
        -e EXPECTED_SAKIT="$EXPECTED_SAKIT" \
        -e EXPECTED_ALPHA="$EXPECTED_ALPHA" \
        backend php <<'PHP'
<?php
require 'vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

$file = (string) getenv('EXPORT_FILE');
$spreadsheet = IOFactory::load($file);
$sheet = $spreadsheet->getSheetByName('Laporan Presensi');
$summarySheet = $spreadsheet->getSheetByName('Ringkasan');
if ($sheet === null || $summarySheet === null) {
    file_put_contents('php://stderr', "Sheet XLSX tidak lengkap.\n");
    exit(1);
}
$header = [];
for ($column = 1; $column <= 7; $column++) {
    $header[] = (string) $sheet->getCell([$column, 4])->getValue();
}
if ($header !== ['Tanggal', 'Siswa', 'NISN', 'Rombel', 'Ruangan', 'Jam Masuk', 'Status']) {
    file_put_contents('php://stderr', "Header XLSX tidak cocok.\n");
    exit(1);
}

$expectedDate = (string) getenv('EXPECTED_DATE');
$expectedRombel = (string) getenv('EXPECTED_ROMBEL');
$students = [];
$statusCounts = ['hadir' => 0, 'terlambat' => 0, 'izin' => 0, 'sakit' => 0, 'alpha' => 0];
$rows = 0;
for ($row = 5; $row <= $sheet->getHighestDataRow(); $row++) {
    $date = (string) $sheet->getCell([1, $row])->getFormattedValue();
    if ($date === '') {
        continue;
    }
    $rows++;
    $rombel = (string) $sheet->getCell([4, $row])->getValue();
    if ($date !== $expectedDate || $rombel !== $expectedRombel) {
        file_put_contents('php://stderr', "XLSX berisi tanggal atau rombel di luar target.\n");
        exit(1);
    }
    $nisn = (string) $sheet->getCell([3, $row])->getValue();
    $jam = (int) $sheet->getCell([6, $row])->getValue();
    $status = strtolower((string) $sheet->getCell([7, $row])->getValue());
    $students[$nisn][$jam] = true;
    if (!array_key_exists($status, $statusCounts)) {
        file_put_contents('php://stderr', "Status XLSX tidak dikenal.\n");
        exit(1);
    }
    $statusCounts[$status]++;
}

if ($rows !== (int) getenv('EXPECTED_ROWS') || count($students) !== (int) getenv('EXPECTED_STUDENTS')) {
    file_put_contents('php://stderr', "Jumlah row atau siswa XLSX tidak cocok.\n");
    exit(1);
}
foreach ($students as $nisn => $hours) {
    $actual = array_keys($hours);
    sort($actual);
    if ($actual !== range(1, 8)) {
        file_put_contents('php://stderr', "XLSX: jam tidak lengkap untuk NISN $nisn.\n");
        exit(1);
    }
}
$expected = [
    'hadir' => (int) getenv('EXPECTED_HADIR'),
    'terlambat' => (int) getenv('EXPECTED_TERLAMBAT'),
    'izin' => (int) getenv('EXPECTED_IZIN'),
    'sakit' => (int) getenv('EXPECTED_SAKIT'),
    'alpha' => (int) getenv('EXPECTED_ALPHA'),
];
if ($statusCounts !== $expected) {
    file_put_contents('php://stderr', "Summary status XLSX tidak cocok.\n");
    exit(1);
}

$summaryRows = [
    'hadir' => 4,
    'terlambat' => 5,
    'sakit' => 6,
    'izin' => 7,
    'alpha' => 8,
];
foreach ($summaryRows as $status => $row) {
    if ((int) $summarySheet->getCell([2, $row])->getValue() !== $expected[$status]) {
        file_put_contents('php://stderr', "Sheet Ringkasan XLSX tidak cocok untuk $status.\n");
        exit(1);
    }
}
if ((int) $summarySheet->getCell([2, 9])->getValue() !== (int) getenv('EXPECTED_ROWS')) {
    file_put_contents('php://stderr', "Total sheet Ringkasan XLSX tidak cocok.\n");
    exit(1);
}
PHP
      then
        pass "xlsx isi dan sheet Ringkasan sama dengan database"
      else
        fail "xlsx isi tidak sama dengan database"
      fi
      ;;

    pdf)
      MIME="$(header_value "$HEADER_HOST" 'Content-Type')"
      [[ "$MIME" == 'application/pdf' ]] && pass "pdf Content-Type valid" || fail "pdf Content-Type=$MIME"
      SIGNATURE="$(od -An -N5 -c "$FILE_HOST" | tr -d ' \n')"
      [[ "$SIGNATURE" == '%PDF-' ]] && pass "pdf signature valid" || fail "pdf signature tidak valid"

      if command -v pdftotext >/dev/null 2>&1; then
        pdftotext -layout "$FILE_HOST" "$OUTPUT_HOST/laporan-presensi-pdf.txt"
        if grep -Fq "Periode: $TARGET_DATE" "$OUTPUT_HOST/laporan-presensi-pdf.txt" \
          && grep -Fq "$TARGET_ROMBEL_LABEL" "$OUTPUT_HOST/laporan-presensi-pdf.txt"; then
          pass "pdf teks memuat periode dan rombel target"
        else
          fail "pdf teks tidak memuat periode atau rombel target"
        fi
      else
        warn "pdftotext tidak tersedia. PDF hanya divalidasi HTTP, MIME, ukuran, dan signature."
      fi
      ;;

    docx)
      MIME="$(header_value "$HEADER_HOST" 'Content-Type')"
      [[ "$MIME" == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ]] \
        && pass "docx Content-Type valid" \
        || fail "docx Content-Type=$MIME"

      if docker compose exec -T \
        -e EXPORT_FILE="$FILE_CONTAINER" \
        -e EXPECTED_DATE="$TARGET_DATE" \
        -e EXPECTED_ROMBEL="$TARGET_ROMBEL_LABEL" \
        -e EXPECTED_STUDENTS="$EXPECTED_STUDENTS" \
        backend php <<'PHP'
<?php
$file = (string) getenv('EXPORT_FILE');
$zip = new ZipArchive();
if ($zip->open($file) !== true) {
    file_put_contents('php://stderr', "DOCX bukan ZIP valid.\n");
    exit(1);
}
$xml = $zip->getFromName('word/document.xml');
$zip->close();
if (!is_string($xml) || $xml === '') {
    file_put_contents('php://stderr', "word/document.xml tidak tersedia.\n");
    exit(1);
}

$dom = new DOMDocument();
$dom->loadXML($xml);
$xpath = new DOMXPath($dom);
$xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

$allText = '';
foreach ($xpath->query('//w:t') as $node) {
    $allText .= $node->textContent . "\n";
}
$expectedDate = (string) getenv('EXPECTED_DATE');
$expectedRombel = (string) getenv('EXPECTED_ROMBEL');
$expectedStudents = (int) getenv('EXPECTED_STUDENTS');

if (!str_contains($allText, 'Periode: ' . $expectedDate)) {
    file_put_contents('php://stderr', "Periode DOCX tidak sama dengan filter.\n");
    exit(1);
}
if (!str_contains($allText, $expectedRombel)) {
    file_put_contents('php://stderr', "Rombel DOCX tidak memuat target.\n");
    exit(1);
}
if (!str_contains($allText, 'Jam Pelajaran') || !str_contains($allText, 'Hadir') || !str_contains($allText, 'Tidak Hadir')) {
    file_put_contents('php://stderr', "Header compact DOCX belum sesuai.\n");
    exit(1);
}

$dataRows = 0;
$invalidKehadiranRows = 0;
$invalidTidakHadirRows = 0;
$invalidStatusRows = 0;

foreach ($xpath->query('//w:tr') as $row) {
    $cells = [];
    foreach ($xpath->query('./w:tc', $row) as $cell) {
        $cellText = '';
        foreach ($xpath->query('.//w:t', $cell) as $textNode) {
            $cellText .= $textNode->textContent;
        }
        $cells[] = trim((string) preg_replace('/\s+/', ' ', $cellText));
    }

    if (($cells[1] ?? '') === $expectedDate && ($cells[4] ?? '') === $expectedRombel) {
        $dataRows++;

        if (!preg_match('/^8\s*\/\s*8\s*Jam$/i', (string) ($cells[5] ?? ''))) {
            $invalidKehadiranRows++;
        }

        if ((string) ($cells[6] ?? '') !== '-') {
            $invalidTidakHadirRows++;
        }

        if ((string) ($cells[7] ?? '') !== 'Hadir') {
            $invalidStatusRows++;
        }
    }
}

if ($dataRows !== $expectedStudents) {
    file_put_contents('php://stderr', "Data row compact DOCX=$dataRows, expected siswa=$expectedStudents\n");
    exit(1);
}
if ($invalidKehadiranRows > 0) {
    file_put_contents('php://stderr', "DOCX memiliki $invalidKehadiranRows row tanpa Kehadiran 8/8 Jam.\n");
    exit(1);
}
if ($invalidTidakHadirRows > 0) {
    file_put_contents('php://stderr', "DOCX memiliki $invalidTidakHadirRows row dengan Jam Pelajaran Tidak Hadir bukan '-'.\n");
    exit(1);
}
if ($invalidStatusRows > 0) {
    file_put_contents('php://stderr', "DOCX memiliki $invalidStatusRows row dengan Status bukan Hadir.\n");
    exit(1);
}
PHP
      then
        pass "docx compact tepat: periode, rombel, $EXPECTED_STUDENTS siswa, Kehadiran 8/8 Jam"
      else
        fail "docx compact tidak sama dengan filter/database"
      fi
      ;;
  esac
done

printf '\n=== RESULT ===\n'
printf 'PASS   : %s\n' "$PASS_COUNT"
printf 'FAIL   : %s\n' "$FAIL_COUNT"
printf 'WARN   : %s\n' "$WARN_COUNT"
printf 'OUTPUT : %s\n' "$OUTPUT_HOST"

if (( FAIL_COUNT > 0 )); then
  printf 'STATUS : FAILED\n'
  exit 1
fi

printf 'STATUS : PASSED\n'
