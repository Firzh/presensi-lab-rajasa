import { useEffect, useMemo, useState } from 'preact/hooks';
import clsx from 'clsx';

import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import { UserFilterBar, UserForm, UsersTable } from '../../components/management/users/index.js';
import { AppIcon } from '../../components/ui/AppIcon.jsx';
import { createAdminUser, listAdminUsers, updateAdminUser } from '../../api/adminUsersApi.js';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import { paginateRows } from '../../lib/adminUsersUtils.js';
import { appStorage } from '../../lib/storage.js';

const initialFilters = Object.freeze({
  keyword: '',
  selectedFilters: [],
  filter: '',
});

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

function getSelectedFilterValues(filters, type) {
  const selectedFilters = Array.isArray(filters.selectedFilters)
    ? filters.selectedFilters
    : filters.filter
      ? [filters.filter]
      : [];

  return selectedFilters
    .map((item) => String(item ?? '').split(':'))
    .filter(([key, value]) => key === type && value)
    .map(([, value]) => value);
}

function getApiFilters(filters, page) {
  const keyword = String(filters.keyword ?? '').trim();
  const roles = getSelectedFilterValues(filters, 'role');
  const statuses = getSelectedFilterValues(filters, 'status');
  const userTypes = getSelectedFilterValues(filters, 'user_type');
  const includeSiswa = keyword !== '' || roles.includes('siswa') || userTypes.includes('siswa');

  return {
    q: keyword,
    page,
    per_page: 10,
    roles,
    statuses,
    user_types: userTypes,
    exclude_user_type: includeSiswa ? '' : 'siswa',
  };
}

export function ManageUsersPage() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [allUsers, setAllUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [formMode, setFormMode] = useState('list');
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isDark = theme === 'dark';
  const fallbackPagination = useMemo(() => paginateRows(allUsers, currentPage, 10), [allUsers, currentPage]);
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

    async function loadUsers() {
      setIsLoading(true);

      try {
        const result = await listAdminUsers(getApiFilters(filters, currentPage));

        if (!isMounted) return;

        if (!result.ok) {
          setMessage(result.data?.message ?? 'Gagal memuat data users.');
          return;
        }

        const data = result.data?.data ?? {};
        setAllUsers(Array.isArray(data.items) ? data.items : []);
        setPagination(data.pagination ?? { page: 1, total_pages: 1 });
      } catch (_error) {
        if (isMounted) {
          setMessage('Backend users belum bisa diakses.');
          setAllUsers([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

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

  async function saveUser(payload) {
    setIsLoading(true);

    try {
      const result = selectedUser
        ? await updateAdminUser(selectedUser.id, payload)
        : await createAdminUser(payload);

      if (!result.ok) {
        setMessage(result.data?.message ?? 'Data user gagal disimpan.');
        return;
      }

      const savedUser = result.data?.data?.user;

      if (savedUser) {
        setAllUsers((current) => {
          if (selectedUser) {
            return current.map((user) => (user.id === selectedUser.id ? savedUser : user));
          }

          return [savedUser, ...current];
        });
      }

      setMessage('Data user berhasil disimpan.');
      closeForm();
    } catch (_error) {
      setMessage('Data user gagal dikirim ke backend.');
    } finally {
      setIsLoading(false);
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
              Kelola akun admin, guru, staff, dan intern. User siswa tampil jika dicari atau filter siswa dipilih.
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
          </div>
        </header>

        {formMode === 'list' ? (
          <>
            <UserFilterBar filters={filters} theme={theme} onChange={setFilters} />
            {isLoading ? (
              <p className="m-0 mt-4 text-sm font-bold text-[#8b9298]">Memuat data users...</p>
            ) : null}
            <UsersTable
              users={allUsers}
              theme={theme}
              currentPage={pagination.page ?? currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onEdit={openEditForm}
            />
          </>
        ) : (
          <UserForm initialData={selectedUser} theme={theme} onCancel={closeForm} onSubmit={saveUser} />
        )}
      </main>
    </div>
  );
}
