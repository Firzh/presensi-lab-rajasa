import { apiFetch, buildQueryString } from '../lib/apiClient.js';

export async function listAdminUsers(params = {}) {
  const query = buildQueryString(params);
  const url = query ? `/api/admin/users?${query}` : '/api/admin/users';
  return apiFetch(url, { method: 'GET' });
}

export async function createAdminUser(payload) {
  return apiFetch('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUser(id, payload) {
  return apiFetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function listUserActivities(params = {}) {
  const query = buildQueryString(params);
  const url = query ? `/api/admin/user-activities?${query}` : '/api/admin/user-activities';
  return apiFetch(url, { method: 'GET' });
}
