import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';

import { PengaturanPage } from '../pages/management/PengaturanPage.jsx';
import { calculateLateThreshold, getDefaultScheduleSlots } from '../lib/settingsUtils.js';

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
});

describe('pengaturan management page', () => {
  it('renders backup database tab by default', () => {
    render(<PengaturanPage />);

    expect(screen.getByRole('heading', { name: 'Pengaturan' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Backup Database' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /backup sekarang/i })).toBeTruthy();
  });

  it('renders rombel schedule editor and adds mapel slot', () => {
    render(<PengaturanPage />);

    fireEvent.click(screen.getByRole('button', { name: /jam pelajaran rombel/i }));

    expect(screen.getByRole('heading', { name: 'Jam Pelajaran Rombel' })).toBeTruthy();
    expect(screen.getByText('Mapel 6')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /tambah mapel/i }));

    expect(screen.getByText('Mapel 7')).toBeTruthy();
  });

  it('renders late rule calculator', () => {
    render(<PengaturanPage />);

    fireEvent.click(screen.getByRole('button', { name: /aturan keterlambatan/i }));

    expect(screen.getByRole('heading', { name: 'Aturan Keterlambatan' })).toBeTruthy();
    expect(screen.getByText('07:10')).toBeTruthy();
  });
});

describe('settings utils', () => {
  it('calculates late threshold and default schedule', () => {
    expect(calculateLateThreshold('07:00', 10)).toBe('07:10');
    expect(getDefaultScheduleSlots()).toHaveLength(7);
  });
});
