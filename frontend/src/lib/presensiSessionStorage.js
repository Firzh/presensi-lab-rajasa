import { STORAGE_KEYS } from '../constants/storageKeys.js';
import { appStorage } from './storage.js';

const ACTIVE_PRESENSI_SESSION_KEY = `${STORAGE_KEYS.SESSION}:presensi_active`;

export function saveActivePresensiSession(payload) {
  appStorage.setJSON(ACTIVE_PRESENSI_SESSION_KEY, payload);
}

export function getActivePresensiSession() {
  return appStorage.getJSON(ACTIVE_PRESENSI_SESSION_KEY, null);
}

export function clearActivePresensiSession() {
  appStorage.remove(ACTIVE_PRESENSI_SESSION_KEY);
}