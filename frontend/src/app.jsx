import { useEffect, useState } from 'preact/hooks';
import './app.css';
import { AppShell } from './components/layout/index.js';
import { ROUTES, STORAGE_KEYS } from './constants/index.js';
import { LoginPage } from './pages/LoginPage.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const AUTH_USER_KEY = 'rajasa-auth-user';
const THEME_KEY = STORAGE_KEYS.THEME || 'rajasa-presensi-theme';

const APP_NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard' },
  { href: ROUTES.SISWA, label: 'Siswa' },
  { href: ROUTES.JURUSAN, label: 'Jurusan' },
  { href: ROUTES.RUANGAN, label: 'Ruangan' },
];

function readStoredTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function App() {
  const [theme, setTheme] = useState(readStoredTheme);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  }

  async function handleLoginSubmit({ username, password, remember }) {
    setLoginError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
          remember,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Login gagal.');
      }

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      window.history.pushState(null, '', data.user.dashboard_path || '/dashboard');
    } catch (error) {
      setLoginError(error.message || 'Tidak bisa menghubungi server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell title="Login" navItems={APP_NAV_ITEMS} variant="auth">
      <LoginPage
        isSubmitting={isSubmitting}
        loginError={loginError}
        onSubmit={handleLoginSubmit}
        onToggleTheme={toggleTheme}
        theme={theme}
      />
    </AppShell>
  );
}
