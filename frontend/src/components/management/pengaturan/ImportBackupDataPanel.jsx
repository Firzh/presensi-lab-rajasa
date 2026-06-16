import { useMemo, useState } from 'preact/hooks';
import clsx from 'clsx';

import { AppIcon } from '../../ui/AppIcon.jsx';

const PER_PAGE = 8;

function getFileLabel(file) {
  return file?.name
    ? `${file.name} (${Math.ceil((file.size || 0) / 1024)} KB)`
    : 'Belum ada file dipilih';
}

function getDetails(preview) {
  return Array.isArray(preview?.overwrite_details) ? preview.overwrite_details : [];
}

function getSummary(preview) {
  return preview?.summary ?? {};
}

function FilePicker({ theme, label, accept, file, onChange }) {
  const isDark = theme === 'dark';

  return (
    <label
      className={clsx(
        'grid cursor-pointer gap-3 rounded-2xl border border-dashed p-4 text-sm font-bold transition hover:-translate-y-0.5',
        isDark
          ? 'border-[#64717d] bg-[#25303a] text-[#cfd8e3] hover:bg-[#313b45]'
          : 'border-[#bfd1ea] bg-[#f8fbff] text-[#43505a] hover:bg-[#eef4fb]'
      )}
    >
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#8b9298]">{label}</span>
      <span className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#31527d] text-white">
          <AppIcon name="fileExport" />
        </span>
        <span className="min-w-0 truncate">{getFileLabel(file)}</span>
      </span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => onChange?.(event.currentTarget.files?.[0] ?? null)}
      />
    </label>
  );
}

