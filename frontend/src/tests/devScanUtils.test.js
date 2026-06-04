import { describe, expect, it } from 'vitest';
import {
  getQrFingerprint,
  getRombelLabel,
  getSelectedJamLabel,
  sortJamIds,
} from '../lib/devScanUtils.js';

describe('devScanUtils', () => {
  it('sorts jam ids ascending without mutating original array', () => {
    const input = [3, 1, 2];

    expect(sortJamIds(input)).toEqual([1, 2, 3]);
    expect(input).toEqual([3, 1, 2]);
  });

  it('creates normalized QR fingerprint', () => {
    expect(getQrFingerprint('  ABC-123  ')).toBe('abc-123');
  });

  it('returns fallback rombel label when item is empty', () => {
    expect(getRombelLabel(null)).toBe('Belum memilih rombel');
  });

  it('returns rombel label from available label fields', () => {
    expect(getRombelLabel({ label: '10 TKJ 1' })).toBe('10 TKJ 1');
    expect(getRombelLabel({ label_rombel: '11 TKRO 2' })).toBe('11 TKRO 2');
    expect(getRombelLabel({ label_rombel_raw: '12 TP 1' })).toBe('12 TP 1');
  });

  it('returns rombel id fallback when no label is available', () => {
    expect(getRombelLabel({ rombel_id: 99 })).toBe('Rombel #99');
  });

  it('returns selected jam label', () => {
    expect(getSelectedJamLabel([])).toBe('Pilih jam presensi');
    expect(getSelectedJamLabel([1])).toBe('Jam 1');
    expect(getSelectedJamLabel([1, 3])).toBe('Jam 1, Jam 3');
  });
});