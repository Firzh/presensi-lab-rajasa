import { useEffect, useState } from 'preact/hooks';

import { isAuthenticated } from '../../lib/authSession.js';
import { ROUTES } from '../../constants/routes.js';

/**
 * BUG-01 + BUG-08 fix: Komponen route guard untuk melindungi halaman private.
 *
 * Cara penggunaan di AppRoutes.jsx:
 *   <Route path="/dashboard" component={PrivateRoute} pageComponent={DashboardPage} />
 *
 * preact-iso meneruskan semua props Route ke komponen — termasuk `pageComponent`.
 * PrivateRoute menerima `pageComponent` dan merendernya jika user terauthentikasi.
 *
 * Cara kerja:
 * 1. Cek isAuthenticated() (ada token di localStorage atau tidak).
 * 2. Jika tidak ada token → redirect via window.location.replace() ke halaman login.
 *    replace() (bukan assign/href) agar halaman private tidak masuk history browser.
 *    Tombol Back setelah logout TIDAK bisa kembali ke halaman private.
 * 3. Jika ada token → render pageComponent (halaman yang diminta).
 * 4. Render null saat cek berlangsung untuk mencegah flash konten private.
 *
 * Penting:
 * - Guard ini adalah proteksi client-side. Proteksi sesungguhnya tetap di backend (401/403).
 * - Token yang ada di localStorage tidak diverifikasi ke server di sini — verifikasi
 *   terjadi saat komponen halaman memanggil API (yang akan return 401 jika expired).
 * - API client (apiClient.js) menangani 401 dari backend dengan clearAuthSession + redirect.
 */
export function PrivateRoute({ pageComponent: PageComponent, ...rest }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

  useEffect(() => {
    if (isAuthenticated()) {
      setStatus('allowed');
    } else {
      setStatus('denied');
      // Gunakan replace() agar halaman ini tidak masuk history — back button aman
      window.location.replace(ROUTES.LOGIN);
    }
  }, []);

  // Render loading state selama cek berlangsung
  if (status === 'checking' || status === 'denied') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f1f2f5] text-[#6b747c]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3c82f6] border-t-transparent"></div>
          <p className="text-sm font-medium">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  // Token ada di localStorage — render halaman asli
  return <PageComponent {...rest} />;
}
