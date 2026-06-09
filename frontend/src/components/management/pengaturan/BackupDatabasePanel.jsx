import clsx from 'clsx';

import { AppIcon } from '../../ui/AppIcon.jsx';

export function BackupDatabasePanel({ theme = 'light', backups, onBackupNow, onDownload }) {
  const isDark = theme === 'dark';
  const latestBackup = backups[0];

  return (
    <section className={clsx('rounded-2xl p-4 sm:p-6', isDark ? 'bg-[#313b45]' : 'bg-white')}>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h2
            className={clsx(
              'm-0 text-2xl font-extrabold',
              isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
            )}
          >
            Backup Database
          </h2>
          <p className="m-0 mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-[#8b9298]">
            Pantau status backup, simpan riwayat file, dan unduh file cadangan saat dibutuhkan.
          </p>
        </div>

        <button
          type="button"
          className={clsx(
            'flex h-12 w-full items-center justify-center gap-3 rounded-xl px-5 text-sm font-extrabold transition hover:-translate-y-0.5 sm:w-auto',
            isDark
              ? 'bg-[#4f8fe7] text-white hover:bg-[#6fa6ef]'
              : 'bg-[#31527d] text-white hover:bg-[#456da1]'
          )}
          onClick={onBackupNow}
        >
          <AppIcon name="shieldHalved" />
          Backup Sekarang
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div
          className={clsx(
            'rounded-2xl border p-4 transition hover:-translate-y-0.5',
            isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#e3eaf4] bg-[#f8fbff]'
          )}
        >
          <p className="m-0 text-xs font-extrabold uppercase tracking-wide text-[#8b9298]">
            Status Backup
          </p>
          <p className="m-0 mt-3 text-xl font-extrabold text-green-400">Aman</p>
          <p className="m-0 mt-1 text-sm font-semibold text-[#8b9298]">
            Backup terakhir berhasil diproses.
          </p>
        </div>

        <div
          className={clsx(
            'rounded-2xl border p-4 transition hover:-translate-y-0.5',
            isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#e3eaf4] bg-[#f8fbff]'
          )}
        >
          <p className="m-0 text-xs font-extrabold uppercase tracking-wide text-[#8b9298]">
            Backup Terakhir
          </p>
          <p
            className={clsx(
              'm-0 mt-3 text-xl font-extrabold',
              isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
            )}
          >
            {latestBackup?.createdAt ?? '-'}
          </p>
          <p className="m-0 mt-1 text-sm font-semibold text-[#8b9298]">
            {latestBackup?.fileName ?? 'Belum ada file'}
          </p>
        </div>

        <div
          className={clsx(
            'rounded-2xl border p-4 transition hover:-translate-y-0.5',
            isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#e3eaf4] bg-[#f8fbff]'
          )}
        >
          <p className="m-0 text-xs font-extrabold uppercase tracking-wide text-[#8b9298]">
            Total Riwayat
          </p>
          <p
            className={clsx(
              'm-0 mt-3 text-xl font-extrabold',
              isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
            )}
          >
            {backups.length} File
          </p>
          <p className="m-0 mt-1 text-sm font-semibold text-[#8b9298]">
            Siap diunduh oleh admin/operator.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className={isDark ? 'border-b border-[#1d262e]' : 'border-b border-[#c8d4e7]'}>
              {['FILE', 'WAKTU', 'UKURAN', 'STATUS', 'OPERATOR', 'AKSI'].map((column) => (
                <th
                  key={column}
                  className={clsx(
                    'px-3 pb-3 text-xs font-extrabold tracking-wide',
                    isDark ? 'text-[#f4f1ec]' : 'text-[#6d8bb3]'
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {backups.map((item) => (
              <tr
                key={item.id}
                className={clsx(
                  'transition',
                  isDark ? 'text-[#f4f1ec] hover:bg-[#56616d]/35' : 'text-[#6f7882] hover:bg-[#f4f7fb]'
                )}
              >
                <td className="px-3 py-3 font-extrabold">{item.fileName}</td>
                <td className="px-3 py-3 font-bold">{item.createdAt}</td>
                <td className="px-3 py-3 font-bold">{item.size}</td>
                <td className="px-3 py-3">
                  <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-extrabold text-green-400">
                    {item.status}
                  </span>
                </td>
                <td className="px-3 py-3 font-bold">{item.by}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className={clsx(
                      'rounded-lg px-4 py-2 text-xs font-extrabold transition hover:-translate-y-0.5',
                      isDark
                        ? 'bg-[#4b5561] text-[#f4f1ec] hover:bg-[#31527d]'
                        : 'bg-[#dce5f0] text-[#43505a] hover:bg-[#bfcee3]'
                    )}
                    onClick={() => onDownload?.(item)}
                  >
                    Unduh
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
