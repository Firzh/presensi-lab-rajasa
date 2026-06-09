import { StatusBox } from './StatusBox.jsx';

export function DevScanHeader({ secureContextMessage }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Tahap 8.3c</p>

      <h1 className="mt-1 text-2xl font-bold">Demo Scan QR Presensi</h1>

      <p className="mt-2 text-sm text-slate-600">
        Halaman ini untuk demo alur presensi via HP. Dropdown rombel sudah mengambil data dari
        database.
      </p>

      <a
        className="mt-4 flex w-full justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 sm:inline-flex sm:w-auto"
        href="/dev/attendance-audit"
      >
        Lihat Hasil Presensi Terkini
      </a>

      <a
        className="mt-3 flex w-full justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 sm:mt-4 sm:ml-2 sm:inline-flex sm:w-auto"
        href="/dev/import"
      >
        Demo Import
      </a>

      <div className="mt-4">
        <StatusBox message={secureContextMessage.message} type={secureContextMessage.type} />
      </div>
    </section>
  );
}