function SummaryCards({ theme, preview }) {
  const isDark = theme === 'dark';
  const summary = getSummary(preview);
  const items = [
    ['Total Baris', summary.total_rows ?? summary.total_insert_rows ?? 0],
    ['Akan Dibuat', summary.create_rows ?? summary.insert_rows ?? 0],
    ['Akan Ditimpa', summary.overwrite_rows ?? 0],
    ['Gagal/Invalid', summary.invalid_rows ?? summary.skipped_rows ?? 0],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value]) => (
        <div
          key={label}
          className={clsx(
            'rounded-2xl border p-4',
            isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#e3eaf4] bg-[#f8fbff]'
          )}
        >
          <p className="m-0 text-xs font-extrabold uppercase tracking-wide text-[#8b9298]">
            {label}
          </p>
          <p
            className={clsx(
              'm-0 mt-2 text-2xl font-extrabold',
              isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
            )}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

function WarningTable({ theme, title, preview, page, onPageChange }) {
  const isDark = theme === 'dark';
  const details = getDetails(preview);
  const totalPages = Math.max(1, Math.ceil(details.length / PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const visibleRows = details.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  if (!preview) {
    return null;
  }

  if (!details.length) {
    return (
      <div
        className={clsx(
          'rounded-2xl border p-4 text-sm font-bold',
          isDark
            ? 'border-green-500/30 bg-green-500/10 text-green-200'
            : 'border-green-200 bg-green-50 text-green-700'
        )}
      >
        Tidak ada data lama yang akan ditimpa.
      </div>
    );
  }

  return (
    <section
      className={clsx(
        'rounded-2xl border p-4',
        isDark ? 'border-amber-400/30 bg-amber-400/10' : 'border-amber-200 bg-amber-50'
      )}
    >
      <div className="mb-3 flex items-start gap-3">
        <span className="mt-1 text-amber-500">
          <AppIcon name="triangleExclamation" />
        </span>
        <div>
          <h4
            className={clsx(
              'm-0 text-base font-extrabold',
              isDark ? 'text-amber-100' : 'text-amber-800'
            )}
          >
            {title}
          </h4>
          <p
            className={clsx(
              'm-0 mt-1 text-sm font-bold',
              isDark ? 'text-amber-100/80' : 'text-amber-700'
            )}
          >
            {details.length} data lama terdeteksi akan ditimpa. Cek detailnya sebelum import. Ya,
            tombol import memang bisa menjadi palu godam kecil.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-190 border-collapse text-left text-sm">
          <thead>
            <tr className={isDark ? 'border-b border-amber-200/20' : 'border-b border-amber-200'}>
              {['TARGET', 'DATA LAMA', 'DATA BARU', 'PERUBAHAN'].map((column) => (
                <th
                  key={column}
                  className={clsx(
                    'px-3 pb-3 text-xs font-extrabold tracking-wide',
                    isDark ? 'text-amber-100' : 'text-amber-800'
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr
                key={`${row.table ?? row.nisn ?? row.key}-${index}`}
                className={isDark ? 'text-amber-50' : 'text-amber-900'}
              >
                <td className="px-3 py-3 font-extrabold">
                  {row.target ?? row.table ?? row.nisn ?? '-'}
                </td>
                <td className="px-3 py-3 font-bold">{row.old_label ?? row.old ?? '-'}</td>
                <td className="px-3 py-3 font-bold">{row.new_label ?? row.new ?? '-'}</td>
                <td className="px-3 py-3 font-bold">
                  {Array.isArray(row.changes) && row.changes.length
                    ? row.changes
                        .map(
                          (change) => `${change.field}: ${change.old ?? '-'} → ${change.new ?? '-'}`
                        )
                        .join(', ')
                    : (row.message ?? 'Akan ditulis ulang')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm font-extrabold">
        <span className={isDark ? 'text-amber-100' : 'text-amber-800'}>
          Halaman {safePage} dari {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg bg-white/70 px-3 py-2 text-[#43505a] disabled:opacity-40"
            disabled={safePage <= 1}
            onClick={() => onPageChange?.(safePage - 1)}
          >
            Sebelumnya
          </button>
          <button
            type="button"
            className="rounded-lg bg-white/70 px-3 py-2 text-[#43505a] disabled:opacity-40"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange?.(safePage + 1)}
          >
            Berikutnya
          </button>
        </div>
      </div>
    </section>
  );
}

function ActionButton({ theme, children, disabled, danger = false, onClick }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      disabled={disabled}
      className={clsx(
        'flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45',
        danger
          ? 'bg-amber-500 text-white hover:bg-amber-600'
          : isDark
            ? 'bg-[#4f8fe7] text-white hover:bg-[#6fa6ef]'
            : 'bg-[#31527d] text-white hover:bg-[#456da1]'
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function ImportBackupDataPanel({
  theme = 'light',
  isBusy = false,
  dataFile,
  backupFile,
  dataPreview,
  backupPreview,
  dataResult,
  backupResult,
  onDataFileChange,
  onBackupFileChange,
  onPreviewData,
  onImportData,
  onPreviewBackup,
  onImportBackup,
}) {
  const isDark = theme === 'dark';
  const [dataPage, setDataPage] = useState(1);
  const [backupPage, setBackupPage] = useState(1);
  const dataOverwriteCount = getDetails(dataPreview).length;
  const backupOverwriteCount = getDetails(backupPreview).length;
  const dataSummary = useMemo(() => getSummary(dataPreview), [dataPreview]);
  const backupSummary = useMemo(() => getSummary(backupPreview), [backupPreview]);

  return (
    <section
      className={clsx('grid gap-5 rounded-2xl p-4 sm:p-6', isDark ? 'bg-[#313b45]' : 'bg-white')}
    >
      <div>
        <h2
          className={clsx(
            'm-0 text-2xl font-extrabold',
            isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
          )}
        >
          Import Data
        </h2>
        <p className="m-0 mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-[#8b9298]">
          Import data siswa memakai mekanisme yang sama dengan halaman dev import. Import backup
          memakai mode data-only: struktur tabel tidak dihapus atau dibuat ulang.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div
          className={clsx(
            'grid gap-4 rounded-2xl border p-4',
            isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#e3eaf4] bg-[#f8fbff]'
          )}
        >
          <div>
            <h3
              className={clsx(
                'm-0 text-lg font-extrabold',
                isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
              )}
            >
              Import Data Asli
            </h3>
            <p className="m-0 mt-1 text-sm font-semibold text-[#8b9298]">
              Menerima file CSV/XLSX berisi NISN, NAMA, dan KELAS.
            </p>
          </div>
          <FilePicker
            theme={theme}
            label="File data siswa"
            accept=".csv,.txt,.xlsx"
            file={dataFile}
            onChange={(file) => {
              onDataFileChange?.(file);
              setDataPage(1);
            }}
          />
          <div className="flex flex-wrap gap-3">
            <ActionButton theme={theme} disabled={!dataFile || isBusy} onClick={onPreviewData}>
              Preview Warning
            </ActionButton>
            <ActionButton
              theme={theme}
              disabled={!dataFile || !dataPreview || isBusy}
              danger={dataOverwriteCount > 0}
              onClick={onImportData}
            >
              {dataOverwriteCount > 0 ? 'Import Tetap' : 'Import Data'}
            </ActionButton>
          </div>
          {dataPreview ? <SummaryCards theme={theme} preview={dataPreview} /> : null}
          <WarningTable
            theme={theme}
            title="Warning Import Data"
            preview={dataPreview}
            page={dataPage}
            onPageChange={setDataPage}
          />
          {dataResult ? (
            <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
              {JSON.stringify(dataResult, null, 2)}
            </pre>
          ) : null}
        </div>

        <div
          className={clsx(
            'grid gap-4 rounded-2xl border p-4',
            isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#e3eaf4] bg-[#f8fbff]'
          )}
        >
          <div>
            <h3
              className={clsx(
                'm-0 text-lg font-extrabold',
                isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
              )}
            >
              Import Backup
            </h3>
            <p className="m-0 mt-1 text-sm font-semibold text-[#8b9298]">
              Mode B: restore data saja dari file SQL backup. DROP TABLE dan CREATE TABLE diabaikan.
            </p>
          </div>
          <FilePicker
            theme={theme}
            label="File backup .sql"
            accept=".sql"
            file={backupFile}
            onChange={(file) => {
              onBackupFileChange?.(file);
              setBackupPage(1);
            }}
          />
          <div className="flex flex-wrap gap-3">
            <ActionButton theme={theme} disabled={!backupFile || isBusy} onClick={onPreviewBackup}>
              Preview Warning
            </ActionButton>
            <ActionButton
              theme={theme}
              disabled={!backupFile || !backupPreview || isBusy}
              danger={backupOverwriteCount > 0}
              onClick={onImportBackup}
            >
              {backupOverwriteCount > 0 ? 'Restore Tetap' : 'Restore Backup'}
            </ActionButton>
          </div>
          {backupPreview ? <SummaryCards theme={theme} preview={backupPreview} /> : null}
          {backupSummary?.details_truncated ? (
            <div className="rounded-xl bg-amber-500/15 px-4 py-3 text-sm font-extrabold text-amber-500">
              Detail overwrite dipotong oleh backend. Ringkasan total tetap akurat.
            </div>
          ) : null}
          <WarningTable
            theme={theme}
            title="Warning Import Backup"
            preview={backupPreview}
            page={backupPage}
            onPageChange={setBackupPage}
          />
          {backupResult ? (
            <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
              {JSON.stringify(backupResult, null, 2)}
            </pre>
          ) : null}
        </div>
      </div>
    </section>
  );
}
