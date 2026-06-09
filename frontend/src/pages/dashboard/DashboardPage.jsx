import { useEffect, useState } from 'preact/hooks';

import { getDashboardData } from '../../api/dashboardApi.js';
import {
  DashboardEmptyState,
  DashboardQuickAction,
  DashboardSidebar,
  DashboardStatCard,
  DashboardTopbar,
} from '../../components/dashboard/index.js';
import { ROUTES } from '../../constants/routes.js';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import { getAuthSession } from '../../lib/authSession.js';
import { APP_TIME_ZONE, getAppTodayDate } from '../../lib/dateUtils.js';
import { isGuruSession } from '../../lib/roleUtils.js';
import { appStorage } from '../../lib/storage.js';

const defaultSummary = Object.freeze({
  totalSiswa: 0,
  hadirHari: 0,
  tidakHadir: 0,
  logAksesInvalid: 0,
  recentPresensi: [],
});

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

function formatDashboardDate(now = new Date()) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: APP_TIME_ZONE,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(now);
}

function buildStats(summary, showLogSummary) {
  const stats = [
    { icon: 'graduationCap', value: summary.totalSiswa, label: 'Total Siswa', tone: 'sky' },
    { icon: 'circleCheck', value: summary.hadirHari, label: 'Hadir Hari Ini', tone: 'green' },
    { icon: 'circleXmark', value: summary.tidakHadir, label: 'Tidak Hadir', tone: 'orange' },
  ];

  if (showLogSummary) {
    stats.push({
      icon: 'triangleExclamation',
      value: summary.logAksesInvalid,
      label: 'Log Akses Invalid',
      tone: 'red',
    });
  }

  return stats;
}

function buildQuickActions(showLogUsers) {
  const actions = [
    { icon: 'plus', label: 'Tambah Siswa', href: ROUTES.SISWA },
    { icon: 'users', label: 'Lihat Presensi', href: ROUTES.PRESENSI },
    { icon: 'fileExport', label: 'Export Laporan', href: ROUTES.LAPORAN },
  ];

  if (showLogUsers) {
    actions.push({ icon: 'doorOpen', label: 'Log Users', href: ROUTES.LOG_USERS });
  }

  return actions;
}

function formatTime(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: APP_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function statusLabel(status) {
  const labels = {
    hadir: 'Hadir',
    terlambat: 'Terlambat',
    alpha: 'Alpha',
    izin: 'Izin',
    sakit: 'Sakit',
  };

  return labels[status] ?? status ?? '-';
}

function DashboardRecentAttendance({ items, theme = 'light' }) {
  return (
    <section
      className={
        theme === 'dark'
          ? 'overflow-hidden rounded-xl bg-[#313b45] text-[#f4f1ec]'
          : 'overflow-hidden rounded-xl bg-white text-[#444b51]'
      }
      aria-label="Daftar presensi terbaru"
    >
      {items.map((item) => (
        <article
          key={item.presensi_id}
          className={
            theme === 'dark'
              ? 'flex flex-col gap-1 border-b border-[#25303a] px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between'
              : 'flex flex-col gap-1 border-b border-[#edf0f3] px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between'
          }
        >
          <div>
            <p className="m-0 font-extrabold">{item.siswa?.nama_lengkap ?? '-'}</p>
            <p className="m-0 text-sm text-[#8d8d8d]">
              {item.siswa?.nisn ?? '-'} · {item.rombel?.label_rombel ?? '-'}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="m-0 font-bold">{statusLabel(item.status)}</p>
            <p className="m-0 text-sm text-[#8d8d8d]">
              {formatTime(item.scanned_at || item.edited_at)}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}

export function DashboardPage() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [summary, setSummary] = useState(defaultSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const session = getAuthSession();
  const hideLogUsers = isGuruSession(session);
  const showLogUsers = !hideLogUsers;
  const isDark = theme === 'dark';
  const stats = buildStats(summary, showLogUsers);
  const quickActions = buildQuickActions(showLogUsers);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const result = await getDashboardData({
          tanggal: getAppTodayDate(),
          includeLogSummary: showLogUsers,
        });

        if (!isMounted) {
          return;
        }

        setSummary({
          ...defaultSummary,
          ...result.data,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error?.message || 'Gagal memuat data dashboard.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [showLogUsers]);

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
          <p className="m-0 mt-3 text-base font-medium text-[#8d8d8d]">{formatDashboardDate()}</p>
        </section>

        <section
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Ringkasan dashboard"
        >
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

          {isLoading ? (
            <section
              className={
                isDark ? 'rounded-xl bg-[#313b45] px-5 py-8' : 'rounded-xl bg-white px-5 py-8'
              }
            >
              Memuat data dashboard...
            </section>
          ) : errorMessage ? (
            <section
              className={
                isDark ? 'rounded-xl bg-[#313b45] px-5 py-8' : 'rounded-xl bg-white px-5 py-8'
              }
            >
              {errorMessage}
            </section>
          ) : summary.recentPresensi.length > 0 ? (
            <DashboardRecentAttendance items={summary.recentPresensi} theme={theme} />
          ) : (
            <DashboardEmptyState theme={theme} />
          )}
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
