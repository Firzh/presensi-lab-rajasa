import clsx from 'clsx';

import { AppIcon } from '../ui/AppIcon.jsx';

export function DashboardSidebarLink({
  icon,
  label,
  href,
  active = false,
  theme = 'light',
  compact = false,
}) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex items-center gap-3 rounded-md px-4 py-2 text-[0.95rem] font-bold transition',
        compact && 'ml-9',
        active
          ? theme === 'dark'
            ? 'bg-[#31527d] text-white'
            : 'bg-[#bfcee3] text-white'
          : theme === 'dark'
            ? 'text-[#f1f1ee] hover:bg-[#23303b] hover:text-white'
            : 'text-[#47525b] hover:bg-[#eef1f5] hover:text-[#2f3a43]'
      )}
    >
      <AppIcon name={icon} className="w-4" />
      <span>{label}</span>
    </a>
  );
}
