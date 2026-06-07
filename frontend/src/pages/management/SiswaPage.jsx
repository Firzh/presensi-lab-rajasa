import { useEffect, useState } from 'preact/hooks';
import clsx from 'clsx';

import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import { SiswaFilterBar, SiswaForm, SiswaTable } from '../../components/management/siswa/index.js';
import { AppIcon } from '../../components/ui/AppIcon.jsx';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import { appStorage } from '../../lib/storage.js';

import { listSiswa } from '../../api/siswaApi.js';

const initialFilters = Object.freeze({
  keyword: '',
  jurusan_id: '',
  rombel_id: '',
  status: '',
});

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

export function SiswaPage() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [students, setStudents] = useState([]);
  const [options, setOptions] = useState({
    jurusan: [],
    rombel: [],
    statuses: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [formMode, setFormMode] = useState('list');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    fetchStudents(currentPage);
  }, [currentPage, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }

  async function fetchStudents(page = currentPage) {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await listSiswa({
        q: filters.keyword,
        jurusan_id: filters.jurusan_id,
        rombel_id: filters.rombel_id,
        status: filters.status,
        page,
        per_page: 10,
      });

      if (!result.ok || result.data?.success === false) {
        throw new Error(result.data?.message || 'Gagal memuat data siswa.');
      }

      const payload = result.data?.data ?? {};

      setStudents(payload.items ?? []);
      setOptions(payload.options ?? { jurusan: [], rombel: [], statuses: [] });
      setPagination(
        payload.pagination ?? {
          page,
          per_page: 10,
          total: 0,
          total_pages: 1,
        }
      );
    } catch (error) {
      setStudents([]);
      setErrorMessage(error.message || 'Gagal memuat data siswa.');
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateForm() {
    setSelectedStudent(null);
    setFormMode('form');
  }

  function openEditForm(student) {
    setSelectedStudent(student);
    setFormMode('form');
  }

  function closeForm() {
    setSelectedStudent(null);
    setFormMode('list');
  }

  function saveStudent(payload) {
    if (selectedStudent) {
      setStudents((current) =>
        current.map((student) =>
          student.id === selectedStudent.id
            ? {
                ...student,
                ...payload,
              }
            : student
        )
      );
    } else {
      setStudents((current) => [
        ...current,
        {
          ...payload,
          id: Date.now(),
        },
      ]);
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
      <DashboardSidebar theme={theme} activeKey="siswa" />
      <DashboardTopbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="ml-65 min-h-screen px-10 pb-8 pt-29.5">
        <header className="mb-9 flex items-start justify-between">
          <div>
            <h1
              className={clsx(
                'm-0 text-[2rem] font-extrabold leading-none tracking-wide',
                isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
              )}
            >
              Data Siswa
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
                'flex h-12 items-center gap-3 rounded-md px-6 text-base font-bold transition',
                isDark
                  ? 'bg-[#313b45] text-[#f4f1ec] hover:bg-[#31527d]'
                  : 'bg-white text-[#456da1] hover:bg-[#bfcee3]'
              )}
              onClick={openCreateForm}
            >
              <AppIcon name="plus" />
              Tambah Siswa
            </button>
          ) : null}
        </header>

        {formMode === 'list' ? (
          <>
            <SiswaFilterBar
              filters={filters}
              options={options}
              theme={theme}
              onChange={(nextFilters) => {
                setFilters(nextFilters);
                setCurrentPage(1);
              }}
            />
            {errorMessage ? (
              <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">
                {errorMessage}
              </p>
            ) : null}

            {isLoading ? (
              <p className="mt-4 text-sm font-bold text-[#8b9298]">Memuat data siswa...</p>
            ) : null}
            <SiswaTable
              students={students}
              theme={theme}
              currentPage={pagination.page}
              totalPages={pagination.total_pages}
              onPageChange={setCurrentPage}
              onEdit={openEditForm}
            />
          </>
        ) : (
          <SiswaForm
            initialData={selectedStudent}
            theme={theme}
            onCancel={closeForm}
            onSubmit={saveStudent}
          />
        )}
      </main>
    </div>
  );
}
