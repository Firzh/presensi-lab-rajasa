import clsx from 'clsx';

import { AppIcon } from '../ui/AppIcon.jsx';

const toneClassMap = Object.freeze({
  sky: {
    icon: 'bg-[#9fd5ee] text-white',
  },
  green: {
    icon: 'bg-[#8bd08c] text-white',
  },
  orange: {
    icon: 'bg-[#f2a57f] text-white',
  },
  red: {
    icon: 'bg-[#ee7d86] text-white',
  },
});

export function DashboardStatCard({ icon, value, label, tone = 'sky', theme = 'light' }) {
  const toneClass = toneClassMap[tone] ?? toneClassMap.sky;

  return (
    <article
      className={clsx(
        'flex min-h-19.5 items-center justify-between rounded-xl px-6 py-3',
        theme === 'dark' ? 'bg-[#313b45] text-[#f4f1ec]' : 'bg-white text-[#444b51]'
      )}
    >
      <div className={clsx('grid h-10 w-10 place-items-center rounded-full', toneClass.icon)}>
        <AppIcon name={icon} className="text-[1.15rem]" />
      </div>

      <div className="text-right">
        <p className="m-0 text-4xl font-extrabold leading-none tracking-wide">{value}</p>
        <p className="m-0 mt-1 text-lg font-medium">{label}</p>
      </div>
    </article>
  );
}
