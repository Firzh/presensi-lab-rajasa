import { Field } from './Field.jsx';
import { JamSelector } from './JamSelector.jsx';
import { getRombelLabel } from '../../lib/devScanUtils.js';

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
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2 disabled:bg-slate-100"
            disabled={modePresensi === 'piket' || isLoadingRombel || rombelOptions.length === 0}
            value={selectedRombelId}
            onInput={(event) => setSelectedRombelId(event.currentTarget.value)}
          >
            {rombelOptions.length === 0 && <option value="">Belum ada data rombel</option>}

            {rombelOptions.map((item) => (
              <option key={item.rombel_id} value={String(item.rombel_id)}>
                {getRombelLabel(item)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Jam Presensi">
          <div className="relative">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm"
              onClick={() => setIsJamDropdownOpen((value) => !value)}
            >
              <span>
                {selectedJamIds.length === 0
                  ? 'Pilih jam presensi'
                  : `Jam ${selectedJamIds.join(', ')}`}
              </span>
              <span className="text-slate-500">▾</span>
            </button>

            {isJamDropdownOpen && (
              <JamSelector selectedJamIds={selectedJamIds} onToggleJam={onToggleJam} />
            )}
          </div>
        </Field>

        <Field label="Ruang">
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={ruangPilihan}
            onInput={(event) => setRuangPilihan(event.currentTarget.value)}
          >
            <option value="kelas">kelas</option>
            <option value="lab-tkj-1">lab-tkj-1</option>
            <option value="lab-tkj-2">lab-tkj-2</option>
            <option value="lab-tkj-3">lab-tkj-3</option>
            <option value="lab-tkj-4">lab-tkj-4</option>
            <option value="piket">piket</option>
          </select>
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
