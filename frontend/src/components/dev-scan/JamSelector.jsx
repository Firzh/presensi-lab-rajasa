import { JAM_OPTIONS } from '../../constants/devScan.js';

export function JamSelector({ selectedJamIds, onToggleJam }) {
  return (
    <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      {JAM_OPTIONS.map((jam) => {
        const checked = selectedJamIds.includes(jam.id);

        return (
          <button
            key={jam.id}
            type="button"
            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 ${
              checked ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'
            }`}
            onClick={() => onToggleJam(jam.id)}
          >
            <span>{jam.label}</span>
            {checked ? <span>✓</span> : null}
          </button>
        );
      })}
    </div>
  );
}