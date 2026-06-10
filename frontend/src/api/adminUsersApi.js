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

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const cleanValues = value
        .map((item) => String(item ?? '').trim())
        .filter(Boolean);

      if (cleanValues.length > 0) {
        query.set(key, cleanValues.join(','));
      }

      return;
    }

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

export async function listAdminUsers(params = {}) {
  const query = buildQuery(params);
  const url = query ? `/api/admin/users?${query}` : '/api/admin/users';

  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}

export async function createAdminUser(payload) {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}

export async function updateAdminUser(id, payload) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response);
}

export async function listUserActivities(params = {}) {
  const query = buildQuery(params);
  const url = query ? `/api/admin/user-activities?${query}` : '/api/admin/user-activities';

  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseJsonResponse(response);
}
