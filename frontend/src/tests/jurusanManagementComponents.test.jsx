import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';

import { JurusanPage } from '../pages/management/JurusanPage.jsx';
import {
  createJurusan,
  deleteJurusan,
  listJurusan,
  updateJurusan,
} from '../api/jurusanApi.js';

vi.mock('../api/jurusanApi.js', () => ({
  listJurusan: vi.fn(),
  createJurusan: vi.fn(),
  updateJurusan: vi.fn(),
  deleteJurusan: vi.fn(),
}));

const jurusanResponse = {
  ok: true,
  status: 200,
  data: {
    success: true,
    message: 'Daftar jurusan.',
    data: {
      items: [
        {
          id: 1,
          jurusan_id: 1,
          kode_jurusan: 'TKJ',
          nama_jurusan: 'Teknik Komputer dan Jaringan',
          ketua_jurusan: 'Ahmad Supiyadi, S.Pd.',
          deskripsi_jurusan: null,
          status: 'aktif',
          status_label: 'Aktif',
          total_siswa: 365,
          total_rombel: 6,
          total_ruang_lab: 0,
        },
      ],
      pagination: {
        page: 1,
        per_page: 4,
        total: 1,
        total_pages: 1,
      },
      options: {
        statuses: [
          { value: 'aktif', label: 'Aktif' },
          { value: 'nonaktif', label: 'Nonaktif' },
        ],
      },
    },
  },
};

const jurusanMutationResponse = {
  ok: true,
  status: 200,
  data: {
    success: true,
    message: 'Jurusan berhasil diperbarui.',
    data: {
      jurusan: jurusanResponse.data.data.items[0],
    },
  },
};

beforeEach(() => {
  listJurusan.mockResolvedValue(jurusanResponse);
  createJurusan.mockResolvedValue({
    ...jurusanMutationResponse,
    status: 201,
  });
  updateJurusan.mockResolvedValue(jurusanMutationResponse);
  deleteJurusan.mockResolvedValue(jurusanMutationResponse);
});

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
  vi.clearAllMocks();
});

describe('jurusan management page', () => {
  it('renders jurusan cards from api', async () => {
    render(<JurusanPage />);

    expect(screen.getByRole('heading', { name: 'Data Jurusan' })).toBeTruthy();
    expect(await screen.findByText('Teknik Komputer dan Jaringan')).toBeTruthy();
    expect(screen.getByText('TKJ')).toBeTruthy();
    expect(screen.getByText('365 Siswa')).toBeTruthy();
  });

  it('filters jurusan by keyword through api query', async () => {
    render(<JurusanPage />);

    fireEvent.input(screen.getByPlaceholderText('Cari kode, nama, atau ketua jurusan...'), {
      target: { value: 'tkj' },
    });

    await waitFor(() => {
      expect(listJurusan).toHaveBeenCalledWith(
        expect.objectContaining({
          q: 'tkj',
          page: 1,
          per_page: 4,
        }),
      );
    });
  });

  it('opens create form and saves jurusan', async () => {
    render(<JurusanPage />);

    await screen.findByText('Teknik Komputer dan Jaringan');

    fireEvent.click(screen.getByRole('button', { name: /tambah jurusan/i }));

    expect(screen.getByRole('heading', { name: 'Tambah Data Jurusan' })).toBeTruthy();

    fireEvent.input(screen.getByPlaceholderText('Contoh: TKJ'), {
      target: { value: 'RPL' },
    });

    fireEvent.input(screen.getByPlaceholderText('Contoh: Teknik Komputer dan Jaringan'), {
      target: { value: 'Rekayasa Perangkat Lunak' },
    });

    fireEvent.click(screen.getByRole('button', { name: /simpan/i }));

    await waitFor(() => {
      expect(createJurusan).toHaveBeenCalled();
    });
  });

  it('opens edit form and updates jurusan', async () => {
    render(<JurusanPage />);

    await screen.findByText('Teknik Komputer dan Jaringan');

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByRole('heading', { name: 'Edit Data Jurusan' })).toBeTruthy();
    expect(screen.getByDisplayValue('TKJ')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /simpan/i }));

    await waitFor(() => {
      expect(updateJurusan).toHaveBeenCalled();
    });
  });
});