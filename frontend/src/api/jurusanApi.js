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

export async function listJurusan(params = {}) {
  const query = buildQuery(params);
  const url = query ? `/api/jurusan?${query}` : '/api/jurusan';

  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}

export async function createJurusan(payload) {
  const response = await fetch('/api/jurusan', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}

export async function updateJurusan(id, payload) {
  const response = await fetch(`/api/jurusan/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}

export async function deleteJurusan(id) {
  const response = await fetch(`/api/jurusan/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}