export function PresensiModal({ title, message, actionLabel = 'OK', danger = false, onAction, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="m-0 text-xl font-extrabold text-[#43505a]">{title}</h2>
        <p className="mt-4 whitespace-pre-line text-sm font-semibold leading-6 text-[#6f7882]">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          {onClose ? (
            <button
              type="button"
              className="h-11 rounded-xl bg-[#e9e9e9] px-5 font-bold text-[#43505a]"
              onClick={onClose}
            >
              Tutup
            </button>
          ) : null}

          <button
            type="button"
            className={danger ? 'h-11 rounded-xl bg-[#ff6568] px-5 font-bold text-white' : 'h-11 rounded-xl bg-[#a9c9f4] px-5 font-bold text-[#4f6b8b]'}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        </div>
      </section>
    </div>
  );
}