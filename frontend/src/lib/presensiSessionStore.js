import { STORAGE_KEYS } from '../constants/storageKeys.js';
import { appStorage } from './storage.js';

export function getActivePresensiSession() {
  return appStorage.getJSON(STORAGE_KEYS.PRESENSI_ACTIVE_SESSION, null);
}

export function saveActivePresensiSession(session) {
  appStorage.setJSON(STORAGE_KEYS.PRESENSI_ACTIVE_SESSION, session);
}

export function updateActivePresensiSession(patch) {
  const current = getActivePresensiSession();

  if (!current) {
    return null;
  }

  const next = {
    ...current,
    ...patch,
  };

  saveActivePresensiSession(next);

  return next;
}

export function clearActivePresensiSession() {
  appStorage.remove(STORAGE_KEYS.PRESENSI_ACTIVE_SESSION);
}
