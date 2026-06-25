#!/usr/bin/env bash
set -uo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/../docker-compose.yml" ]]; then
  PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
elif [[ -f "$SCRIPT_DIR/docker-compose.yml" ]]; then
  PROJECT_ROOT="$SCRIPT_DIR"
else
  echo "[FATAL] docker-compose.yml tidak ditemukan. Jalankan file dari root project atau folder scripts/."
  exit 2
fi
cd "$PROJECT_ROOT"

ENV_FILE="${ENV_FILE:-$PROJECT_ROOT/.env}"
read_env() {
  local key="$1"
  [[ -f "$ENV_FILE" ]] || return 0
  awk -v wanted="$key" '
    index($0, wanted "=") == 1 {
      value = substr($0, length(wanted) + 2)
      gsub(/\r$/, "", value)
      gsub(/^"|"$/, "", value)
      print value
      exit
    }
  ' "$ENV_FILE"
}

APP_URL="${APP_URL:-$(read_env APP_URL)}"
APP_URL="${APP_URL:-http://localhost:8080}"
APP_URL="${APP_URL%/}"

USERNAME="${EXPORT_TEST_USERNAME:-admin.demo}"
PASSWORD="${EXPORT_TEST_PASSWORD:-Rajasa@123}"
AUTO_START="${AUTO_START:-1}"
RUN_PHPUNIT="${RUN_PHPUNIT:-1}"

DB_USERNAME="${DB_USERNAME:-$(read_env DB_USERNAME)}"
DB_USERNAME="${DB_USERNAME:-root}"
DB_PASSWORD="${DB_PASSWORD:-$(read_env DB_PASSWORD)}"
DB_DATABASE="${DB_DATABASE:-$(read_env DB_DATABASE)}"
DB_DATABASE="${DB_DATABASE:-sistem_presensi_siswa_qr}"

STATUS_FILTER="${STATUS_FILTER:-}"
ROMBEL_ID="${ROMBEL_ID:-}"
JAM_KE="${JAM_KE:-}"
MODE_FILTER="${MODE_FILTER:-}"

RUN_ID="$(TZ=Asia/Jakarta date +%Y%m%d_%H%M%S)"
OUTPUT_REL="storage/test-export/$RUN_ID"
OUTPUT_HOST="$PROJECT_ROOT/backend/$OUTPUT_REL"
mkdir -p "$OUTPUT_HOST"

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf '[PASS] %s\n' "$1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf '[FAIL] %s\n' "$1"
}

fatal() {
  printf '[FATAL] %s\n' "$1"
  exit 2
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fatal "Command wajib tidak tersedia: $1"
}

json_value() {
  local path="$1"
  docker compose exec -T backend php -r '
    $path = explode(".", $argv[1]);
    $data = json_decode(stream_get_contents(STDIN), true);
    if (!is_array($data)) { exit(3); }
    $value = $data;
    foreach ($path as $segment) {
      if (!is_array($value) || !array_key_exists($segment, $value)) { exit(4); }
      $value = $value[$segment];
    }
    if (is_bool($value)) { echo $value ? "true" : "false"; }
    elseif (is_scalar($value)) { echo (string) $value; }
    else { echo json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); }
  ' "$path"
}

