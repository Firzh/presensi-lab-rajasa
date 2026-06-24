import clsx from 'clsx';

export function LaporanExportModal({ theme = 'light', isExporting = false, onClose, onExport }) {
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/45 px-4 py-6 sm:px-5">
      <section
        className={clsx(
          'w-full max-w-4xl rounded-2xl p-5 shadow-2xl sm:p-8',
          isDark ? 'bg-[#313b45]' : 'bg-white'
        )}
      >
        <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-start sm:justify-between">
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
            className="h-10 w-full rounded-xl bg-[#e9e9e9] px-4 font-bold text-[#43505a] transition hover:bg-red-500 hover:text-white sm:w-auto"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
          <button
            type="button"
            disabled={isExporting}
            className="h-14 rounded-xl bg-[#e9e9e9] px-5 font-bold text-[#6f7882] transition hover:bg-[#4f8fe7] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onExport('csv')}
          >
            Export as CSV
          </button>

          <button
            type="button"
            disabled={isExporting}
            className="h-14 rounded-xl bg-[#e9e9e9] px-5 font-bold text-[#6f7882] transition hover:bg-[#4f8fe7] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onExport('xlsx')}
          >
            Export as Excel
          </button>

          <button
            type="button"
            disabled={isExporting}
            className="h-14 rounded-xl bg-[#e9e9e9] px-5 font-bold text-[#6f7882] transition hover:bg-[#4f8fe7] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onExport('pdf')}
          >
            Export as PDF
          </button>

          <button
            type="button"
            disabled={isExporting}
            className="h-14 rounded-xl bg-[#e9e9e9] px-5 font-bold text-[#6f7882] transition hover:bg-[#4f8fe7] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onExport('docx')}
          >
            Export as Docx
          </button>
        </div>
      </section>
    </div>
  );
}
