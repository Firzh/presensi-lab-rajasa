import clsx from 'clsx';

import { sortPresensiRows } from '../../../lib/presensiUtils.js';
import { AppIcon } from '../../ui/AppIcon.jsx';

const statusClassMap = Object.freeze({
  alpha: 'bg-red-500/10 text-red-400',
  warning: 'bg-yellow-500/10 text-yellow-400',
  hadir: 'bg-green-500/10 text-green-400',
  terlambat: 'bg-orange-500/10 text-orange-400',
  izin: 'bg-blue-500/10 text-blue-400',
  sakit: 'bg-purple-500/10 text-purple-400',
});

export function PresensiTodayTable({ rows, warningRows, theme = 'light' }) {
  const isDark = theme === 'dark';
  const sortedRows = sortPresensiRows(rows, warningRows);

  return (
    <section className={clsx('rounded-xl p-5', isDark ? 'bg-[#313b45]' : 'bg-white')}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className={clsx('m-0 text-xl font-extrabold', isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]')}>
            Presensi Hari Ini
          </h2>
          <p className="m-0 mt-2 text-sm font-semibold text-[#8b9298]">
            Urutan: Alpha, Warning, lalu status lainnya.
          </p>
        </div>

        <span className="rounded-md bg-[#a9c9f4]/30 px-3 py-1 text-xs font-extrabold text-[#4f6b8b]">
          {sortedRows.length} Data
        </span>
      </div>

      {sortedRows.length === 0 ? (
        <div className="grid min-h-[260px] place-items-center text-center text-[#8b9298]">
          <div>
            <AppIcon name="inbox" className="text-[3rem]" />
            <p className="mt-3 font-bold">Belum ada data presensi untuk filter ini.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className={isDark ? 'border-b border-[#1d262e]' : 'border-b border-[#c8d4e7]'}>
                <th className="pb-3 font-extrabold text-[#8b9298]">NISN</th>
                <th className="pb-3 font-extrabold text-[#8b9298]">Nama</th>
                <th className="pb-3 font-extrabold text-[#8b9298]">Kelas</th>
                <th className="pb-3 font-extrabold text-[#8b9298]">Jam</th>
                <th className="pb-3 font-extrabold text-[#8b9298]">Status</th>
                <th className="pb-3 font-extrabold text-[#8b9298]">Keterangan</th>
              </tr>
            </thead>

            <tbody>
              {sortedRows.map((row) => (
                <tr key={row.id} className={isDark ? 'text-[#cfd8e3]' : 'text-[#6f7882]'}>
                  <td className="py-3 font-bold">{row.nisn}</td>
                  <td className="py-3 font-bold">{row.nama}</td>
                  <td className="py-3 font-bold">{row.kelas}</td>
                  <td className="py-3 font-bold">{row.jam}</td>
                  <td className="py-3">
                    <span className={clsx('rounded-md px-3 py-1 text-xs font-extrabold', statusClassMap[row.status] || 'bg-slate-500/10 text-slate-400')}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 font-medium">{row.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}