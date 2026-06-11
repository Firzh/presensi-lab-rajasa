/**
 * Centralized API Client — Interceptor 401 dan 403
 *
 * Perbaikan yang diimplementasikan:
 * - Response 401: Bersihkan session, redirect ke login (cegah infinite redirect)
 * - Response 403: Return hasil dengan flag forbidden=true, biarkan komponen handle UI
 * - Semua request private otomatis inject Authorization Bearer token
 * - Helper untuk membangun query string
 *
 * Catatan:
 * - clearAuthSession dan redirect hanya dilakukan di luar halaman login (/),
 *   untuk mencegah infinite redirect saat di halaman login itu sendiri.
 * - Interceptor ini bersifat opsional — API module lama masih bekerja.
 *   Gunakan apiFetch() untuk endpoint baru atau saat membutuhkan interceptor.
 */

import { clearAuthSession, getAuthToken } from './authSession.js';
import { ROUTES } from '../constants/routes.js';

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  Accept: 'application/json',
};

/**
 * Tangani response 401: bersihkan session dan redirect ke login.
 * Tidak redirect jika sudah berada di halaman login (cegah infinite redirect).
 */
function handle401() {
  const currentPath = window.location.pathname;

  if (currentPath === ROUTES.LOGIN || currentPath === '/') {
    return;
  }

  clearAuthSession();
  window.location.replace(ROUTES.LOGIN);
}

/**
 * Parse response JSON dan wrap dalam objek yang konsisten.
 * Jika response bukan JSON, return error generic.
 */
async function parseResponse(response) {
  const data = await response.json().catch(() => ({
    success: false,
    message: 'Response bukan JSON valid.',
    errors: {},
  }));

  return {
    ok: response.ok,
    status: response.status,
    forbidden: response.status === 403,
    unauthorized: response.status === 401,
    data,
  };
}

/**
 * Fetch dengan interceptor 401 dan 403.
 *
 * @param {string} url - URL endpoint
 * @param {RequestInit} options - opsi fetch
 * @param {boolean} withAuth - apakah inject token (default: true)
 */
export async function apiFetch(url, options = {}, withAuth = true) {
  const token = withAuth ? getAuthToken() : null;

  const headers = {
    ...BASE_HEADERS,
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Intercept 401: session expired atau token tidak valid → bersihkan dan redirect
  if (response.status === 401) {
    handle401();
  }

  return parseResponse(response);
}

/**
 * Helper untuk membangun query string dari object params.
 * Skip key dengan nilai kosong, null, atau undefined.
 */
export function buildQueryString(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, String(value));
    }
  });

  return query.toString();
}
