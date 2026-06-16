import { apiFetch, buildQueryString } from '../lib/apiClient.js';
import { getAuthToken } from '../lib/authSession.js';

export async function listLaporanPresensi(params = {}) {
  const query = buildQueryString(params);
  const url = query ? `/api/reports/presensi?${query}` : '/api/reports/presensi';
  return apiFetch(url, { method: 'GET' });
}

export async function downloadExportLaporan(params, format) {
  const normalizedFormat = format === 'excel' ? 'xlsx' : format;
  const query = new URLSearchParams({ ...params, format: normalizedFormat });
  const token = getAuthToken();

  if (!token) {
    throw new Error('Token tidak ditemukan. Silakan login ulang.');
  }

  const response = await fetch(`/api/reports/presensi/export?${query.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token || ''}`,
      Accept: '*/*',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal mengekspor laporan.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `laporan-presensi.${normalizedFormat}`;
  if (contentDisposition && contentDisposition.includes('filename="')) {
    const match = contentDisposition.match(/filename="([^"]+)"/);
    if (match && match[1]) {
      filename = match[1];
    }
  }
  
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
