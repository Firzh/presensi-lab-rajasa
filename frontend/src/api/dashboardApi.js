import { fetchPresensiToday } from './presensiApi.js';
import { listSiswa } from './siswaApi.js';
import { getAuthToken } from '../lib/authSession.js';
import { getAppTodayDate } from '../lib/dateUtils.js';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    Accept: 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
  };
}

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({
    success: false,
    message: 'Response bukan JSON valid.',
    errors: {},
  }));

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export async function fetchPresensiAuditLatest() {
  const response = await fetch('/api/presensi/audit/latest', {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}

function getResponseData(result) {
  return result?.data?.data ?? {};
}

function getTotalSiswa(siswaData) {
  return Number(siswaData?.pagination?.total ?? siswaData?.items?.length ?? 0);
}

function getAttendanceTimestamp(item) {
  const rawDate = item?.scanned_at || item?.edited_at || item?.tanggal || '';
  const timestamp = Date.parse(rawDate);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getRecentPresensi(items) {
  return [...items]
    .sort((a, b) => getAttendanceTimestamp(b) - getAttendanceTimestamp(a))
    .slice(0, 5);
}

export async function getDashboardData({
  tanggal = getAppTodayDate(),
  includeLogSummary = true,
} = {}) {
  const requests = [
    listSiswa({ status: 'aktif', page: 1, per_page: 1 }),
    fetchPresensiToday({ tanggal }),
  ];

  if (includeLogSummary) {
    requests.push(fetchPresensiAuditLatest());
  }

  const [siswaResult, presensiResult, auditResult] = await Promise.allSettled(requests);

  if (siswaResult.status === 'rejected' || !siswaResult.value?.ok) {
    throw new Error('Gagal memuat total siswa.');
  }

  if (presensiResult.status === 'rejected' || !presensiResult.value?.ok) {
    throw new Error('Gagal memuat presensi hari ini.');
  }

  const siswaData = getResponseData(siswaResult.value);
  const presensiData = getResponseData(presensiResult.value);
  const attendanceItems = Array.isArray(presensiData.items) ? presensiData.items : [];

  const presentStatuses = new Set(['hadir', 'terlambat']);
  const absentStatuses = new Set(['alpha', 'izin', 'sakit']);

  const auditData =
    includeLogSummary && auditResult?.status === 'fulfilled' && auditResult.value?.ok
      ? getResponseData(auditResult.value)
      : {};

  return {
    ok: true,
    data: {
      tanggal,
      totalSiswa: getTotalSiswa(siswaData),
      hadirHari: attendanceItems.filter((item) => presentStatuses.has(item.status)).length,
      tidakHadir: attendanceItems.filter((item) => absentStatuses.has(item.status)).length,
      logAksesInvalid: Number(auditData?.summary?.scan_invalid ?? 0),
      recentPresensi: getRecentPresensi(attendanceItems),
    },
  };
}
