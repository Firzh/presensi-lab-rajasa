import { describe, expect, it } from 'vitest';

import {
  clearAuthSession,
  getAuthPermissions,
  getAuthRoles,
  getAuthSession,
  getAuthToken,
  getAuthUser,
  isAuthenticated,
  saveAuthSession,
} from '../lib/authSession.js';
import { createStorageAdapter } from '../lib/storage.js';

class MemoryStorage {
  constructor() {
    this.items = new Map();
  }

  getItem(key) {
    return this.items.has(key) ? this.items.get(key) : null;
  }

  setItem(key, value) {
    this.items.set(key, String(value));
  }

  removeItem(key) {
    this.items.delete(key);
  }
}

function createTestStorage() {
  return createStorageAdapter(new MemoryStorage());
}

describe('authSession', () => {
  it('saves and reads auth session', () => {
    const storage = createTestStorage();

    const session = saveAuthSession(
      {
        token: 'token-demo',
        user: { id: 1, username: 'admin.demo' },
        roles: ['admin'],
        permissions: ['presensi.scan'],
      },
      storage,
    );

    expect(session.token).toBe('token-demo');
    expect(getAuthToken(storage)).toBe('token-demo');
    expect(getAuthUser(storage)).toEqual({ id: 1, username: 'admin.demo' });
    expect(getAuthRoles(storage)).toEqual(['admin']);
    expect(getAuthPermissions(storage)).toEqual(['presensi.scan']);
    expect(isAuthenticated(storage)).toBe(true);
  });

  it('returns normalized session data', () => {
    const storage = createTestStorage();

    saveAuthSession(
      {
        token: 'token-demo',
        user: { id: 1 },
      },
      storage,
    );

    expect(getAuthSession(storage)).toEqual({
      token: 'token-demo',
      user: { id: 1 },
      roles: [],
      permissions: [],
    });
  });

  it('clears auth session', () => {
    const storage = createTestStorage();

    saveAuthSession(
      {
        token: 'token-demo',
        user: { id: 1 },
        roles: ['admin'],
        permissions: ['presensi.scan'],
      },
      storage,
    );

    clearAuthSession(storage);

    expect(getAuthToken(storage)).toBe('');
    expect(getAuthUser(storage)).toBe(null);
    expect(getAuthRoles(storage)).toEqual([]);
    expect(getAuthPermissions(storage)).toEqual([]);
    expect(isAuthenticated(storage)).toBe(false);
  });
});