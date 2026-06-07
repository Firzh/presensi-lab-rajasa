import clsx from 'clsx';

import { AppIcon } from './AppIcon.jsx';

export function AppSelect({
  icon,
  value,
  children,
  theme = 'light',
  className = '',
  onInput,
  ...props
}) {
  return (
    <div className="relative">
      {icon ? (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#F0EDE4]">
          <AppIcon name={icon} />
        </span>
      ) : null}

      <select
        value={value}
        onInput={onInput}
        className={clsx(
          'h-12 w-full appearance-none rounded-xl border px-4 text-sm font-medium outline-none transition',
          icon ? 'pl-14' : 'pl-4',
          'pr-12',
          theme === 'dark'
            ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] focus:border-[#F0EDE4] focus:ring-2 focus:ring-[#F0EDE4]/20'
            : 'border-[#d5dde8] bg-white text-[#43505a] focus:border-[#7ea4d4] focus:ring-2 focus:ring-[#7ea4d4]/20',
          className
        )}
        {...props}
      >
        {children}
      </select>

      <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#F0EDE4]">
        <AppIcon name="angleDown" />
      </span>
    </div>
  );
}
