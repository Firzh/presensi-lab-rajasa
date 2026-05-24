/**
 * app.jsx
 *
 * Root application component.
 *
 * Auth flow:
 *   1. Baca token + user dari localStorage langsung (tanpa hit /api/me)
 *   2. Jika ada & valid → tampilkan dashboard sesuai role
 *   3. Jika tidak ada → tampilkan NotLoggedIn screen
 *
 * Background verification tetap dilakukan ke /api/me secara async
 * tapi tidak memblokir render dashboard.
 *
 * @module app
 * @author fashich/dashboard-siswa-page
 */

import { useState, useEffect } from 'preact/hooks';
import { authApi } from './utils/api';
import auth from './utils/auth';
import DashboardSiswa from './pages/siswa/DashboardSiswa';
import './app.css';

// ─── Loading screen ───────────────────────────────────────────────────────────

function AppLoading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f1f5f9',
      fontFamily: 'Poppins, sans-serif',
      flexDirection: 'column',
      gap: '1rem',
      color: '#64748b',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '4px solid #e2e8f0',
        borderTopColor: '#0284c7',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: '0.875rem' }}>Memuat...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Not logged in screen ─────────────────────────────────────────────────────

function NotLoggedIn() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f1f5f9',
      fontFamily: 'Poppins, sans-serif',
      gap: '1rem',
      color: '#64748b',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: '#e0f2fe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg viewBox="0 0 24 24" width="32" height="32" fill="#0284c7">
          <path d="M12 1C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1zm0 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 14.5c-2.76 0-5.2-1.26-6.84-3.24C6.31 14.4 8.99 13.5 12 13.5s5.69.9 6.84 2.76C17.2 18.24 14.76 19.5 12 19.5z"/>
        </svg>
      </div>
      <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: '#1e293b' }}>
        Sesi tidak ditemukan
      </p>
      <p style={{ margin: 0, fontSize: '0.875rem', maxWidth: 320, lineHeight: 1.6 }}>
        Kamu belum login atau sesi telah berakhir. Silakan login melalui halaman utama.
      </p>
      <a
        href="/"
        style={{
          marginTop: '0.5rem',
          padding: '0.6rem 1.5rem',
          borderRadius: '8px',
          background: '#0284c7',
          color: '#fff',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 500,
          fontSize: '0.875rem',
          textDecoration: 'none',
        }}
      >
        Ke Halaman Login
      </a>
    </div>
  );
}

// ─── Role not yet implemented ─────────────────────────────────────────────────

function RoleNotImplemented({ role }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Poppins, sans-serif',
      gap: '0.75rem',
      color: '#64748b',
    }}>
      <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>
        Dashboard untuk role <code>{role}</code> belum tersedia.
      </p>
      <button
        type="button"
        onClick={() => { auth.clearAuth(); window.location.reload(); }}
        style={{
          padding: '0.5rem 1.25rem',
          border: 'none',
          borderRadius: '8px',
          background: '#0284c7',
          color: '#fff',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Kembali ke Login
      </button>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export function App() {
  const [authUser, setAuthUser] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    /**
     * Baca langsung dari localStorage tanpa tunggu /api/me
     * agar dashboard langsung muncul tanpa delay.
     *
     * Background: tetap verifikasi ke /api/me secara async
     * untuk refresh data user terbaru.
     */
    const localUser = auth.getUser();
    const localToken = auth.getToken();

    if (localUser && localToken) {
      // Langsung tampilkan dashboard dari data lokal
      setAuthUser(localUser);
      setLoading(false);

      // Background verify — update user data jika ada perubahan
      authApi.getCurrentUser()
        .then(res => {
          const freshUser = res?.data?.user ?? res?.user ?? null;
          if (freshUser) {
            auth.setUser(freshUser);
            setAuthUser(freshUser);
          }
        })
        .catch(() => {
          // Token expired — clear dan minta login ulang
          auth.clearAuth();
          setAuthUser(null);
        });
    } else {
      // Tidak ada token — langsung tampilkan NotLoggedIn
      setLoading(false);
    }
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    auth.clearAuth();
    setAuthUser(null);
  };

  if (loading)   return <AppLoading />;
  if (!authUser) return <NotLoggedIn />;

  if (authUser.user_type === 'siswa') {
    return <DashboardSiswa user={authUser} onLogout={handleLogout} />;
  }

  return <RoleNotImplemented role={authUser.user_type} />;
}
