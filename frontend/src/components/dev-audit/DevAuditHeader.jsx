export function DevAuditHeader({ status, onRefresh }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase text-blue-700">Demo Audit</p>
      <h1 className="text-2xl font-bold">Hasil Presensi Terkini</h1>
      <p className="mt-2 text-sm text-slate-600">
        Menampilkan scan log dan presensi yang sudah masuk database.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <a className="rounded-xl border px-4 py-2 font-semibold" href="/dev/scan">
          Kembali ke Scanner
        </a>

        <button
          className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
          type="button"
          onClick={onRefresh}
        >
          Refresh Audit
        </button>
      </div>

      <div className="mt-4 rounded-xl border bg-slate-50 px-4 py-3 text-sm">{status}</div>
    </section>
  );
}