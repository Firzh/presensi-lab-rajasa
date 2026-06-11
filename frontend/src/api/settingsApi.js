import { apiFetch, buildQueryString } from '../lib/apiClient.js';

export async function getPengaturanData() {
  return apiFetch('/api/settings', { method: 'GET' });
}

export async function createDatabaseBackup() {
  return apiFetch('/api/settings/backup', { method: 'POST' });
}

export async function downloadDatabaseBackup(fileName) {
  const query = buildQueryString({ file: fileName });
  return apiFetch(`/api/settings/backup/download?${query}`, { method: 'GET' });
}

export async function updateRombelSchedule(payload) {
  return apiFetch('/api/settings/rombel-schedule', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateLateRule(payload) {
  return apiFetch('/api/settings/late-rule', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
