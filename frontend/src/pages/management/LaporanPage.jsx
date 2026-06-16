import { useEffect, useMemo, useState } from 'preact/hooks';
import clsx from 'clsx';

import { listLaporanPresensi, downloadExportLaporan } from '../../api/laporanApi.js';
import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import {
  LaporanExportModal,
  LaporanFilterBar,
  LaporanStatCard,
  LaporanTable,
} from '../../components/management/laporan/index.js';
import { AppIcon } from '../../components/ui/AppIcon.jsx';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import {
  filterLaporanRows,
  getLaporanSummary,
  getTotalPages,
  LAPORAN_SUMMARY_ITEMS,
  normalizeLaporanRows,
  paginateRows,
} from '../../lib/laporanUtils.js';
import { appStorage } from '../../lib/storage.js';

import { getAppTodayDate } from '../../lib/dateUtils.js';

const PAGE_SIZE = 5;

const today = getAppTodayDate();
const initialFilters = Object.freeze({
  keyword: '',
  status: '',
  date_from: today,
  date_to: today,
  rombel_id: '',
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
  const [isExporting, setIsExporting] = useState(false);

  const isDark = theme === 'dark';

  const [serverSummary, setServerSummary] = useState(null);

  const normalizedRows = useMemo(() => normalizeLaporanRows(rawRows), [rawRows]);

  const filteredRows = useMemo(() => {
    return filterLaporanRows(normalizedRows, { keyword: filters.keyword, status: filters.status });
  }, [normalizedRows, filters.keyword, filters.status]);

  const summary = useMemo(() => {
    return serverSummary || getLaporanSummary(filteredRows);
  }, [serverSummary, filteredRows]);

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
        date_from: filters.date_from,
        date_to: filters.date_to,
        rombel_id: filters.rombel_id,
        status: filters.status,
      });

      if (!result.ok || result.data?.success === false) {
        throw new Error(result.data?.message || 'Gagal memuat laporan presensi.');
      }

      const payload = result.data?.data ?? {};
      setRawRows(payload.items ?? payload.rows ?? []);
      setServerSummary(payload.summary ?? null);
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

  async function handleExport(format) {
    if (isExporting) return;

    setIsExporting(true);
    setMessage('');
    setIsExportOpen(false);

    try {
      await downloadExportLaporan(
        {
          date_from: filters.date_from,
          date_to: filters.date_to,
          rombel_id: filters.rombel_id,
          status: filters.status,
        },
        format
      );
    } catch (err) {
      setMessage(err.message || 'Gagal mengekspor laporan.');
    } finally {
      setIsExporting(false);
    }
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

      <main className="min-h-screen px-4 pb-8 pt-36 sm:px-6 lg:ml-65 lg:px-10 lg:pb-8 lg:pt-29.5">
        <header className="mb-7 flex flex-col items-stretch justify-between gap-4 sm:mb-9 sm:flex-row sm:items-start">
          <div>
            <h1
              className={clsx(
                'm-0 text-[1.75rem] font-extrabold leading-none tracking-wide sm:text-[2rem]',
                isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
              )}
            >
              Laporan Presensi
            </h1>
            <p className="m-0 mt-4 text-base font-bold text-[#8b9298]">
              Kelola dan pantau laporan presensi siswa
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:flex">
            <button
              type="button"
              className={clsx(
                'flex h-12 w-full items-center justify-center gap-3 rounded-md px-6 text-base font-bold transition sm:w-auto',
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

        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-4">
            {LAPORAN_SUMMARY_ITEMS.map((item) => (
              <LaporanStatCard key={item.key} item={item} value={summary[item.key]} theme={theme} />
            ))}
          </div>

          <LaporanFilterBar
            filters={filters}
            theme={theme}
            onFilterChange={updateFilter}
            onApply={fetchRows}
          />

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

      {isExportOpen ? (
        <LaporanExportModal
          theme={theme}
          isExporting={isExporting}
          onClose={() => setIsExportOpen(false)}
          onExport={handleExport}
        />
      ) : null}
    </div>
  );
}