header_value() {
  local file="$1"
  local name="$2"
  grep -i "^${name}:" "$file" | tail -n 1 | cut -d: -f2- | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

mysql_scalar() {
  local sql="$1"
  docker compose exec -T -e MYSQL_PWD="$DB_PASSWORD" db \
    mysql --batch --skip-column-names -u "$DB_USERNAME" "$DB_DATABASE" -e "$sql" 2>/dev/null \
    | tr -d '\r' | tail -n 1
}

validate_date() {
  [[ "$1" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || fatal "Format tanggal tidak valid: $1"
}

require_command curl
require_command docker
require_command unzip
require_command od

docker compose version >/dev/null 2>&1 || fatal "Docker Compose tidak tersedia."

HEALTH_URL="$APP_URL/api/health"
LOGIN_URL="$APP_URL/api/auth/login"
REPORT_URL="$APP_URL/api/reports/presensi"
EXPORT_URL="$APP_URL/api/reports/presensi/export"

printf '%s\n' '=== Attendance Report Export Audit ==='
printf 'Project root : %s\n' "$PROJECT_ROOT"
printf 'API base     : %s\n' "$APP_URL"
printf 'Output       : %s\n' "$OUTPUT_HOST"

health_status="$(curl -sS -o "$OUTPUT_HOST/health.json" -w '%{http_code}' "$HEALTH_URL" 2>"$OUTPUT_HOST/health.stderr" || true)"
if [[ "$health_status" != "200" && "$AUTO_START" == "1" ]]; then
  echo '[INFO] Service belum sehat. Menjalankan db, backend, dan nginx...'
  docker compose up -d db backend nginx >"$OUTPUT_HOST/docker-up.log" 2>&1 || fatal "Gagal menjalankan service. Lihat $OUTPUT_HOST/docker-up.log"

  health_status=""
  for _ in $(seq 1 60); do
    health_status="$(curl -sS -o "$OUTPUT_HOST/health.json" -w '%{http_code}' "$HEALTH_URL" 2>"$OUTPUT_HOST/health.stderr" || true)"
    [[ "$health_status" == "200" ]] && break
    sleep 1
  done
fi

if [[ "$health_status" == "200" ]]; then
  pass "Health endpoint HTTP 200"
else
  fatal "Health endpoint gagal. HTTP=${health_status:-000}. Lihat $OUTPUT_HOST/health.stderr dan docker compose logs backend nginx"
fi

if [[ "$RUN_PHPUNIT" == "1" ]]; then
  if docker compose exec -T backend test -x vendor/bin/phpunit; then
    if docker compose exec -T backend vendor/bin/phpunit --testsuite Unit >"$OUTPUT_HOST/phpunit-unit.log" 2>&1; then
      pass "PHPUnit Unit suite"
    else
      fail "PHPUnit Unit suite. Lihat $OUTPUT_HOST/phpunit-unit.log"
    fi

    if docker compose exec -T backend vendor/bin/phpunit --filter AttendanceReportExportTest >"$OUTPUT_HOST/phpunit-export-feature.log" 2>&1; then
      pass "PHPUnit AttendanceReportExportTest"
    else
      fail "PHPUnit AttendanceReportExportTest. Lihat $OUTPUT_HOST/phpunit-export-feature.log"
    fi
  else
    fail "vendor/bin/phpunit tidak tersedia di container backend"
  fi
else
  echo '[SKIP] PHPUnit dinonaktifkan dengan RUN_PHPUNIT=0'
fi

DB_TOTAL="$(mysql_scalar 'SELECT COUNT(*) FROM presensi_jam_siswa;' || true)"
LATEST_DATE="$(mysql_scalar "SELECT COALESCE(DATE_FORMAT(MAX(tanggal), '%Y-%m-%d'), '') FROM presensi_jam_siswa;" || true)"

if [[ ! "$DB_TOTAL" =~ ^[0-9]+$ ]]; then
  fatal "Query database gagal. Pastikan service db hidup dan kredensial .env benar."
fi
pass "Query database presensi_jam_siswa berhasil, total=$DB_TOTAL"

TODAY="$(TZ=Asia/Jakarta date +%Y-%m-%d)"
DATE_FROM="${DATE_FROM:-${LATEST_DATE:-$TODAY}}"
DATE_TO="${DATE_TO:-$DATE_FROM}"
validate_date "$DATE_FROM"
validate_date "$DATE_TO"

[[ -z "$ROMBEL_ID" || "$ROMBEL_ID" =~ ^[0-9]+$ ]] || fatal "ROMBEL_ID harus numerik."
[[ -z "$JAM_KE" || "$JAM_KE" =~ ^[1-8]$ ]] || fatal "JAM_KE harus 1 sampai 8."
[[ -z "$STATUS_FILTER" || "$STATUS_FILTER" =~ ^(hadir|terlambat|izin|sakit|alpha)$ ]] || fatal "STATUS_FILTER tidak valid."
[[ -z "$MODE_FILTER" || "$MODE_FILTER" =~ ^(rombel|piket|manual)$ ]] || fatal "MODE_FILTER tidak valid."

SQL_WHERE="tanggal BETWEEN '$DATE_FROM' AND '$DATE_TO'"
[[ -n "$ROMBEL_ID" ]] && SQL_WHERE+=" AND rombel_id_snapshot = $ROMBEL_ID"
[[ -n "$JAM_KE" ]] && SQL_WHERE+=" AND jam_id IN (SELECT jam_id FROM jam_pembelajaran WHERE jam_ke = $JAM_KE)"
[[ -n "$STATUS_FILTER" ]] && SQL_WHERE+=" AND status = '$STATUS_FILTER'"
[[ -n "$MODE_FILTER" ]] && SQL_WHERE+=" AND mode_presensi = '$MODE_FILTER'"
DB_FILTERED_TOTAL="$(mysql_scalar "SELECT COUNT(*) FROM presensi_jam_siswa WHERE $SQL_WHERE;" || true)"
[[ "$DB_FILTERED_TOTAL" =~ ^[0-9]+$ ]] || fatal "Query total terfilter gagal."

printf 'Test period   : %s s/d %s\n' "$DATE_FROM" "$DATE_TO"
printf 'Expected rows : %s\n' "$DB_FILTERED_TOTAL"

LOGIN_STATUS="$(curl -sS -o "$OUTPUT_HOST/login.json" -w '%{http_code}' \
  -X POST "$LOGIN_URL" \
  -H 'Content-Type: application/json' \
  --data "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" \
  2>"$OUTPUT_HOST/login.stderr" || true)"

if [[ "$LOGIN_STATUS" != "200" ]]; then
  fatal "Login gagal. HTTP=$LOGIN_STATUS. Lihat $OUTPUT_HOST/login.json"
fi
TOKEN="$(json_value 'data.token' <"$OUTPUT_HOST/login.json" 2>/dev/null || true)"
[[ -n "$TOKEN" ]] || fatal "Login HTTP 200 tetapi token kosong."
pass "Login dan token Bearer"

if grep -q 'reports.attendance.export' "$OUTPUT_HOST/login.json"; then
  pass "Permission reports.attendance.export tersedia"
else
  fail "Permission reports.attendance.export tidak ditemukan pada response login"
fi

QUERY_ARGS=(
  --data-urlencode "date_from=$DATE_FROM"
  --data-urlencode "date_to=$DATE_TO"
  --data-urlencode 'per_page=0'
)
[[ -n "$ROMBEL_ID" ]] && QUERY_ARGS+=(--data-urlencode "rombel_id=$ROMBEL_ID")
[[ -n "$JAM_KE" ]] && QUERY_ARGS+=(--data-urlencode "jam_ke=$JAM_KE")
[[ -n "$STATUS_FILTER" ]] && QUERY_ARGS+=(--data-urlencode "status=$STATUS_FILTER")
[[ -n "$MODE_FILTER" ]] && QUERY_ARGS+=(--data-urlencode "mode=$MODE_FILTER")

REPORT_STATUS="$(curl -sS -G -o "$OUTPUT_HOST/report.json" -w '%{http_code}' \
  "$REPORT_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/json' \
  "${QUERY_ARGS[@]}" \
  2>"$OUTPUT_HOST/report.stderr" || true)"

if [[ "$REPORT_STATUS" == "200" ]]; then
  pass "Report API HTTP 200"
else
  fail "Report API HTTP $REPORT_STATUS. Lihat $OUTPUT_HOST/report.json"
fi

API_TOTAL="$(json_value 'data.summary.total' <"$OUTPUT_HOST/report.json" 2>/dev/null || true)"
if [[ "$API_TOTAL" == "$DB_FILTERED_TOTAL" ]]; then
  pass "API summary.total sama dengan database, total=$API_TOTAL"
else
  fail "API total=$API_TOTAL berbeda dari database=$DB_FILTERED_TOTAL"
fi

formats=(csv xlsx pdf docx)
for format in "${formats[@]}"; do
  file="$OUTPUT_HOST/laporan-presensi.$format"
  headers="$OUTPUT_HOST/header-$format.txt"
  stderr="$OUTPUT_HOST/export-$format.stderr"

  status="$(curl -sS -G -L -o "$file" -D "$headers" -w '%{http_code}' \
    "$EXPORT_URL" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Accept: */*' \
    "${QUERY_ARGS[@]}" \
    --data-urlencode "format=$format" \
    2>"$stderr" || true)"

  if [[ "$status" == "200" ]]; then
    pass "$format HTTP 200"
  else
    fail "$format HTTP $status. Lihat $file dan $stderr"
    continue
  fi

  size="$(wc -c <"$file" | tr -d ' ')"
  if [[ "$size" =~ ^[0-9]+$ && "$size" -gt 0 ]]; then
    pass "$format file tidak kosong, size=$size"
  else
    fail "$format file kosong"
  fi

  content_type="$(header_value "$headers" 'Content-Type')"
  disposition="$(header_value "$headers" 'Content-Disposition')"
  content_length="$(header_value "$headers" 'Content-Length')"

  case "$format" in
    csv)
      expected_type='text/csv'
      signature="$(od -An -tx1 -N3 "$file" | tr -d ' \n')"
      [[ "$signature" == 'efbbbf' ]] && pass 'csv UTF-8 BOM valid' || fail "csv BOM invalid: $signature"
      grep -q 'Tanggal.*Siswa.*NISN.*Rombel.*Ruangan.*Jam Masuk.*Status' "$file" \
        && pass 'csv header valid' || fail 'csv header tidak valid'

      CSV_ROWS="$(docker compose exec -T backend php -r '
        $file = new SplFileObject($argv[1]);
        $file->setFlags(SplFileObject::READ_CSV | SplFileObject::SKIP_EMPTY);
        $rows = 0;
        foreach ($file as $row) {
          if ($row === false || $row === [null]) { continue; }
          $rows++;
        }
        echo max(0, $rows - 1);
      ' "$OUTPUT_REL/laporan-presensi.csv" 2>/dev/null || true)"
      if [[ "$CSV_ROWS" == "$DB_FILTERED_TOTAL" ]]; then
        pass "csv data rows sama dengan database, total=$CSV_ROWS"
      else
        fail "csv rows=$CSV_ROWS berbeda dari database=$DB_FILTERED_TOTAL"
      fi
      ;;
    xlsx)
      expected_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      signature="$(od -An -tx1 -N2 "$file" | tr -d ' \n')"
      [[ "$signature" == '504b' ]] && pass 'xlsx ZIP signature valid' || fail "xlsx signature invalid: $signature"
      unzip -tqq "$file" >/dev/null 2>&1 && pass 'xlsx ZIP structure valid' || fail 'xlsx ZIP rusak'
      unzip -Z1 "$file" | grep -qx 'xl/workbook.xml' && pass 'xlsx workbook.xml tersedia' || fail 'xlsx workbook.xml tidak ada'
      ;;
    pdf)
      expected_type='application/pdf'
      signature="$(head -c 5 "$file" 2>/dev/null || true)"
      [[ "$signature" == '%PDF-' ]] && pass 'pdf signature valid' || fail "pdf signature invalid: $signature"
      ;;
    docx)
      expected_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      signature="$(od -An -tx1 -N2 "$file" | tr -d ' \n')"
      [[ "$signature" == '504b' ]] && pass 'docx ZIP signature valid' || fail "docx signature invalid: $signature"
      unzip -tqq "$file" >/dev/null 2>&1 && pass 'docx ZIP structure valid' || fail 'docx ZIP rusak'
      unzip -Z1 "$file" | grep -qx 'word/document.xml' && pass 'docx document.xml tersedia' || fail 'docx document.xml tidak ada'
      ;;
  esac

  [[ "$content_type" == "$expected_type"* ]] \
    && pass "$format Content-Type valid" \
    || fail "$format Content-Type salah: $content_type"

  [[ "$disposition" == *"attachment;"* && "$disposition" == *".$format"* ]] \
    && pass "$format Content-Disposition valid" \
    || fail "$format Content-Disposition salah: $disposition"

  if [[ -n "$content_length" && "$content_length" == "$size" ]]; then
    pass "$format Content-Length cocok"
  else
    fail "$format Content-Length=$content_length, actual=$size"
  fi
done

NO_TOKEN_STATUS="$(curl -sS -G -o "$OUTPUT_HOST/no-token.json" -w '%{http_code}' \
  "$EXPORT_URL" --data-urlencode 'format=csv' 2>/dev/null || true)"
[[ "$NO_TOKEN_STATUS" == '401' ]] \
  && pass 'Export tanpa token ditolak 401' \
  || fail "Export tanpa token menghasilkan HTTP $NO_TOKEN_STATUS"

INVALID_STATUS="$(curl -sS -G -o "$OUTPUT_HOST/invalid-format.json" -w '%{http_code}' \
  "$EXPORT_URL" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode 'format=txt' 2>/dev/null || true)"
[[ "$INVALID_STATUS" == '400' ]] \
  && pass 'Format tidak didukung ditolak 400' \
  || fail "Format invalid menghasilkan HTTP $INVALID_STATUS"

printf '\n=== RESULT ===\n'
printf 'PASS   : %d\n' "$PASS_COUNT"
printf 'FAIL   : %d\n' "$FAIL_COUNT"
printf 'OUTPUT : %s\n' "$OUTPUT_HOST"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo 'STATUS : FAILED'
  exit 1
fi

echo 'STATUS : PASSED'
exit 0
