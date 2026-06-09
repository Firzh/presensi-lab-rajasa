import { useEffect, useMemo, useState } from 'preact/hooks';
import clsx from 'clsx';

import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import { UserFilterBar, UserForm, UsersTable } from '../../components/management/users/index.js';
import { AppIcon } from '../../components/ui/AppIcon.jsx';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import {
  filterUsers,
  mockUsers,
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

export function ManageUsersPage() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [allUsers, setAllUsers] = useState(() => [...mockUsers]);
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [formMode, setFormMode] = useState('list');
  const [selectedUser, setSelectedUser] = useState(null);

  const isDark = theme === 'dark';

  const filteredUsers = useMemo(() => filterUsers(allUsers, filters), [allUsers, filters]);
  const paginated = useMemo(
    () => paginateRows(filteredUsers, currentPage, 10),
    [filteredUsers, currentPage]
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

  function openCreateForm() {
    setSelectedUser(null);
    setFormMode('form');
  }

  function openEditForm(user) {
    setSelectedUser(user);
    setFormMode('form');
  }

  function closeForm() {
    setSelectedUser(null);
    setFormMode('list');
  }

  function saveUser(payload) {
    if (selectedUser) {
      setAllUsers((current) => current.map((user) => (user.id === selectedUser.id ? payload : user)));
    } else {
      setAllUsers((current) => [payload, ...current]);
    }

    closeForm();
  }

  return (
    <div
      className={
        isDark
          ? 'min-h-screen bg-[#1d262e] text-[#f4f1ec]'
          : 'min-h-screen bg-[#f3f3f3] text-[#444b51]'
      }
    >
      <DashboardSidebar theme={theme} activeKey="users" />
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
              Data Users
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

          {formMode === 'list' ? (
            <button
              type="button"
              className={clsx(
                'flex h-12 w-full items-center justify-center gap-3 rounded-md px-6 text-base font-bold transition hover:-translate-y-0.5 sm:w-auto',
                isDark
                  ? 'bg-[#313b45] text-[#f4f1ec] hover:bg-[#31527d]'
                  : 'bg-white text-[#456da1] hover:bg-[#bfcee3]'
              )}
              onClick={openCreateForm}
            >
              <AppIcon name="plus" />
              Tambah Users
            </button>
          ) : null}
        </header>

        {formMode === 'list' ? (
          <>
            <UserFilterBar filters={filters} theme={theme} onChange={setFilters} />
            <UsersTable
              users={paginated.items}
              theme={theme}
              currentPage={paginated.pagination.page}
              totalPages={paginated.pagination.total_pages}
              onPageChange={setCurrentPage}
              onEdit={openEditForm}
            />
          </>
        ) : (
          <UserForm
            initialData={selectedUser}
            theme={theme}
            onCancel={closeForm}
            onSubmit={saveUser}
          />
        )}
      </main>
    </div>
  );
}
