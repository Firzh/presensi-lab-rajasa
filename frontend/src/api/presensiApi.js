import { apiFetch, buildQueryString } from '../lib/apiClient.js';

export async function fetchRombelOptions() {
  return apiFetch('/api/rombel/options', { method: 'GET' });
}

export async function fetchPresensiToday(params = {}) {
  const query = buildQueryString(params);
  const url = query ? `/api/presensi/jam-siswa?${query}` : '/api/presensi/jam-siswa';
  return apiFetch(url, { method: 'GET' });
}

export async function checkPresensiSessionWarning({ modePresensi, rombelId, jamIds, ruangPilihan }) {
  const body = { mode_presensi: modePresensi, jam_ids: jamIds, ruang_pilihan: ruangPilihan };
  if (modePresensi === 'rombel') body.rombel_id = Number(rombelId);

  return apiFetch('/api/presensi/sesi/check-warning', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createPresensiSession({ modePresensi, rombelId, jamIds, ruangPilihan }) {
  const body = { mode_presensi: modePresensi, jam_ids: jamIds, ruang_pilihan: ruangPilihan };
  if (modePresensi === 'rombel') body.rombel_id = Number(rombelId);

  return apiFetch('/api/presensi/sesi', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function pausePresensiSession(presensiSesiId) {
  return apiFetch(`/api/presensi/sesi/${presensiSesiId}/pause`, { method: 'POST' });
}

export async function resumePresensiSession(presensiSesiId) {
  return apiFetch(`/api/presensi/sesi/${presensiSesiId}/resume`, { method: 'POST' });
}

export async function finishPresensiSession(presensiSesiId) {
  return apiFetch(`/api/presensi/sesi/${presensiSesiId}/finish`, { method: 'POST' });
}

export async function heartbeatPresensiSession(presensiSesiId) {
  return apiFetch(`/api/presensi/sesi/${presensiSesiId}/heartbeat`, { method: 'POST' });
}

export async function submitPresensiQrScan({ presensiSesiId, payloadRaw }) {
  return apiFetch('/api/presensi/scan', {
    method: 'POST',
    body: JSON.stringify({
      presensi_sesi_id: Number(presensiSesiId),
      payload_raw: payloadRaw,
    }),
  });
}