import { EmptyRow } from './EmptyRow.jsx';
import { StatusBadge } from './StatusBadge.jsx';

export function AttendanceTable({ rows }) {
  const items = rows || [];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Presensi Masuk dari Scan</h2>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-left text-xs uppercase text-slate-600">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Sesi</th>
              <th className="px-3 py-2">Scan Log</th>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">NISN</th>
              <th className="px-3 py-2">Kelas</th>
              <th className="px-3 py-2">Tanggal</th>
              <th className="px-3 py-2">Jam</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Mode</th>
              <th className="px-3 py-2">Scan At</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 && <EmptyRow colSpan={11} text="Belum ada presensi dari scan." />}

            {items.map((row) => (
              <tr className="border-b" key={row.presensi_id}>
                <td className="px-3 py-2">{row.presensi_id}</td>
                <td className="px-3 py-2">{row.presensi_sesi_id || '-'}</td>
                <td className="px-3 py-2">{row.scan_log_id || '-'}</td>
                <td className="px-3 py-2 font-semibold">{row.nama_lengkap || '-'}</td>
                <td className="px-3 py-2">{row.nisn || '-'}</td>
                <td className="px-3 py-2">{row.kelas_aktif || '-'}</td>
                <td className="px-3 py-2">{row.tanggal || '-'}</td>
                <td className="px-3 py-2">{row.jam_id || '-'}</td>
                <td className="px-3 py-2">
                  <StatusBadge value={row.status} />
                </td>
                <td className="px-3 py-2">{row.mode_presensi || '-'}</td>
                <td className="px-3 py-2">{row.scanned_at || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}