import { apiFetch, buildQueryString } from '../lib/apiClient.js';

export async function listSiswa(params = {}) {
  const query = buildQueryString(params);
  const url = query ? `/api/siswa?${query}` : '/api/siswa';
  return apiFetch(url, { method: 'GET' });
}
