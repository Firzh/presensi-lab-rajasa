import { STORAGE_KEYS } from '../constants/storageKeys.js';
import { appStorage } from './storage.js';

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeAuthSession(data) {
  return {
    token: data?.token || '',
    user: data?.user || null,
    roles: normalizeArray(data?.roles),
    permissions: normalizeArray(data?.permissions),
  };
}

export function saveAuthSession(data, storage = appStorage) {
  const session = normalizeAuthSession(data);

  storage.setRaw(STORAGE_KEYS.AUTH_TOKEN, session.token);
  storage.setJSON(STORAGE_KEYS.AUTH_USER, session.user);
  storage.setJSON(STORAGE_KEYS.AUTH_ROLES, session.roles);
  storage.setJSON(STORAGE_KEYS.AUTH_PERMISSIONS, session.permissions);
  storage.setJSON(STORAGE_KEYS.SESSION, session);

  return session;
}

export function getAuthToken(storage = appStorage) {
  return storage.getRaw(STORAGE_KEYS.AUTH_TOKEN, '');
}

export function getAuthUser(storage = appStorage) {
  return storage.getJSON(STORAGE_KEYS.AUTH_USER, null);
}

export function getAuthRoles(storage = appStorage) {
  return storage.getJSON(STORAGE_KEYS.AUTH_ROLES, []);
}

export function getAuthPermissions(storage = appStorage) {
  return storage.getJSON(STORAGE_KEYS.AUTH_PERMISSIONS, []);
}

export function getAuthSession(storage = appStorage) {
  return {
    token: getAuthToken(storage),
    user: getAuthUser(storage),
    roles: getAuthRoles(storage),
    permissions: getAuthPermissions(storage),
  };
}

export function isAuthenticated(storage = appStorage) {
  return Boolean(getAuthToken(storage));
}

export function clearAuthSession(storage = appStorage) {
  storage.remove(STORAGE_KEYS.AUTH_TOKEN);
  storage.remove(STORAGE_KEYS.AUTH_USER);
  storage.remove(STORAGE_KEYS.AUTH_ROLES);
  storage.remove(STORAGE_KEYS.AUTH_PERMISSIONS);
  storage.remove(STORAGE_KEYS.SESSION);
}