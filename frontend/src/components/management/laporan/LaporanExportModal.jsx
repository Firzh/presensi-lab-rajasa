import { useState } from 'preact/hooks';
import clsx from 'clsx';

const EXPORT_FORMATS = [
  { key: 'csv', label: 'Export as CSV' },
  { key: 'xlsx', label: 'Export as Excel' },
  { key: 'pdf', label: 'Export as PDF' },
  { key: 'docx', label: 'Export as Docx' },
];

export function LaporanExportModal({
  theme = 'light',
  isExporting = false,
  dateFrom = '-',
  dateTo = '-',
  onClose,
  onExport,
}) {
  const isDark = theme === 'dark';
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const selectedLabel = EXPORT_FORMATS.find((item) => item.key === selectedFormat)?.label ?? 'Export';
  const isSubModalOpen = Boolean(selectedFormat || isTutorialOpen);

  function handleConfirmExport() {
    if (!selectedFormat || isExporting) return;
    onExport(selectedFormat);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/45 px-4 py-6 sm:px-5">
      {!isSubModalOpen ? (
        <section
          className={clsx(
            'relative w-full max-w-4xl rounded-2xl p-5 shadow-2xl sm:p-8',
            isDark ? 'bg-[#313b45]' : 'bg-white'
          )}
        >
        <button
          type="button"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#e9e9e9] text-lg font-black text-[#43505a] transition hover:bg-red-500 hover:text-white"
          onClick={onClose}
          aria-label="Tutup popup export"
        >
          ×
        </button>

        <div className="mb-6 pr-10 sm:mb-7">
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

        <div className="mb-5 rounded-xl bg-blue-500/10 px-4 py-3 text-sm font-bold text-[#4f8fe7]">
          Rentang tanggal aktif: {dateFrom || '-'} s/d {dateTo || '-'}
        </div>

        <button
          type="button"
          className="mb-5 rounded-xl bg-[#e9e9e9] px-4 py-3 text-sm font-extrabold text-[#43505a] transition hover:bg-[#4f8fe7] hover:text-white"
          onClick={() => setIsTutorialOpen(true)}
        >
          Lihat Tutorial Export
        </button>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
          {EXPORT_FORMATS.map((format) => (
            <button
              key={format.key}
              type="button"
              disabled={isExporting}
              className="h-14 rounded-xl bg-[#e9e9e9] px-5 font-bold text-[#6f7882] transition hover:bg-[#4f8fe7] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setSelectedFormat(format.key)}
            >
              {format.label}
            </button>
          ))}
        </div>
        </section>
      ) : null}

      {selectedFormat ? (
        <section
          className={clsx(
            'fixed inset-x-4 top-1/2 z-[60] mx-auto max-w-md -translate-y-1/2 rounded-2xl p-6 shadow-2xl',
            isDark ? 'bg-[#313b45] text-[#F0EDE4]' : 'bg-white text-[#43505a]'
          )}
        >
          <button
            type="button"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#e9e9e9] text-lg font-black text-[#43505a] transition hover:bg-red-500 hover:text-white"
            onClick={() => setSelectedFormat(null)}
            aria-label="Tutup konfirmasi export"
          >
            ×
          </button>
          <h3 className="m-0 pr-10 text-xl font-extrabold">Konfirmasi Export</h3>
          <p className="mt-3 text-sm font-bold text-[#8b9298]">
            File {selectedLabel} akan dibuat memakai filter tanggal {dateFrom || '-'} s/d {dateTo || '-'}.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="h-11 rounded-xl bg-[#e9e9e9] font-extrabold text-[#43505a] transition hover:bg-red-500 hover:text-white"
              onClick={() => setSelectedFormat(null)}
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isExporting}
              className="h-11 rounded-xl bg-[#4f8fe7] font-extrabold text-white transition hover:bg-[#31527d] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleConfirmExport}
            >
              Lanjut Export
            </button>
          </div>
        </section>
      ) : null}

      {isTutorialOpen ? (
        <section
          className={clsx(
            'fixed inset-x-4 top-1/2 z-[70] mx-auto max-w-md -translate-y-1/2 rounded-2xl p-6 shadow-2xl',
            isDark ? 'bg-[#313b45] text-[#F0EDE4]' : 'bg-white text-[#43505a]'
          )}
        >
          <button
            type="button"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[#e9e9e9] text-lg font-black text-[#43505a] transition hover:bg-red-500 hover:text-white"
            onClick={() => setIsTutorialOpen(false)}
            aria-label="Tutup tutorial export"
          >
            ×
          </button>
          <h3 className="m-0 pr-10 text-xl font-extrabold">Tutorial Export</h3>
          <ol className="mt-4 space-y-3 pl-5 text-sm font-bold text-[#8b9298]">
            <li>Pilih rentang tanggal pada filter tabel.</li>
            <li>Tekan tombol Terapkan Filter.</li>
            <li>Tekan Eksport Laporan.</li>
            <li>Pilih format file.</li>
            <li>Periksa konfirmasi tanggal, lalu tekan Lanjut Export.</li>
          </ol>
        </section>
      ) : null}
    </div>
  );
}
