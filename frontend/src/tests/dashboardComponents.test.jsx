import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';

import { DashboardPage } from '../pages/dashboard/DashboardPage.jsx';
import { DashboardStatCard } from '../components/dashboard/DashboardStatCard.jsx';
import { DashboardQuickAction } from '../components/dashboard/DashboardQuickAction.jsx';
import { getDashboardData } from '../api/dashboardApi.js';
import { getAuthSession } from '../lib/authSession.js';

vi.mock('../lib/authSession.js', () => ({
  getAuthSession: vi.fn(),
}));

vi.mock('../api/dashboardApi.js', () => ({
  getDashboardData: vi.fn(),
}));

beforeEach(() => {
  getAuthSession.mockReturnValue({
    token: 'token-admin',
    user: {
      username: 'admin.test',
      user_type: 'admin',
    },
    roles: ['Admin'],
    permissions: [],
  });

  getDashboardData.mockResolvedValue({
    ok: true,
    data: {
      totalSiswa: 20,
      hadirHari: 15,
      tidakHadir: 3,
      logAksesInvalid: 2,
      recentPresensi: [
        {
          presensi_id: 1,
          status: 'hadir',
          scanned_at: '2026-06-09 07:15:00',
          siswa: { nama_lengkap: 'Siti Aisyah', nisn: '12345' },
          rombel: { label_rombel: 'X RPL 1' },
        },
      ],
    },
  });
});

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

  it('renders dashboard page shell', async () => {
    render(<DashboardPage />);

    expect(screen.getByText('SMK RAJASA SURABAYA')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Lihat Presensi' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    expect(screen.getByText('Presensi Terbaru')).toBeTruthy();
    expect(await screen.findByText('Siti Aisyah')).toBeTruthy();
    expect(screen.getByText('Aksi Cepat')).toBeTruthy();
  });

  it('hides log users menu and action for guru session', async () => {
    getAuthSession.mockReturnValue({
      token: 'token-guru',
      user: {
        username: 'guru.demo',
        user_type: 'guru',
      },
      roles: ['Guru'],
      permissions: [],
    });

    render(<DashboardPage />);

    expect(await screen.findByText('Total Siswa')).toBeTruthy();
    expect(screen.queryByText('Log Users')).toBeNull();
    expect(screen.queryByText('Log Akses Invalid')).toBeNull();
  });

  it('toggles dashboard theme', () => {
    render(<DashboardPage />);

    fireEvent.click(screen.getByLabelText('Ubah tema'));

    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
