import { EmptyRow } from './EmptyRow.jsx';
import { StatusBadge } from './StatusBadge.jsx';

export function ScanLogTable({ rows }) {
  const items = rows || [];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Scan Log Terbaru</h2>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-left text-xs uppercase text-slate-600">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Sesi</th>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">NISN</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Warning</th>
              <th className="px-3 py-2">Rombel Sesi</th>
              <th className="px-3 py-2">Rombel Siswa</th>
              <th className="px-3 py-2">Waktu</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 && <EmptyRow colSpan={9} text="Belum ada scan log." />}

            {items.map((row) => (
              <tr className="border-b" key={row.scan_log_id}>
                <td className="px-3 py-2">{row.scan_log_id}</td>
                <td className="px-3 py-2">{row.presensi_sesi_id || '-'}</td>
                <td className="px-3 py-2 font-semibold">{row.payload_nama || '-'}</td>
                <td className="px-3 py-2">{row.payload_nisn || '-'}</td>
                <td className="px-3 py-2">
                  <StatusBadge value={row.status_scan} />
                </td>
                <td className="px-3 py-2">{row.warning_reason || '-'}</td>
                <td className="px-3 py-2">{row.selected_rombel_id || '-'}</td>
                <td className="px-3 py-2">{row.actual_rombel_id || '-'}</td>
                <td className="px-3 py-2">{row.created_at || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}