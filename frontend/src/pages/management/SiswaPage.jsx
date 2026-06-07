import { useEffect, useMemo, useState } from 'preact/hooks';
import clsx from 'clsx';

import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import { SiswaFilterBar, SiswaForm, SiswaTable } from '../../components/management/siswa/index.js';
import { AppIcon } from '../../components/ui/AppIcon.jsx';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import { appStorage } from '../../lib/storage.js';

const initialStudents = Object.freeze(
  Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    nisn: '0068234587',
    nama: 'RACHMAD HIDAYAT',
    jurusan: 'TKJ',
    kelas: 'X-1',
    gender: 'L',
    status: 'Aktif',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2010-03-30',
    catatan: '',
  }))
);

const initialFilters = Object.freeze({
  keyword: '',
  jurusan: '',
  kelas: '',
  status: '',
});

const PAGE_SIZE = 10;

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

export function SiswaPage() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [students, setStudents] = useState(initialStudents);
  const [filters, setFilters] = useState(initialFilters);
  const [formMode, setFormMode] = useState('list');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const filteredStudents = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();

    return students.filter((student) => {
      const matchesKeyword =
        !keyword ||
        student.nisn.toLowerCase().includes(keyword) ||
        student.nama.toLowerCase().includes(keyword);

      const matchesJurusan = !filters.jurusan || student.jurusan === filters.jurusan;
      const matchesKelas = !filters.kelas || student.kelas === filters.kelas;
      const matchesStatus = !filters.status || student.status === filters.status;

      return matchesKeyword && matchesJurusan && matchesKelas && matchesStatus;
    });
  }, [filters, students]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredStudents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
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
            <SiswaFilterBar filters={filters} theme={theme} onChange={setFilters} />
            <SiswaTable
              students={paginatedStudents}
              theme={theme}
              currentPage={currentPage}
              totalPages={totalPages}
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
