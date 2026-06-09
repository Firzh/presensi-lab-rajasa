import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';

import { listLaporanPresensi } from '../api/laporanApi.js';
import { LaporanPage } from '../pages/management/LaporanPage.jsx';

vi.mock('../api/laporanApi.js', () => ({
  listLaporanPresensi: vi.fn(),
}));

beforeEach(() => {
  listLaporanPresensi.mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      success: true,
      data: {
        items: [
          {
            presensi_id: 1,
            scan_log_id: 11,
            tanggal: '2026-04-21',
            scanned_at: '07:01:56',
            status: 'hadir',
            siswa: {
              nisn: '0068234587',
              nama_lengkap: 'Rachmat Hidayat',
              kelas_aktif: 'XII TKJ 3',
            },
            rombel: {
              label_rombel: 'XII TKJ 3',
            },
            ruang_label_snapshot: 'Lab TKJ 1',
          },
          {
            presensi_id: 2,
            scan_log_id: null,
            tanggal: '2026-04-21',
            scanned_at: null,
            status: 'alpha',
            siswa: {
              nisn: '0096672112',
              nama_lengkap: 'AISYAH LISTYA NARISTA',
              kelas_aktif: 'X TKJ 1',
            },
            rombel: {
              label_rombel: 'X TKJ 1',
            },
            ruang_label_snapshot: 'Lab TKJ 1',
          },
        ],
      },
    },
  });

  window.print = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('data-theme');
});

describe('laporan management page', () => {
  it('renders laporan data from database API', async () => {
    render(<LaporanPage />);

    expect(screen.getByRole('heading', { name: 'Laporan Presensi' })).toBeTruthy();
    expect(await screen.findByText('Rachmat Hidayat')).toBeTruthy();
    expect(screen.getByText('0068234587')).toBeTruthy();
    expect(screen.getAllByText('Lab TKJ 1')).toHaveLength(2);
  });

  it('filters laporan by status', async () => {
    render(<LaporanPage />);

    await screen.findByText('Rachmat Hidayat');

    fireEvent.input(screen.getByLabelText('Filter Status'), {
      target: { value: 'alpha' },
    });

    expect(screen.queryByText('Rachmat Hidayat')).toBeFalsy();
    expect(screen.getByText('AISYAH LISTYA NARISTA')).toBeTruthy();
  });

  it('opens edit validasi modal and updates selected row validation', async () => {
    render(<LaporanPage />);

    await screen.findByText('Rachmat Hidayat');

    fireEvent.click(screen.getByRole('button', { name: /edit validasi/i }));

    expect(screen.getByRole('heading', { name: 'Edit Validasi' })).toBeTruthy();

    fireEvent.input(screen.getByLabelText('Data Presensi'), {
      target: { value: '1' },
    });

    fireEvent.input(screen.getByLabelText('Validasi'), {
      target: { value: 'tidak valid' },
    });

    fireEvent.click(screen.getByRole('button', { name: /simpan validasi/i }));

    expect(screen.getAllByText('tidak valid').length).toBeGreaterThan(0);
  });

  it('opens export modal', async () => {
    render(<LaporanPage />);

    await screen.findByText('Rachmat Hidayat');

    fireEvent.click(screen.getByRole('button', { name: /eksport laporan/i }));

    expect(screen.getByRole('heading', { name: 'Export Laporan' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Export as CSV' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Export as Excel' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Export as PDF' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Export as Docx' })).toBeTruthy();
  });
});
