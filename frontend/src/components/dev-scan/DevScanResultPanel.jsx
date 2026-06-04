import { StatusBox } from './StatusBox.jsx';

export function DevScanResultPanel({ statusMessage, statusType, responseJson }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Status</h2>

      <div className="mt-3">
        <StatusBox message={statusMessage} type={statusType} />
      </div>

      <h2 className="mt-5 text-lg font-bold">Response JSON</h2>

      <pre className="mt-3 max-h-96 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
        {JSON.stringify(responseJson, null, 2)}
      </pre>
    </section>
  );
}
