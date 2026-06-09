import { useEffect, useState } from 'preact/hooks';

import {
  DashboardEmptyState,
  DashboardQuickAction,
  DashboardSidebar,
  DashboardStatCard,
  DashboardTopbar,
} from '../../components/dashboard/index.js';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import { appStorage } from '../../lib/storage.js';

const stats = Object.freeze([
  { icon: 'graduationCap', value: 20, label: 'Total Siswa', tone: 'sky' },
  { icon: 'circleCheck', value: 15, label: 'Hadir Hari', tone: 'green' },
  { icon: 'circleXmark', value: 3, label: 'Tidak Hadir', tone: 'orange' },
  { icon: 'triangleExclamation', value: 2, label: 'Log Akses Invalid', tone: 'red' },
]);

const quickActions = Object.freeze([
  { icon: 'plus', label: 'Tambah Siswa', href: '/siswa' },
  { icon: 'users', label: 'Lihat Presensi', href: '#presensi' },
  { icon: 'fileExport', label: 'Export Laporan', href: '#export' },
  { icon: 'doorOpen', label: 'Log Akses', href: '#log-akses' },
]);

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

export function DashboardPage() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }

  return (
    <div
      className={
        isDark
          ? 'min-h-screen bg-[#1d262e] text-[#f4f1ec]'
          : 'min-h-screen bg-[#f3f3f3] text-[#444b51]'
      }
    >
      <DashboardSidebar theme={theme} activeKey="dashboard" />
      <DashboardTopbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="min-h-screen px-4 pb-8 pt-36 sm:px-6 lg:ml-65 lg:px-14 lg:pb-9 lg:pt-33">
        <section className="mb-10">
          <h1 className="m-0 text-[2rem] font-extrabold leading-none tracking-wide text-[#6d747b] sm:text-[2.35rem]">
            Dashboard
          </h1>
          <p className="m-0 mt-3 text-base font-medium text-[#8d8d8d]">Senin, 30 Maret 2026</p>
        </section>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan dashboard">
          {stats.map((stat) => (
            <DashboardStatCard key={stat.label} {...stat} theme={theme} />
          ))}
        </section>

        <section className="mt-6">
          <h2 className="mb-4 flex items-center gap-3 text-base font-extrabold text-[#77808a]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#77808a] text-[0.7rem] text-white">
              <span>J</span>
            </span>
            Presensi Terbaru
          </h2>

          <DashboardEmptyState theme={theme} />
        </section>

        <section className="mt-6">
          <h2 className="mb-4 text-base font-extrabold text-[#77808a]">Aksi Cepat</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-7">
            {quickActions.map((action) => (
              <DashboardQuickAction key={action.label} {...action} theme={theme} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
