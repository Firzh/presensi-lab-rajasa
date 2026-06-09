import { getAuthToken } from '../lib/authSession.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  Accept: 'application/json',
};

function authHeaders() {
  return {
    ...JSON_HEADERS,
    Authorization: `Bearer ${getAuthToken()}`,
  };
}

function buildQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, String(value));
    }
  });

  return query.toString();
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

export async function fetchRombelOptions() {
  const response = await fetch('/api/rombel/options', {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}

export async function fetchPresensiToday(params = {}) {
  const query = buildQuery(params);
  const url = query ? `/api/presensi/jam-siswa?${query}` : '/api/presensi/jam-siswa';

  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}

export async function checkPresensiSessionWarning({ modePresensi, rombelId, jamIds, ruangPilihan }) {
  const body = {
    mode_presensi: modePresensi,
    jam_ids: jamIds,
    ruang_pilihan: ruangPilihan,
  };

  if (modePresensi === 'rombel') {
    body.rombel_id = Number(rombelId);
  }

  const response = await fetch('/api/presensi/sesi/check-warning', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  return parseJsonResponse(response);
}

export async function createPresensiSession({ modePresensi, rombelId, jamIds, ruangPilihan }) {
  const body = {
    mode_presensi: modePresensi,
    jam_ids: jamIds,
    ruang_pilihan: ruangPilihan,
  };

  if (modePresensi === 'rombel') {
    body.rombel_id = Number(rombelId);
  }

  const response = await fetch('/api/presensi/sesi', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  return parseJsonResponse(response);
}

export async function pausePresensiSession(presensiSesiId) {
  const response = await fetch(`/api/presensi/sesi/${presensiSesiId}/pause`, {
    method: 'POST',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}

export async function resumePresensiSession(presensiSesiId) {
  const response = await fetch(`/api/presensi/sesi/${presensiSesiId}/resume`, {
    method: 'POST',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}

export async function finishPresensiSession(presensiSesiId) {
  const response = await fetch(`/api/presensi/sesi/${presensiSesiId}/finish`, {
    method: 'POST',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}

export async function heartbeatPresensiSession(presensiSesiId) {
  const response = await fetch(`/api/presensi/sesi/${presensiSesiId}/heartbeat`, {
    method: 'POST',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}

export async function submitPresensiQrScan({ presensiSesiId, payloadRaw }) {
  const response = await fetch('/api/presensi/scan', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      presensi_sesi_id: Number(presensiSesiId),
      payload_raw: payloadRaw,
    }),
  });

  return parseJsonResponse(response);
}