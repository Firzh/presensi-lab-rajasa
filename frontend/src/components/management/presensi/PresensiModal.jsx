export function PresensiModal({
  title,
  message,
  actionLabel = 'OK',
  secondaryLabel = '',
  danger = false,
  onAction,
  onSecondary,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="m-0 text-xl font-extrabold text-[#43505a]">{title}</h2>
        <p className="mt-4 whitespace-pre-line text-sm font-semibold leading-6 text-[#6f7882]">
          {message}
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {onClose ? (
            <button
              type="button"
              className="h-11 rounded-xl bg-[#e9e9e9] px-5 font-bold text-[#43505a] transition hover:bg-[#d8dee5] hover:text-[#2f3a43]"
              onClick={onClose}
            >
              Tutup
            </button>
          ) : null}

          {secondaryLabel ? (
            <button
              type="button"
              className="h-11 rounded-xl bg-[#ff6568] px-5 font-bold text-white transition hover:bg-[#dc2626] hover:shadow-md"
              onClick={onSecondary}
            >
              {secondaryLabel}
            </button>
          ) : null}

          <button
            type="button"
            className={
              danger
                ? 'h-11 rounded-xl bg-[#ff6568] px-5 font-bold text-white transition hover:bg-[#dc2626] hover:shadow-md'
                : 'h-11 rounded-xl bg-[#a9c9f4] px-5 font-bold text-[#2f5278] transition hover:bg-[#4f8fe7] hover:text-white hover:shadow-md'
            }
            onClick={onAction}
          >
            {actionLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
