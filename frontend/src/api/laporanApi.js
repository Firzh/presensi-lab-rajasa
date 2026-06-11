import { apiFetch, buildQueryString } from '../lib/apiClient.js';

export async function listLaporanPresensi(params = {}) {
  const query = buildQueryString(params);
  const url = query ? `/api/presensi/jam-siswa?${query}` : '/api/presensi/jam-siswa';
  return apiFetch(url, { method: 'GET' });
}
