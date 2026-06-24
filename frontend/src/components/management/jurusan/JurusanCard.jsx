import clsx from 'clsx';

import { AppIcon } from '../../ui/AppIcon.jsx';

export function JurusanCard({ jurusan, theme = 'light', onEdit }) {
  const isDark = theme === 'dark';

  return (
    <article className={clsx('rounded-xl p-3 sm:p-5', isDark ? 'bg-[#313b45]' : 'bg-white')}>
      <div className="mb-4 flex items-start justify-between gap-2 sm:mb-7">
        <div
          className={clsx(
            'grid h-9 min-w-11 place-items-center rounded-xl px-2 text-xs font-extrabold sm:h-10 sm:min-w-14 sm:px-3 sm:text-sm',
            isDark ? 'bg-[#56616d] text-[#F0EDE4]' : 'bg-[#dce5f0] text-[#43505a]',
          )}
        >
          {jurusan.kode_jurusan}
        </div>

        <span
          className={clsx(
            'rounded-md px-2 py-1 text-[0.62rem] font-extrabold sm:px-3 sm:text-xs',
            jurusan.status === 'aktif'
              ? 'bg-[#2f9e44]/20 text-[#35c46b]'
              : 'bg-[#ef4444]/20 text-[#ef4444]',
          )}
        >
          {jurusan.status_label}
        </span>
      </div>

      <h2
        className={clsx(
          'min-h-10 text-sm font-bold leading-tight sm:min-h-12 sm:text-lg',
          isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]',
        )}
      >
        {jurusan.nama_jurusan}
      </h2>

      <div className={clsx('mt-4 grid gap-2 text-xs sm:mt-7 sm:text-sm', isDark ? 'text-[#cfd8e3]' : 'text-[#6f7882]')}>
        <p className="m-0">
          <span className="font-bold">Ketua Jurusan:</span>
          <br />
          {jurusan.ketua_jurusan || 'Belum diisi'}
        </p>

        <p className="m-0 flex items-center gap-2">
          <AppIcon name="users" />
          {jurusan.total_siswa} Siswa
        </p>

        <p className="m-0 flex items-center gap-2">
          <AppIcon name="building" />
          {jurusan.total_rombel} Rombel
        </p>

        <p className="m-0 flex items-center gap-2">
          <AppIcon name="doorOpen" />
          {jurusan.total_ruang_lab} Ruang Lab
        </p>
      </div>

      <div className="mt-6 flex justify-end sm:mt-10">
        <button
          type="button"
          className={clsx(
            'h-9 w-full rounded-md text-xs font-bold transition sm:h-10 sm:w-24 sm:text-sm',
            isDark ? 'bg-[#56616d] text-[#F0EDE4] hover:bg-[#31527d]' : 'bg-[#dce5f0] text-[#43505a] hover:bg-[#bfcee3]',
          )}
          onClick={() => onEdit?.(jurusan)}
        >
          Edit
        </button>
      </div>
    </article>
  );
}
