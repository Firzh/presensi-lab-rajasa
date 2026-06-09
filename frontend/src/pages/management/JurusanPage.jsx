import { useEffect, useState } from 'preact/hooks';
import clsx from 'clsx';

import {
  createJurusan,
  deleteJurusan,
  listJurusan,
  updateJurusan,
} from '../../api/jurusanApi.js';
import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import { JurusanCard, JurusanForm } from '../../components/management/jurusan/index.js';
import { AppIcon } from '../../components/ui/AppIcon.jsx';
import { AppSelect } from '../../components/ui/AppSelect.jsx';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import { appStorage } from '../../lib/storage.js';

const initialFilters = Object.freeze({
  keyword: '',
  status: '',
});

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

function getVisiblePages(currentPage, totalPages) {
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startPage = Math.max(1, safeCurrentPage - 2);
  const endPage = Math.min(totalPages, safeCurrentPage + 2);

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
}

export function JurusanPage() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 4,
    total: 0,
    total_pages: 1,
  });
  const [formMode, setFormMode] = useState('list');
  const [selectedJurusan, setSelectedJurusan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    fetchJurusan(pagination.page);
  }, [filters, pagination.page]);

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }

  async function fetchJurusan(page = 1) {
    setIsLoading(true);
    setMessage('');

    try {
      const result = await listJurusan({
        q: filters.keyword,
        status: filters.status,
        page,
        per_page: 4,
      });

      if (!result.ok || result.data?.success === false) {
        throw new Error(result.data?.message || 'Gagal memuat data jurusan.');
      }

      const payload = result.data?.data ?? {};

      setItems(payload.items ?? []);
      setPagination(payload.pagination ?? {
        page,
        per_page: 4,
        total: 0,
        total_pages: 1,
      });
    } catch (error) {
      setItems([]);
      setMessage(error.message || 'Gagal memuat data jurusan.');
    } finally {
      setIsLoading(false);
    }
  }

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));

    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  }

  function openCreateForm() {
    setSelectedJurusan(null);
    setFormMode('form');
  }

  function openEditForm(jurusan) {
    setSelectedJurusan(jurusan);
    setFormMode('form');
  }

  function closeForm() {
    setSelectedJurusan(null);
    setFormMode('list');
  }

  async function saveJurusan(payload) {
    setIsLoading(true);
    setMessage('');

    try {
      const result = selectedJurusan
        ? await updateJurusan(selectedJurusan.jurusan_id, payload)
        : await createJurusan(payload);

      if (!result.ok || result.data?.success === false) {
        throw new Error(result.data?.message || 'Gagal menyimpan data jurusan.');
      }

      closeForm();
      await fetchJurusan(pagination.page);
    } catch (error) {
      setMessage(error.message || 'Gagal menyimpan data jurusan.');
    } finally {
      setIsLoading(false);
    }
  }

  async function disableJurusan(jurusan) {
    setIsLoading(true);
    setMessage('');

    try {
      const result = await deleteJurusan(jurusan.jurusan_id);

      if (!result.ok || result.data?.success === false) {
        throw new Error(result.data?.message || 'Gagal menonaktifkan jurusan.');
      }

      closeForm();
      await fetchJurusan(pagination.page);
    } catch (error) {
      setMessage(error.message || 'Gagal menonaktifkan jurusan.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={isDark ? 'min-h-screen bg-[#1d262e] text-[#f4f1ec]' : 'min-h-screen bg-[#f3f3f3] text-[#444b51]'}>
      <DashboardSidebar theme={theme} activeKey="jurusan" />
      <DashboardTopbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="min-h-screen px-4 pb-8 pt-36 sm:px-6 lg:ml-65 lg:px-10 lg:pb-8 lg:pt-29.5">
        <header className="mb-7 flex flex-col items-stretch justify-between gap-4 sm:mb-9 sm:flex-row sm:items-start">
          <div>
            <h1
              className={clsx(
                'm-0 text-[1.75rem] font-extrabold leading-none tracking-wide sm:text-[2rem]',
                isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]',
              )}
            >
              Data Jurusan
            </h1>
            <p className={clsx('m-0 mt-4 text-base font-bold', isDark ? 'text-[#cfd8e3]' : 'text-[#6f7882]')}>
              Kelola data jurusan SMK Rajasa Surabaya
            </p>
          </div>

          {formMode === 'list' ? (
            <button
              type="button"
              className={clsx(
                'flex h-12 w-full items-center justify-center gap-3 rounded-md px-6 text-base font-bold transition sm:w-auto',
                isDark
                  ? 'bg-[#313b45] text-[#f4f1ec] hover:bg-[#31527d]'
                  : 'bg-white text-[#456da1] hover:bg-[#bfcee3]',
              )}
              onClick={openCreateForm}
            >
              <AppIcon name="plus" />
              Tambah Jurusan
            </button>
          ) : null}
        </header>

        {message ? (
          <p className="mb-5 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">
            {message}
          </p>
        ) : null}

        {formMode === 'list' ? (
          <>
            <section
              className={clsx(
                'mb-7 grid grid-cols-1 gap-4 rounded-xl p-4 sm:p-5 lg:grid-cols-[1fr_260px] lg:gap-5',
                isDark ? 'bg-[#313b45]' : 'bg-white',
              )}
            >
              <label className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F0EDE4]">
                  <AppIcon name="magnifyingGlass" />
                </span>
                <input
                  type="search"
                  className={clsx(
                    'h-12 w-full rounded-xl border px-4 pl-14 text-sm font-medium outline-none transition',
                    isDark
                      ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] placeholder:text-[#F0EDE4]/70'
                      : 'border-[#d5dde8] bg-white text-[#43505a] placeholder:text-[#8b9298]',
                  )}
                  placeholder="Cari kode, nama, atau ketua jurusan..."
                  value={filters.keyword}
                  onInput={(event) => updateFilter('keyword', event.currentTarget.value)}
                />
              </label>

              <AppSelect
                icon="circleCheck"
                theme={theme}
                value={filters.status}
                onInput={(event) => updateFilter('status', event.currentTarget.value)}
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </AppSelect>
            </section>

            {isLoading ? (
              <p className="text-sm font-bold text-[#8b9298]">Memuat data jurusan...</p>
            ) : null}

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
              {items.map((jurusan) => (
                <JurusanCard
                  key={jurusan.jurusan_id}
                  jurusan={jurusan}
                  theme={theme}
                  onEdit={openEditForm}
                />
              ))}
            </section>

            {items.length === 0 && !isLoading ? (
              <section className={clsx('mt-6 grid min-h-[280px] place-items-center rounded-xl', isDark ? 'bg-[#313b45]' : 'bg-white')}>
                <p className="font-bold text-[#8b9298]">Tidak ada data jurusan</p>
              </section>
            ) : null}

            {items.length > 0 && pagination.total_pages > 1 ? (
              <div className="mt-7 flex flex-wrap justify-center gap-3 text-base font-bold sm:gap-4">
                <button
                  type="button"
                  aria-label="Halaman sebelumnya"
                  disabled={pagination.page === 1}
                  className="disabled:opacity-30"
                  onClick={() =>
                    setPagination((current) => ({
                      ...current,
                      page: Math.max(1, current.page - 1),
                    }))
                  }
                >
                  ‹
                </button>

                {getVisiblePages(pagination.page, pagination.total_pages).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={clsx(
                      'min-w-7 rounded-md px-2',
                      page === pagination.page
                        ? isDark
                          ? 'bg-[#F0EDE4] text-[#1d262e]'
                          : 'bg-[#d8dee5] text-[#43505a]'
                        : 'opacity-70',
                    )}
                    onClick={() =>
                      setPagination((current) => ({
                        ...current,
                        page,
                      }))
                    }
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  aria-label="Halaman berikutnya"
                  disabled={pagination.page === pagination.total_pages}
                  className="disabled:opacity-30"
                  onClick={() =>
                    setPagination((current) => ({
                      ...current,
                      page: Math.min(current.total_pages, current.page + 1),
                    }))
                  }
                >
                  ›
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <JurusanForm
            initialData={selectedJurusan}
            theme={theme}
            onCancel={closeForm}
            onSubmit={saveJurusan}
            onDisable={disableJurusan}
          />
        )}
      </main>
    </div>
  );
}