import clsx from 'clsx';

import { AppIcon } from '../ui/AppIcon.jsx';

export function DashboardEmptyState({ theme = 'light' }) {
  return (
    <section
      className={clsx(
        'grid min-h-55 place-items-center rounded-xl px-4 py-8 sm:min-h-70',
        theme === 'dark' ? 'bg-[#313b45]' : 'bg-white'
      )}
    >
      <div className="grid justify-items-center gap-5 text-center">
        <AppIcon
          name="inbox"
          className={clsx('text-[4rem]', theme === 'dark' ? 'text-[#9aa6b0]' : 'text-[#d9dee2]')}
        />
        <p
          className={clsx('m-0 text-base', theme === 'dark' ? 'text-[#58626b]' : 'text-[#c5c9cc]')}
        >
          Belum ada presensi hari ini
        </p>
      </div>
    </section>
  );
}
