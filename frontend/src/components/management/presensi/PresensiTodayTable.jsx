import clsx from 'clsx';

function StatusBadge({ value }) {
  const normalized = String(value || '-').toLowerCase();

  const className =
    normalized === 'hadir'
      ? 'bg-green-500/10 text-green-400'
      : normalized === 'alpha'
        ? 'bg-red-500/10 text-red-400'
        : normalized === 'warning'
          ? 'bg-yellow-500/10 text-yellow-400'
          : normalized === 'terlambat'
            ? 'bg-orange-500/10 text-orange-400'
            : 'bg-slate-500/10 text-slate-400';

  return (
    <span className={clsx('rounded-md px-3 py-1 text-xs font-extrabold', className)}>
      {normalized}
    </span>
  );
}

export function PresensiTodayTable({ rows, theme = 'light' }) {
  const isDark = theme === 'dark';
  const items = rows || [];

  return (
    <section className={clsx('rounded-xl p-5', isDark ? 'bg-[#313b45]' : 'bg-white')}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2
            className={clsx(
              'm-0 text-xl font-extrabold',
              isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
            )}
          >
            Presensi Hari Ini
          </h2>
          <p className="m-0 mt-2 text-sm font-semibold text-[#8b9298]">
            Referensi audit presensi masuk dari scan.
          </p>
        </div>

        <span className="rounded-md bg-[#a9c9f4]/30 px-3 py-1 text-xs font-extrabold text-[#4f6b8b]">
          {items.length} Data
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-260 border-collapse text-left text-sm">
          <thead>
            <tr className={isDark ? 'bg-[#1d262e] text-[#cfd8e3]' : 'bg-[#eef1f5] text-[#6f7882]'}>
              <th className="px-3 py-3">ID</th>
              <th className="px-3 py-3">Sesi</th>
              <th className="px-3 py-3">Scan Log</th>
              <th className="px-3 py-3">Nama</th>
              <th className="px-3 py-3">NISN</th>
              <th className="px-3 py-3">Kelas</th>
              <th className="px-3 py-3">Tanggal</th>
              <th className="px-3 py-3">Jam</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Mode</th>
              <th className="px-3 py-3">Scan At</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center font-bold text-[#8b9298]" colSpan={11}>
                  Belum ada presensi hari ini.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.presensi_id}
                  className={clsx(
                    'border-b',
                    isDark ? 'border-[#1d262e] text-[#cfd8e3]' : 'border-[#e5e9ef] text-[#6f7882]'
                  )}
                >
                  <td className="px-3 py-3">{row.presensi_id}</td>
                  <td className="px-3 py-3">{row.presensi_sesi_id || '-'}</td>
                  <td className="px-3 py-3">{row.scan_log_id || '-'}</td>
                  <td className="px-3 py-3 font-bold">
                    {row.siswa?.nama_lengkap || row.nama_lengkap || '-'}
                  </td>
                  <td className="px-3 py-3">{row.siswa?.nisn || row.nisn || '-'}</td>
                  <td className="px-3 py-3">
                    {row.rombel?.label_rombel || row.siswa?.kelas_aktif || row.kelas_aktif || '-'}
                  </td>
                  <td className="px-3 py-3">{row.tanggal || '-'}</td>
                  <td className="px-3 py-3">
                    {row.jam?.jam_ke ? `Jam ${row.jam.jam_ke}` : row.jam_id || '-'}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge value={row.status} />
                  </td>
                  <td className="px-3 py-3">{row.mode_presensi || '-'}</td>
                  <td className="px-3 py-3">{row.scanned_at || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
