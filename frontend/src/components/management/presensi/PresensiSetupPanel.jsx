import { useMemo, useState } from 'preact/hooks';
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

function getRombelJurusanValue(rombel) {
  if (rombel.kode_jurusan) return String(rombel.kode_jurusan);
  if (rombel.jurusan?.kode_jurusan) return String(rombel.jurusan.kode_jurusan);
  if (rombel.nama_jurusan) return String(rombel.nama_jurusan);

  const label = getRombelLabel(rombel);
  const parts = label.split(' ').filter(Boolean);

  if (parts.length >= 3 && /^\d+$/.test(parts[0])) {
    return parts.slice(1, -1).join(' ');
  }

  return 'Lainnya';
}

function getRombelAngkatanValue(rombel) {
  if (rombel.tingkatan) return String(rombel.tingkatan);
  if (rombel.angkatan) return String(rombel.angkatan);

  const label = getRombelLabel(rombel);
  const match = label.match(/\b(10|11|12)\b/);

  return match ? match[1] : 'Lainnya';
}

function getUniqueOptions(items, mapper) {
  const map = new Map();

  items.forEach((item) => {
    const value = mapper(item);

    if (value) {
      map.set(value, value);
    }
  });

  return Array.from(map.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'id'));
}

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
  const [jurusanFilter, setJurusanFilter] = useState('');
  const [angkatanFilter, setAngkatanFilter] = useState('');
  const isDark = theme === 'dark';

  const jurusanOptions = useMemo(() => {
    return getUniqueOptions(rombelOptions, getRombelJurusanValue);
  }, [rombelOptions]);

  const angkatanOptions = useMemo(() => {
    return getUniqueOptions(rombelOptions, getRombelAngkatanValue);
  }, [rombelOptions]);

  const filteredRombelOptions = useMemo(() => {
    return rombelOptions.filter((rombel) => {
      const jurusan = getRombelJurusanValue(rombel);
      const angkatan = getRombelAngkatanValue(rombel);

      const matchJurusan = jurusanFilter === '' || jurusan === jurusanFilter;
      const matchAngkatan = angkatanFilter === '' || angkatan === angkatanFilter;

      return matchJurusan && matchAngkatan;
    });
  }, [rombelOptions, jurusanFilter, angkatanFilter]);

  function handleJurusanFilterChange(value) {
    setJurusanFilter(value);
    onRombelChange('');
  }

  function handleAngkatanFilterChange(value) {
    setAngkatanFilter(value);
    onRombelChange('');
  }

  return (
    <section className={clsx('rounded-xl p-5', isDark ? 'bg-[#313b45]' : 'bg-white')}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2
            className={clsx(
              'm-0 text-xl font-extrabold',
              isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
            )}
          >
            Setup Presensi
          </h2>
          <p className="m-0 mt-2 text-sm font-semibold text-[#8b9298]">
            Pilih mode, rombel, dan jam pembelajaran.
          </p>
        </div>

        <span
          className={clsx(
            'rounded-md px-3 py-1 text-xs font-extrabold',
            isSessionActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-400/20 text-[#8b9298]'
          )}
        >
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
                  ? 'border-[#7ba9e8] bg-[#a9c9f4] text-[#2f5278] shadow-sm hover:border-[#5f95df] hover:bg-[#6fa6ef] hover:text-white'
                  : isDark
                    ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] hover:border-[#F0EDE4] hover:bg-[#64717d]'
                    : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#a9c9f4] hover:bg-[#eef1f5]'
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
                  ? 'border-[#7ba9e8] bg-[#a9c9f4] text-[#2f5278] shadow-sm hover:border-[#5f95df] hover:bg-[#6fa6ef] hover:text-white'
                  : isDark
                    ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] hover:border-[#F0EDE4] hover:bg-[#64717d]'
                    : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#a9c9f4] hover:bg-[#eef1f5]'
              )}
              disabled={isSessionActive}
              onClick={() => onModeChange('piket')}
            >
              Piket
            </button>
          </div>
        </div>

        <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
          Filter Jurusan
          <AppSelect
            aria-label="Filter Jurusan"
            icon="building"
            theme={theme}
            value={jurusanFilter}
            disabled={modePresensi === 'piket' || isSessionActive}
            onInput={(event) => handleJurusanFilterChange(event.currentTarget.value)}
          >
            <option value="">Semua Jurusan</option>
            {jurusanOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </AppSelect>
        </label>

        <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
          Filter Angkatan
          <AppSelect
            aria-label="Filter Angkatan"
            icon="graduationCap"
            theme={theme}
            value={angkatanFilter}
            disabled={modePresensi === 'piket' || isSessionActive}
            onInput={(event) => handleAngkatanFilterChange(event.currentTarget.value)}
          >
            <option value="">Semua Angkatan</option>
            {angkatanOptions.map((item) => (
              <option key={item.value} value={item.value}>
                Kelas {item.label}
              </option>
            ))}
          </AppSelect>
        </label>

        <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
          Rombel
          <AppSelect
            aria-label="Rombel"
            icon="users"
            theme={theme}
            value={selectedRombelId}
            disabled={modePresensi === 'piket' || isSessionActive}
            onInput={(event) => onRombelChange(event.currentTarget.value)}
          >
            <option value="">Pilih Rombel</option>
            {filteredRombelOptions.map((rombel) => (
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
              'flex h-12 items-center justify-between rounded-xl border px-4 text-left text-sm font-medium transition',
              isDark
                ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] hover:border-[#F0EDE4] hover:bg-[#64717d]'
                : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#a9c9f4] hover:bg-[#eef1f5]'
            )}
            disabled={isSessionActive}
            onClick={onJamDropdownToggle}
          >
            <span>{getSelectedJamLabel(selectedJamIds)}</span>
            <AppIcon name="angleDown" />
          </button>

          {isJamDropdownOpen ? (
            <div
              className={clsx(
                'absolute left-0 right-0 top-18.5 z-30 overflow-hidden rounded-xl border shadow-lg',
                isDark ? 'border-[#64717d] bg-[#56616d]' : 'border-[#d5dde8] bg-white'
              )}
            >
              {JAM_OPTIONS.map((jam) => {
                const selected = selectedJamIds.includes(jam.id);

                return (
                  <button
                    key={jam.id}
                    type="button"
                    className={clsx(
                      'flex w-full items-center justify-between px-4 py-2 text-left text-sm font-bold transition',
                      selected
                        ? 'bg-[#a9c9f4] text-[#4f6b8b] hover:bg-[#8ab7ef]'
                        : isDark
                          ? 'text-[#F0EDE4] hover:bg-[#64717d]'
                          : 'text-[#43505a] hover:bg-[#eef1f5]'
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
            aria-label="Ruang"
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
        className="mt-5 h-12 w-full rounded-xl bg-[#a9c9f4] font-extrabold text-[#2f5278] shadow-sm transition hover:bg-[#4f8fe7] hover:text-white hover:shadow-md disabled:opacity-50"
        disabled={isSessionActive || isLoading}
        onClick={onCreateSession}
      >
        {isLoading ? 'Memproses...' : 'Mulai Presensi'}
      </button>
    </section>
  );
}
