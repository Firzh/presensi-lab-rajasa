import { useEffect, useState } from 'preact/hooks';

import { LoginBrandPanel } from '../../components/auth/LoginBrandPanel.jsx';
import { LoginForm } from '../../components/auth/LoginForm.jsx';
import { ThemeToggle } from '../../components/auth/ThemeToggle.jsx';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import { ROUTES } from '../../constants/routes.js';
import { appStorage } from '../../lib/storage.js';
import '../../styles/login.css';

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

export function LoginPage() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }

  function handleLoginSuccess() {
    window.location.assign(ROUTES.DASHBOARD);
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Halaman login sistem presensi lab">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />

        <LoginBrandPanel />

        <section className="login-form-panel" aria-label="Form login">
          <div className="login-form-main">
            <div className="login-form-content">
              <header className="login-header">
                <h2>Selamat Datang</h2>
                <p>Silahkan masuk untuk mengakses sistem</p>
              </header>

              {/* <LoginForm /> */}
              <LoginForm onSuccess={handleLoginSuccess} />
            </div>
          </div>

          <footer className="login-footer">
            <p>2026 SMKS Rajasa Surabaya</p>
            <p>Tim Magang TKJ</p>
          </footer>
        </section>
      </section>
    </main>
  );
}
