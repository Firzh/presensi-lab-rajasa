import clsx from 'clsx';

import { AppIcon } from '../../ui/AppIcon.jsx';

export function JurusanCard({ jurusan, theme = 'light', onEdit }) {
  const isDark = theme === 'dark';

  return (
    <article className={clsx('rounded-xl p-5', isDark ? 'bg-[#313b45]' : 'bg-white')}>
      <div className="mb-7 flex items-start justify-between">
        <div
          className={clsx(
            'grid h-10 min-w-14 place-items-center rounded-xl px-3 text-sm font-extrabold',
            isDark ? 'bg-[#56616d] text-[#F0EDE4]' : 'bg-[#dce5f0] text-[#43505a]',
          )}
        >
          {jurusan.kode_jurusan}
        </div>

        <span
          className={clsx(
            'rounded-md px-3 py-1 text-xs font-extrabold',
            jurusan.status === 'aktif'
              ? 'bg-[#2f9e44]/20 text-[#35c46b]'
              : 'bg-[#ef4444]/20 text-[#ef4444]',
          )}
        >
          {jurusan.status_label}
        </span>
      </div>

      <h2 className={clsx('min-h-12 text-lg font-bold leading-tight', isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]')}>
        {jurusan.nama_jurusan}
      </h2>

      <div className={clsx('mt-7 grid gap-2 text-sm', isDark ? 'text-[#cfd8e3]' : 'text-[#6f7882]')}>
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

      <div className="mt-10 flex justify-end">
        <button
          type="button"
          className={clsx(
            'h-10 w-24 rounded-md text-sm font-bold transition',
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