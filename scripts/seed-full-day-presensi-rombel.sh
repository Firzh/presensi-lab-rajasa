#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# Menyiapkan data presensi hadir 1 rombel untuk Jam ke-1 sampai Jam ke-8.
# Script menggunakan alur aplikasi nyata:
# login -> buat 3 sesi (1-3, 4-6, 7-8) -> scan QR seluruh siswa -> tutup sesi.
#
# Jalankan dari root project:
#   ROMBEL_LABEL="10 TKJ 2" ./scripts/seed-full-day-presensi-rombel.sh
#
# Alternatif berdasarkan ID:
#   ROMBEL_ID=7 ./scripts/seed-full-day-presensi-rombel.sh
#
# Jika target hari ini sudah memiliki data parsial dan memang boleh dihapus:
#   ROMBEL_LABEL="10 TKJ 2" RESET_TARGET=1 ./scripts/seed-full-day-presensi-rombel.sh
#
# Override opsional:
#   API_BASE=http://localhost:8080 LOGIN_USER=admin.demo LOGIN_PASSWORD='Rajasa@123' \
#   ROMBEL_LABEL="10 TKJ 2" ./scripts/seed-full-day-presensi-rombel.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

ROMBEL_LABEL="${ROMBEL_LABEL:-10 TKJ 2}"
ROMBEL_ID="${ROMBEL_ID:-}"
TIPE_HARI="${TIPE_HARI:-normal}"
RESET_TARGET="${RESET_TARGET:-0}"
KEEP_ON_FAILURE="${KEEP_ON_FAILURE:-0}"
LOGIN_USER="${LOGIN_USER:-admin.demo}"
LOGIN_PASSWORD="${LOGIN_PASSWORD:-Rajasa@123}"

SUCCESS=0
CREATED_SESSION_IDS=()

info() { printf '[INFO] %s\n' "$1"; }
pass() { printf '[PASS] %s\n' "$1"; }
warn() { printf '[WARN] %s\n' "$1"; }
die() { printf '[PREREQUISITE FAILED] %s\n' "$1" >&2; exit 2; }

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Command '$1' tidak tersedia."
}

env_value() {
  local key="$1"
  sed -n "s/^${key}=//p" .env | tail -n 1 | tr -d '\r'
}

sql_escape() {
  printf '%s' "$1" | sed "s/'/''/g"
}

mysql_query() {
  local sql="$1"
  docker compose exec -T \
    -e MYSQL_PWD="$DB_PASSWORD_VALUE" \
    db mysql -u"$DB_USERNAME_VALUE" "$DB_DATABASE_VALUE" -N -B -e "$sql" | tr -d '\r'
}

