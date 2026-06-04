export function HomePageDev() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Presensi Lab Rajasa
        </p>

        <h1 className="mt-2 text-3xl font-bold">Frontend Baseline</h1>

        <p className="mt-3 text-slate-600">
          Halaman utama frontend masih baseline. Untuk demo presensi, buka halaman dev scanner.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
            href="/dev/scan"
          >
            Buka Dev Scanner
          </a>

          <a
            className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700"
            href="/dev/import"
          >
            Demo Import
          </a>

          <a
            className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700"
            href="/dev/attendance-audit"
          >
            Audit Presensi
          </a>
        </div>
      </section>
    </main>
  );
}