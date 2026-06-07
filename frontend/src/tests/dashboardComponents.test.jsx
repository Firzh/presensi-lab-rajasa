import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';

import { DashboardPage } from '../pages/dashboard/DashboardPage.jsx';
import { DashboardStatCard } from '../components/dashboard/DashboardStatCard.jsx';
import { DashboardQuickAction } from '../components/dashboard/DashboardQuickAction.jsx';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('dashboard components', () => {
  it('renders stat card', () => {
    render(<DashboardStatCard icon="graduationCap" value={20} label="Total Siswa" tone="sky" />);

    expect(screen.getByText('20')).toBeTruthy();
    expect(screen.getByText('Total Siswa')).toBeTruthy();
  });

  it('renders quick action', () => {
    render(<DashboardQuickAction icon="plus" label="Tambah Siswa" href="/siswa" />);

    expect(screen.getByText('Tambah Siswa')).toBeTruthy();
    expect(screen.getByRole('link', { name: /tambah siswa/i }).getAttribute('href')).toBe('/siswa');
  });

  it('renders dashboard page shell', () => {
    render(<DashboardPage />);

    expect(screen.getByText('SMK RAJASA SURABAYA')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Presensi' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    expect(screen.getByText('Senin, 30 Maret 2026')).toBeTruthy();
    expect(screen.getByText('Presensi Terbaru')).toBeTruthy();
    expect(screen.getByText('Belum ada presensi hari ini')).toBeTruthy();
    expect(screen.getByText('Aksi Cepat')).toBeTruthy();
  });

  it('toggles dashboard theme', () => {
    render(<DashboardPage />);

    fireEvent.click(screen.getByLabelText('Ubah tema'));

    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
