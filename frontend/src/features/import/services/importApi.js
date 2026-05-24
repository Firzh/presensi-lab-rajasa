import { loginDev } from '../../presensi-scan/services/presensiScanApi.js';

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export { loginDev };

export async function uploadImportFile({ token, file }) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/import', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseJsonResponse(response);
}