import { useEffect, useMemo, useState } from 'preact/hooks';
import clsx from 'clsx';

import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import {
  LogUserDetailsModal,
  LogUserFilterBar,
  LogUsersTable,
} from '../../components/management/log-users/index.js';
import { AppIcon } from '../../components/ui/AppIcon.jsx';
import { listUserActivities } from '../../api/adminUsersApi.js';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import { buildLogsCsv, paginateRows } from '../../lib/adminUsersUtils.js';
import { appStorage } from '../../lib/storage.js';

const initialFilters = Object.freeze({
  keyword: '',
  filter: '',
});

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

function getApiFilters(filters, page) {
  const [filterKey, filterValue] = String(filters.filter ?? '').split(':');

  return {
    q: filters.keyword,
    page,
    per_page: 10,
    action: filterKey === 'action' ? filterValue : '',
    status: filterKey === 'status' ? filterValue : '',
  };
}

export function LogUsersPage() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isDark = theme === 'dark';
  const fallbackPagination = useMemo(() => paginateRows(logs, currentPage, 10), [logs, currentPage]);
  const totalPages = pagination.total_pages ?? fallbackPagination.pagination.total_pages;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      setIsLoading(true);

      try {
        const result = await listUserActivities(getApiFilters(filters, currentPage));

        if (!isMounted) return;

        if (!result.ok) {
          setMessage(result.data?.message ?? 'Gagal memuat log users.');
          return;
        }

        const data = result.data?.data ?? {};
        setLogs(Array.isArray(data.items) ? data.items : []);
        setPagination(data.pagination ?? { page: 1, total_pages: 1 });
      } catch (_error) {
        if (isMounted) {
          setMessage('Backend log users belum bisa diakses.');
          setLogs([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, [filters, currentPage]);

  useEffect(() => {
    if (!message) return undefined;

    const timeoutId = window.setTimeout(() => setMessage(''), 2400);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }

  function exportLogs() {
    const csv = buildLogsCsv(logs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'log-users.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className={
        isDark
          ? 'min-h-screen bg-[#1d262e] text-[#f4f1ec]'
          : 'min-h-screen bg-[#f3f3f3] text-[#444b51]'
      }
    >
      <DashboardSidebar theme={theme} activeKey="log-users" />
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
              Log Users
            </h1>
            <p
              className={clsx(
                'm-0 mt-4 text-base font-bold',
                isDark ? 'text-[#cfd8e3]' : 'text-[#6f7882]'
              )}
            >
              Pantau aktivitas login dan perubahan data user.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            {message ? (
              <div
                className={clsx(
                  'rounded-xl px-4 py-3 text-sm font-extrabold shadow-md',
                  isDark ? 'bg-[#25303a] text-[#cfd8e3]' : 'bg-white text-[#31527d]'
                )}
              >
                {message}
              </div>
            ) : null}

            <button
              type="button"
              className={clsx(
                'flex h-12 w-full items-center justify-center gap-3 rounded-md px-6 text-base font-bold transition hover:-translate-y-0.5 sm:w-auto',
                isDark
                  ? 'bg-[#313b45] text-[#f4f1ec] hover:bg-[#31527d]'
                  : 'bg-white text-[#456da1] hover:bg-[#bfcee3]'
              )}
              onClick={exportLogs}
            >
              <AppIcon name="fileExport" />
              Eksport Laporan
            </button>
          </div>
        </header>

        <LogUserFilterBar filters={filters} theme={theme} onChange={setFilters} />
        {isLoading ? (
          <p className="m-0 mt-4 text-sm font-bold text-[#8b9298]">Memuat log users...</p>
        ) : null}
        <LogUsersTable
          logs={logs}
          theme={theme}
          currentPage={pagination.page ?? currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onDetails={setSelectedLog}
        />

        <LogUserDetailsModal log={selectedLog} theme={theme} onClose={() => setSelectedLog(null)} />
      </main>
    </div>
  );
}
