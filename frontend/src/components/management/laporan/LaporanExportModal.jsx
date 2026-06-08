import clsx from 'clsx';

export function LaporanExportModal({ theme = 'light', onClose, onExport }) {
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-5">
      <section
        className={clsx(
          'w-full max-w-4xl rounded-2xl p-8 shadow-2xl',
          isDark ? 'bg-[#313b45]' : 'bg-white'
        )}
      >
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h2
              className={clsx(
                'm-0 text-2xl font-extrabold',
                isDark ? 'text-[#F0EDE4]' : 'text-[#43505a]'
              )}
            >
              Export Laporan
            </h2>
            <p className="m-0 mt-2 text-sm font-bold text-[#8b9298]">
              Pilih format file sesuai kebutuhan.
            </p>
          </div>

          <button
            type="button"
            className="h-10 rounded-xl bg-[#e9e9e9] px-4 font-bold text-[#43505a] transition hover:bg-[#d8dee5]"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <button
            type="button"
            className="h-14 rounded-xl bg-[#e9e9e9] px-5 font-bold text-[#6f7882] transition hover:bg-[#4f8fe7] hover:text-white"
            onClick={() => onExport('csv')}
          >
            Export as CSV
          </button>

          <button
            type="button"
            className="h-14 rounded-xl bg-[#e9e9e9] px-5 font-bold text-[#6f7882] transition hover:bg-[#4f8fe7] hover:text-white"
            onClick={() => onExport('excel')}
          >
            Export as Excel
          </button>

          <button
            type="button"
            className="h-14 rounded-xl bg-[#e9e9e9] px-5 font-bold text-[#6f7882] transition hover:bg-[#4f8fe7] hover:text-white"
            onClick={() => onExport('pdf')}
          >
            Export as PDF
          </button>

          <button
            type="button"
            className="h-14 rounded-xl bg-[#e9e9e9] px-5 font-bold text-[#6f7882] transition hover:bg-[#4f8fe7] hover:text-white"
            onClick={() => onExport('docx')}
          >
            Export as Docx
          </button>
        </div>
      </section>
    </div>
  );
}
