import { h } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/preact';

import { submitQrScan } from '../api/presensiScanApi.js';
import { useDevScanSubmit } from '../hooks/useDevScanSubmit.js';

vi.mock('../api/presensiScanApi.js', () => ({
  submitQrScan: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function SubmitHookHarness({
  token = 'token-demo',
  presensiSesiId = '10',
  initialPayload = 'PAYLOAD-1',
  showResponse = vi.fn(() => true),
  initialProcessedPayloads = [],
  initialProcessedStudentIds = [],
}) {
  const [payloadRaw, setPayloadRaw] = useState(initialPayload);
  const [statusType, setStatusType] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [responseJson, setResponseJson] = useState(null);

  const processedPayloadsRef = useRef(new Set(initialProcessedPayloads));
  const processedStudentIdsRef = useRef(new Set(initialProcessedStudentIds));
  const isSubmittingRef = useRef(false);

  const { handleSubmitScan } = useDevScanSubmit({
    token,
    presensiSesiId,
    payloadRaw,
    setPayloadRaw,
    setResponseJson,
    setStatusType,
    setStatusMessage,
    showResponse,
    processedPayloadsRef,
    processedStudentIdsRef,
    isSubmittingRef,
  });

  return (
    <div>
      <p data-testid="payload">{payloadRaw}</p>
      <p data-testid="status-type">{statusType}</p>
      <p data-testid="status-message">{statusMessage}</p>
      <p data-testid="response-json">{responseJson ? JSON.stringify(responseJson) : ''}</p>

      <button type="button" onClick={() => handleSubmitScan()}>
        Submit Default
      </button>

      <button type="button" onClick={() => handleSubmitScan(' PAYLOAD-2 ')}>
        Submit Scanned
      </button>
    </div>
  );
}

describe('useDevScanSubmit', () => {
  it('rejects submit when token is empty', async () => {
    render(<SubmitHookHarness token="" />);

    await act(async () => {
      screen.getByText('Submit Default').click();
    });

    expect(submitQrScan).not.toHaveBeenCalled();
    expect(screen.getByTestId('status-type').textContent).toBe('error');
    expect(screen.getByTestId('status-message').textContent).toBe('Login dulu sebelum scan.');
  });

  it('rejects submit when session id is empty', async () => {
    render(<SubmitHookHarness presensiSesiId="" />);

    await act(async () => {
      screen.getByText('Submit Default').click();
    });

    expect(submitQrScan).not.toHaveBeenCalled();
    expect(screen.getByTestId('status-type').textContent).toBe('error');
    expect(screen.getByTestId('status-message').textContent).toBe('Presensi Sesi ID wajib diisi.');
  });

  it('rejects submit when payload is empty', async () => {
    render(<SubmitHookHarness initialPayload="" />);

    await act(async () => {
      screen.getByText('Submit Default').click();
    });

    expect(submitQrScan).not.toHaveBeenCalled();
    expect(screen.getByTestId('status-type').textContent).toBe('error');
    expect(screen.getByTestId('status-message').textContent).toBe('Payload QR kosong.');
  });

  it('submits scanned payload and handles success status', async () => {
    submitQrScan.mockResolvedValue({
      ok: true,
      data: {
        success: true,
        data: {
          status_scan: 'berhasil',
          attendance_status: 'hadir',
          affected_rows: 1,
          siswa: {
            siswa_id: 5,
            nama_lengkap: 'Budi',
          },
        },
      },
    });

    render(<SubmitHookHarness />);

    await act(async () => {
      screen.getByText('Submit Scanned').click();
    });

    expect(submitQrScan).toHaveBeenCalledWith({
      token: 'token-demo',
      presensiSesiId: '10',
      payloadRaw: 'PAYLOAD-2',
    });
    expect(screen.getByTestId('payload').textContent).toBe('PAYLOAD-2');
    expect(screen.getByTestId('status-type').textContent).toBe('success');
    expect(screen.getByTestId('status-message').textContent).toContain('Budi berhasil presensi');
  });

  it('handles duplicate payload before calling API', async () => {
    render(<SubmitHookHarness initialProcessedPayloads={['payload-1']} />);

    await act(async () => {
      screen.getByText('Submit Default').click();
    });

    expect(submitQrScan).not.toHaveBeenCalled();
    expect(screen.getByTestId('status-type').textContent).toBe('warning');
    expect(screen.getByTestId('status-message').textContent).toContain('sudah diproses di sesi ini');
    expect(screen.getByTestId('response-json').textContent).toContain('duplicate_frontend');
  });

  it('handles rejected duplicate status from backend', async () => {
    submitQrScan.mockResolvedValue({
      ok: true,
      data: {
        success: true,
        data: {
          status_scan: 'ditolak',
          siswa: {
            siswa_id: 6,
            nama_lengkap: 'Siti',
          },
        },
      },
    });

    render(<SubmitHookHarness />);

    await act(async () => {
      screen.getByText('Submit Default').click();
    });

    expect(screen.getByTestId('status-type').textContent).toBe('warning');
    expect(screen.getByTestId('status-message').textContent).toContain('sudah presensi pada jam ini');
  });

  it('handles invalid QR status', async () => {
    submitQrScan.mockResolvedValue({
      ok: true,
      data: {
        success: true,
        data: {
          status_scan: 'invalid',
          siswa: null,
        },
      },
    });

    render(<SubmitHookHarness />);

    await act(async () => {
      screen.getByText('Submit Default').click();
    });

    expect(screen.getByTestId('status-type').textContent).toBe('error');
    expect(screen.getByTestId('status-message').textContent).toBe(
      'QR tidak dikenal. Data tidak masuk presensi.'
    );
  });
});