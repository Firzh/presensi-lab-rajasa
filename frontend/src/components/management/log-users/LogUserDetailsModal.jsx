import clsx from 'clsx';

export function LogUserDetailsModal({ log, theme = 'light', onClose }) {
  const isDark = theme === 'dark';

  if (!log) {
    return null;
  }

  const detailRows = [
    ['Username', log.username],
    ['Role', log.role],
    ['Action Type', log.action_type],
    ['Module', log.module],
    ['Status', log.status],
    ['Waktu', log.waktu],
    ['IP Address', log.ip_address],
    ['Details', log.details],
  ];

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-black/40 px-4" role="dialog" aria-modal="true">
      <div
        className={clsx(
          'w-full max-w-xl rounded-2xl p-5 shadow-2xl sm:p-7',
          isDark ? 'bg-[#313b45] text-[#f4f1ec]' : 'bg-white text-[#43505a]'
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="m-0 text-xl font-extrabold">Detail Log Users</h2>
            <p className={clsx('m-0 mt-2 text-sm font-bold', isDark ? 'text-[#cfd8e3]' : 'text-[#8b9298]')}>
              Aktivitas user pada modul {log.module}
            </p>
          </div>

          <button
            type="button"
            className={clsx(
              'grid h-9 w-9 place-items-center rounded-xl text-xl font-bold transition hover:-translate-y-0.5',
              isDark ? 'bg-[#56616d] hover:bg-[#64717d]' : 'bg-[#eef0f3] hover:bg-[#dce5f0]'
            )}
            aria-label="Tutup detail log"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <dl className="grid gap-3">
          {detailRows.map(([label, value]) => (
            <div
              key={label}
              className={clsx(
                'grid gap-1 rounded-xl px-4 py-3 sm:grid-cols-[140px_1fr] sm:gap-4',
                isDark ? 'bg-[#56616d]/45' : 'bg-[#f4f7fb]'
              )}
            >
              <dt className="text-sm font-extrabold text-[#8aa6cf]">{label}</dt>
              <dd className="m-0 break-words text-sm font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
