import clsx from 'clsx';

import { AppIcon } from '../../ui/AppIcon.jsx';

const cardThemeMap = Object.freeze({
  hadir: {
    iconWrap: 'text-[#8faad8]',
    icon: 'text-[1.75rem]',
  },
  terlambat: {
    iconWrap: 'text-[#e0b64c]',
    icon: 'text-[1.75rem]',
  },
  sakit: {
    iconWrap: 'text-[#5ac0a6]',
    icon: 'text-[1.85rem]',
  },
  izin: {
    iconWrap: 'text-[#9a75d6]',
    icon: 'text-[1.75rem]',
  },
  alpha: {
    iconWrap: 'text-[#ef707c]',
    icon: 'text-[1.75rem]',
  },
});

export function LaporanStatCard({ item, value, theme = 'light' }) {
  const isDark = theme === 'dark';
  const current = cardThemeMap[item.key] ?? cardThemeMap.hadir;

  return (
    <article
      className={clsx(
        'flex h-20 items-center gap-4 rounded-xl px-4 transition sm:gap-5 sm:px-6',
        isDark ? 'bg-[#313b45]' : 'bg-white'
      )}
    >
      <div className={clsx('grid h-11 w-11 shrink-0 place-items-center', current.iconWrap)}>
        <AppIcon name={item.icon} className={current.icon} />
      </div>

      <p className="m-0 flex items-center gap-3">
        <span
          className={clsx(
            'min-w-7 text-2xl font-extrabold leading-none',
            isDark ? 'text-[#F0EDE4]' : 'text-[#43505a]'
          )}
        >
          {value}
        </span>

        <span className="text-base font-bold text-[#8b9298]">{item.label}</span>
      </p>
    </article>
  );
}
