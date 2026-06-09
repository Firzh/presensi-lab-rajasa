import clsx from 'clsx';

import { getVisiblePages } from '../../../lib/laporanUtils.js';
import { AppIcon } from '../../ui/AppIcon.jsx';

const statusClassMap = Object.freeze({
  hadir: 'text-[#6f89b9]',
  terlambat: 'text-[#d5a43c]',
  sakit: 'text-[#55aa94]',
  izin: 'text-[#8d72c1]',
  alpha: 'text-[#ce6973]',
});

export function LaporanTable({ rows, theme = 'light', currentPage, totalPages, onPageChange }) {
  const isDark = theme === 'dark';

  return (
    <section className={clsx('rounded-xl p-7', isDark ? 'bg-[#313b45]' : 'bg-white')}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-245 border-collapse text-left text-sm">
          <thead>
            <tr className={isDark ? 'border-b border-[#64717d]' : 'border-b border-[#c8d4e7]'}>
              <th className="px-4 pb-4 text-xs font-extrabold tracking-wider text-[#6f89b9]">
                TANGGAL
              </th>
              <th className="px-4 pb-4 text-xs font-extrabold tracking-wider text-[#6f89b9]">
                SISWA
              </th>
              <th className="px-4 pb-4 text-xs font-extrabold tracking-wider text-[#6f89b9]">
                ROMBEL
              </th>
              <th className="px-4 pb-4 text-xs font-extrabold tracking-wider text-[#6f89b9]">
                RUANGAN
              </th>
              <th className="px-4 pb-4 text-xs font-extrabold tracking-wider text-[#6f89b9]">
                JAM MASUK
              </th>
              <th className="px-4 pb-4 text-xs font-extrabold tracking-wider text-[#6f89b9]">
                STATUS
              </th>
              <th className="px-4 pb-4 text-xs font-extrabold tracking-wider text-[#6f89b9]">
                VALIDASI
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="grid min-h-75 place-items-center text-center text-[#b9c4d4]">
                    <div>
                      <AppIcon name="inbox" className="text-[3rem]" />
                      <p className="mt-4 font-bold">Tidak ada data siswa</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className={isDark ? 'text-[#cfd8e3]' : 'text-[#6f89b9]'}>
                  <td className="px-4 py-3 font-bold">{row.tanggal}</td>
                  <td className="px-4 py-3 font-bold">
                    <span className="block">{row.siswa}</span>
                    <span className="block text-xs opacity-80">{row.nisn}</span>
                  </td>
                  <td className="px-4 py-3 font-bold">{row.rombel}</td>
                  <td className="px-4 py-3 font-bold">{row.ruangan}</td>
                  <td className="px-4 py-3 font-bold">{row.jam_masuk}</td>
                  <td
                    className={clsx(
                      'px-4 py-3 font-extrabold',
                      statusClassMap[row.status] || 'text-[#8b9298]'
                    )}
                  >
                    {row.status}
                  </td>
                  <td className="px-4 py-3 font-extrabold">{row.validasi}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-8 flex justify-center gap-4 text-base font-bold">
          <button
            type="button"
            aria-label="Halaman sebelumnya"
            disabled={currentPage === 1}
            className="disabled:opacity-30"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            ‹
          </button>

          {getVisiblePages(currentPage, totalPages).map((page) => (
            <button
              key={page}
              type="button"
              className={clsx(
                'min-w-7 rounded-md px-2',
                page === currentPage
                  ? isDark
                    ? 'bg-[#F0EDE4] text-[#1d262e]'
                    : 'bg-[#d8dee5] text-[#43505a]'
                  : 'opacity-70 hover:opacity-100'
              )}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            aria-label="Halaman berikutnya"
            disabled={currentPage === totalPages}
            className="disabled:opacity-30"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          >
            ›
          </button>
        </div>
      ) : null}
    </section>
  );
}
