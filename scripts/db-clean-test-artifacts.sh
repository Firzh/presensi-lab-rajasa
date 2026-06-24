#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/db-env.sh"

DB_NAME="$(get_env DB_DATABASE sistem_presensi_siswa_qr)"
DB_USER="$(get_env DB_USERNAME root)"
DB_PASS="$(get_env DB_PASSWORD '')"

MYSQL_PASSWORD_ARG=()
if [ -n "$DB_PASS" ]; then
  MYSQL_PASSWORD_ARG=(-p"$DB_PASS")
fi

echo "--- Clean test artifacts from database: $DB_NAME ---"

docker compose exec -T db mysql -u"$DB_USER" "${MYSQL_PASSWORD_ARG[@]}" "$DB_NAME" <<'SQL'
SET FOREIGN_KEY_CHECKS = 1;

CREATE TEMPORARY TABLE tmp_test_nisn (
  nisn VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO tmp_test_nisn (nisn) VALUES
  ('7788001122'),
  ('1111111111'),
  ('2222222222'),
  ('3333333333'),
  ('0123456789'),
  ('9999999999'),
  ('0096672112'),
  ('0106325606');

CREATE TEMPORARY TABLE tmp_test_siswa (
  siswa_id INT UNSIGNED PRIMARY KEY
);

INSERT IGNORE INTO tmp_test_siswa (siswa_id)
SELECT siswa_id
FROM siswa
WHERE nisn IN (SELECT nisn FROM tmp_test_nisn)
   OR nama_lengkap LIKE 'SISWA TEST%'
   OR nama_lengkap = 'SISWA ADVANCED IMPORT'
   OR nama_lengkap = 'VALID SISWA'
   OR nama_lengkap = 'SISWA TKRO SATU'
   OR nama_lengkap = 'SISWA TKRO DUA'
   OR nama_lengkap = 'SISWA TKRO TANPA NOMOR';

CREATE TEMPORARY TABLE tmp_delete_siswa (
  siswa_id INT UNSIGNED PRIMARY KEY
);

INSERT IGNORE INTO tmp_delete_siswa (siswa_id)
SELECT siswa_id
FROM siswa
WHERE nisn IN ('7788001122', '1111111111', '2222222222', '3333333333', '0123456789')
   OR nama_lengkap LIKE 'SISWA TEST%'
   OR nama_lengkap = 'SISWA ADVANCED IMPORT'
   OR nama_lengkap = 'VALID SISWA'
   OR nama_lengkap = 'SISWA TKRO SATU'
   OR nama_lengkap = 'SISWA TKRO DUA'
   OR nama_lengkap = 'SISWA TKRO TANPA NOMOR';

CREATE TEMPORARY TABLE tmp_test_jurusan (
  jurusan_id INT UNSIGNED PRIMARY KEY
);

INSERT IGNORE INTO tmp_test_jurusan (jurusan_id)
SELECT jurusan_id
FROM jurusan
WHERE kode_jurusan LIKE 'UT%'
   OR kode_jurusan LIKE 'TST%'
   OR kode_jurusan LIKE 'TMO%'
   OR kode_jurusan LIKE 'TM0%'
   OR kode_jurusan = 'TEST'
   OR nama_jurusan LIKE 'Unit Test Jurusan%'
   OR nama_jurusan LIKE 'Jurusan Test%'
   OR nama_jurusan LIKE '%Test Timeout%'
   OR nama_jurusan LIKE '%Test Manual Edit%'
   OR nama_jurusan = 'TEST';

CREATE TEMPORARY TABLE tmp_test_rombel (
  rombel_id INT UNSIGNED PRIMARY KEY
);

INSERT IGNORE INTO tmp_test_rombel (rombel_id)
SELECT rombel_id
FROM rombel
WHERE jurusan_id IN (SELECT jurusan_id FROM tmp_test_jurusan)
   OR label_rombel LIKE '%TEST%'
   OR label_rombel_raw LIKE '%TEST%'
   OR label_rombel LIKE '%TIMEOUT%'
   OR label_rombel_raw LIKE '%TIMEOUT%';

CREATE TEMPORARY TABLE tmp_test_sessions (
  presensi_sesi_id BIGINT UNSIGNED PRIMARY KEY
);

INSERT IGNORE INTO tmp_test_sessions (presensi_sesi_id)
SELECT presensi_sesi_id
FROM presensi_sesi
WHERE session_uuid LIKE 'test-%'
   OR rombel_id IN (SELECT rombel_id FROM tmp_test_rombel);

INSERT IGNORE INTO tmp_test_sessions (presensi_sesi_id)
SELECT DISTINCT presensi_sesi_id
FROM presensi_scan_log
WHERE presensi_sesi_id IS NOT NULL
  AND (
    payload_nisn IN (SELECT nisn FROM tmp_test_nisn)
    OR payload_nama LIKE 'SISWA TEST%'
    OR payload_nama = 'SISWA TIDAK ADA'
    OR payload_raw LIKE '%9999999999%'
  );

CREATE TEMPORARY TABLE tmp_test_scan_logs (
  scan_log_id BIGINT UNSIGNED PRIMARY KEY
);

INSERT IGNORE INTO tmp_test_scan_logs (scan_log_id)
SELECT scan_log_id
FROM presensi_scan_log
WHERE presensi_sesi_id IN (SELECT presensi_sesi_id FROM tmp_test_sessions)
   OR siswa_id IN (SELECT siswa_id FROM tmp_test_siswa)
   OR payload_nisn IN (SELECT nisn FROM tmp_test_nisn)
   OR payload_nama LIKE 'SISWA TEST%'
   OR payload_nama = 'SISWA TIDAK ADA'
   OR payload_raw LIKE '%9999999999%';

CREATE TEMPORARY TABLE tmp_test_presensi (
  presensi_id BIGINT UNSIGNED PRIMARY KEY
);

INSERT IGNORE INTO tmp_test_presensi (presensi_id)
SELECT presensi_id
FROM presensi_jam_siswa
WHERE presensi_sesi_id IN (SELECT presensi_sesi_id FROM tmp_test_sessions)
   OR scan_log_id IN (SELECT scan_log_id FROM tmp_test_scan_logs)
   OR siswa_id IN (SELECT siswa_id FROM tmp_test_siswa)
   OR rombel_id_snapshot IN (SELECT rombel_id FROM tmp_test_rombel);

CREATE TEMPORARY TABLE tmp_test_imports (
  import_id BIGINT UNSIGNED PRIMARY KEY
);

INSERT IGNORE INTO tmp_test_imports (import_id)
SELECT DISTINCT import_id
FROM import_row_logs
WHERE CAST(source_payload_json AS CHAR) LIKE '%SISWA ADVANCED IMPORT%'
   OR CAST(source_payload_json AS CHAR) LIKE '%SISWA TEST%'
   OR CAST(source_payload_json AS CHAR) LIKE '%SISWA TKRO SATU%'
   OR CAST(source_payload_json AS CHAR) LIKE '%SISWA TKRO DUA%'
   OR CAST(source_payload_json AS CHAR) LIKE '%SISWA TKRO TANPA NOMOR%'
   OR CAST(source_payload_json AS CHAR) LIKE '%VALID SISWA%'
   OR CAST(source_payload_json AS CHAR) LIKE '%TANPA NISN%'
   OR CAST(source_payload_json AS CHAR) LIKE '%7788001122%'
   OR CAST(source_payload_json AS CHAR) LIKE '%1111111111%'
   OR CAST(source_payload_json AS CHAR) LIKE '%2222222222%'
   OR CAST(source_payload_json AS CHAR) LIKE '%3333333333%'
   OR CAST(source_payload_json AS CHAR) LIKE '%0123456789%'
   OR CAST(source_payload_json AS CHAR) LIKE '%0096672112%'
   OR CAST(source_payload_json AS CHAR) LIKE '%0106325606%';

INSERT IGNORE INTO tmp_test_imports (import_id)
SELECT import_id
FROM import_jobs
WHERE original_filename LIKE '%rajasa-%'
   OR original_filename LIKE '%scan-readiness-%'
   OR original_filename LIKE '%scan-test-%'
   OR original_filename LIKE '%siswa.csv%'
   OR original_filename LIKE '%guru.csv%'
   OR original_filename LIKE '%wali.csv%';

SELECT 'before_import_jobs', COUNT(*) FROM tmp_test_imports;
SELECT 'before_siswa', COUNT(*) FROM tmp_delete_siswa;
SELECT 'before_jurusan', COUNT(*) FROM tmp_test_jurusan;
SELECT 'before_rombel', COUNT(*) FROM tmp_test_rombel;
SELECT 'before_sessions', COUNT(*) FROM tmp_test_sessions;
SELECT 'before_scan_logs', COUNT(*) FROM tmp_test_scan_logs;
SELECT 'before_presensi', COUNT(*) FROM tmp_test_presensi;

DELETE FROM presensi_edit_log
WHERE presensi_id IN (SELECT presensi_id FROM tmp_test_presensi);

DELETE FROM presensi_jam_siswa
WHERE presensi_id IN (SELECT presensi_id FROM tmp_test_presensi)
   OR presensi_sesi_id IN (SELECT presensi_sesi_id FROM tmp_test_sessions)
   OR scan_log_id IN (SELECT scan_log_id FROM tmp_test_scan_logs)
   OR siswa_id IN (SELECT siswa_id FROM tmp_test_siswa)
   OR rombel_id_snapshot IN (SELECT rombel_id FROM tmp_test_rombel);

DELETE FROM presensi_scan_log
WHERE scan_log_id IN (SELECT scan_log_id FROM tmp_test_scan_logs)
   OR presensi_sesi_id IN (SELECT presensi_sesi_id FROM tmp_test_sessions)
   OR siswa_id IN (SELECT siswa_id FROM tmp_test_siswa)
   OR payload_nisn IN (SELECT nisn FROM tmp_test_nisn);

DELETE FROM presensi_sesi_jam
WHERE presensi_sesi_id IN (SELECT presensi_sesi_id FROM tmp_test_sessions);

DELETE FROM presensi_sesi
WHERE presensi_sesi_id IN (SELECT presensi_sesi_id FROM tmp_test_sessions);

DELETE FROM siswa_qr
WHERE siswa_id IN (SELECT siswa_id FROM tmp_test_siswa)
   OR payload_nisn IN (SELECT nisn FROM tmp_test_nisn);

DELETE FROM import_row_logs
WHERE import_id IN (SELECT import_id FROM tmp_test_imports);

DELETE FROM import_column_mappings
WHERE import_id IN (SELECT import_id FROM tmp_test_imports);

DELETE FROM import_jobs
WHERE import_id IN (SELECT import_id FROM tmp_test_imports);

DELETE FROM penempatan_siswa_rombel
WHERE siswa_id IN (SELECT siswa_id FROM tmp_delete_siswa)
   OR rombel_id IN (SELECT rombel_id FROM tmp_test_rombel);

DELETE FROM siswa_mutasi
WHERE siswa_id IN (SELECT siswa_id FROM tmp_delete_siswa);

DELETE FROM siswa_mutasi
WHERE rombel_lama_id IN (SELECT rombel_id FROM tmp_test_rombel);

DELETE FROM siswa_mutasi
WHERE rombel_baru_id IN (SELECT rombel_id FROM tmp_test_rombel);

DELETE FROM profil_siswa
WHERE siswa_id IN (SELECT siswa_id FROM tmp_delete_siswa);

DELETE FROM siswa
WHERE siswa_id IN (SELECT siswa_id FROM tmp_delete_siswa);

DELETE FROM rombel_wali_kelas
WHERE rombel_id IN (SELECT rombel_id FROM tmp_test_rombel);

DELETE FROM rombel
WHERE rombel_id IN (SELECT rombel_id FROM tmp_test_rombel);

DELETE FROM jurusan
WHERE jurusan_id IN (SELECT jurusan_id FROM tmp_test_jurusan);

SELECT 'after_siswa', COUNT(*) FROM siswa
WHERE nisn IN ('7788001122','1111111111','2222222222','3333333333','0123456789')
   OR nama_lengkap LIKE 'SISWA TEST%'
   OR nama_lengkap = 'SISWA ADVANCED IMPORT'
   OR nama_lengkap = 'VALID SISWA'
   OR nama_lengkap LIKE 'SISWA TKRO%';

SELECT 'after_jurusan', COUNT(*) FROM jurusan
WHERE kode_jurusan LIKE 'UT%'
   OR kode_jurusan LIKE 'TST%'
   OR kode_jurusan LIKE 'TMO%'
   OR kode_jurusan LIKE 'TM0%'
   OR kode_jurusan = 'TEST'
   OR nama_jurusan LIKE 'Unit Test Jurusan%'
   OR nama_jurusan LIKE 'Jurusan Test%';

SELECT 'after_rombel', COUNT(*) FROM rombel
WHERE label_rombel LIKE '%TEST%'
   OR label_rombel LIKE '%TIMEOUT%';

DROP TEMPORARY TABLE IF EXISTS tmp_test_presensi;
DROP TEMPORARY TABLE IF EXISTS tmp_test_scan_logs;
DROP TEMPORARY TABLE IF EXISTS tmp_test_sessions;
DROP TEMPORARY TABLE IF EXISTS tmp_test_imports;
DROP TEMPORARY TABLE IF EXISTS tmp_test_rombel;
DROP TEMPORARY TABLE IF EXISTS tmp_test_jurusan;
DROP TEMPORARY TABLE IF EXISTS tmp_delete_siswa;
DROP TEMPORARY TABLE IF EXISTS tmp_test_siswa;
DROP TEMPORARY TABLE IF EXISTS tmp_test_nisn;
SQL

echo "--- Test artifacts cleanup finished ---"