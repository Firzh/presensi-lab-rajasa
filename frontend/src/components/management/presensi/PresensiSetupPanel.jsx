import clsx from 'clsx';

import { JAM_OPTIONS } from '../../../constants/devScan.js';
import { getRombelLabel, getSelectedJamLabel } from '../../../lib/presensiUtils.js';
import { AppIcon } from '../../ui/AppIcon.jsx';
import { AppSelect } from '../../ui/AppSelect.jsx';

const roomOptions = Object.freeze([
  { value: 'kelas', label: 'Kelas' },
  { value: 'lab-tkj-1', label: 'Lab TKJ 1' },
  { value: 'lab-tkj-2', label: 'Lab TKJ 2' },
  { value: 'lab-tkj-3', label: 'Lab TKJ 3' },
  { value: 'lab-tkj-4', label: 'Lab TKJ 4' },
]);

export function PresensiSetupPanel({
  theme = 'light',
  modePresensi,
  rombelOptions,
  selectedRombelId,
  selectedJamIds,
  ruangPilihan,
  isJamDropdownOpen,
  isSessionActive,
  isLoading,
  sessionLabel,
  onModeChange,
  onRombelChange,
  onJamDropdownToggle,
  onToggleJam,
  onRuangChange,
  onCreateSession,
}) {
  const isDark = theme === 'dark';

  return (
    <section className={clsx('rounded-xl p-5', isDark ? 'bg-[#313b45]' : 'bg-white')}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className={clsx('m-0 text-xl font-extrabold', isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]')}>
            Setup Presensi
          </h2>
          <p className="m-0 mt-2 text-sm font-semibold text-[#8b9298]">
            Pilih mode, rombel, dan jam pembelajaran.
          </p>
        </div>

        <span className={clsx('rounded-md px-3 py-1 text-xs font-extrabold', isSessionActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-400/20 text-[#8b9298]')}>
          {isSessionActive ? 'Sesi Aktif' : 'Belum Ada Sesi'}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-3">
          <span className="text-sm font-bold text-[#8b9298]">Mode Presensi</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={clsx(
                'h-12 rounded-xl border font-bold transition',
                modePresensi === 'rombel'
                  ? 'border-[#a9c9f4] bg-[#a9c9f4] text-[#4f6b8b]'
                  : isDark
                    ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4]'
                    : 'border-[#d5dde8] bg-white text-[#43505a]',
              )}
              disabled={isSessionActive}
              onClick={() => onModeChange('rombel')}
            >
              Rombel
            </button>

            <button
              type="button"
              className={clsx(
                'h-12 rounded-xl border font-bold transition',
                modePresensi === 'piket'
                  ? 'border-[#a9c9f4] bg-[#a9c9f4] text-[#4f6b8b]'
                  : isDark
                    ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4]'
                    : 'border-[#d5dde8] bg-white text-[#43505a]',
              )}
              disabled={isSessionActive}
              onClick={() => onModeChange('piket')}
            >
              Piket
            </button>
          </div>
        </div>

        <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
          Rombel
          <AppSelect
            arial-label="Rombel"
            icon="users"
            theme={theme}
            value={selectedRombelId}
            disabled={modePresensi === 'piket' || isSessionActive}
            onInput={(event) => onRombelChange(event.currentTarget.value)}
          >
            <option value="">Pilih Rombel</option>
            {rombelOptions.map((rombel) => (
              <option key={rombel.rombel_id} value={rombel.rombel_id}>
                {getRombelLabel(rombel)}
              </option>
            ))}
          </AppSelect>
        </label>

        <div className="relative grid gap-3">
          <span className="text-sm font-bold text-[#8b9298]">Jam Pembelajaran</span>
          <button
            type="button"
            className={clsx(
              'flex h-12 items-center justify-between rounded-xl border px-4 text-left text-sm font-medium',
              isDark
                ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4]'
                : 'border-[#d5dde8] bg-white text-[#43505a]',
            )}
            disabled={isSessionActive}
            onClick={onJamDropdownToggle}
          >
            <span>{getSelectedJamLabel(selectedJamIds)}</span>
            <AppIcon name="angleDown" />
          </button>

          {isJamDropdownOpen ? (
            <div className={clsx('absolute left-0 right-0 top-[74px] z-30 overflow-hidden rounded-xl border shadow-lg', isDark ? 'border-[#64717d] bg-[#56616d]' : 'border-[#d5dde8] bg-white')}>
              {JAM_OPTIONS.map((jam) => {
                const selected = selectedJamIds.includes(jam.id);

                return (
                  <button
                    key={jam.id}
                    type="button"
                    className={clsx(
                      'flex w-full items-center justify-between px-4 py-2 text-left text-sm font-bold',
                      selected
                        ? 'bg-[#a9c9f4] text-[#4f6b8b]'
                        : isDark
                          ? 'text-[#F0EDE4] hover:bg-[#64717d]'
                          : 'text-[#43505a] hover:bg-[#eef1f5]',
                    )}
                    onClick={() => onToggleJam(jam.id)}
                  >
                    <span>{jam.label}</span>
                    {selected ? <span>✓</span> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
          Ruang
          <AppSelect
            arial-label="Ruang"
            icon="doorOpen"
            theme={theme}
            value={modePresensi === 'piket' ? 'piket' : ruangPilihan}
            disabled={modePresensi === 'piket' || isSessionActive}
            onInput={(event) => onRuangChange(event.currentTarget.value)}
          >
            {modePresensi === 'piket' ? (
              <option value="piket">Piket</option>
            ) : (
              roomOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))
            )}
          </AppSelect>
        </label>
      </div>

      {sessionLabel ? (
        <p className="mt-5 rounded-xl bg-green-500/10 px-4 py-3 text-sm font-bold text-green-400">
          {sessionLabel}
        </p>
      ) : null}

      <button
        type="button"
        className="mt-5 h-12 w-full rounded-xl bg-[#a9c9f4] font-extrabold text-[#4f6b8b] transition hover:bg-[#8ab7ef] disabled:opacity-50"
        disabled={isSessionActive || isLoading}
        onClick={onCreateSession}
      >
        {isLoading ? 'Memproses...' : 'Mulai Presensi'}
      </button>
    </section>
  );
}