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

function buildImportFormData(file) {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
}

export async function previewDataImport(file) {
  return apiFetch('/api/import/preview', {
    method: 'POST',
    body: buildImportFormData(file),
  });
}

export async function importDataFile(file) {
  return apiFetch('/api/import', {
    method: 'POST',
    body: buildImportFormData(file),
  });
}

export async function previewBackupImport(file) {
  return apiFetch('/api/settings/backup/preview-import', {
    method: 'POST',
    body: buildImportFormData(file),
  });
}

export async function importBackupFile(file) {
  return apiFetch('/api/settings/backup/import', {
    method: 'POST',
    body: buildImportFormData(file),
  });
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
