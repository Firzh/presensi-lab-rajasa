import { describe, expect, it, vi, beforeEach } from 'vitest';
import { downloadExportLaporan } from '../api/laporanApi.js';

vi.mock('../lib/authSession.js', () => ({
  getAuthToken: () => 'token-test',
}));

describe('laporanApi export', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({
        'Content-Disposition': 'attachment; filename="laporan-presensi.xlsx"',
      }),
      blob: () => Promise.resolve(new Blob(['test'])),
    });

    URL.createObjectURL = vi.fn(() => 'blob:test');
    URL.revokeObjectURL = vi.fn();
  });

  it('maps excel format to xlsx', async () => {
    await downloadExportLaporan({}, 'excel');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('format=xlsx'),
      expect.objectContaining({
        method: 'GET',
      })
    );
  });
});
