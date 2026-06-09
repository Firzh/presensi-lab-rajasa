import { useEffect, useMemo, useState } from 'preact/hooks';
import clsx from 'clsx';

import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import {
  LogUserDetailsModal,
  LogUserFilterBar,
  LogUsersTable,
} from '../../components/management/log-users/index.js';
import { AppIcon } from '../../components/ui/AppIcon.jsx';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import {
  buildLogsCsv,
  filterLogUsers,
  mockLogUsers,
  paginateRows,
} from '../../lib/adminUsersUtils.js';
import { appStorage } from '../../lib/storage.js';

const initialFilters = Object.freeze({
  keyword: '',
  filter: '',
});

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

export function LogUsersPage() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  const isDark = theme === 'dark';

  const filteredLogs = useMemo(() => filterLogUsers(mockLogUsers, filters), [filters]);
  const paginated = useMemo(
    () => paginateRows(filteredLogs, currentPage, 10),
    [filteredLogs, currentPage]
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }

  function exportLogs() {
    const csv = buildLogsCsv(filteredLogs);
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
              Kelola data siswa SMK Rajasa Surabaya
            </p>
          </div>

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
        </header>

        <LogUserFilterBar filters={filters} theme={theme} onChange={setFilters} />
        <LogUsersTable
          logs={paginated.items}
          theme={theme}
          currentPage={paginated.pagination.page}
          totalPages={paginated.pagination.total_pages}
          onPageChange={setCurrentPage}
          onDetails={setSelectedLog}
        />

        <LogUserDetailsModal log={selectedLog} theme={theme} onClose={() => setSelectedLog(null)} />
      </main>
    </div>
  );
}
