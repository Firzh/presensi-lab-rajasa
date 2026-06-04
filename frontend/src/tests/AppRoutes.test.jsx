import { h } from 'preact';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/preact';

import { AppRoutes } from '../routes/AppRoutes.jsx';

afterEach(() => {
  cleanup();
  window.history.pushState({}, '', '/');
});

function renderRoute(path) {
  window.history.pushState({}, '', path);

  return render(<AppRoutes />);
}

describe('AppRoutes', () => {
  it('renders HomePageDev for root route', () => {
    renderRoute('/');

    expect(screen.getByText('Frontend Baseline')).toBeTruthy();
    expect(screen.getByText('Buka Dev Scanner')).toBeTruthy();
  });

  it('renders DevScanPage route', () => {
    renderRoute('/dev/scan');

    expect(screen.getByText('Demo Scan QR Presensi')).toBeTruthy();
  });

  it('renders DevImportPage route', () => {
    renderRoute('/dev/import');

    expect(screen.getByText('Demo Advanced Import')).toBeTruthy();
  });

  it('renders DevAttendanceAuditPage route', () => {
    renderRoute('/dev/attendance-audit');

    expect(screen.getByText('Hasil Presensi Terkini')).toBeTruthy();
  });

  it('renders NotFoundPage for unknown route', () => {
    renderRoute('/route-tidak-ada');

    expect(screen.getByText('Halaman tidak ditemukan')).toBeTruthy();
  });
});