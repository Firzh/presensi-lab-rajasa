import './app.css';
import { DevScanPage } from './pages/dev/DevScanPage.jsx';
import { DevAttendanceAuditPage } from './pages/dev/DevAttendanceAuditPage.jsx';

function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Presensi Lab Rajasa
        </p>

        <h1 className="mt-2 text-3xl font-bold">Frontend Baseline</h1>

        <p className="mt-3 text-slate-600">
          Halaman utama frontend masih baseline. Untuk demo scan QR Tahap 8.1,
          buka halaman dev scanner.
        </p>

        <a
          className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
          href="/dev/scan"
        >
          Buka Dev Scanner
        </a>
      </section>
    </main>
  );
}

export function App() {
  const path = window.location.pathname;

  if (path === '/dev/scan') {
    return <DevScanPage />;
  }

  if (window.location.pathname === '/dev/attendance-audit') {
    return <DevAttendanceAuditPage />;
  }

  return <HomePage />;
}

export default App;