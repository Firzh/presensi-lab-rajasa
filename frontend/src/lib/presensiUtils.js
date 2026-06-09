export function sortJamIds(ids) {
  return [...new Set(ids.map(Number))].sort((a, b) => a - b);
}

export function getSelectedJamLabel(ids) {
  const sorted = sortJamIds(ids);

  return sorted.length > 0 ? `Jam ${sorted.join(', ')}` : 'Pilih jam';
}

export function toggleConsecutiveJam(selectedIds, jamId) {
  const current = sortJamIds(selectedIds);
  const target = Number(jamId);

  const next = current.includes(target)
    ? current.filter((id) => id !== target)
    : sortJamIds([...current, target]);

  if (next.length === 0) {
    return {
      selectedIds: current,
      error: 'Minimal satu jam pembelajaran harus dipilih.',
    };
  }

  if (next.length > 3) {
    return {
      selectedIds: current,
      error: 'Jam pembelajaran maksimal 3 jam.',
    };
  }

  for (let index = 1; index < next.length; index += 1) {
    if (next[index] !== next[index - 1] + 1) {
      return {
        selectedIds: current,
        error: 'Jam pembelajaran harus berurutan.',
      };
    }
  }

  return {
    selectedIds: next,
    error: '',
  };
}

export function getRombelLabel(rombel) {
  if (!rombel) return '-';

  return (
    rombel.label ||
    rombel.label_rombel ||
    rombel.label_rombel_raw ||
    [rombel.tingkatan, rombel.kode_jurusan, rombel.nomor_rombel].filter(Boolean).join(' ') ||
    `Rombel #${rombel.rombel_id}`
  );
}

export function sortPresensiRows(rows, warningRows = []) {
  const mappedWarnings = warningRows.map((row) => ({
    type: 'warning',
    id: `warning-${row.scan_log_id || row.payload_nisn || row.nama_lengkap}`,
    nama: row.nama_lengkap || row.siswa?.nama_lengkap || row.payload_nama || '-',
    nisn: row.nisn || row.siswa?.nisn || row.payload_nisn || '-',
    kelas: row.kelas_aktif || row.siswa?.kelas_aktif || '-',
    jam: '-',
    status: 'warning',
    keterangan: row.message || row.warning_reason || 'Siswa tidak sesuai rombel.',
    scanned_at: row.scanned_at || '',
  }));

  const mappedRows = rows.map((row) => ({
    type: 'attendance',
    id: `attendance-${row.presensi_id}`,
    nama: row.siswa?.nama_lengkap || '-',
    nisn: row.siswa?.nisn || '-',
    kelas: row.rombel?.label_rombel || row.siswa?.kelas_aktif || '-',
    jam: row.jam?.jam_ke ? `Jam ${row.jam.jam_ke}` : row.jam?.label_jam || '-',
    status: row.status,
    keterangan: row.keterangan || '-',
    scanned_at: row.scanned_at || '',
  }));

  const order = {
    alpha: 1,
    warning: 2,
    terlambat: 3,
    hadir: 4,
    izin: 5,
    sakit: 6,
  };

  return [...mappedRows, ...mappedWarnings].sort((a, b) => {
    const left = order[a.status] ?? 99;
    const right = order[b.status] ?? 99;

    if (left !== right) return left - right;

    return a.nama.localeCompare(b.nama);
  });
}