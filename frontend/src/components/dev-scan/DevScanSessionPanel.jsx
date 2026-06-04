import { Field } from './Field.jsx';
import { JamSelector } from './JamSelector.jsx';
import { SingleSelect } from './SingleSelect.jsx';
import { getRombelLabel, getSelectedJamLabel } from '../../lib/devScanUtils.js';

export function DevScanSessionPanel({
  modePresensi,
  onModeChange,
  rombelOptions,
  selectedRombelId,
  setSelectedRombelId,
  selectedRombel,
  isLoadingRombel,
  selectedJamIds,
  isJamDropdownOpen,
  setIsJamDropdownOpen,
  onToggleJam,
  ruangPilihan,
  setRuangPilihan,
  rombelLabel,
  presensiSesiId,
  setPresensiSesiId,
  sessionLabel,
  onCreateSession,
  onFinishSession,
}) {
  const rombelSelectOptions = rombelOptions.map((item) => ({
    value: String(item.rombel_id),
    label: getRombelLabel(item),
  }));

  const ruangSelectOptions = [
    { value: 'kelas', label: 'kelas' },
    { value: 'lab-tkj-1', label: 'lab-tkj-1' },
    { value: 'lab-tkj-2', label: 'lab-tkj-2' },
    { value: 'lab-tkj-3', label: 'lab-tkj-3' },
    { value: 'lab-tkj-4', label: 'lab-tkj-4' },
    { value: 'piket', label: 'piket' },
  ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">2. Buat Sesi</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Mode">
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={modePresensi}
            onInput={(event) => onModeChange(event.currentTarget.value)}
          >
            <option value="rombel">rombel</option>
            <option value="piket">piket</option>
          </select>
        </Field>

        <Field label="Rombel">
          <SingleSelect
            value={selectedRombelId}
            options={rombelSelectOptions}
            placeholder="Belum ada data rombel"
            disabled={modePresensi === 'piket' || isLoadingRombel || rombelOptions.length === 0}
            onChange={setSelectedRombelId}
          />
        </Field>

        <Field label="Jam Presensi">
          <div className="relative">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm"
              onClick={() => setIsJamDropdownOpen((value) => !value)}
            >
              <span>{getSelectedJamLabel(selectedJamIds)}</span>
              <span className="text-slate-500">▾</span>
            </button>

            {isJamDropdownOpen && (
              <JamSelector selectedJamIds={selectedJamIds} onToggleJam={onToggleJam} />
            )}
          </div>
        </Field>

        <Field label="Ruang">
          <SingleSelect
            value={ruangPilihan}
            options={ruangSelectOptions}
            placeholder="Pilih ruang"
            onChange={setRuangPilihan}
          />
        </Field>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-semibold">Sesi akan dibuat untuk:</p>
        <p>{rombelLabel}</p>

        {selectedRombel && modePresensi === 'rombel' && (
          <div className="mt-2 text-xs text-slate-500">
            <p>Rombel ID: {selectedRombel.rombel_id}</p>
            <p>
              Tingkat: {selectedRombel.tingkat_angka || selectedRombel.tingkatan || '-'} | Nomor:{' '}
              {selectedRombel.nomor_rombel || '-'}
            </p>
            <p>Jurusan: {selectedRombel.kode_jurusan || selectedRombel.nama_jurusan || '-'}</p>
          </div>
        )}
      </div>

      <button
        className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white"
        type="button"
        onClick={onCreateSession}
      >
        Buat Sesi
      </button>

      <button
        className="mt-3 w-full rounded-xl bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        type="button"
        disabled={!presensiSesiId}
        onClick={onFinishSession}
      >
        Akhiri Sesi
      </button>

      <Field label="Presensi Sesi ID">
        <input
          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"
          type="number"
          value={presensiSesiId}
          onInput={(event) => setPresensiSesiId(event.currentTarget.value)}
        />
      </Field>

      {sessionLabel && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Sesi aktif: {sessionLabel}
        </div>
      )}
    </div>
  );
}
