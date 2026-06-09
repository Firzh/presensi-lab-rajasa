import { AppIcon } from '../ui/AppIcon.jsx';

export function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="login-theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}
    >
      <AppIcon name="circleHalfStroke" />
    </button>
  );
}