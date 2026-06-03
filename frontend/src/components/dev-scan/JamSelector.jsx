import { JAM_OPTIONS } from '../../constants/devScan.js';
import { getSelectedJamLabel } from '../../lib/devScanUtils.js';

export function JamSelector({ selectedJamIds, onToggleJam }) {
  return (
    <div className="custom-select">
      <div className="custom-select__trigger">
        <span>{getSelectedJamLabel(selectedJamIds)}</span>
        <span className="custom-select__arrow">▾</span>
      </div>

      <div className="custom-select__menu">
        {JAM_OPTIONS.map((jam) => {
          const checked = selectedJamIds.includes(jam.id);

          return (
            <button
              key={jam.id}
              type="button"
              className={`custom-select__option ${checked ? 'is-selected' : ''}`}
              onClick={() => onToggleJam(jam.id)}
            >
              <span>{jam.label}</span>
              {checked ? <strong>✓</strong> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
