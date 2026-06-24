import { apiFetch, buildQueryString } from '../lib/apiClient.js';

export async function listJurusan(params = {}) {
  const query = buildQueryString(params);
  const url = query ? `/api/jurusan?${query}` : '/api/jurusan';
  return apiFetch(url, { method: 'GET' });
}

export async function createJurusan(payload) {
  return apiFetch('/api/jurusan', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateJurusan(id, payload) {
  return apiFetch(`/api/jurusan/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteJurusan(id) {
  return apiFetch(`/api/jurusan/${id}`, { method: 'DELETE' });
}