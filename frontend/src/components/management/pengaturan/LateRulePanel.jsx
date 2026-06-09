import clsx from 'clsx';

import { calculateLateThreshold } from '../../../lib/settingsUtils.js';
import { AppIcon } from '../../ui/AppIcon.jsx';

function Input({ theme = 'light', className = '', ...props }) {
  const isDark = theme === 'dark';

  return (
    <input
      className={clsx(
        'h-12 rounded-xl border px-4 text-sm font-bold outline-none transition',
        isDark
          ? 'border-[#64717d] bg-[#56616d] text-[#f4f1ec] hover:border-[#f4f1ec] focus:border-[#f4f1ec]'
          : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#5f95df] focus:border-[#7ea4d4]',
        className
      )}
      {...props}
    />
  );
}

export function LateRulePanel({ theme = 'light', rule, onChange, onSave }) {
  const isDark = theme === 'dark';
  const lateThreshold = calculateLateThreshold(rule.standardTime, rule.toleranceMinutes);

  function updateRule(key, value) {
    onChange?.({
      ...rule,
      [key]: value,
    });
  }

  return (
    <section className={clsx('rounded-2xl p-4 sm:p-6', isDark ? 'bg-[#313b45]' : 'bg-white')}>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h2
            className={clsx(
              'm-0 text-2xl font-extrabold',
              isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
            )}
          >
            Aturan Keterlambatan
          </h2>
          <p className="m-0 mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-[#8b9298]">
            Tentukan jam masuk standar dan batas toleransi untuk status presensi otomatis.
          </p>
        </div>

        <button
          type="button"
          className={clsx(
            'flex h-12 w-full items-center justify-center gap-3 rounded-xl px-5 text-sm font-extrabold transition hover:-translate-y-0.5 sm:w-auto',
            isDark
              ? 'bg-[#4f8fe7] text-white hover:bg-[#6fa6ef]'
              : 'bg-[#31527d] text-white hover:bg-[#456da1]'
          )}
          onClick={onSave}
        >
          <AppIcon name="circleCheck" />
          Simpan Aturan
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#8b9298]">
            Jam Masuk Standar
            <Input
              type="time"
              aria-label="Jam Masuk Standar"
              theme={theme}
              value={rule.standardTime}
              onInput={(event) => updateRule('standardTime', event.currentTarget.value)}
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#8b9298]">
            Toleransi Terlambat Menit
            <Input
              type="number"
              min="0"
              aria-label="Toleransi Terlambat Menit"
              theme={theme}
              value={rule.toleranceMinutes}
              onInput={(event) => updateRule('toleranceMinutes', event.currentTarget.value)}
            />
          </label>

          <label
            className={clsx(
              'flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm font-extrabold transition hover:-translate-y-0.5 sm:col-span-2',
              rule.autoStatus
                ? isDark
                  ? 'border-[#8db8ef] bg-[#31527d] text-white'
                  : 'border-[#9fbbe1] bg-[#dce9fb] text-[#31527d]'
                : isDark
                  ? 'border-[#45515e] bg-[#25303a] text-[#cfd8e3] hover:border-[#8db8ef]'
                  : 'border-[#dfe6f0] bg-[#f8fbff] text-[#6f7882] hover:border-[#9fbbe1]'
            )}
          >
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#4f8fe7]"
              checked={rule.autoStatus}
              onChange={(event) => updateRule('autoStatus', event.currentTarget.checked)}
            />
            Aktifkan status otomatis Terlambat
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#8b9298] sm:col-span-2">
            Catatan Aturan
            <textarea
              aria-label="Catatan Aturan"
              className={clsx(
                'min-h-28 rounded-xl border px-4 py-3 text-sm font-bold outline-none transition',
                isDark
                  ? 'border-[#64717d] bg-[#56616d] text-[#f4f1ec] hover:border-[#f4f1ec] focus:border-[#f4f1ec]'
                  : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#5f95df] focus:border-[#7ea4d4]'
              )}
              value={rule.note}
              onInput={(event) => updateRule('note', event.currentTarget.value)}
            />
          </label>
        </div>

        <aside
          className={clsx(
            'grid content-start gap-4 rounded-2xl border p-5',
            isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#e3eaf4] bg-[#f8fbff]'
          )}
        >
          <div className="flex items-center gap-3">
            <span
              className={clsx(
                'grid h-12 w-12 place-items-center rounded-xl',
                isDark ? 'bg-[#313b45] text-[#cfd8e3]' : 'bg-white text-[#6d8bb3]'
              )}
            >
              <AppIcon name="clock" />
            </span>
            <div>
              <p className="m-0 text-xs font-extrabold uppercase tracking-wide text-[#8b9298]">
                Batas Tepat Waktu
              </p>
              <p
                className={clsx(
                  'm-0 text-3xl font-extrabold',
                  isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
                )}
              >
                {lateThreshold}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-green-500/10 px-4 py-3 text-sm font-bold leading-relaxed text-green-400">
            Scan sampai {lateThreshold} dihitung Hadir. Scan setelah {lateThreshold} dihitung
            Terlambat apabila status otomatis aktif.
          </div>

          <div className="rounded-2xl bg-[#4f8fe7]/10 px-4 py-3 text-sm font-bold leading-relaxed text-[#4f8fe7]">
            Contoh: masuk {rule.standardTime}, toleransi {rule.toleranceMinutes || 0} menit, maka
            lebih dari {lateThreshold} masuk kategori Terlambat.
          </div>
        </aside>
      </div>
    </section>
  );
}
