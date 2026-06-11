import { apiFetch } from '../lib/apiClient.js';

export async function login({ username, password }) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }, false);
}

export async function logout({ token }) {
  return apiFetch('/api/auth/logout', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function getMe({ token }) {
  return apiFetch('/api/me', {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}