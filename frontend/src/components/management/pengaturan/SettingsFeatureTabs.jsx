import clsx from 'clsx';

import { AppIcon } from '../../ui/AppIcon.jsx';

export function SettingsFeatureTabs({ tabs, activeTab, theme = 'light', onChange }) {
  const isDark = theme === 'dark';

  return (
    <section className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {tabs.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <button
            type="button"
            key={tab.key}
            className={clsx(
              'group rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5',
              active
                ? isDark
                  ? 'border-[#8db8ef] bg-[#31527d] text-white shadow-lg'
                  : 'border-[#9fbbe1] bg-[#dce9fb] text-[#31527d] shadow-md'
                : isDark
                  ? 'border-[#3d4854] bg-[#313b45] text-[#f4f1ec] hover:border-[#8db8ef] hover:bg-[#364653]'
                  : 'border-[#edf0f3] bg-white text-[#43505a] hover:border-[#bfd1ea] hover:bg-[#f8fbff]'
            )}
            onClick={() => onChange?.(tab.key)}
          >
            <div className="flex items-start gap-4">
              <span
                className={clsx(
                  'grid h-11 w-11 place-items-center rounded-xl transition',
                  active
                    ? isDark
                      ? 'bg-white/15 text-white'
                      : 'bg-white text-[#31527d]'
                    : isDark
                      ? 'bg-[#25303a] text-[#cfd8e3] group-hover:bg-[#31527d] group-hover:text-white'
                      : 'bg-[#eef3f9] text-[#6d8bb3] group-hover:bg-[#dce9fb] group-hover:text-[#31527d]'
                )}
              >
                <AppIcon name={tab.icon} />
              </span>

              <span className="min-w-0">
                <span className="block text-base font-extrabold">{tab.title}</span>
                <span
                  className={clsx(
                    'mt-1 block text-sm font-semibold leading-relaxed',
                    active ? (isDark ? 'text-[#e8eef6]' : 'text-[#4c6f9c]') : 'text-[#8b9298]'
                  )}
                >
                  {tab.description}
                </span>
              </span>
            </div>
          </button>
        );
      })}
    </section>
  );
}
