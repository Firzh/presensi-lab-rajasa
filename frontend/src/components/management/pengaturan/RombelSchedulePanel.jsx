import { useState } from 'preact/hooks';
import clsx from 'clsx';

import { scheduleDayOptions } from '../../../lib/settingsUtils.js';
import { AppIcon } from '../../ui/AppIcon.jsx';
import { AppSelect } from '../../ui/AppSelect.jsx';

function FieldShell({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#8b9298]">
      {label}
      {children}
    </label>
  );
}

function EmptyBatchState({ isDark, isBatchEditMode }) {
  return (
    <div
      className={clsx(
        'col-span-full rounded-xl border border-dashed px-4 py-6 text-center text-sm font-bold',
        isDark ? 'border-[#56616d] text-[#cfd8e3]' : 'border-[#cbd6e5] text-[#6f7882]'
      )}
    >
      {isBatchEditMode
        ? 'Tidak ada rombel sesuai filter ini.'
        : 'Batch belum memiliki rombel sesuai filter ini. Aktifkan Edit Batch untuk menambah rombel.'}
    </div>
  );
}

export function RombelSchedulePanel({
  theme = 'light',
  selectedRombelIds,
  batchRombelIds,
  rombelOptions,
  batchEditableRombelOptions,
  majorOptions,
  yearOptions,
  jurusanFilter,
  yearFilter,
  isBatchEditMode,
  scheduleMode,
  day,
  attendanceCutoff,
  startTime,
  slots,
  scheduleRows,
  validationMessage,
  bulkDuration,
  onToggleRombel,
  onToggleBatchRombel,
  onToggleBatchEditMode,
  onJurusanFilterChange,
  onYearFilterChange,
  onScheduleModeChange,
  onDayChange,
  onAttendanceCutoffChange,
  onStartTimeChange,
  onAddSlot,
  onRemoveSlot,
  onMoveSlot,
  onUpdateSlotDuration,
  onBulkDurationChange,
  onApplyBulkDuration,
  onSaveSchedule,
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const isDark = theme === 'dark';
  const mapelCount = slots.filter((slot) => slot.type === 'mapel').length;
  const breakCount = slots.filter((slot) => slot.type === 'break').length;
  const visibleRombels = isBatchEditMode ? batchEditableRombelOptions : rombelOptions;

  function handleDrop(targetIndex) {
    if (dragIndex === null) return;

    onMoveSlot?.(dragIndex, targetIndex);
    setDragIndex(null);
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
            Jam Pelajaran Rombel
          </h2>
          <p className="m-0 mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-[#8b9298]">
            Filter jurusan dan angkatan, atur isi batch, lalu pilih rombel untuk update jam masuk
            atau slot mapel.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[auto_auto]">
          <div
            className={clsx(
              'rounded-xl px-4 py-3 text-sm font-extrabold',
              isDark ? 'bg-[#25303a] text-[#cfd8e3]' : 'bg-[#eef3f9] text-[#6d8bb3]'
            )}
          >
            {selectedRombelIds.length} dipilih / {batchRombelIds.length} dalam batch
          </div>

          <button
            type="button"
            className={clsx(
              'h-12 rounded-xl px-5 text-sm font-extrabold transition hover:-translate-y-0.5',
              isDark ? 'bg-[#4f8fe7] text-white hover:bg-[#6fa6ef]' : 'bg-[#31527d] text-white hover:bg-[#456da1]'
            )}
            onClick={onSaveSchedule}
          >
            Simpan Jadwal
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid content-start gap-5">
          <div
            className={clsx(
              'rounded-2xl border p-4',
              isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#e3eaf4] bg-[#f8fbff]'
            )}
          >
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p
                  className={clsx(
                    'm-0 text-base font-extrabold',
                    isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
                  )}
                >
                  Batch Rombel
                </p>
                <p className="m-0 mt-1 text-xs font-bold text-[#8b9298]">
                  {isBatchEditMode
                    ? 'Centang rombel yang masuk ke batch.'
                    : 'Centang rombel dalam batch yang akan diubah.'}
                </p>
              </div>

              <button
                type="button"
                className={clsx(
                  'h-9 rounded-full px-4 text-xs font-extrabold transition hover:-translate-y-0.5',
                  isBatchEditMode
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-[#4f8fe7]/15 text-[#4f8fe7] hover:bg-[#4f8fe7] hover:text-white'
                )}
                onClick={onToggleBatchEditMode}
              >
                {isBatchEditMode ? 'Selesai Edit' : 'Edit Batch'}
              </button>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <FieldShell label="Filter Jurusan">
                <AppSelect
                  aria-label="Filter Jurusan"
                  icon="school"
                  theme={theme}
                  value={jurusanFilter}
                  onInput={(event) => onJurusanFilterChange?.(event.currentTarget.value)}
                >
                  {majorOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </AppSelect>
              </FieldShell>

              <FieldShell label="Angkatan">
                <AppSelect
                  aria-label="Filter Angkatan"
                  icon="graduationCap"
                  theme={theme}
                  value={yearFilter}
                  onInput={(event) => onYearFilterChange?.(event.currentTarget.value)}
                >
                  {yearOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </AppSelect>
              </FieldShell>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {visibleRombels.length ? (
                visibleRombels.map((rombel) => {
                  const checked = isBatchEditMode
                    ? batchRombelIds.includes(rombel.id)
                    : selectedRombelIds.includes(rombel.id);

                  return (
                    <label
                      key={rombel.id}
                      className={clsx(
                        'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm font-extrabold transition hover:-translate-y-0.5',
                        checked
                          ? isDark
                            ? 'border-[#8db8ef] bg-[#31527d] text-white'
                            : 'border-[#9fbbe1] bg-[#dce9fb] text-[#31527d]'
                          : isDark
                            ? 'border-[#45515e] bg-[#313b45] text-[#cfd8e3] hover:border-[#8db8ef]'
                            : 'border-[#dfe6f0] bg-white text-[#6f7882] hover:border-[#9fbbe1]'
                      )}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#4f8fe7]"
                        checked={checked}
                        onChange={() =>
                          isBatchEditMode
                            ? onToggleBatchRombel?.(rombel.id)
                            : onToggleRombel?.(rombel.id)
                        }
                      />
                      <span className="min-w-0">
                        <span className="block truncate">{rombel.label}</span>
                        <span className="block text-xs opacity-70">
                          {rombel.jurusan} · {rombel.yearLabel}
                        </span>
                      </span>
                    </label>
                  );
                })
              ) : (
                <EmptyBatchState isDark={isDark} isBatchEditMode={isBatchEditMode} />
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <FieldShell label="Hari Jadwal">
              <AppSelect
                aria-label="Hari Jadwal"
                icon="calendar"
                theme={theme}
                value={day}
                onInput={(event) => onDayChange?.(event.currentTarget.value)}
              >
                {scheduleDayOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </AppSelect>
            </FieldShell>

            <FieldShell label="Jenis Modifikasi">
              <AppSelect
                aria-label="Jenis Modifikasi"
                icon="gear"
                theme={theme}
                value={scheduleMode}
                onInput={(event) => onScheduleModeChange?.(event.currentTarget.value)}
              >
                <option value="jam-masuk">Jam Masuk</option>
                <option value="mapel">Slot Mapel</option>
              </AppSelect>
            </FieldShell>
          </div>

          {scheduleMode === 'jam-masuk' ? (
            <div
              className={clsx(
                'rounded-2xl border p-4',
                isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#e3eaf4] bg-[#f8fbff]'
              )}
            >
              <FieldShell label="Batas Presensi Masuk">
                <input
                  type="time"
                  aria-label="Batas Presensi Masuk"
                  className={clsx(
                    'h-12 rounded-xl border px-4 text-sm font-bold outline-none transition',
                    isDark
                      ? 'border-[#64717d] bg-[#56616d] text-[#f4f1ec] hover:border-[#f4f1ec]'
                      : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#5f95df]'
                  )}
                  value={attendanceCutoff}
                  onInput={(event) => onAttendanceCutoffChange?.(event.currentTarget.value)}
                />
              </FieldShell>

              <p className="m-0 mt-4 rounded-xl bg-[#4f8fe7]/10 px-4 py-3 text-sm font-bold text-[#4f8fe7]">
                Presensi setelah jam ini dapat ditandai terlambat sesuai aturan sistem.
              </p>
            </div>
          ) : null}
        </div>

        {scheduleMode === 'mapel' ? (
          <div
            className={clsx(
              'rounded-2xl border p-4',
              isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#e3eaf4] bg-[#f8fbff]'
            )}
          >
            <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
              <FieldShell label="Jam Mulai Slot Pertama">
                <input
                  type="time"
                  aria-label="Jam Mulai Slot Pertama"
                  className={clsx(
                    'h-12 rounded-xl border px-4 text-sm font-bold outline-none transition',
                    isDark
                      ? 'border-[#64717d] bg-[#56616d] text-[#f4f1ec] hover:border-[#f4f1ec]'
                      : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#5f95df]'
                  )}
                  value={startTime}
                  onInput={(event) => onStartTimeChange?.(event.currentTarget.value)}
                />
              </FieldShell>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="h-12 rounded-xl bg-green-500 px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={mapelCount >= 12}
                  onClick={() => onAddSlot?.('mapel')}
                >
                  <AppIcon name="plus" /> Tambah Mapel
                </button>
                <button
                  type="button"
                  className="h-12 rounded-xl bg-green-500 px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={breakCount >= 2}
                  onClick={() => onAddSlot?.('break')}
                >
                  <AppIcon name="plus" /> Tambah Istirahat
                </button>
              </div>
            </div>

            {validationMessage ? (
              <p className="m-0 mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">
                {validationMessage}
              </p>
            ) : null}

            <div className="grid gap-3">
              {scheduleRows.map((slot, index) => (
                <div
                  key={slot.id}
                  draggable
                  className={clsx(
                    'grid gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 sm:grid-cols-[1.1fr_0.8fr_0.85fr_auto] sm:items-center',
                    slot.type === 'break'
                      ? isDark
                        ? 'border-amber-300/40 bg-amber-300/10'
                        : 'border-amber-200 bg-amber-50'
                      : isDark
                        ? 'border-[#45515e] bg-[#313b45] hover:border-[#8db8ef]'
                        : 'border-[#dfe6f0] bg-white hover:border-[#9fbbe1]'
                  )}
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(index)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={clsx(
                        'grid h-10 w-10 place-items-center rounded-xl',
                        slot.type === 'break'
                          ? 'bg-amber-400/20 text-amber-500'
                          : isDark
                            ? 'bg-[#25303a] text-[#cfd8e3]'
                            : 'bg-[#eef3f9] text-[#6d8bb3]'
                      )}
                    >
                      <AppIcon name={slot.type === 'break' ? 'clock' : 'list'} />
                    </span>
                    <div>
                      <p
                        className={clsx(
                          'm-0 font-extrabold',
                          isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
                        )}
                      >
                        {slot.label}
                      </p>
                      <p className="m-0 text-xs font-bold text-[#8b9298]">Drag untuk urutkan</p>
                    </div>
                  </div>

                  <label className="grid gap-1 text-xs font-extrabold text-[#8b9298]">
                    Durasi Menit
                    <input
                      type="number"
                      min="1"
                      aria-label={`Durasi ${slot.label}`}
                      className={clsx(
                        'h-10 rounded-xl border px-3 text-sm font-bold outline-none transition',
                        isDark
                          ? 'border-[#64717d] bg-[#56616d] text-[#f4f1ec] hover:border-[#f4f1ec]'
                          : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#5f95df]'
                      )}
                      value={slot.duration}
                      onInput={(event) => onUpdateSlotDuration?.(slot.id, event.currentTarget.value)}
                    />
                  </label>

                  <div className="rounded-xl bg-[#4f8fe7]/10 px-3 py-2 text-sm font-extrabold text-[#4f8fe7]">
                    {slot.startsAt} - {slot.endsAt}
                  </div>

                  <div className="flex gap-2 sm:justify-end">
                    <button
                      type="button"
                      className={clsx(
                        'h-9 rounded-lg px-3 text-xs font-extrabold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40',
                        isDark
                          ? 'bg-[#4b5561] text-[#f4f1ec] hover:bg-[#31527d]'
                          : 'bg-[#dce5f0] text-[#43505a] hover:bg-[#bfcee3]'
                      )}
                      disabled={index === 0}
                      onClick={() => onMoveSlot?.(index, index - 1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={clsx(
                        'h-9 rounded-lg px-3 text-xs font-extrabold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40',
                        isDark
                          ? 'bg-[#4b5561] text-[#f4f1ec] hover:bg-[#31527d]'
                          : 'bg-[#dce5f0] text-[#43505a] hover:bg-[#bfcee3]'
                      )}
                      disabled={index === scheduleRows.length - 1}
                      onClick={() => onMoveSlot?.(index, index + 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="h-9 rounded-lg bg-red-500/15 px-3 text-xs font-extrabold text-red-400 transition hover:-translate-y-0.5 hover:bg-red-500 hover:text-white"
                      onClick={() => onRemoveSlot?.(slot.id)}
                    >
                      Nonaktifkan
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={clsx(
                'mt-5 grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_auto]',
                isDark ? 'border-[#45515e] bg-[#313b45]' : 'border-[#dfe6f0] bg-white'
              )}
            >
              <FieldShell label="Massal Durasi Slot">
                <input
                  type="number"
                  min="1"
                  aria-label="Massal Durasi Slot"
                  className={clsx(
                    'h-12 rounded-xl border px-4 text-sm font-bold outline-none transition',
                    isDark
                      ? 'border-[#64717d] bg-[#56616d] text-[#f4f1ec] hover:border-[#f4f1ec]'
                      : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#5f95df]'
                  )}
                  value={bulkDuration}
                  onInput={(event) => onBulkDurationChange?.(event.currentTarget.value)}
                />
              </FieldShell>

              <button
                type="button"
                className={clsx(
                  'h-12 self-end rounded-xl px-5 text-sm font-extrabold transition hover:-translate-y-0.5',
                  isDark
                    ? 'bg-[#4f8fe7] text-white hover:bg-[#6fa6ef]'
                    : 'bg-[#31527d] text-white hover:bg-[#456da1]'
                )}
                onClick={onApplyBulkDuration}
              >
                Terapkan Massal
              </button>
            </div>

            <p className="m-0 mt-4 rounded-xl bg-[#4f8fe7]/10 px-4 py-3 text-sm font-bold leading-relaxed text-[#4f8fe7]">
              Catatan pengembangan: data mapel spesifik belum diikat ke backend. Slot ini masih tampak depan
              untuk pengaturan urutan, durasi, dan jam selesai.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
