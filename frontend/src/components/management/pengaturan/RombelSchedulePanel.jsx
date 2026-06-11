import { useState } from 'preact/hooks';
import clsx from 'clsx';

import { scheduleDayOptions } from '../../../lib/settingsUtils.js';
import { AppIcon } from '../../ui/AppIcon.jsx';
import { AppSelect } from '../../ui/AppSelect.jsx';

function FieldShell({ label, children }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-bold text-[#8b9298]">
      {label}
      {children}
    </label>
  );
}

function getBatchDropdownLabel({ isBatchEditMode, selectedCount, batchCount }) {
  if (isBatchEditMode) {
    return `${batchCount} rombel dalam batch`;
  }

  if (selectedCount <= 0) {
    return 'Pilih rombel dalam batch';
  }

  return `${selectedCount} dipilih / ${batchCount} dalam batch`;
}

function TargetModeSwitch({ theme, value, onChange }) {
  const isDark = theme === 'dark';

  return (
    <div
      className={clsx(
        'grid rounded-xl p-1 sm:grid-cols-2',
        isDark ? 'bg-[#1f2a33]' : 'bg-[#eaf0f7]'
      )}
    >
      {[
        { value: 'single', label: 'Set per rombel' },
        { value: 'batch', label: 'Batch rombel' },
      ].map((item) => {
        const active = value === item.value;

        return (
          <button
            key={item.value}
            type="button"
            className={clsx(
              'h-10 rounded-lg px-4 text-sm font-extrabold transition',
              active
                ? 'bg-[#4f8fe7] text-white shadow-sm'
                : isDark
                  ? 'text-[#cfd8e3] hover:bg-[#313b45]'
                  : 'text-[#6f7882] hover:bg-white'
            )}
            onClick={() => onChange?.(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function SingleRombelDropdown({ theme, options, selectedId, isOpen, onToggleOpen, onSelect }) {
  const isDark = theme === 'dark';
  const selectedRombel = options.find((rombel) => String(rombel.id) === String(selectedId));
  const label = selectedRombel ? selectedRombel.label : 'Pilih satu rombel';

  return (
    <div className="relative">
      <button
        type="button"
        className={clsx(
          'flex h-12 w-full items-center justify-between rounded-xl border px-4 text-left text-sm font-medium transition',
          isDark
            ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] hover:border-[#F0EDE4] hover:bg-[#64717d]'
            : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#a9c9f4] hover:bg-[#eef1f5]'
        )}
        onClick={onToggleOpen}
      >
        <span className="truncate">{label}</span>
        <AppIcon name="angleDown" />
      </button>

      {isOpen ? (
        <div
          className={clsx(
            'absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-y-auto rounded-xl border shadow-lg',
            isDark ? 'border-[#64717d] bg-[#56616d]' : 'border-[#d5dde8] bg-white'
          )}
        >
          {options.length ? (
            options.map((rombel) => {
              const selected = String(selectedId) === String(rombel.id);

              return (
                <button
                  key={rombel.id}
                  type="button"
                  className={clsx(
                    'flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm font-bold transition',
                    selected
                      ? 'bg-[#a9c9f4] text-[#4f6b8b] hover:bg-[#8ab7ef]'
                      : isDark
                        ? 'text-[#F0EDE4] hover:bg-[#64717d]'
                        : 'text-[#43505a] hover:bg-[#eef1f5]'
                  )}
                  onClick={() => onSelect?.(rombel.id)}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{rombel.label}</span>
                    <span className="block truncate text-xs opacity-70">
                      {rombel.jurusan} · {rombel.yearLabel}
                    </span>
                  </span>
                  {selected ? <span>✓</span> : null}
                </button>
              );
            })
          ) : (
            <div
              className={clsx(
                'px-4 py-5 text-center text-sm font-bold',
                isDark ? 'text-[#cfd8e3]' : 'text-[#6f7882]'
              )}
            >
              Tidak ada rombel sesuai filter ini.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function BatchRombelDropdown({
  theme,
  options,
  selectedIds,
  batchCount,
  isBatchEditMode,
  isOpen,
  onToggleOpen,
  onToggleOption,
}) {
  const isDark = theme === 'dark';
  const label = getBatchDropdownLabel({
    isBatchEditMode,
    selectedCount: selectedIds.length,
    batchCount,
  });

  return (
    <div className="relative">
      <button
        type="button"
        className={clsx(
          'flex h-12 w-full items-center justify-between rounded-xl border px-4 text-left text-sm font-medium transition',
          isDark
            ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] hover:border-[#F0EDE4] hover:bg-[#64717d]'
            : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#a9c9f4] hover:bg-[#eef1f5]'
        )}
        onClick={onToggleOpen}
      >
        <span className="truncate">{label}</span>
        <AppIcon name="angleDown" />
      </button>

      {isOpen ? (
        <div
          className={clsx(
            'absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-y-auto rounded-xl border shadow-lg',
            isDark ? 'border-[#64717d] bg-[#56616d]' : 'border-[#d5dde8] bg-white'
          )}
        >
          {options.length ? (
            options.map((rombel) => {
              const checked = selectedIds.includes(rombel.id);

              return (
                <button
                  key={rombel.id}
                  type="button"
                  className={clsx(
                    'flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm font-bold transition',
                    checked
                      ? 'bg-[#a9c9f4] text-[#4f6b8b] hover:bg-[#8ab7ef]'
                      : isDark
                        ? 'text-[#F0EDE4] hover:bg-[#64717d]'
                        : 'text-[#43505a] hover:bg-[#eef1f5]'
                  )}
                  onClick={() => onToggleOption?.(rombel.id)}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{rombel.label}</span>
                    <span className="block truncate text-xs opacity-70">
                      {rombel.jurusan} · {rombel.yearLabel}
                    </span>
                  </span>
                  {checked ? <span>✓</span> : null}
                </button>
              );
            })
          ) : (
            <div
              className={clsx(
                'px-4 py-5 text-center text-sm font-bold',
                isDark ? 'text-[#cfd8e3]' : 'text-[#6f7882]'
              )}
            >
              {isBatchEditMode
                ? 'Tidak ada rombel sesuai filter ini.'
                : 'Batch belum memiliki rombel sesuai filter ini.'}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}


function SlotNameEditModal({ theme, slotLabel, value, onChange, onCancel, onSave }) {
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4">
      <div
        className={clsx(
          'w-full max-w-md rounded-2xl border p-5 shadow-2xl',
          isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#dfe6f0] bg-white'
        )}
      >
        <div className="mb-4">
          <p
            className={clsx(
              'm-0 text-lg font-extrabold',
              isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
            )}
          >
            Edit Nama Mapel
          </p>
          <p className="m-0 mt-1 text-xs font-bold text-[#8b9298]">
            Ubah nama untuk {slotLabel}. Nama akan tetap ikut saat slot dipindah.
          </p>
        </div>

        <label className="grid gap-2 text-sm font-bold text-[#8b9298]">
          Nama Mapel
          <input
            type="text"
            aria-label="Nama Mapel"
            className={clsx(
              'h-12 w-full rounded-xl border px-4 text-sm font-bold outline-none transition',
              isDark
                ? 'border-[#64717d] bg-[#56616d] text-[#f4f1ec] hover:border-[#f4f1ec]'
                : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#5f95df]'
            )}
            value={value}
            onInput={(event) => onChange?.(event.currentTarget.value)}
            placeholder="Contoh: Matematika"
            autoFocus
          />
        </label>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={clsx(
              'h-11 rounded-xl px-4 text-sm font-extrabold transition hover:-translate-y-0.5',
              isDark
                ? 'bg-[#4b5561] text-[#f4f1ec] hover:bg-[#64717d]'
                : 'bg-[#dce5f0] text-[#43505a] hover:bg-[#bfcee3]'
            )}
            onClick={onCancel}
          >
            Batal
          </button>
          <button
            type="button"
            className="h-11 rounded-xl bg-[#4f8fe7] px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#6fa6ef]"
            onClick={onSave}
          >
            Simpan Nama
          </button>
        </div>
      </div>
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
  onSelectSingleRombel,
  onUseBatchMode,
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
  onUpdateSlotName,
  onBulkDurationChange,
  onApplyBulkDuration,
  onSaveSchedule,
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [editingSlotName, setEditingSlotName] = useState('');
  const [targetMode, setTargetMode] = useState(selectedRombelIds.length > 1 ? 'batch' : 'single');
  const [isSingleDropdownOpen, setIsSingleDropdownOpen] = useState(false);
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
  const isDark = theme === 'dark';
  const mapelCount = slots.filter((slot) => slot.type === 'mapel').length;
  const breakCount = slots.filter((slot) => slot.type === 'break').length;
  const visibleBatchRombels = isBatchEditMode ? batchEditableRombelOptions : rombelOptions;
  const selectedBatchRombelIds = selectedRombelIds.filter((id) => batchRombelIds.includes(id));
  const activeBatchSelectedIds = isBatchEditMode ? batchRombelIds : selectedBatchRombelIds;
  const singleSelectedId = selectedRombelIds[0] ?? '';
  const editingSlot = scheduleRows.find((slot) => slot.id === editingSlotId);

  function isMobileViewport() {
      return typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;
  }

  function handleTargetModeChange(nextMode) {
    setTargetMode(nextMode);
    setIsSingleDropdownOpen(false);
    setIsBatchDropdownOpen(false);

    if (nextMode === 'single') {
      onSelectSingleRombel?.(selectedRombelIds[0] ?? '');
      return;
    }

    onUseBatchMode?.();
  }

  function handleSingleSelect(rombelId) {
    onSelectSingleRombel?.(rombelId);
    setIsSingleDropdownOpen(false);
  }

  function handleBatchToggle(rombelId) {
    if (isBatchEditMode) {
      onToggleBatchRombel?.(rombelId);
      return;
    }

    onToggleRombel?.(rombelId);
  }

  function handleDragStart(event, index) {
    if (isMobileViewport()) {
      event.preventDefault();
      return;
    }

    setDragIndex(index);
  }

  function handleDrop(targetIndex) {
    if (dragIndex === null || isMobileViewport()) return;

    onMoveSlot?.(dragIndex, targetIndex);
    setDragIndex(null);
  }

  function openSlotNameEditor(slot) {
    if (slot.type !== 'mapel') return;

    setEditingSlotId(slot.id);
    setEditingSlotName(slot.customLabel || slot.label || '');
  }

  function closeSlotNameEditor() {
    setEditingSlotId(null);
    setEditingSlotName('');
  }

  function saveSlotName() {
    if (!editingSlotId) return;

    onUpdateSlotName?.(editingSlotId, editingSlotName);
    closeSlotNameEditor();
  }

  return (
    <section className={clsx('w-full max-w-full overflow-visible rounded-2xl p-4 sm:p-6', isDark ? 'bg-[#313b45]' : 'bg-white')}>
      {editingSlot ? (
        <SlotNameEditModal
          theme={theme}
          slotLabel={editingSlot.label}
          value={editingSlotName}
          onChange={setEditingSlotName}
          onCancel={closeSlotNameEditor}
          onSave={saveSlotName}
        />
      ) : null}

      <div className="mb-6 flex min-w-0 flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <h2
            className={clsx(
              'm-0 text-2xl font-extrabold',
              isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
            )}
          >
            Jam Pelajaran Rombel
          </h2>
          <p className="m-0 mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-[#8b9298]">
            Pilih target rombel, lalu update jam masuk atau slot mapel.
          </p>
        </div>

        <button
          type="button"
          className={clsx(
            'h-12 w-full rounded-xl px-5 text-sm font-extrabold transition hover:-translate-y-0.5 lg:w-auto',
            isDark ? 'bg-[#4f8fe7] text-white hover:bg-[#6fa6ef]' : 'bg-[#31527d] text-white hover:bg-[#456da1]'
          )}
          onClick={onSaveSchedule}
        >
          Simpan Jadwal
        </button>
      </div>

      <div className="grid min-w-0 gap-5">
        <div
          className={clsx(
            'relative z-20 min-w-0 rounded-2xl border p-4',
            isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#e3eaf4] bg-[#f8fbff]'
          )}
        >
          <div className="mb-4">
            <p
              className={clsx(
                'm-0 text-base font-extrabold',
                isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
              )}
            >
              Target Rombel
            </p>
            <p className="m-0 mt-1 text-xs font-bold text-[#8b9298]">
              Gunakan single rombel untuk satu kelas atau batch rombel untuk beberapa kelas.
            </p>
          </div>

          <div className="grid min-w-0 gap-4">
            <TargetModeSwitch theme={theme} value={targetMode} onChange={handleTargetModeChange} />

            {targetMode === 'single' ? (
              <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.35fr)]">
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

                <FieldShell label="Rombel">
                  <SingleRombelDropdown
                    theme={theme}
                    options={batchEditableRombelOptions}
                    selectedId={singleSelectedId}
                    isOpen={isSingleDropdownOpen}
                    onToggleOpen={() => setIsSingleDropdownOpen((current) => !current)}
                    onSelect={handleSingleSelect}
                  />
                </FieldShell>
              </div>
            ) : (
              <div
                className={clsx(
                  'grid min-w-0 gap-4 rounded-2xl border p-4',
                  isDark ? 'border-[#45515e] bg-[#1f2a33]' : 'border-[#dfe6f0] bg-white'
                )}
              >
                <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div
                    className={clsx(
                      'min-w-0 rounded-xl px-4 py-3 text-sm font-extrabold',
                      isDark ? 'bg-[#25303a] text-[#cfd8e3]' : 'bg-[#eef3f9] text-[#6d8bb3]'
                    )}
                  >
                    {selectedBatchRombelIds.length} dipilih / {batchRombelIds.length} dalam batch
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

                <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.35fr)]">
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

                  <FieldShell label={isBatchEditMode ? 'Isi Batch' : 'Rombel Batch'}>
                    <BatchRombelDropdown
                      theme={theme}
                      options={visibleBatchRombels}
                      selectedIds={activeBatchSelectedIds}
                      batchCount={batchRombelIds.length}
                      isBatchEditMode={isBatchEditMode}
                      isOpen={isBatchDropdownOpen}
                      onToggleOpen={() => setIsBatchDropdownOpen((current) => !current)}
                      onToggleOption={handleBatchToggle}
                    />
                  </FieldShell>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
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
              'min-w-0 rounded-2xl border p-4',
              isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#e3eaf4] bg-[#f8fbff]'
            )}
          >
            <FieldShell label="Batas Presensi Masuk">
              <input
                type="time"
                aria-label="Batas Presensi Masuk"
                className={clsx(
                  'h-12 w-full rounded-xl border px-4 text-sm font-bold outline-none transition',
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

        {scheduleMode === 'mapel' ? (
          <div
            className={clsx(
              'min-w-0 rounded-2xl border p-4',
              isDark ? 'border-[#45515e] bg-[#25303a]' : 'border-[#e3eaf4] bg-[#f8fbff]'
            )}
          >
            <div className="mb-5 flex min-w-0 flex-col justify-between gap-4 xl:flex-row xl:items-end">
              <FieldShell label="Jam Mulai Slot Pertama">
                <input
                  type="time"
                  aria-label="Jam Mulai Slot Pertama"
                  className={clsx(
                    'h-12 w-full rounded-xl border px-4 text-sm font-bold outline-none transition',
                    isDark
                      ? 'border-[#64717d] bg-[#56616d] text-[#f4f1ec] hover:border-[#f4f1ec]'
                      : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#5f95df]'
                  )}
                  value={startTime}
                  onInput={(event) => onStartTimeChange?.(event.currentTarget.value)}
                />
              </FieldShell>

              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  disabled={mapelCount >= 12}
                  onClick={() => onAddSlot?.('mapel')}
                >
                  <AppIcon name="plus" /> Tambah Mapel
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
                  draggable={!isMobileViewport()}
                  className={clsx(
                    'grid min-w-0 gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,0.85fr)_auto] lg:items-center',
                    slot.type === 'break'
                      ? isDark
                        ? 'border-amber-300/40 bg-amber-300/10'
                        : 'border-amber-200 bg-amber-50'
                      : isDark
                        ? 'border-[#45515e] bg-[#313b45] hover:border-[#8db8ef]'
                        : 'border-[#dfe6f0] bg-white hover:border-[#9fbbe1]'
                  )}
                  onDragStart={(event) => handleDragStart(event, index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(index)}
                >
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <span
                      className={clsx(
                        'hidden h-10 w-10 place-items-center rounded-xl lg:grid',
                        slot.type === 'break'
                          ? 'bg-amber-400/20 text-amber-500'
                          : isDark
                            ? 'bg-[#25303a] text-[#cfd8e3]'
                            : 'bg-[#eef3f9] text-[#6d8bb3]'
                      )}
                    >
                      <AppIcon name={slot.type === 'break' ? 'clock' : 'list'} />
                    </span>
                    <div className="min-w-0">
                      <p
                        className={clsx(
                          'm-0 truncate font-extrabold',
                          isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
                        )}
                      >
                        {slot.label}
                      </p>
                      <div className="flex min-w-0 flex-wrap gap-2 lg:justify-end">
                        Drag untuk urutkan
                      </div>
                    </div>
                  </div>

                  <label className="grid gap-1 text-xs font-extrabold text-[#8b9298]">
                    Durasi Menit
                    <input
                      type="number"
                      min="1"
                      aria-label={`Durasi ${slot.label}`}
                      className={clsx(
                        'h-10 w-full rounded-xl border px-3 text-sm font-bold outline-none transition',
                        isDark
                          ? 'border-[#64717d] bg-[#56616d] text-[#f4f1ec] hover:border-[#f4f1ec]'
                          : 'border-[#d5dde8] bg-white text-[#43505a] hover:border-[#5f95df]'
                      )}
                      value={slot.duration}
                      onInput={(event) => onUpdateSlotDuration?.(slot.id, event.currentTarget.value)}
                    />
                  </label>

                  <div className="min-w-0 rounded-xl bg-[#4f8fe7]/10 px-3 py-2 text-sm font-extrabold text-[#4f8fe7]">
                    {slot.startsAt} - {slot.endsAt}
                  </div>

                  <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end">
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
                                        {slot.type === 'mapel' ? (
                      <button
                        type="button"
                        className={clsx(
                          'h-9 rounded-lg border px-3 text-xs font-extrabold transition hover:-translate-y-0.5',
                          isDark
                            ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] hover:border-[#a9c9f4] hover:bg-[#a9c9f4] hover:text-[#13202d]'
                            : 'border-[#d5dde8] bg-white text-[#4f6b8b] hover:border-[#4f8fe7] hover:bg-[#4f8fe7] hover:text-white'
                        )}
                        onClick={() => openSlotNameEditor(slot)}
                      >
                        Edit Nama
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div
              className={clsx(
                'mt-5 grid min-w-0 gap-3 rounded-2xl border p-4 md:grid-cols-[minmax(0,1fr)_auto]',
                isDark ? 'border-[#45515e] bg-[#313b45]' : 'border-[#dfe6f0] bg-white'
              )}
            >
              <FieldShell label="Massal Durasi Slot">
                <input
                  type="number"
                  min="1"
                  aria-label="Massal Durasi Slot"
                  className={clsx(
                    'h-12 w-full rounded-xl border px-4 text-sm font-bold outline-none transition',
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
