import { h } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';

import {
  AttendanceTable,
  AuditSummaryCards,
  DevAuditHeader,
  EmptyRow,
  ScanLogTable,
  StatusBadge,
} from '../components/dev-audit/index.js';

afterEach(() => {
  cleanup();
});

describe('dev-audit components', () => {
  it('renders StatusBadge value', () => {
    render(<StatusBadge value="berhasil" />);

    expect(screen.getByText('berhasil')).toBeTruthy();
  });

  it('renders EmptyRow message', () => {
    render(
      <table>
        <tbody>
          <EmptyRow colSpan={3} text="Data kosong." />
        </tbody>
      </table>
    );

    expect(screen.getByText('Data kosong.')).toBeTruthy();
  });

  it('renders AuditSummaryCards values', () => {
    render(<AuditSummaryCards summary={{ total_scan: 5, total_hadir: 3 }} />);

    expect(screen.getByText('total scan')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('total hadir')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('renders DevAuditHeader and calls refresh handler', () => {
    const onRefresh = vi.fn();

    render(<DevAuditHeader status="Siap cek audit." onRefresh={onRefresh} />);

    expect(screen.getByText('Hasil Presensi Terkini')).toBeTruthy();
    expect(screen.getByText('Siap cek audit.')).toBeTruthy();

    fireEvent.click(screen.getByText('Refresh Audit'));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders ScanLogTable empty state and data row', () => {
    const rows = [
      {
        scan_log_id: 10,
        presensi_sesi_id: 2,
        payload_nama: 'Budi',
        payload_nisn: '12345',
        status_scan: 'berhasil',
        warning_reason: '',
        selected_rombel_id: 5,
        actual_rombel_id: 5,
        created_at: '2026-06-04 08:00:00',
      },
    ];

    render(<ScanLogTable rows={rows} />);

    expect(screen.getByText('Scan Log Terbaru')).toBeTruthy();
    expect(screen.getByText('Budi')).toBeTruthy();
    expect(screen.getByText('12345')).toBeTruthy();
    expect(screen.getByText('berhasil')).toBeTruthy();
  });

  it('renders ScanLogTable empty message', () => {
    render(<ScanLogTable rows={[]} />);

    expect(screen.getByText('Belum ada scan log.')).toBeTruthy();
  });

  it('renders AttendanceTable empty state and data row', () => {
    const rows = [
      {
        presensi_id: 20,
        presensi_sesi_id: 2,
        scan_log_id: 10,
        nama_lengkap: 'Siti',
        nisn: '67890',
        kelas_aktif: '10 TKJ 1',
        tanggal: '2026-06-04',
        jam_id: 1,
        status: 'hadir',
        mode_presensi: 'rombel',
        scanned_at: '2026-06-04 08:05:00',
      },
    ];

    render(<AttendanceTable rows={rows} />);

    expect(screen.getByText('Presensi Masuk dari Scan')).toBeTruthy();
    expect(screen.getByText('Siti')).toBeTruthy();
    expect(screen.getByText('67890')).toBeTruthy();
    expect(screen.getByText('10 TKJ 1')).toBeTruthy();
    expect(screen.getByText('hadir')).toBeTruthy();
  });

  it('renders AttendanceTable empty message', () => {
    render(<AttendanceTable rows={[]} />);

    expect(screen.getByText('Belum ada presensi dari scan.')).toBeTruthy();
  });
});