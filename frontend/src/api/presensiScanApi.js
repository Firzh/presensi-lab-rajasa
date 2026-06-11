import { apiFetch } from '../lib/apiClient.js';

export async function loginDev({ username, password }) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }, false);
}

export async function fetchRombelOptions({ token }) {
  return apiFetch('/api/rombel/options', {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function checkPresensiSessionWarning({ token, modePresensi, rombelId, jamIds, ruangPilihan }) {
  const body = { mode_presensi: modePresensi, jam_ids: jamIds, ruang_pilihan: ruangPilihan };
  if (modePresensi === 'rombel') body.rombel_id = Number(rombelId);

  return apiFetch('/api/presensi/sesi/check-warning', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(body),
  });
}

export async function createPresensiSession({ token, modePresensi, rombelId, jamIds, ruangPilihan }) {
  const body = { mode_presensi: modePresensi, jam_ids: jamIds, ruang_pilihan: ruangPilihan };
  if (modePresensi === 'rombel') body.rombel_id = Number(rombelId);

  return apiFetch('/api/presensi/sesi', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(body),
  });
}

export async function submitQrScan({ token, presensiSesiId, payloadRaw }) {
  return apiFetch('/api/presensi/scan', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({
      presensi_sesi_id: Number(presensiSesiId),
      payload_raw: payloadRaw,
    }),
  });
}

export async function fetchPresensiAudit({ token }) {
  return apiFetch('/api/presensi/audit/latest', {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function heartbeatPresensiSession({ token, presensiSesiId }) {
  return apiFetch(`/api/presensi/sesi/${presensiSesiId}/heartbeat`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function finishPresensiSession({ token, presensiSesiId }) {
  return apiFetch(`/api/presensi/sesi/${presensiSesiId}/finish`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}