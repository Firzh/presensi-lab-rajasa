export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">404</p>

        <h1 className="mt-2 text-3xl font-bold">Halaman tidak ditemukan</h1>

        <p className="mt-3 text-slate-600">
          Route yang dibuka belum tersedia di frontend.
        </p>

        <a
          className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
          href="/"
        >
          Kembali ke Home
        </a>
      </section>
    </main>
  );
}