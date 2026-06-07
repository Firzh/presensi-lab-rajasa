import clsx from 'clsx';

import { AppIcon } from '../ui/AppIcon.jsx';
import { DashboardSidebarLink } from './DashboardSidebarLink.jsx';
import { DashboardSidebarSection } from './DashboardSidebarSection.jsx';

const managementItems = Object.freeze([
  { key: 'siswa', icon: 'userGraduate', label: 'Data Siswa', href: '/siswa' },
  { key: 'jurusan', icon: 'building', label: 'Data Jurusan', href: '/jurusan' },
  { key: 'ruangan', icon: 'doorOpen', label: 'Data Ruangan', href: '/ruangan' },
  { key: 'laporan', icon: 'list', label: 'Laporan', href: '#laporan' },
]);

const adminItems = Object.freeze([
  { key: 'users', icon: 'usersGear', label: 'Kelola Users', href: '#users' },
  { key: 'log-users', icon: 'triangleExclamation', label: 'Log Users', href: '#log-users' },
  { key: 'pengaturan', icon: 'gear', label: 'Pengaturan', href: '#pengaturan' },
]);

export function DashboardSidebar({ theme = 'light', activeKey = 'dashboard' }) {
  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 z-20 flex h-screen w-65 flex-col border-r px-6 py-4',
        theme === 'dark'
          ? 'border-[#1f2933] bg-[#141b23] text-white'
          : 'border-[#edf0f3] bg-white text-[#43505a]'
      )}
    >
      <div className="mb-16 flex items-center gap-3">
        <div
          className={clsx(
            'grid h-11 w-11 place-items-center rounded-full',
            theme === 'dark' ? 'bg-[#263544] text-[#9cc2e8]' : 'bg-[#e7f1fb] text-[#3975aa]'
          )}
        >
          <AppIcon name="microscope" className="text-2xl" />
        </div>

        <div>
          <p className="m-0 text-2xl font-extrabold leading-tight">Presensi</p>
          <p className="m-0 text-[0.78rem] tracking-[0.08em] text-[#8b9298]">SMK RAJASA SURABAYA</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-7" aria-label="Navigasi dashboard">
        <div className="grid gap-2">
          <DashboardSidebarLink
            icon="house"
            label="Dashboard"
            href="/dashboard"
            active={activeKey === 'dashboard'}
            theme={theme}
          />
        </div>

        <DashboardSidebarSection
          icon="users"
          title="Manajemen"
          items={managementItems}
          theme={theme}
          activeKey={activeKey}
        />

        <DashboardSidebarSection
          icon="userShield"
          title="Admin"
          items={adminItems}
          theme={theme}
          activeKey={activeKey}
        />
      </nav>

      <a
        href="/"
        className={clsx(
          'mt-8 flex items-center gap-3 rounded-md px-4 py-3 text-[0.95rem] font-extrabold transition',
          theme === 'dark'
            ? 'bg-[#25303a] text-[#f1f1ee] hover:bg-[#31527d] hover:text-white'
            : 'bg-[#eef0f3] text-[#47525b] hover:bg-[#bfcee3] hover:text-white'
        )}
      >
        <AppIcon name="arrowRightFromBracket" />
        Keluar
      </a>
    </aside>
  );
}
