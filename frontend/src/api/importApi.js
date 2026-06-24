import { loginDev } from './presensiScanApi.js';
import { apiFetch } from '../lib/apiClient.js';

export { loginDev };

export async function uploadImportFile({ token, file }) {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch('/api/import', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
}