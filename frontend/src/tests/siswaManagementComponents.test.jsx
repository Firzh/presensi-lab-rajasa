import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';

import { SiswaPage } from '../pages/management/SiswaPage.jsx';
import { SiswaTable } from '../components/management/siswa/SiswaTable.jsx';
import { listSiswa } from '../api/siswaApi.js';

vi.mock('../api/siswaApi.js', () => ({
  listSiswa: vi.fn(),
}));

const siswaResponse = {
  ok: true,
  status: 200,
  data: {
    success: true,
    message: 'Daftar siswa.',
    data: {
      items: [
        {
          id: 1,
          siswa_id: 1,
          nisn: '0068234587',
          nis: '12345',
          nama: 'RACHMAD HIDAYAT',
          nama_lengkap: 'RACHMAD HIDAYAT',
          jurusan_id: 1,
          rombel_id: 1,
          jurusan: 'TKJ',
          kelas: 'X-1',
          gender: 'L',
          status: 'aktif',
          status_label: 'Aktif',
        },
      ],
      pagination: {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
      },
      options: {
        jurusan: [
          { jurusan_id: 1, kode_jurusan: 'TKJ', nama_jurusan: 'Teknik Komputer dan Jaringan' },
        ],
        rombel: [{ rombel_id: 1, label: 'X-1', jurusan_id: 1, kode_jurusan: 'TKJ' }],
        statuses: [{ value: 'aktif', label: 'Aktif' }],
      },
    },
  },
};

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
  vi.clearAllMocks();
});

beforeEach(() => {
  listSiswa.mockResolvedValue(siswaResponse);
});

describe('siswa management page', () => {
  it('renders siswa page shell and table from api', async () => {
    render(<SiswaPage />);

    expect(screen.getByRole('heading', { name: 'Data Siswa' })).toBeTruthy();
    expect(screen.getByText('Kelola data siswa SMK Rajasa Surabaya')).toBeTruthy();

    expect(await screen.findByText('RACHMAD HIDAYAT')).toBeTruthy();
    expect(screen.getByText('NISN/NIS')).toBeTruthy();
  });

  it('filters siswa by keyword through api query', async () => {
    render(<SiswaPage />);

    fireEvent.input(screen.getByPlaceholderText('Cari NISN, NIS, atau nama...'), {
      target: { value: 'rachmad' },
    });

    await waitFor(() => {
      expect(listSiswa).toHaveBeenCalledWith(
        expect.objectContaining({
          q: 'rachmad',
          page: 1,
          per_page: 10,
        })
      );
    });
  });

  it('opens create form and cancels it', async () => {
    render(<SiswaPage />);

    await screen.findByText('RACHMAD HIDAYAT');

    fireEvent.click(screen.getByRole('button', { name: /tambah siswa/i }));

    expect(screen.getByRole('heading', { name: 'Tambah Data Siswa' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /batal/i }));

    expect(screen.getByRole('heading', { name: 'Data Siswa' })).toBeTruthy();
  });

  it('shows only two pagination pages before and after current page', () => {
    render(
      <SiswaTable
        students={[
          {
            id: 1,
            nisn: '0096672112',
            nama: 'AISYAH LISTYA NARISTA',
            jurusan: 'AKL',
            kelas: '10 AKL',
            gender: '-',
            status_label: 'Aktif',
          },
        ]}
        currentPage={70}
        totalPages={140}
        onPageChange={() => {}}
      />
    );

    expect(screen.queryByRole('button', { name: '67' })).toBeFalsy();
    expect(screen.getByRole('button', { name: '68' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '69' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '70' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '71' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '72' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '73' })).toBeFalsy();
  });

  it('opens edit form from table action', async () => {
    render(<SiswaPage />);

    await screen.findByText('RACHMAD HIDAYAT');

    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);

    expect(screen.getByRole('heading', { name: 'Edit Data Siswa' })).toBeTruthy();
    expect(screen.getByDisplayValue('RACHMAD HIDAYAT')).toBeTruthy();
  });
});
