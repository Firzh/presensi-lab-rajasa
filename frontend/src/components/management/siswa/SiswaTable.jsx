import clsx from 'clsx';

import { AppIcon } from '../../ui/AppIcon.jsx';

const columns = Object.freeze([
  'NO',
  'NISN/NIS',
  'NAMA LENGKAP',
  'JURUSAN',
  'KELAS',
  'GENDER',
  'STATUS',
  'AKSI',
]);

export function SiswaTable({
  students,
  theme = 'light',
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onEdit,
}) {
  return (
    <section
      className={clsx(
        'mt-6 min-h-105 rounded-xl px-7 py-5',
        theme === 'dark' ? 'bg-[#313b45]' : 'bg-white'
      )}
    >
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr
            className={theme === 'dark' ? 'border-b border-[#1d262e]' : 'border-b border-[#c8d4e7]'}
          >
            {columns.map((column) => (
              <th
                key={column}
                className={clsx(
                  'pb-3 text-sm font-extrabold tracking-wide',
                  theme === 'dark' ? 'text-[#f4f1ec]' : 'text-[#6d8bb3]'
                )}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {students.length > 0 ? (
            students.map((student, index) => (
              <tr
                key={student.id}
                className={theme === 'dark' ? 'text-[#cfd8e3]' : 'text-[#86a0c3]'}
              >
                <td className="py-3 font-bold">{index + 1}</td>
                <td className="py-3 font-bold">{student.nisn}</td>
                <td className="py-3 font-bold">{student.nama}</td>
                <td className="py-3 font-bold">{student.jurusan}</td>
                <td className="py-3 font-bold">{student.kelas}</td>
                <td className="py-3 font-bold">{student.gender}</td>
                <td className="py-3 font-bold">{student.status}</td>
                <td className="py-3">
                  <button
                    type="button"
                    className={clsx(
                      'h-9 min-w-20 rounded-md px-4 text-sm font-medium transition',
                      theme === 'dark'
                        ? 'bg-[#56616d] text-[#f4f1ec] hover:bg-[#31527d]'
                        : 'bg-[#dce5f0] text-[#43505a] hover:bg-[#bfcee3]'
                    )}
                    onClick={() => onEdit?.(student)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <div className="grid min-h-75 place-items-center">
                  <div className="grid justify-items-center gap-4 text-center">
                    <AppIcon
                      name="inbox"
                      className={clsx(
                        'text-[3.5rem]',
                        theme === 'dark' ? 'text-[#929da8]' : 'text-[#c9d4e4]'
                      )}
                    />
                    <p
                      className={clsx(
                        'm-0 font-semibold',
                        theme === 'dark' ? 'text-[#cfd8e3]' : 'text-[#9ab0cf]'
                      )}
                    >
                      Tidak ada data siswa
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {students.length > 0 && totalPages > 1 ? (
        <div
          className={clsx(
            'mt-4 flex justify-center gap-4 text-base font-bold',
            theme === 'dark' ? 'text-[#cfd8e3]' : 'text-[#43505a]'
          )}
        >
          <button
            type="button"
            aria-label="Halaman sebelumnya"
            disabled={currentPage === 1}
            className="disabled:opacity-30"
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={clsx(
                'min-w-7 rounded-md px-2',
                page === currentPage
                  ? theme === 'dark'
                    ? 'bg-[#f4f1ec] text-[#1d262e]'
                    : 'bg-[#d8dee5] text-[#43505a]'
                  : 'opacity-70'
              )}
              onClick={() => onPageChange?.(page)}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            aria-label="Halaman berikutnya"
            disabled={currentPage === totalPages}
            className="disabled:opacity-30"
            onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
          >
            ›
          </button>
        </div>
      ) : null}
    </section>
  );
}
