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

export async function listSiswa(params = {}) {
  const token = getAuthToken();
  const query = buildQuery(params);
  const url = query ? `/api/siswa?${query}` : '/api/siswa';

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'ngrok-skip-browser-warning': 'true',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return parseJsonResponse(response);
}
