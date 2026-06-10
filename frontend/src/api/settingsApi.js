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

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export async function getPengaturanData() {
  const response = await fetch('/api/settings', {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}

export async function createDatabaseBackup() {
  const response = await fetch('/api/settings/backup', {
    method: 'POST',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}

export async function downloadDatabaseBackup(fileName) {
  const query = buildQuery({ file: fileName });
  const response = await fetch(`/api/settings/backup/download?${query}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}

export async function updateRombelSchedule(payload) {
  const response = await fetch('/api/settings/rombel-schedule', {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}

export async function updateLateRule(payload) {
  const response = await fetch('/api/settings/late-rule', {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}
