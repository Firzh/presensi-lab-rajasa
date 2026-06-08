import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';

import {
  createPresensiSession,
  fetchPresensiToday,
  fetchRombelOptions,
  submitPresensiQrScan,
} from '../api/presensiApi.js';
import { PresensiPage } from '../pages/management/PresensiPage.jsx';
import { toggleConsecutiveJam } from '../lib/presensiUtils.js';

vi.mock('../api/presensiApi.js', () => ({
  checkPresensiSessionWarning: vi.fn(() =>
    Promise.resolve({
      ok: true,
      data: { success: true, data: { has_warning: false, conflicts: [] } },
    }),
  ),
  createPresensiSession: vi.fn(),
  fetchPresensiToday: vi.fn(),
  fetchRombelOptions: vi.fn(),
  finishPresensiSession: vi.fn(() => Promise.resolve({ ok: true, data: { success: true } })),
  heartbeatPresensiSession: vi.fn(() => Promise.resolve({ ok: true, data: { success: true } })),
  pausePresensiSession: vi.fn(() => Promise.resolve({ ok: true, data: { success: true } })),
  resumePresensiSession: vi.fn(() => Promise.resolve({ ok: true, data: { success: true } })),
  submitPresensiQrScan: vi.fn(),
}));

vi.mock('../lib/authSession.js', () => ({
  getAuthToken: vi.fn(() => 'token-demo'),
}));

vi.mock('../hooks/useQrScanner.js', () => ({
  useQrScanner: () => ({
    isScanning: false,
    scannerError: '',
    startScanner: vi.fn(),
    stopScanner: vi.fn(),
  }),
}));

beforeEach(() => {
  fetchRombelOptions.mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      success: true,
      data: {
        rombel: [{ rombel_id: 5, label_rombel: '10 TKJ 1', kode_jurusan: 'TKJ' }],
      },
    },
  });

  fetchPresensiToday.mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      success: true,
      data: {
        items: [
          {
            presensi_id: 1,
            status: 'alpha',
            siswa: { nisn: '0096672112', nama_lengkap: 'AISYAH LISTYA NARISTA', kelas_aktif: '10 TKJ 1' },
            rombel: { label_rombel: '10 TKJ 1' },
            jam: { jam_id: 1, jam_ke: 1 },
            keterangan: null,
          },
        ],
      },
    },
  });

  createPresensiSession.mockResolvedValue({
    ok: true,
    status: 201,
    data: {
      success: true,
      data: {
        session: {
          presensi_sesi_id: 99,
          ruang_label_snapshot: 'Kelas 10 TKJ 1',
        },
      },
    },
  });

  submitPresensiQrScan.mockResolvedValue({
    ok: true,
    status: 201,
    data: {
      success: true,
      data: {
        status_scan: 'berhasil',
        attendance_status: 'hadir',
        affected_rows: 1,
        siswa: {
          siswa_id: 1,
          nisn: '0096672112',
          nama_lengkap: 'AISYAH LISTYA NARISTA',
          kelas_aktif: '10 TKJ 1',
        },
      },
    },
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.documentElement.removeAttribute('data-theme');
});

async function waitUntilRombelLoaded() {
  await waitFor(() => {
    expect(screen.getByLabelText('Rombel').value).toBe('5');
  });
}

describe('presensi management page', () => {
  it('renders presensi setup and today table', async () => {
    render(<PresensiPage />);

    expect(screen.getByRole('heading', { name: 'Presensi' })).toBeTruthy();
    expect(screen.getByText('Setup Presensi')).toBeTruthy();
    expect(screen.getByText('Scan QR')).toBeTruthy();

    expect(await screen.findByText('AISYAH LISTYA NARISTA')).toBeTruthy();
  });

  it('creates presensi session', async () => {
    render(<PresensiPage />);

    await screen.findByText('AISYAH LISTYA NARISTA');
    await waitUntilRombelLoaded();

    fireEvent.click(screen.getByRole('button', { name: /mulai presensi/i }));

    await waitFor(() => {
      expect(createPresensiSession).toHaveBeenCalledWith(
        expect.objectContaining({
          modePresensi: 'rombel',
          jamIds: [1],
          ruangPilihan: 'kelas',
        }),
      );
    });

    expect(await screen.findByText(/Sesi presensi berhasil dibuat/i)).toBeTruthy();
  });

  it('rejects non consecutive jam selection', () => {
    const result = toggleConsecutiveJam([1], 3);

    expect(result.selectedIds).toEqual([1]);
    expect(result.error).toBe('Jam pembelajaran harus berurutan.');
  });

  it('shows warning modal when scan returns wrong rombel warning', async () => {
    submitPresensiQrScan.mockResolvedValueOnce({
      ok: true,
      status: 201,
      data: {
        success: true,
        data: {
          status_scan: 'warning',
          warning_reason: 'siswa_tidak_sesuai_rombel',
          message: 'Siswa tidak sesuai rombel.',
          siswa: {
            nisn: '0106325606',
            nama_lengkap: 'AISYAH NUR AMALINA',
            kelas_aktif: '10 MP',
          },
        },
      },
    });

    render(<PresensiPage />);

    await screen.findByText('AISYAH LISTYA NARISTA');
    await waitUntilRombelLoaded();

    fireEvent.click(screen.getByRole('button', { name: /mulai presensi/i }));

    await screen.findByText(/Sesi presensi berhasil dibuat/i);

    fireEvent.input(screen.getByPlaceholderText('Payload QR manual...'), {
      target: { value: 'payload-warning' },
    });

    fireEvent.click(screen.getByRole('button', { name: /kirim manual/i }));

    expect(await screen.findByText('Warning Kartu Tidak Sesuai')).toBeTruthy();
    expect(
      screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'p' &&
          content.includes('AISYAH NUR AMALINA terdeteksi tidak sesuai rombel')
        );
      }),
    ).toBeTruthy();
  });
});