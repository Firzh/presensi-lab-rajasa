import { getAuthToken } from '../lib/authSession.js';

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

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    Accept: 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
  };
}

export async function listLaporanPresensi(params = {}) {
  const query = buildQuery(params);
  const url = query ? `/api/presensi/jam-siswa?${query}` : '/api/presensi/jam-siswa';

  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}
