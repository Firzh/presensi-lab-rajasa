import { fetchPresensiToday } from './presensiApi.js';
import { listSiswa } from './siswaApi.js';
import { apiFetch } from '../lib/apiClient.js';
import { getAppTodayDate } from '../lib/dateUtils.js';

export async function fetchPresensiAuditLatest() {
  return apiFetch('/api/presensi/audit/latest', { method: 'GET' });
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
