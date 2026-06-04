export function ImportResultPanel({ responseJson }) {
  if (!responseJson) {
    return null;
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Response Import</h2>

      <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
        {JSON.stringify(responseJson, null, 2)}
      </pre>
    </section>
  );
}