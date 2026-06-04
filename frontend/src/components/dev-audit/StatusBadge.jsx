export function StatusBadge({ value }) {
  const tone =
    value === 'berhasil' || value === 'hadir'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : value === 'warning' || value === 'terlambat'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : value === 'invalid' || value === 'ditolak'
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${tone}`}>
      {value || '-'}
    </span>
  );
}