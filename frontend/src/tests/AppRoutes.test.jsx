import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/preact';

import { AppRoutes } from '../routes/AppRoutes.jsx';
import { listSiswa } from '../api/siswaApi.js';
import { listJurusan } from '../api/jurusanApi.js';
import { listLaporanPresensi } from '../api/laporanApi.js';
import { getDashboardData } from '../api/dashboardApi.js';
import { fetchPresensiToday, fetchRombelOptions } from '../api/presensiApi.js';

vi.mock('../api/dashboardApi.js', () => ({
  getDashboardData: vi.fn(),
}));

vi.mock('../api/siswaApi.js', () => ({
  listSiswa: vi.fn(),
}));

vi.mock('../api/jurusanApi.js', () => ({
  listJurusan: vi.fn(),
}));

vi.mock('../api/presensiApi.js', () => ({
  fetchPresensiToday: vi.fn(),
  fetchRombelOptions: vi.fn(),
}));

vi.mock('../api/laporanApi.js', () => ({
  listLaporanPresensi: vi.fn(),
}));

vi.mock('../lib/authSession.js', () => ({
  isAuthenticated: vi.fn(() => true),
  getAuthToken: vi.fn(() => 'abc'),
  getAuthUser: vi.fn(() => ({ username: 'admin.test', user_type: 'admin' })),
  getAuthRoles: vi.fn(() => ['Admin']),
  getAuthSession: vi.fn(() => ({ token: 'abc' })),
}));

afterEach(() => {
  cleanup();
  window.history.pushState({}, '', '/');
});

function renderRoute(path) {
  window.history.pushState({}, '', path);

  return render(<AppRoutes />);
}

listJurusan.mockResolvedValue({
  ok: true,
  status: 200,
  data: {
    success: true,
    message: 'Daftar jurusan.',
    data: {
      items: [],
      pagination: {
        page: 1,
        per_page: 4,
        total: 0,
        total_pages: 1,
      },
      options: {
        statuses: [],
      },
    },
  },
});

fetchRombelOptions.mockResolvedValue({
  ok: true,
  status: 200,
  data: {
    success: true,
    data: {
      rombel: [],
    },
  },
});

fetchPresensiToday.mockResolvedValue({
  ok: true,
  status: 200,
  data: {
    success: true,
    data: {
      items: [],
    },
  },
});

listLaporanPresensi.mockResolvedValue({
  ok: true,
  status: 200,
  data: {
    success: true,
    data: {
      items: [],
    },
  },
});

beforeEach(() => {
  getDashboardData.mockResolvedValue({
    ok: true,
    data: {
      totalSiswa: 0,
      hadirHari: 0,
      tidakHadir: 0,
      logAksesInvalid: 0,
      recentPresensi: [],
    },
  });
  listSiswa.mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      success: true,
      message: 'Daftar siswa.',
      data: {
        items: [],
        pagination: {
          page: 1,
          per_page: 10,
          total: 0,
          total_pages: 1,
        },
        options: {
          jurusan: [],
          rombel: [],
          statuses: [],
        },
      },
    },
  });
});

describe('AppRoutes', () => {
  it('renders LoginPage for root route', () => {
    renderRoute('/');

    expect(screen.getByText('Sistem Presensi Lab')).toBeTruthy();
    expect(screen.getByText('Selamat Datang')).toBeTruthy();
  });

  it('renders DevScanPage route', () => {
    renderRoute('/dev');

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

  it('renders DashboardPage route', () => {
    renderRoute('/dashboard');

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    expect(screen.getByText('Total Siswa')).toBeTruthy();
  });

  it('renders SiswaPage route', () => {
    renderRoute('/siswa');

    expect(screen.getByRole('heading', { name: 'Data Siswa' })).toBeTruthy();
    expect(screen.getByText('Kelola data siswa SMK Rajasa Surabaya')).toBeTruthy();
  });

  it('renders JurusanPage route', () => {
    renderRoute('/jurusan');

    expect(screen.getByRole('heading', { name: 'Data Jurusan' })).toBeTruthy();
    expect(screen.getByText('Kelola data jurusan SMK Rajasa Surabaya')).toBeTruthy();
  });

  it('renders PresensiPage route', () => {
    renderRoute('/presensi');

    expect(screen.getByRole('heading', { name: 'Presensi' })).toBeTruthy();
    expect(screen.getByText('Buat sesi, lalu pantau presensi siswa hari ini.')).toBeTruthy();
  });

  it('renders PresensiScanPage route', () => {
    renderRoute('/presensi/scan');

    expect(screen.getByRole('heading', { name: 'Scan QR Presensi' })).toBeTruthy();
  });

  it('renders LaporanPage route', () => {
    renderRoute('/laporan');

    expect(screen.getByRole('heading', { name: 'Laporan Presensi' })).toBeTruthy();
    expect(screen.getByText('Kelola dan pantau laporan presensi siswa')).toBeTruthy();
  });

  it('renders PengaturanPage route', () => {
    renderRoute('/pengaturan');

    expect(screen.getByRole('heading', { name: 'Pengaturan' })).toBeTruthy();
    expect(
      screen.getByText(
        'Pusat kontrol administratif untuk backup, jadwal rombel, dan aturan keterlambatan.'
      )
    ).toBeTruthy();
  });

  it('renders NotFoundPage for unknown route', () => {
    renderRoute('/route-tidak-ada');

    expect(screen.getByText('Halaman tidak ditemukan')).toBeTruthy();
  });
});
