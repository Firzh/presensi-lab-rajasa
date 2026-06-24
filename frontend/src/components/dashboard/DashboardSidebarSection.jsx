import { useState } from 'preact/hooks';

import { AppIcon } from '../ui/AppIcon.jsx';
import { DashboardSidebarLink } from './DashboardSidebarLink.jsx';

export function DashboardSidebarSection({ icon, title, items, theme = 'light', activeKey }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="grid gap-2">
      <button
        type="button"
        className="flex items-center justify-between px-3 text-[0.95rem] font-extrabold"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          <AppIcon name={icon} className="w-4" />
          {title}
        </span>

        <AppIcon
          name="angleDown"
          className={isOpen ? 'w-3 transition-transform' : 'w-3 -rotate-90 transition-transform'}
        />
      </button>

      {isOpen ? (
        <div className="grid gap-1">
          {items.map((item) => (
            <DashboardSidebarLink
              key={item.key}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={item.key === activeKey}
              theme={theme}
              compact
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
