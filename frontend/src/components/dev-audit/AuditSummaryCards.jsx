export function AuditSummaryCards({ summary }) {
  return (
    <section className="grid gap-3 sm:grid-cols-5">
      {Object.entries(summary || {}).map(([key, value]) => (
        <div className="rounded-2xl bg-white p-4 shadow-sm" key={key}>
          <p className="text-xs uppercase text-slate-500">{key.replaceAll('_', ' ')}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
      ))}
    </section>
  );
}