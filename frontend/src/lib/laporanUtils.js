export const LAPORAN_STATUS_OPTIONS = Object.freeze([
  { value: '', label: 'Pilih Filter' },
  { value: 'hadir', label: 'Hadir' },
  { value: 'terlambat', label: 'Terlambat' },
  { value: 'sakit', label: 'Sakit' },
  { value: 'izin', label: 'Izin' },
  { value: 'alpha', label: 'Alpha' },
]);

export const LAPORAN_VALIDASI_OPTIONS = Object.freeze([
  { value: 'perlu dicek', label: 'Perlu Dicek' },
  { value: 'valid', label: 'Valid' },
  { value: 'tidak valid', label: 'Tidak Valid' },
]);

export const LAPORAN_SUMMARY_ITEMS = Object.freeze([
  { key: 'hadir', label: 'Hadir', icon: 'circleCheck' },
  { key: 'terlambat', label: 'Terlambat', icon: 'clock' },
  { key: 'sakit', label: 'Sakit', icon: 'heartPulse' },
  { key: 'izin', label: 'Izin', icon: 'userCheck' },
  { key: 'alpha', label: 'Alpha', icon: 'circleXmark' },
]);

export function normalizeLaporanRow(row) {
  const siswa = row.siswa || {};
  const rombel = row.rombel || {};
  const jam = row.jam || {};

  const status = String(row.status || row.status_presensi || 'alpha').toLowerCase();

  return {
    id: row.presensi_id || row.id || `${siswa.nisn || row.nisn}-${row.jam_id || jam.jam_id || ''}`,
    presensi_id: row.presensi_id || '-',
    scan_log_id: row.scan_log_id || '-',
    tanggal: row.tanggal || row.tanggal_presensi || row.created_at?.slice?.(0, 10) || '-',
    siswa: siswa.nama_lengkap || row.nama_lengkap || row.nama_siswa || '-',
    nisn: siswa.nisn || row.nisn || '-',
    rombel: rombel.label_rombel || row.label_rombel || siswa.kelas_aktif || row.kelas_aktif || '-',
    ruangan: row.ruang_label_snapshot || row.ruangan || row.ruang || row.lab || '-',
    jam_masuk: row.scanned_at || row.jam_masuk || row.created_at || '-',
    status,
    validasi: row.validasi || row.validation_status || row.status_validasi || 'perlu dicek',
    mode_presensi: row.mode_presensi || '-',
    raw: row,
  };
}

export function normalizeLaporanRows(rows) {
  return rows.map((row) => normalizeLaporanRow(row));
}

export function getLaporanSummary(rows) {
  return rows.reduce(
    (summary, row) => {
      const status = String(row.status || '').toLowerCase();

      if (Object.hasOwn(summary, status)) {
        summary[status] += 1;
      }

      return summary;
    },
    {
      hadir: 0,
      terlambat: 0,
      sakit: 0,
      izin: 0,
      alpha: 0,
    }
  );
}

export function filterLaporanRows(rows, filters) {
  const keyword = String(filters.keyword || '')
    .trim()
    .toLowerCase();
  const status = String(filters.status || '')
    .trim()
    .toLowerCase();

  return rows.filter((row) => {
    const matchKeyword =
      keyword === '' ||
      row.siswa.toLowerCase().includes(keyword) ||
      row.nisn.toLowerCase().includes(keyword) ||
      row.rombel.toLowerCase().includes(keyword) ||
      row.ruangan.toLowerCase().includes(keyword);

    const matchStatus = status === '' || row.status === status;

    return matchKeyword && matchStatus;
  });
}

export function paginateRows(rows, page, perPage) {
  const start = (page - 1) * perPage;

  return rows.slice(start, start + perPage);
}

export function getTotalPages(totalRows, perPage) {
  return Math.max(1, Math.ceil(totalRows / perPage));
}

export function getVisiblePages(currentPage, totalPages) {
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startPage = Math.max(1, safePage - 2);
  const endPage = Math.min(totalPages, safePage + 2);

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
}

export function rowsToCsv(rows) {
  const headers = [
    'Tanggal',
    'Siswa',
    'NISN',
    'Rombel',
    'Ruangan',
    'Jam Masuk',
    'Status',
    'Validasi',
  ];

  const body = rows.map((row) => [
    row.tanggal,
    row.siswa,
    row.nisn,
    row.rombel,
    row.ruangan,
    row.jam_masuk,
    row.status,
    row.validasi,
  ]);

  return [headers, ...body]
    .map((line) => line.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');
}

export function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function exportLaporan(rows, format) {
  const filenameBase = `laporan-presensi-${new Date().toISOString().slice(0, 10)}`;
  const csv = rowsToCsv(rows);

  if (format === 'csv') {
    downloadBlob(csv, `${filenameBase}.csv`, 'text/csv;charset=utf-8;');
    return;
  }

  if (format === 'excel') {
    const html = `
      <table>
        ${csv
          .split('\n')
          .map(
            (line) =>
              `<tr>${line
                .split(',')
                .map((cell) => `<td>${cell.replaceAll('"', '')}</td>`)
                .join('')}</tr>`
          )
          .join('')}
      </table>
    `;

    downloadBlob(html, `${filenameBase}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
    return;
  }

  if (format === 'docx') {
    const html = `
      <html>
        <body>
          <h1>Laporan Presensi</h1>
          <pre>${csv}</pre>
        </body>
      </html>
    `;

    downloadBlob(html, `${filenameBase}.doc`, 'application/msword;charset=utf-8;');
    return;
  }

  if (format === 'pdf') {
    window.print();
  }
}
