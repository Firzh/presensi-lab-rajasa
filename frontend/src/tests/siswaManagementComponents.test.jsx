import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';

import { SiswaPage } from '../pages/management/SiswaPage.jsx';

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
});

describe('siswa management page', () => {
  it('renders siswa page shell and table', () => {
    render(<SiswaPage />);

    expect(screen.getByRole('heading', { name: 'Data Siswa' })).toBeTruthy();
    expect(screen.getByText('Kelola data siswa SMK Rajasa Surabaya')).toBeTruthy();
    expect(screen.getByText('NISN/NIS')).toBeTruthy();
    expect(screen.getAllByText('RACHMAD HIDAYAT').length).toBeGreaterThan(0);
  });

  it('filters siswa by keyword', () => {
    render(<SiswaPage />);

    fireEvent.input(screen.getByPlaceholderText('Cari NISN, NIS, atau nama...'), {
      target: { value: 'tidak ada' },
    });

    expect(screen.getByText('Tidak ada data siswa')).toBeTruthy();
  });

  it('opens create form and cancels it', () => {
    render(<SiswaPage />);

    fireEvent.click(screen.getByRole('button', { name: /tambah siswa/i }));

    expect(screen.getByRole('heading', { name: 'Tambah Data Siswa' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /batal/i }));

    expect(screen.getByRole('heading', { name: 'Data Siswa' })).toBeTruthy();
  });

  it('does not show pagination when data is only one page', () => {
    render(<SiswaPage />);

    expect(screen.queryByRole('button', { name: 'Halaman berikutnya' })).toBeFalsy();
  });

  it('opens edit form from table action', () => {
    render(<SiswaPage />);

    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);

    expect(screen.getByRole('heading', { name: 'Edit Data Siswa' })).toBeTruthy();
    expect(screen.getByDisplayValue('RACHMAD HIDAYAT')).toBeTruthy();
  });
});
