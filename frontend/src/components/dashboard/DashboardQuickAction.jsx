import clsx from 'clsx';

import { AppIcon } from '../ui/AppIcon.jsx';

export function DashboardQuickAction({ icon, label, href = '#', theme = 'light' }) {
  return (
    <a
      href={href}
      className={clsx(
        'flex min-h-16 items-center justify-start gap-4 rounded-md px-4 text-base font-medium no-underline sm:justify-center',
        theme === 'dark' ? 'bg-[#313b45] text-[#f4f1ec]' : 'bg-white text-[#444b51]'
      )}
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#a9bfdb] text-white">
        <AppIcon name={icon} />
      </span>
      {label}
    </a>
  );
}
