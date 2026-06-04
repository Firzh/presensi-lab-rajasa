import { JAM_OPTIONS } from '../constants/devScan.js';

export function sortJamIds(jamIds) {
  return [...jamIds].sort((a, b) => a - b);
}

export function getQrFingerprint(payload) {
  return payload.trim().toLowerCase();
}

export function getRombelLabel(item) {
  if (!item) {
    return 'Belum memilih rombel';
  }

  const label = String(item.label || item.label_rombel || item.label_rombel_raw || '').trim();

  if (label !== '') {
    return label;
  }

  return `Rombel #${item.rombel_id}`;
}

export function getSelectedJamLabel(selectedJamIds) {
  if (selectedJamIds.length === 0) {
    return 'Pilih jam presensi';
  }

  return JAM_OPTIONS.filter((item) => selectedJamIds.includes(item.id))
    .map((item) => item.label)
    .join(', ');
}
