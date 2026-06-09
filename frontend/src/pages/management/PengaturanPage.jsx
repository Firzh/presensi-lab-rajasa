import { useEffect, useMemo, useState } from 'preact/hooks';
import clsx from 'clsx';

import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import {
  BackupDatabasePanel,
  LateRulePanel,
  RombelSchedulePanel,
  SettingsFeatureTabs,
} from '../../components/management/pengaturan/index.js';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import {
  buildBackupDownloadText,
  calculateScheduleRows,
  countSlotsByType,
  createBackupRecord,
  createScheduleSlot,
  defaultLateRule,
  filterRombelOptions,
  getDefaultBatchRombelIds,
  getDefaultScheduleSlots,
  mockBackupHistory,
  rombelMajorOptions,
  rombelSettingOptions,
  rombelYearOptions,
  moveScheduleSlot,
  renumberScheduleSlots,
  settingTabs,
  validateScheduleRows,
} from '../../lib/settingsUtils.js';
import { appStorage } from '../../lib/storage.js';

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

export function PengaturanPage() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [activeTab, setActiveTab] = useState('backup');
  const [backupHistory, setBackupHistory] = useState(() => [...mockBackupHistory]);
  const [batchRombelIds, setBatchRombelIds] = useState(getDefaultBatchRombelIds);
  const [selectedRombelIds, setSelectedRombelIds] = useState(['10-tkj-1', '10-tkj-2']);
  const [jurusanFilter, setJurusanFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [isBatchEditMode, setIsBatchEditMode] = useState(false);
  const [scheduleMode, setScheduleMode] = useState('mapel');
  const [day, setDay] = useState('Senin');
  const [attendanceCutoff, setAttendanceCutoff] = useState('07:10');
  const [startTime, setStartTime] = useState('07:00');
  const [slots, setSlots] = useState(getDefaultScheduleSlots);
  const [bulkDuration, setBulkDuration] = useState(40);
  const [lateRule, setLateRule] = useState(() => ({ ...defaultLateRule }));
  const [toastMessage, setToastMessage] = useState('');

  const isDark = theme === 'dark';
  const scheduleRows = useMemo(() => calculateScheduleRows(slots, startTime), [slots, startTime]);
  const validationMessage = useMemo(() => validateScheduleRows(scheduleRows), [scheduleRows]);
  const batchEditableRombelOptions = useMemo(
    () => filterRombelOptions(rombelSettingOptions, jurusanFilter, yearFilter),
    [jurusanFilter, yearFilter]
  );
  const rombelOptions = useMemo(
    () =>
      filterRombelOptions(
        rombelSettingOptions.filter((rombel) => batchRombelIds.includes(rombel.id)),
        jurusanFilter,
        yearFilter
      ),
    [batchRombelIds, jurusanFilter, yearFilter]
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    if (!toastMessage) return undefined;

    const timeoutId = window.setTimeout(() => setToastMessage(''), 2400);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }

  function toggleRombel(rombelId) {
    setSelectedRombelIds((current) => {
      if (current.includes(rombelId)) {
        return current.filter((item) => item !== rombelId);
      }

      return [...current, rombelId];
    });
  }

  function toggleBatchRombel(rombelId) {
    setBatchRombelIds((current) => {
      if (current.includes(rombelId)) {
        setSelectedRombelIds((selected) => selected.filter((item) => item !== rombelId));
        return current.filter((item) => item !== rombelId);
      }

      return [...current, rombelId];
    });
  }

  function toggleBatchEditMode() {
    setIsBatchEditMode((current) => !current);
  }

  function backupNow() {
    const nextBackup = createBackupRecord(backupHistory);
    setBackupHistory((current) => [nextBackup, ...current]);
    setToastMessage('Backup database berhasil dibuat.');
  }

  function downloadBackup(item) {
    const blob = new Blob([buildBackupDownloadText(item)], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = item.fileName.replace('.sql', '.txt');
    anchor.click();
    URL.revokeObjectURL(url);
    setToastMessage(`File ${item.fileName} siap diunduh.`);
  }

  function addSlot(type) {
    const limit = type === 'break' ? 2 : 12;

    if (countSlotsByType(slots, type) >= limit) {
      setToastMessage(type === 'break' ? 'Maksimal 2 slot istirahat.' : 'Maksimal 12 slot mapel.');
      return;
    }

    setSlots((current) => renumberScheduleSlots([...current, createScheduleSlot(type)]));
  }

  function removeSlot(slotId) {
    setSlots((current) => renumberScheduleSlots(current.filter((slot) => slot.id !== slotId)));
  }

  function moveSlot(fromIndex, toIndex) {
    setSlots((current) => moveScheduleSlot(current, fromIndex, toIndex));
  }

  function updateSlotDuration(slotId, value) {
    setSlots((current) =>
      current.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              duration: Number(value),
            }
          : slot
      )
    );
  }

  function applyBulkDuration() {
    const nextDuration = Number(bulkDuration);

    if (nextDuration <= 0) {
      setToastMessage('Durasi massal harus lebih dari 0 menit.');
      return;
    }

    setSlots((current) =>
      current.map((slot) => ({
        ...slot,
        duration: nextDuration,
      }))
    );
    setToastMessage('Durasi slot berhasil diterapkan massal.');
  }

  function saveLateRule() {
    setToastMessage('Aturan keterlambatan berhasil disimpan.');
  }

  return (
    <div
      className={
        isDark
          ? 'min-h-screen bg-[#1d262e] text-[#f4f1ec]'
          : 'min-h-screen bg-[#f3f3f3] text-[#444b51]'
      }
    >
      <DashboardSidebar theme={theme} activeKey="pengaturan" />
      <DashboardTopbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="min-h-screen px-4 pb-8 pt-36 sm:px-6 lg:ml-65 lg:px-10 lg:pb-8 lg:pt-29.5">
        <header className="mb-7 flex flex-col items-stretch justify-between gap-4 sm:mb-9 sm:flex-row sm:items-start">
          <div>
            <h1
              className={clsx(
                'm-0 text-[1.75rem] font-extrabold leading-none tracking-wide sm:text-[2rem]',
                isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
              )}
            >
              Pengaturan
            </h1>
            <p
              className={clsx(
                'm-0 mt-4 max-w-3xl text-base font-bold leading-relaxed',
                isDark ? 'text-[#cfd8e3]' : 'text-[#6f7882]'
              )}
            >
              Pusat kontrol administratif untuk backup, jadwal rombel, dan aturan keterlambatan.
            </p>
          </div>

          {toastMessage ? (
            <div
              className={clsx(
                'rounded-xl px-4 py-3 text-sm font-extrabold shadow-md',
                isDark ? 'bg-[#25303a] text-[#cfd8e3]' : 'bg-white text-[#31527d]'
              )}
            >
              {toastMessage}
            </div>
          ) : null}
        </header>

        <SettingsFeatureTabs
          tabs={settingTabs}
          activeTab={activeTab}
          theme={theme}
          onChange={setActiveTab}
        />

        {activeTab === 'backup' ? (
          <BackupDatabasePanel
            theme={theme}
            backups={backupHistory}
            onBackupNow={backupNow}
            onDownload={downloadBackup}
          />
        ) : null}

        {activeTab === 'jadwal' ? (
          <RombelSchedulePanel
            theme={theme}
            selectedRombelIds={selectedRombelIds}
            batchRombelIds={batchRombelIds}
            rombelOptions={rombelOptions}
            batchEditableRombelOptions={batchEditableRombelOptions}
            majorOptions={rombelMajorOptions}
            yearOptions={rombelYearOptions}
            jurusanFilter={jurusanFilter}
            yearFilter={yearFilter}
            isBatchEditMode={isBatchEditMode}
            scheduleMode={scheduleMode}
            day={day}
            attendanceCutoff={attendanceCutoff}
            startTime={startTime}
            slots={slots}
            scheduleRows={scheduleRows}
            validationMessage={validationMessage}
            bulkDuration={bulkDuration}
            onToggleRombel={toggleRombel}
            onToggleBatchRombel={toggleBatchRombel}
            onToggleBatchEditMode={toggleBatchEditMode}
            onJurusanFilterChange={setJurusanFilter}
            onYearFilterChange={setYearFilter}
            onScheduleModeChange={setScheduleMode}
            onDayChange={setDay}
            onAttendanceCutoffChange={setAttendanceCutoff}
            onStartTimeChange={setStartTime}
            onAddSlot={addSlot}
            onRemoveSlot={removeSlot}
            onMoveSlot={moveSlot}
            onUpdateSlotDuration={updateSlotDuration}
            onBulkDurationChange={setBulkDuration}
            onApplyBulkDuration={applyBulkDuration}
          />
        ) : null}

        {activeTab === 'keterlambatan' ? (
          <LateRulePanel
            theme={theme}
            rule={lateRule}
            onChange={setLateRule}
            onSave={saveLateRule}
          />
        ) : null}
      </main>
    </div>
  );
}