json_payload() {
  local type="$1"
  shift

  case "$type" in
    login)
      docker compose exec -T backend php -r '
        echo json_encode([
          "username" => $argv[1],
          "password" => $argv[2],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
      ' "$1" "$2" | tr -d '\r'
      ;;
    session)
      docker compose exec -T backend php -r '
        $jamIds = array_map("intval", explode(",", $argv[2]));
        echo json_encode([
          "mode_presensi" => "rombel",
          "rombel_id" => (int) $argv[1],
          "jam_ids" => $jamIds,
          "ruang_pilihan" => "kelas",
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
      ' "$1" "$2" | tr -d '\r'
      ;;
    scan)
      docker compose exec -T backend php -r '
        $payloadRaw = hex2bin($argv[2]);
        if ($payloadRaw === false) {
          fwrite(STDERR, "Payload QR HEX tidak valid.\n");
          exit(1);
        }
        echo json_encode([
          "presensi_sesi_id" => (int) $argv[1],
          "payload_raw" => $payloadRaw,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
      ' "$1" "$2" | tr -d '\r'
      ;;
    *)
      die "Jenis JSON payload tidak dikenal: $type"
      ;;
  esac
}

parse_login() {
  local file_container="$1"
  docker compose exec -T -e JSON_FILE="$file_container" backend php <<'PHP' | tr -d '\r'
<?php
$data = json_decode((string) file_get_contents((string) getenv('JSON_FILE')), true);
if (!is_array($data) || ($data['success'] ?? false) !== true) {
    exit(1);
}
$permissions = $data['data']['permissions'] ?? [];
echo (string) ($data['data']['token'] ?? ''), "\t", implode(',', is_array($permissions) ? $permissions : []);
PHP
}

parse_session_id() {
  local file_container="$1"
  docker compose exec -T -e JSON_FILE="$file_container" backend php <<'PHP' | tr -d '\r'
<?php
$data = json_decode((string) file_get_contents((string) getenv('JSON_FILE')), true);
if (!is_array($data) || ($data['success'] ?? false) !== true) {
    exit(1);
}
$id = (int) ($data['data']['session']['presensi_sesi_id'] ?? 0);
if ($id <= 0) {
    exit(1);
}
echo $id;
PHP
}

parse_scan() {
  local file_container="$1"
  docker compose exec -T -e JSON_FILE="$file_container" backend php <<'PHP' | tr -d '\r'
<?php
$data = json_decode((string) file_get_contents((string) getenv('JSON_FILE')), true);
if (!is_array($data)) {
    exit(1);
}
echo (($data['success'] ?? false) === true ? '1' : '0'), "\t",
     (string) ($data['data']['status_scan'] ?? ''), "\t",
     (int) ($data['data']['affected_rows'] ?? -1), "\t",
     (string) ($data['message'] ?? $data['data']['message'] ?? '');
PHP
}

rollback_created_sessions() {
  [[ ${#CREATED_SESSION_IDS[@]} -gt 0 ]] || return 0

  local ids
  ids="$(IFS=,; printf '%s' "${CREATED_SESSION_IDS[*]}")"

  warn "Rollback sesi yang dibuat script: $ids"
  mysql_query "
    START TRANSACTION;
    DELETE pel
      FROM presensi_edit_log pel
      JOIN presensi_jam_siswa pjs ON pjs.presensi_id = pel.presensi_id
      WHERE pjs.presensi_sesi_id IN ($ids);
    DELETE FROM presensi_jam_siswa WHERE presensi_sesi_id IN ($ids);
    DELETE FROM presensi_scan_log WHERE presensi_sesi_id IN ($ids);
    DELETE FROM system_error_logs WHERE presensi_sesi_id IN ($ids);
    DELETE FROM presensi_sesi_jam WHERE presensi_sesi_id IN ($ids);
    DELETE FROM presensi_sesi WHERE presensi_sesi_id IN ($ids);
    COMMIT;
  " >/dev/null
}

cleanup_on_exit() {
  local exit_code=$?
  if (( exit_code != 0 )) && (( SUCCESS == 0 )) && [[ "$KEEP_ON_FAILURE" != "1" ]]; then
    set +e
    rollback_created_sessions
    set -e
  fi
}
trap cleanup_on_exit EXIT

require_command docker
require_command curl
require_command sed
require_command awk
require_command grep
require_command wc

[[ -f .env ]] || die "File .env tidak ditemukan di root project."
[[ -f docker-compose.yml ]] || die "docker-compose.yml tidak ditemukan di root project."
[[ -d backend ]] || die "Folder backend tidak ditemukan di root project."
[[ "$RESET_TARGET" =~ ^[01]$ ]] || die "RESET_TARGET hanya boleh 0 atau 1."
[[ "$KEEP_ON_FAILURE" =~ ^[01]$ ]] || die "KEEP_ON_FAILURE hanya boleh 0 atau 1."
[[ "$TIPE_HARI" =~ ^(normal|jumat|khusus)$ ]] || die "TIPE_HARI harus normal, jumat, atau khusus."
if [[ -n "$ROMBEL_ID" && ! "$ROMBEL_ID" =~ ^[0-9]+$ ]]; then
  die "ROMBEL_ID harus berupa angka."
fi

DB_DATABASE_VALUE="${DB_DATABASE:-$(env_value DB_DATABASE)}"
DB_USERNAME_VALUE="${DB_USERNAME:-$(env_value DB_USERNAME)}"
DB_PASSWORD_VALUE="${DB_PASSWORD:-$(env_value DB_PASSWORD)}"
NGINX_PORT_VALUE="${NGINX_PORT:-$(env_value NGINX_PORT)}"
APP_URL_VALUE="${APP_URL:-$(env_value APP_URL)}"

DB_USERNAME_VALUE="${DB_USERNAME_VALUE:-root}"
NGINX_PORT_VALUE="${NGINX_PORT_VALUE:-8080}"
API_BASE="${API_BASE:-${APP_URL_VALUE:-http://localhost:${NGINX_PORT_VALUE}}}"
API_BASE="${API_BASE%/}"

[[ -n "$DB_DATABASE_VALUE" ]] || die "DB_DATABASE kosong di .env."

docker compose exec -T db true >/dev/null 2>&1 || die "Container db belum berjalan. Jalankan: docker compose up -d"
docker compose exec -T backend true >/dev/null 2>&1 || die "Container backend belum berjalan. Jalankan: docker compose up -d"

HEALTH_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "$API_BASE/api/health" || true)"
[[ "$HEALTH_CODE" == "200" ]] || die "Health endpoint gagal. URL=$API_BASE/api/health HTTP=$HEALTH_CODE"

TARGET_DATE="$(mysql_query 'SELECT CURDATE();')"
TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
OUTPUT_HOST="backend/storage/test-presensi-seed/$TIMESTAMP"
OUTPUT_CONTAINER="storage/test-presensi-seed/$TIMESTAMP"
mkdir -p "$OUTPUT_HOST"

# Resolusi rombel dilakukan langsung dari data nyata agar label tidak ditebak.
if [[ -n "$ROMBEL_ID" ]]; then
  ROMBEL_ROWS="$(mysql_query "
    SELECT rombel_id,
           COALESCE(NULLIF(label_rombel, ''), NULLIF(label_rombel_raw, ''), CONCAT('Rombel ', rombel_id))
    FROM rombel
    WHERE rombel_id = $ROMBEL_ID
      AND status = 'aktif';
  ")"
else
  ROMBEL_LABEL_SQL="$(sql_escape "$ROMBEL_LABEL")"
  ROMBEL_ROWS="$(mysql_query "
    SELECT rombel_id,
           COALESCE(NULLIF(label_rombel, ''), NULLIF(label_rombel_raw, ''), CONCAT('Rombel ', rombel_id))
    FROM rombel
    WHERE status = 'aktif'
      AND (
        LOWER(TRIM(COALESCE(label_rombel, ''))) = LOWER(TRIM('$ROMBEL_LABEL_SQL'))
        OR LOWER(TRIM(COALESCE(label_rombel_raw, ''))) = LOWER(TRIM('$ROMBEL_LABEL_SQL'))
      )
    ORDER BY rombel_id;
  ")"
fi

ROMBEL_MATCH_COUNT="$(printf '%s\n' "$ROMBEL_ROWS" | sed '/^$/d' | wc -l | tr -d '[:space:]')"
if [[ "$ROMBEL_MATCH_COUNT" == "0" ]]; then
  printf 'Rombel target tidak ditemukan. Rombel aktif yang tersedia:\n' >&2
  mysql_query "
    SELECT rombel_id,
           COALESCE(NULLIF(label_rombel, ''), NULLIF(label_rombel_raw, ''), CONCAT('Rombel ', rombel_id))
    FROM rombel
    WHERE status = 'aktif'
    ORDER BY tingkat_angka, label_rombel, rombel_id;
  " >&2 || true
  die "Gunakan ROMBEL_LABEL yang sama persis atau isi ROMBEL_ID."
fi
[[ "$ROMBEL_MATCH_COUNT" == "1" ]] || die "Label '$ROMBEL_LABEL' cocok dengan lebih dari satu rombel. Gunakan ROMBEL_ID."

IFS=$'\t' read -r TARGET_ROMBEL_ID TARGET_ROMBEL_LABEL <<< "$ROMBEL_ROWS"

# Jam dipilih berdasarkan jam_ke 1..8, bukan asumsi jam_id 1..8.
JAM_ROWS="$(mysql_query "
  SELECT jam_ke, jam_id
  FROM jam_pembelajaran
  WHERE status = 'aktif'
    AND tipe_hari = '$(sql_escape "$TIPE_HARI")'
    AND jam_ke BETWEEN 1 AND 8
  ORDER BY jam_ke;
")"

JAM_IDS=()
EXPECTED_JAM=1
while IFS=$'\t' read -r JAM_KE JAM_ID; do
  [[ -n "$JAM_KE" ]] || continue
  [[ "$JAM_KE" == "$EXPECTED_JAM" ]] || die "Urutan jam tidak lengkap. Diharapkan Jam ke-$EXPECTED_JAM, ditemukan Jam ke-$JAM_KE."
  JAM_IDS+=("$JAM_ID")
  EXPECTED_JAM=$((EXPECTED_JAM + 1))
done <<< "$JAM_ROWS"
[[ ${#JAM_IDS[@]} -eq 8 ]] || die "Dibutuhkan tepat 8 jam aktif untuk tipe_hari=$TIPE_HARI. Ditemukan ${#JAM_IDS[@]}."

# Roster disamakan dengan PresensiSessionService::initAlphaRows.
ROSTER_SQL="
WITH active_placement AS (
  SELECT psr.siswa_id
  FROM penempatan_siswa_rombel psr
  WHERE psr.rombel_id = $TARGET_ROMBEL_ID
    AND psr.is_aktif = 1
),
roster AS (
  SELECT ap.siswa_id
  FROM active_placement ap
  UNION ALL
  SELECT s.siswa_id
  FROM siswa s
  WHERE s.rombel_id_aktif = $TARGET_ROMBEL_ID
    AND s.status = 'aktif'
    AND NOT EXISTS (SELECT 1 FROM active_placement)
)
SELECT CONCAT_WS('|',
       s.siswa_id,
       REPLACE(COALESCE(s.nisn, ''), '|', ' '),
       REPLACE(REPLACE(REPLACE(s.nama_lengkap, '|', ' '), CHAR(9), ' '), CHAR(10), ' '),
       COALESCE(s.rombel_id_aktif, 0),
       COALESCE(HEX(q.payload_raw), '')
)
FROM roster r
JOIN siswa s ON s.siswa_id = r.siswa_id
LEFT JOIN siswa_qr q ON q.siswa_id = s.siswa_id
ORDER BY s.nama_lengkap, s.siswa_id;
"

ROSTER_FILE="$OUTPUT_HOST/roster.tsv"
mysql_query "$ROSTER_SQL" > "$ROSTER_FILE"
STUDENT_COUNT="$(sed '/^$/d' "$ROSTER_FILE" | wc -l | tr -d '[:space:]')"
[[ "$STUDENT_COUNT" =~ ^[0-9]+$ ]] && (( STUDENT_COUNT > 0 )) || die "Rombel $TARGET_ROMBEL_LABEL tidak memiliki roster aktif."

MISSING_QR=0
MISMATCH_ROMBEL=0
while IFS='|' read -r SISWA_ID NISN NAMA AKTUAL_ROMBEL_ID PAYLOAD_HEX; do
  [[ -n "$SISWA_ID" ]] || continue
  if [[ "$AKTUAL_ROMBEL_ID" != "$TARGET_ROMBEL_ID" ]]; then
    printf '[DATA INVALID] siswa_id=%s nama=%s rombel_id_aktif=%s, target=%s\n' \
      "$SISWA_ID" "$NAMA" "$AKTUAL_ROMBEL_ID" "$TARGET_ROMBEL_ID" >&2
    MISMATCH_ROMBEL=$((MISMATCH_ROMBEL + 1))
  fi
  if [[ -z "$PAYLOAD_HEX" ]]; then
    printf '[QR MISSING] siswa_id=%s nisn=%s nama=%s\n' "$SISWA_ID" "$NISN" "$NAMA" >&2
    MISSING_QR=$((MISSING_QR + 1))
  fi
done < "$ROSTER_FILE"

(( MISMATCH_ROMBEL == 0 )) || die "$MISMATCH_ROMBEL siswa pada penempatan aktif tidak memiliki rombel_id_aktif yang sesuai."
(( MISSING_QR == 0 )) || die "$MISSING_QR siswa belum memiliki siswa_qr.payload_raw. Lengkapi QR sebelum menjalankan script."

EXPECTED_ROWS=$((STUDENT_COUNT * 8))

# Login dan permission diperiksa sebelum data apa pun diubah.
LOGIN_BODY="$(json_payload login "$LOGIN_USER" "$LOGIN_PASSWORD")"
LOGIN_CODE="$(curl -sS \
  -X POST "$API_BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  --data "$LOGIN_BODY" \
  -o "$OUTPUT_HOST/login.json" \
  -w '%{http_code}' || true)"
[[ "$LOGIN_CODE" == "200" ]] || die "Login gagal HTTP=$LOGIN_CODE. Cek $OUTPUT_HOST/login.json"

LOGIN_PARSED="$(parse_login "$OUTPUT_CONTAINER/login.json")" || die "Response login tidak valid."
IFS=$'\t' read -r TOKEN PERMISSIONS <<< "$LOGIN_PARSED"
[[ -n "$TOKEN" ]] || die "Token login kosong."
for REQUIRED_PERMISSION in attendance.session.create attendance.session.update attendance.scan; do
  case ",$PERMISSIONS," in
    *",$REQUIRED_PERMISSION,"*) ;;
    *) die "Akun $LOGIN_USER tidak memiliki permission $REQUIRED_PERMISSION." ;;
  esac
done
pass "Login dan permission presensi tersedia"

# Idempotensi: jika data hadir 8 jam sudah lengkap, tidak membuat data ganda.
EXISTING_SUMMARY="$(mysql_query "
SELECT
  COUNT(*) AS total_rows,
  COUNT(DISTINCT siswa_id) AS total_students,
  COUNT(DISTINCT jam_id) AS total_jams,
  SUM(status = 'hadir') AS hadir_rows,
  SUM(scanned_at IS NOT NULL) AS scanned_rows
FROM presensi_jam_siswa
WHERE tanggal = '$TARGET_DATE'
  AND rombel_id_snapshot = $TARGET_ROMBEL_ID;
")"
IFS=$'\t' read -r EXISTING_ROWS EXISTING_STUDENTS EXISTING_JAMS EXISTING_HADIR EXISTING_SCANNED <<< "$EXISTING_SUMMARY"
EXISTING_ROWS="${EXISTING_ROWS:-0}"
EXISTING_STUDENTS="${EXISTING_STUDENTS:-0}"
EXISTING_JAMS="${EXISTING_JAMS:-0}"
EXISTING_HADIR="${EXISTING_HADIR:-0}"
EXISTING_SCANNED="${EXISTING_SCANNED:-0}"

VALID_EXISTING_STUDENTS="$(mysql_query "
SELECT COUNT(*)
FROM (
  SELECT p.siswa_id
  FROM presensi_jam_siswa p
  JOIN jam_pembelajaran j ON j.jam_id = p.jam_id
  WHERE p.tanggal = '$TARGET_DATE'
    AND p.rombel_id_snapshot = $TARGET_ROMBEL_ID
  GROUP BY p.siswa_id
  HAVING COUNT(*) = 8
     AND COUNT(DISTINCT j.jam_ke) = 8
     AND MIN(j.jam_ke) = 1
     AND MAX(j.jam_ke) = 8
     AND SUM(p.status = 'hadir') = 8
     AND SUM(p.scanned_at IS NOT NULL) = 8
) complete_students;
")"
VALID_EXISTING_STUDENTS="${VALID_EXISTING_STUDENTS:-0}"

if [[ "$EXISTING_ROWS" == "$EXPECTED_ROWS" \
   && "$EXISTING_STUDENTS" == "$STUDENT_COUNT" \
   && "$EXISTING_JAMS" == "8" \
   && "$EXISTING_HADIR" == "$EXPECTED_ROWS" \
   && "$EXISTING_SCANNED" == "$EXPECTED_ROWS" \
   && "$VALID_EXISTING_STUDENTS" == "$STUDENT_COUNT" ]]; then
  printf '=== DATA SUDAH SIAP ===\n'
  printf 'Tanggal      : %s\n' "$TARGET_DATE"
  printf 'Rombel       : %s (ID %s)\n' "$TARGET_ROMBEL_LABEL" "$TARGET_ROMBEL_ID"
  printf 'Siswa        : %s\n' "$STUDENT_COUNT"
  printf 'Record hadir : %s\n' "$EXPECTED_ROWS"
  printf '\nJalankan test export:\n'
  printf 'TEST_DATE=%s ROMBEL_ID=%s ./scripts/test-export-full-day-rombel.sh\n' "$TARGET_DATE" "$TARGET_ROMBEL_ID"
  SUCCESS=1
  exit 0
fi

EXISTING_SESSION_COUNT="$(mysql_query "
  SELECT COUNT(*)
  FROM presensi_sesi
  WHERE tanggal = '$TARGET_DATE'
    AND mode_presensi = 'rombel'
    AND rombel_id = $TARGET_ROMBEL_ID;
")"

if (( EXISTING_ROWS > 0 || EXISTING_SESSION_COUNT > 0 )); then
  if [[ "$RESET_TARGET" != "1" ]]; then
    printf 'Data target hari ini belum bersih:\n' >&2
    printf '  existing_rows     : %s\n' "$EXISTING_ROWS" >&2
    printf '  existing_sessions : %s\n' "$EXISTING_SESSION_COUNT" >&2
    printf '  hadir_rows        : %s\n' "$EXISTING_HADIR" >&2
    die "Jalankan ulang dengan RESET_TARGET=1 hanya jika data target boleh dihapus dan dibuat ulang."
  fi

  warn "RESET_TARGET=1: menghapus data presensi $TARGET_ROMBEL_LABEL tanggal $TARGET_DATE"
  mysql_query "
    START TRANSACTION;

    CREATE TEMPORARY TABLE tmp_target_sessions AS
      SELECT presensi_sesi_id
      FROM presensi_sesi
      WHERE tanggal = '$TARGET_DATE'
        AND mode_presensi = 'rombel'
        AND rombel_id = $TARGET_ROMBEL_ID;

    CREATE TEMPORARY TABLE tmp_target_attendance AS
      SELECT DISTINCT p.presensi_id
      FROM presensi_jam_siswa p
      LEFT JOIN tmp_target_sessions ts ON ts.presensi_sesi_id = p.presensi_sesi_id
      WHERE p.tanggal = '$TARGET_DATE'
        AND (p.rombel_id_snapshot = $TARGET_ROMBEL_ID OR ts.presensi_sesi_id IS NOT NULL);

    DELETE pel
      FROM presensi_edit_log pel
      JOIN tmp_target_attendance ta ON ta.presensi_id = pel.presensi_id;

    DELETE p
      FROM presensi_jam_siswa p
      JOIN tmp_target_attendance ta ON ta.presensi_id = p.presensi_id;

    DELETE l
      FROM presensi_scan_log l
      JOIN tmp_target_sessions ts ON ts.presensi_sesi_id = l.presensi_sesi_id;

    DELETE e
      FROM system_error_logs e
      JOIN tmp_target_sessions ts ON ts.presensi_sesi_id = e.presensi_sesi_id;

    DELETE sj
      FROM presensi_sesi_jam sj
      JOIN tmp_target_sessions ts ON ts.presensi_sesi_id = sj.presensi_sesi_id;

    DELETE s
      FROM presensi_sesi s
      JOIN tmp_target_sessions ts ON ts.presensi_sesi_id = s.presensi_sesi_id;

    COMMIT;
  " >/dev/null
  pass "Data target lama dibersihkan"
fi

printf '=== Seed Full-Day Presensi Rombel ===\n'
printf 'API base       : %s\n' "$API_BASE"
printf 'Tanggal        : %s\n' "$TARGET_DATE"
printf 'Rombel         : %s (ID %s)\n' "$TARGET_ROMBEL_LABEL" "$TARGET_ROMBEL_ID"
printf 'Tipe hari      : %s\n' "$TIPE_HARI"
printf 'Jumlah siswa   : %s\n' "$STUDENT_COUNT"
printf 'Expected rows  : %s\n' "$EXPECTED_ROWS"
printf 'Output log     : %s\n\n' "$OUTPUT_HOST"

# Backend membatasi maksimal 3 jam per sesi, sehingga 8 jam dibagi 3+3+2.
SESSION_GROUPS=(
  "${JAM_IDS[0]},${JAM_IDS[1]},${JAM_IDS[2]}"
  "${JAM_IDS[3]},${JAM_IDS[4]},${JAM_IDS[5]}"
  "${JAM_IDS[6]},${JAM_IDS[7]}"
)
SESSION_LABELS=("Jam 1-3" "Jam 4-6" "Jam 7-8")
SESSION_EXPECTED_AFFECTED=(3 3 2)

for INDEX in 0 1 2; do
  GROUP="${SESSION_GROUPS[$INDEX]}"
  LABEL="${SESSION_LABELS[$INDEX]}"
  EXPECTED_AFFECTED="${SESSION_EXPECTED_AFFECTED[$INDEX]}"
  SESSION_NUMBER=$((INDEX + 1))

  CREATE_BODY="$(json_payload session "$TARGET_ROMBEL_ID" "$GROUP")"
  CREATE_HOST_FILE="$OUTPUT_HOST/session-${SESSION_NUMBER}-create.json"
  CREATE_CONTAINER_FILE="$OUTPUT_CONTAINER/session-${SESSION_NUMBER}-create.json"

  CREATE_CODE="$(curl -sS \
    -X POST "$API_BASE/api/presensi/sesi" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    --data "$CREATE_BODY" \
    -o "$CREATE_HOST_FILE" \
    -w '%{http_code}' || true)"
  [[ "$CREATE_CODE" == "201" ]] || die "Gagal membuat sesi $LABEL. HTTP=$CREATE_CODE. Cek $CREATE_HOST_FILE"

  SESSION_ID="$(parse_session_id "$CREATE_CONTAINER_FILE")" || die "Response create sesi $LABEL tidak valid."
  CREATED_SESSION_IDS+=("$SESSION_ID")
  pass "Sesi $LABEL dibuat, session_id=$SESSION_ID"

  SCANNED_COUNT=0
  # Gunakan file descriptor khusus agar docker/curl di dalam loop tidak
  # mengonsumsi sisa roster dari standard input.
  exec 3< "$ROSTER_FILE"
  while IFS='|' read -r -u 3 SISWA_ID NISN NAMA AKTUAL_ROMBEL_ID PAYLOAD_HEX; do
    [[ -n "$SISWA_ID" ]] || continue
    SCAN_BODY="$(json_payload scan "$SESSION_ID" "$PAYLOAD_HEX")"
    SAFE_SCAN_INDEX=$((SCANNED_COUNT + 1))
    SCAN_HOST_FILE="$OUTPUT_HOST/session-${SESSION_NUMBER}-scan-${SAFE_SCAN_INDEX}.json"
    SCAN_CONTAINER_FILE="$OUTPUT_CONTAINER/session-${SESSION_NUMBER}-scan-${SAFE_SCAN_INDEX}.json"

    SCAN_CODE="$(curl -sS \
      -X POST "$API_BASE/api/presensi/scan" \
      -H "Authorization: Bearer $TOKEN" \
      -H 'Content-Type: application/json' \
      -H 'Accept: application/json' \
      --data "$SCAN_BODY" \
      -o "$SCAN_HOST_FILE" \
      -w '%{http_code}' || true)"
    [[ "$SCAN_CODE" == "201" ]] || die "Scan gagal untuk siswa_id=$SISWA_ID nama=$NAMA pada $LABEL. HTTP=$SCAN_CODE. Cek $SCAN_HOST_FILE"

    SCAN_PARSED="$(parse_scan "$SCAN_CONTAINER_FILE")" || die "Response scan tidak valid untuk siswa_id=$SISWA_ID."
    IFS=$'\t' read -r SCAN_SUCCESS SCAN_STATUS AFFECTED_ROWS SCAN_MESSAGE <<< "$SCAN_PARSED"
    [[ "$SCAN_SUCCESS" == "1" && "$SCAN_STATUS" == "berhasil" ]] \
      || die "Scan ditolak untuk siswa_id=$SISWA_ID nama=$NAMA. status=$SCAN_STATUS message=$SCAN_MESSAGE"
    [[ "$AFFECTED_ROWS" == "$EXPECTED_AFFECTED" ]] \
      || die "affected_rows siswa_id=$SISWA_ID pada $LABEL adalah $AFFECTED_ROWS, expected=$EXPECTED_AFFECTED"

    SCANNED_COUNT=$((SCANNED_COUNT + 1))
    if (( SCANNED_COUNT % 5 == 0 || SCANNED_COUNT == STUDENT_COUNT )); then
      info "$LABEL: $SCANNED_COUNT/$STUDENT_COUNT siswa berhasil discan"
    fi
  done
  exec 3<&-

  [[ "$SCANNED_COUNT" == "$STUDENT_COUNT" ]] || die "Jumlah scan $LABEL tidak sama dengan roster."

  FINISH_HOST_FILE="$OUTPUT_HOST/session-${SESSION_NUMBER}-finish.json"
  FINISH_CODE="$(curl -sS \
    -X POST "$API_BASE/api/presensi/sesi/$SESSION_ID/finish" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    --data '{}' \
    -o "$FINISH_HOST_FILE" \
    -w '%{http_code}' || true)"
  [[ "$FINISH_CODE" == "200" ]] || die "Gagal menutup sesi $LABEL. HTTP=$FINISH_CODE. Cek $FINISH_HOST_FILE"
  pass "Sesi $LABEL selesai"
done

FINAL_SUMMARY="$(mysql_query "
SELECT
  COUNT(*) AS total_rows,
  COUNT(DISTINCT siswa_id) AS total_students,
  COUNT(DISTINCT j.jam_ke) AS total_jams,
  SUM(p.status = 'hadir') AS hadir_rows,
  SUM(p.status = 'alpha') AS alpha_rows,
  SUM(p.scanned_at IS NOT NULL) AS scanned_rows
FROM presensi_jam_siswa p
JOIN jam_pembelajaran j ON j.jam_id = p.jam_id
WHERE p.tanggal = '$TARGET_DATE'
  AND p.rombel_id_snapshot = $TARGET_ROMBEL_ID;
")"
IFS=$'\t' read -r FINAL_ROWS FINAL_STUDENTS FINAL_JAMS FINAL_HADIR FINAL_ALPHA FINAL_SCANNED <<< "$FINAL_SUMMARY"

FINAL_VALID_STUDENTS="$(mysql_query "
SELECT COUNT(*)
FROM (
  SELECT p.siswa_id
  FROM presensi_jam_siswa p
  JOIN jam_pembelajaran j ON j.jam_id = p.jam_id
  WHERE p.tanggal = '$TARGET_DATE'
    AND p.rombel_id_snapshot = $TARGET_ROMBEL_ID
  GROUP BY p.siswa_id
  HAVING COUNT(*) = 8
     AND COUNT(DISTINCT j.jam_ke) = 8
     AND MIN(j.jam_ke) = 1
     AND MAX(j.jam_ke) = 8
     AND SUM(p.status = 'hadir') = 8
     AND SUM(p.scanned_at IS NOT NULL) = 8
) complete_students;
")"

[[ "$FINAL_ROWS" == "$EXPECTED_ROWS" ]] || die "Final rows=$FINAL_ROWS, expected=$EXPECTED_ROWS"
[[ "$FINAL_STUDENTS" == "$STUDENT_COUNT" ]] || die "Final students=$FINAL_STUDENTS, expected=$STUDENT_COUNT"
[[ "$FINAL_JAMS" == "8" ]] || die "Final distinct jam=$FINAL_JAMS, expected=8"
[[ "$FINAL_HADIR" == "$EXPECTED_ROWS" ]] || die "Final hadir=$FINAL_HADIR, expected=$EXPECTED_ROWS"
[[ "$FINAL_ALPHA" == "0" ]] || die "Masih ada alpha=$FINAL_ALPHA"
[[ "$FINAL_SCANNED" == "$EXPECTED_ROWS" ]] || die "Final scanned_at=$FINAL_SCANNED, expected=$EXPECTED_ROWS"
[[ "$FINAL_VALID_STUDENTS" == "$STUDENT_COUNT" ]] || die "Siswa dengan Jam 1-8 lengkap=$FINAL_VALID_STUDENTS, expected=$STUDENT_COUNT"

SUCCESS=1

printf '\n=== RESULT ===\n'
printf 'STATUS        : PASSED\n'
printf 'Tanggal       : %s\n' "$TARGET_DATE"
printf 'Rombel        : %s (ID %s)\n' "$TARGET_ROMBEL_LABEL" "$TARGET_ROMBEL_ID"
printf 'Siswa         : %s\n' "$STUDENT_COUNT"
printf 'Jam           : 8\n'
printf 'Record hadir  : %s\n' "$FINAL_HADIR"
printf 'Session IDs   : %s\n' "$(IFS=,; printf '%s' "${CREATED_SESSION_IDS[*]}")"
printf 'Output log    : %s\n' "$OUTPUT_HOST"
printf '\nLanjutkan dengan test export:\n'
printf 'TEST_DATE=%s ROMBEL_ID=%s ./scripts/test-export-full-day-rombel.sh\n' "$TARGET_DATE" "$TARGET_ROMBEL_ID"
