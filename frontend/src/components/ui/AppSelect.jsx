import clsx from 'clsx';

import { AppIcon } from './AppIcon.jsx';

export function AppSelect({
  icon,
  theme = 'light',
  className = '',
  children,
  disabled = false,
  ...props
}) {
  const isDark = theme === 'dark';

  return (
    <div className={clsx('relative', className)}>
      {icon ? (
        <span
          className={clsx(
            'pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition',
            disabled ? 'text-[#8b9298]/50' : isDark ? 'text-[#F0EDE4]' : 'text-[#43505a]'
          )}
        >
          <AppIcon name={icon} />
        </span>
      ) : null}

      <select
        disabled={disabled}
        className={clsx(
          'h-12 w-full appearance-none rounded-xl border px-4 pr-12 text-sm font-medium outline-none transition',
          icon ? 'pl-14' : 'pl-4',
          disabled && 'cursor-not-allowed opacity-60',
          isDark
            ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] hover:border-[#F0EDE4] hover:bg-[#64717d] focus:border-[#F0EDE4] focus:ring-2 focus:ring-[#F0EDE4]/20'
            : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#5f95df] hover:bg-[#dbeafe] hover:text-[#2f5278] focus:border-[#7ea4d4] focus:ring-2 focus:ring-[#7ea4d4]/20'
        )}
        {...props}
      >
        {children}
      </select>

      <span
        className={clsx(
          'pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 transition',
          disabled ? 'text-[#8b9298]/50' : isDark ? 'text-[#F0EDE4]' : 'text-[#43505a]'
        )}
      >
        <AppIcon name="angleDown" />
      </span>
    </div>
  );
}
