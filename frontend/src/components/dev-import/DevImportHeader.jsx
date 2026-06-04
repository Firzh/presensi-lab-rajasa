export function DevImportHeader({ status, onLogin }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase text-blue-700">Tahap 10.1</p>
      <h1 className="text-2xl font-bold">Demo Advanced Import</h1>
      <p className="mt-2 text-sm text-slate-600">
        Upload CSV/XLSX lewat one-gate import. HP bisa pakai tombol pilih file.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <a className="rounded-xl border px-4 py-2 font-semibold" href="/dev/scan">
          Kembali ke Scanner
        </a>

        <button
          className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
          type="button"
          onClick={onLogin}
        >
          Login Demo
        </button>
      </div>

      <div className="mt-4 rounded-xl border bg-slate-50 px-4 py-3 text-sm">{status}</div>
    </section>
  );
}