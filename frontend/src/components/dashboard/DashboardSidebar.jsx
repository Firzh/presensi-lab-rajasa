import { useState } from 'preact/hooks';
import clsx from 'clsx';

import { AppIcon } from '../ui/AppIcon.jsx';
import { getAuthSession } from '../../lib/authSession.js';
import { isGuruSession } from '../../lib/roleUtils.js';
import { DashboardSidebarLink } from './DashboardSidebarLink.jsx';
import { DashboardSidebarSection } from './DashboardSidebarSection.jsx';

const managementItems = Object.freeze([
  { key: 'siswa', icon: 'userGraduate', label: 'Data Siswa', href: '/siswa' },
  { key: 'jurusan', icon: 'building', label: 'Data Jurusan', href: '/jurusan' },
  // { key: 'ruangan', icon: 'doorOpen', label: 'Data Ruangan', href: '/ruangan' },
  { key: 'laporan', icon: 'list', label: 'Laporan', href: '/laporan' },
  { key: 'presensi', icon: 'clipboardList', label: 'Presensi', href: '/presensi' },
]);

const adminItems = Object.freeze([
  { key: 'users', icon: 'usersGear', label: 'Kelola Users', href: '/users' },
  { key: 'log-users', icon: 'triangleExclamation', label: 'Log Users', href: '/log-users' },
  { key: 'pengaturan', icon: 'gear', label: 'Pengaturan', href: '/pengaturan' },
]);

function getVisibleAdminItems(session) {
  if (!isGuruSession(session)) {
    return adminItems;
  }

  return adminItems.filter((item) => item.key !== 'log-users');
}

function getMobileItems(visibleAdminItems) {
  return [
    { key: 'dashboard', icon: 'house', label: 'Dashboard', href: '/dashboard' },
    ...managementItems,
    ...visibleAdminItems,
  ];
}

function Brand({ theme = 'light', compact = false }) {
  return (
    <div className={clsx('flex items-center gap-3', compact ? 'mb-8' : 'mb-16')}>
      <div
        className={clsx(
          'grid h-11 w-11 place-items-center rounded-full',
          theme === 'dark' ? 'bg-[#f4f1ec] text-[#263544]' : 'bg-[#f8f4ea] text-[#3975aa]'
        )}
      >
        <AppIcon name="microscope" className="text-2xl" />
      </div>

      <div>
        <p className="m-0 text-2xl font-extrabold leading-tight">Presensi</p>
        {!compact ? (
          <p className="m-0 text-[0.78rem] tracking-[0.08em] text-[#8b9298]">SMK RAJASA SURABAYA</p>
        ) : null}
      </div>
    </div>
  );
}

export function DashboardSidebar({ theme = 'light', activeKey = 'dashboard' }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const session = getAuthSession();
  const visibleAdminItems = getVisibleAdminItems(session);
  const mobileItems = getMobileItems(visibleAdminItems);

  function closeMobileSidebar() {
    setIsMobileOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className={clsx(
          'fixed left-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-xl shadow-lg transition lg:hidden',
          theme === 'dark'
            ? 'bg-[#25303a] text-[#f4f1ec] hover:bg-[#31527d]'
            : 'bg-white text-[#31527d] hover:bg-[#dce5f0]'
        )}
        aria-label="Buka navigasi"
        aria-expanded={isMobileOpen}
        onClick={() => setIsMobileOpen(true)}
      >
        <AppIcon name="bars" className="text-lg" />
      </button>

      <aside
        className={clsx(
          'fixed left-0 top-0 z-20 hidden h-screen w-65 flex-col border-r px-6 py-4 lg:flex',
          theme === 'dark'
            ? 'border-[#1f2933] bg-[#141b23] text-white'
            : 'border-[#edf0f3] bg-white text-[#43505a]'
        )}
      >
        <Brand theme={theme} />

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

          {visibleAdminItems.length > 0 ? (
            <DashboardSidebarSection
              icon="userShield"
              title="Admin"
              items={visibleAdminItems}
              theme={theme}
              activeKey={activeKey}
            />
          ) : null}
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

      {isMobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
          aria-label="Tutup navigasi"
          onClick={closeMobileSidebar}
        />
      ) : null}

      <aside
        className={clsx(
          'fixed left-0 top-0 z-50 flex h-screen w-[82vw] max-w-80 flex-col border-r px-5 py-4 shadow-2xl transition-transform duration-200 lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          theme === 'dark'
            ? 'border-[#1f2933] bg-[#141b23] text-white'
            : 'border-[#edf0f3] bg-white text-[#43505a]'
        )}
        aria-label="Navigasi mobile"
      >
        <div className="mb-2 flex items-start justify-between gap-4">
          <Brand theme={theme} compact />

          <button
            type="button"
            className={clsx(
              'grid h-9 w-9 place-items-center rounded-xl text-xl font-bold transition',
              theme === 'dark' ? 'bg-[#25303a] text-[#f4f1ec]' : 'bg-[#eef0f3] text-[#43505a]'
            )}
            aria-label="Tutup navigasi"
            onClick={closeMobileSidebar}
          >
            ×
          </button>
        </div>

        <nav className="grid gap-2 overflow-y-auto pb-6" aria-label="Menu mobile">
          {mobileItems.map((item) => {
            const active = item.key === activeKey;

            return (
              <a
                key={item.key}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                aria-label={`${item.label} mobile`}
                className={clsx(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold no-underline transition',
                  active
                    ? theme === 'dark'
                      ? 'bg-[#f4f1ec] text-[#1d262e]'
                      : 'bg-[#dce5f0] text-[#31527d]'
                    : theme === 'dark'
                      ? 'text-[#cfd8e3] hover:bg-[#25303a]'
                      : 'text-[#6f7882] hover:bg-[#eef0f3]'
                )}
                onClick={closeMobileSidebar}
              >
                <AppIcon name={item.icon} className="w-4" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <a
          href="/"
          className={clsx(
            'mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold transition',
            theme === 'dark'
              ? 'bg-[#25303a] text-[#f1f1ee] hover:bg-[#31527d] hover:text-white'
              : 'bg-[#eef0f3] text-[#47525b] hover:bg-[#bfcee3] hover:text-white'
          )}
        >
          <AppIcon name="arrowRightFromBracket" />
          Keluar
        </a>
      </aside>
    </>
  );
}
