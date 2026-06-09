import { useEffect, useMemo, useState } from 'preact/hooks';
import clsx from 'clsx';

import { listLaporanPresensi } from '../../api/laporanApi.js';
import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import {
  LaporanExportModal,
  LaporanFilterBar,
  LaporanStatCard,
  LaporanTable,
  LaporanValidasiModal,
} from '../../components/management/laporan/index.js';
import { AppIcon } from '../../components/ui/AppIcon.jsx';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import {
  exportLaporan,
  filterLaporanRows,
  getLaporanSummary,
  getTotalPages,
  LAPORAN_SUMMARY_ITEMS,
  normalizeLaporanRows,
  paginateRows,
} from '../../lib/laporanUtils.js';
import { appStorage } from '../../lib/storage.js';

const PAGE_SIZE = 5;

const initialFilters = Object.freeze({
  keyword: '',
  status: '',
});

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

export function LaporanPage() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [rawRows, setRawRows] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isValidasiOpen, setIsValidasiOpen] = useState(false);

  const isDark = theme === 'dark';

  const normalizedRows = useMemo(() => normalizeLaporanRows(rawRows), [rawRows]);

  const filteredRows = useMemo(() => {
    return filterLaporanRows(normalizedRows, filters);
  }, [normalizedRows, filters]);

  const summary = useMemo(() => getLaporanSummary(filteredRows), [filteredRows]);

  const totalPages = getTotalPages(filteredRows.length, PAGE_SIZE);
  const visibleRows = paginateRows(filteredRows, currentPage, PAGE_SIZE);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    fetchRows();
  }, []);

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }

  async function fetchRows() {
    setIsLoading(true);
    setMessage('');

    try {
      const result = await listLaporanPresensi({
        per_page: 500,
      });

      if (!result.ok || result.data?.success === false) {
        throw new Error(result.data?.message || 'Gagal memuat laporan presensi.');
      }

      const payload = result.data?.data ?? {};
      setRawRows(payload.items ?? payload.rows ?? []);
    } catch (error) {
      setRawRows([]);
      setMessage(error.message || 'Gagal memuat laporan presensi.');
    } finally {
      setIsLoading(false);
    }
  }

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
    setCurrentPage(1);
  }

  function handleExport(format) {
    exportLaporan(filteredRows, format);
    setIsExportOpen(false);
  }

  function handleSaveValidasi({ rowId, validasi }) {
    setRawRows((current) =>
      current.map((row) => {
        const normalizedId =
          row.presensi_id ||
          row.id ||
          `${row.siswa?.nisn || row.nisn}-${row.jam_id || row.jam?.jam_id || ''}`;

        if (String(normalizedId) !== String(rowId)) {
          return row;
        }

        return {
          ...row,
          validasi,
        };
      })
    );

    setIsValidasiOpen(false);
  }

  return (
    <div
      className={
        isDark
          ? 'min-h-screen bg-[#1d262e] text-[#f4f1ec]'
          : 'min-h-screen bg-[#f3f3f3] text-[#444b51]'
      }
    >
      <DashboardSidebar theme={theme} activeKey="laporan" />
      <DashboardTopbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="ml-65 min-h-screen px-10 pb-8 pt-29.5">
        <header className="mb-9 flex items-start justify-between gap-4">
          <div>
            <h1
              className={clsx(
                'm-0 text-[2rem] font-extrabold leading-none tracking-wide',
                isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
              )}
            >
              Laporan Presensi
            </h1>
            <p className="m-0 mt-4 text-base font-bold text-[#8b9298]">
              Kelola dan pantau laporan presensi siswa
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className={clsx(
                'flex h-12 items-center gap-3 rounded-md px-6 text-base font-bold transition',
                isDark
                  ? 'bg-[#313b45] text-[#f4f1ec] hover:bg-[#31527d]'
                  : 'bg-white text-[#456da1] hover:bg-[#bfcee3]'
              )}
              onClick={() => setIsValidasiOpen(true)}
            >
              <AppIcon name="circleCheck" />
              Edit Validasi
            </button>

            <button
              type="button"
              className={clsx(
                'flex h-12 items-center gap-3 rounded-md px-6 text-base font-bold transition',
                isDark
                  ? 'bg-[#313b45] text-[#f4f1ec] hover:bg-[#31527d]'
                  : 'bg-white text-[#456da1] hover:bg-[#bfcee3]'
              )}
              onClick={() => setIsExportOpen(true)}
            >
              <AppIcon name="fileExport" />
              Eksport Laporan
            </button>
          </div>
        </header>

        <section className="grid gap-6">
          <div className="grid gap-5 lg:grid-cols-5">
            {LAPORAN_SUMMARY_ITEMS.map((item) => (
              <LaporanStatCard key={item.key} item={item} value={summary[item.key]} theme={theme} />
            ))}
          </div>

          <LaporanFilterBar filters={filters} theme={theme} onFilterChange={updateFilter} />

          {message ? (
            <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">
              {message}
            </p>
          ) : null}

          {isLoading ? (
            <p className="rounded-xl bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-400">
              Memuat laporan presensi...
            </p>
          ) : null}

          <LaporanTable
            rows={visibleRows}
            theme={theme}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </section>
      </main>

      {isValidasiOpen ? (
        <LaporanValidasiModal
          rows={filteredRows}
          theme={theme}
          onClose={() => setIsValidasiOpen(false)}
          onSave={handleSaveValidasi}
        />
      ) : null}

      {isExportOpen ? (
        <LaporanExportModal
          theme={theme}
          onClose={() => setIsExportOpen(false)}
          onExport={handleExport}
        />
      ) : null}
    </div>
  );
}
