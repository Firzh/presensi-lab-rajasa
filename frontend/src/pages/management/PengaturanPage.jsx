import { useEffect, useMemo, useState } from 'preact/hooks';
import clsx from 'clsx';

import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import {
  BackupDatabasePanel,
  ImportBackupDataPanel,
  LateRulePanel,
  RombelSchedulePanel,
  SettingsFeatureTabs,
} from '../../components/management/pengaturan/index.js';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import {
  createDatabaseBackup,
  downloadDatabaseBackup,
  getPengaturanData,
  importBackupFile,
  importDataFile,
  previewBackupImport,
  previewDataImport,
  updateLateRule,
  updateRombelSchedule,
} from '../../api/settingsApi.js';
import {
  calculateScheduleRows,
  countSlotsByType,
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
  const [backendRombelOptions, setBackendRombelOptions] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [dataImportFile, setDataImportFile] = useState(null);
  const [backupImportFile, setBackupImportFile] = useState(null);
  const [dataImportPreview, setDataImportPreview] = useState(null);
  const [backupImportPreview, setBackupImportPreview] = useState(null);
  const [dataImportResult, setDataImportResult] = useState(null);
  const [backupImportResult, setBackupImportResult] = useState(null);

  const isDark = theme === 'dark';
  const scheduleRows = useMemo(() => calculateScheduleRows(slots, startTime), [slots, startTime]);
  const validationMessage = useMemo(() => validateScheduleRows(scheduleRows), [scheduleRows]);
  const batchEditableRombelOptions = useMemo(
    () =>
      filterRombelOptions(backendRombelOptions ?? rombelSettingOptions, jurusanFilter, yearFilter),
    [backendRombelOptions, jurusanFilter, yearFilter]
  );
  const rombelOptions = useMemo(
    () =>
      filterRombelOptions(
        (backendRombelOptions ?? rombelSettingOptions).filter((rombel) =>
          batchRombelIds.includes(String(rombel.id))
        ),
        jurusanFilter,
        yearFilter
      ),
    [backendRombelOptions, batchRombelIds, jurusanFilter, yearFilter]
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const result = await getPengaturanData();

        if (!isMounted || !result.ok) return;

        const data = result.data?.data ?? {};
        const rombelSchedule = data.rombel_schedule ?? {};

        if (Array.isArray(data.backup_history)) {
          setBackupHistory(data.backup_history);
        }

        if (data.late_rule) {
          setLateRule({ ...defaultLateRule, ...data.late_rule });
        }

        if (Array.isArray(rombelSchedule.rombel_options)) {
          setBackendRombelOptions(rombelSchedule.rombel_options);
        }

        if (Array.isArray(rombelSchedule.batch_rombel_ids)) {
          setBatchRombelIds(rombelSchedule.batch_rombel_ids.map(String));
        }

        if (Array.isArray(rombelSchedule.selected_rombel_ids)) {
          setSelectedRombelIds(rombelSchedule.selected_rombel_ids.map(String));
        }

        if (rombelSchedule.attendance_cutoff) {
          setAttendanceCutoff(rombelSchedule.attendance_cutoff);
        }

        if (rombelSchedule.start_time) {
          setStartTime(rombelSchedule.start_time);
        }

        if (Array.isArray(rombelSchedule.slots) && rombelSchedule.slots.length) {
          setSlots(renumberScheduleSlots(rombelSchedule.slots));
        }
      } catch (_error) {
        setToastMessage('Backend pengaturan belum bisa diakses. Data fallback ditampilkan.');
      }
    }

    loadSettings();

    function handleDataImportFileChange(file) {
      setDataImportFile(file);
      setDataImportPreview(null);
      setDataImportResult(null);
    }

    function handleBackupImportFileChange(file) {
      setBackupImportFile(file);
      setBackupImportPreview(null);
      setBackupImportResult(null);
    }

    async function previewSelectedDataImport() {
      if (!dataImportFile) {
        setToastMessage('Pilih file data dulu.');
        return;
      }

      setIsSaving(true);

      try {
        const result = await previewDataImport(dataImportFile);
        setDataImportPreview(result.data?.data ?? null);
        setToastMessage(
          result.ok
            ? 'Preview import data berhasil dibuat.'
            : (result.data?.message ?? 'Preview import data gagal.')
        );
      } catch (_error) {
        setToastMessage('Preview import data gagal diproses backend.');
      } finally {
        setIsSaving(false);
      }
    }

    async function submitSelectedDataImport() {
      if (!dataImportFile) {
        setToastMessage('Pilih file data dulu.');
        return;
      }

      setIsSaving(true);

      try {
        const result = await importDataFile(dataImportFile);
        setDataImportResult(result.data ?? null);
        setToastMessage(
          result.ok
            ? 'Import data berhasil diproses.'
            : (result.data?.message ?? 'Import data gagal.')
        );
      } catch (_error) {
        setToastMessage('Import data gagal diproses backend.');
      } finally {
        setIsSaving(false);
      }
    }

    async function previewSelectedBackupImport() {
      if (!backupImportFile) {
        setToastMessage('Pilih file backup dulu.');
        return;
      }

      setIsSaving(true);

      try {
        const result = await previewBackupImport(backupImportFile);
        setBackupImportPreview(result.data?.data ?? null);
        setToastMessage(
          result.ok
            ? 'Preview import backup berhasil dibuat.'
            : (result.data?.message ?? 'Preview import backup gagal.')
        );
      } catch (_error) {
        setToastMessage('Preview import backup gagal diproses backend.');
      } finally {
        setIsSaving(false);
      }
    }

    async function submitSelectedBackupImport() {
      if (!backupImportFile) {
        setToastMessage('Pilih file backup dulu.');
        return;
      }

      setIsSaving(true);

      try {
        const result = await importBackupFile(backupImportFile);
        setBackupImportResult(result.data ?? null);
        setToastMessage(
          result.ok
            ? 'Import backup berhasil diproses.'
            : (result.data?.message ?? 'Import backup gagal.')
        );
      } catch (_error) {
        setToastMessage('Import backup gagal diproses backend.');
      } finally {
        setIsSaving(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

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

  function selectSingleRombel(rombelId) {
    setSelectedRombelIds(rombelId ? [rombelId] : []);
  }

  function useBatchModeSelection() {
    setSelectedRombelIds((current) =>
      current.filter((rombelId) => batchRombelIds.includes(rombelId))
    );
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

  async function backupNow() {
    setIsSaving(true);

    try {
      const result = await createDatabaseBackup();

      if (!result.ok) {
        setToastMessage(result.data?.message ?? 'Backup database gagal.');
        return;
      }

      const data = result.data?.data ?? {};
      if (data.backup) {
        setBackupHistory((current) => [data.backup, ...current]);
      }
      setToastMessage('Backup database berhasil dibuat.');
    } catch (_error) {
      setToastMessage('Backup database gagal diproses oleh backend.');
    } finally {
      setIsSaving(false);
    }
  }

  async function downloadBackup(item) {
    try {
      const result = await downloadDatabaseBackup(item.fileName);

      if (!result.ok) {
        setToastMessage(result.data?.message ?? 'File backup gagal diunduh.');
        return;
      }

      const content = result.data?.data?.content ?? '';
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = item.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      setToastMessage(`File ${item.fileName} siap diunduh.`);
    } catch (_error) {
      setToastMessage('File backup gagal diunduh dari backend.');
    }
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

  function updateSlotName(slotId, value) {
    const customLabel = String(value || '').trim();

    setSlots((current) =>
      renumberScheduleSlots(
        current.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                customLabel,
              }
            : slot
        )
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

  async function saveRombelSchedule() {
    if (validationMessage) {
      setToastMessage(validationMessage);
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateRombelSchedule({
        batch_rombel_ids: batchRombelIds,
        selected_rombel_ids: selectedRombelIds,
        day,
        schedule_mode: scheduleMode,
        attendance_cutoff: attendanceCutoff,
        start_time: startTime,
        slots: scheduleRows,
      });

      setToastMessage(
        result.ok
          ? 'Jadwal rombel berhasil disimpan.'
          : (result.data?.message ?? 'Jadwal gagal disimpan.')
      );
    } catch (_error) {
      setToastMessage('Jadwal gagal disimpan ke backend.');
    } finally {
      setIsSaving(false);
    }
  }

  async function saveLateRule() {
    setIsSaving(true);

    try {
      const result = await updateLateRule(lateRule);

      setToastMessage(
        result.ok
          ? 'Aturan keterlambatan berhasil disimpan.'
          : (result.data?.message ?? 'Aturan gagal disimpan.')
      );
    } catch (_error) {
      setToastMessage('Aturan keterlambatan gagal disimpan ke backend.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleDataImportFileChange(file) {
    setDataImportFile(file);
    setDataImportPreview(null);
    setDataImportResult(null);
  }

  function handleBackupImportFileChange(file) {
    setBackupImportFile(file);
    setBackupImportPreview(null);
    setBackupImportResult(null);
  }

  async function previewSelectedDataImport() {
    if (!dataImportFile) {
      setToastMessage('Pilih file data dulu.');
      return;
    }

    setIsSaving(true);

    try {
      const result = await previewDataImport(dataImportFile);

      setDataImportPreview(result.data?.data ?? null);
      setToastMessage(
        result.ok
          ? 'Preview import data berhasil dibuat.'
          : (result.data?.message ?? 'Preview import data gagal.')
      );
    } catch (_error) {
      setToastMessage('Preview import data gagal diproses backend.');
    } finally {
      setIsSaving(false);
    }
  }

  async function submitSelectedDataImport() {
    if (!dataImportFile) {
      setToastMessage('Pilih file data dulu.');
      return;
    }

    setIsSaving(true);

    try {
      const result = await importDataFile(dataImportFile);

      setDataImportResult(result.data ?? null);
      setToastMessage(
        result.ok
          ? 'Import data berhasil diproses.'
          : (result.data?.message ?? 'Import data gagal.')
      );
    } catch (_error) {
      setToastMessage('Import data gagal diproses backend.');
    } finally {
      setIsSaving(false);
    }
  }

  async function previewSelectedBackupImport() {
    if (!backupImportFile) {
      setToastMessage('Pilih file backup dulu.');
      return;
    }

    setIsSaving(true);

    try {
      const result = await previewBackupImport(backupImportFile);

      setBackupImportPreview(result.data?.data ?? null);
      setToastMessage(
        result.ok
          ? 'Preview import backup berhasil dibuat.'
          : (result.data?.message ?? 'Preview import backup gagal.')
      );
    } catch (_error) {
      setToastMessage('Preview import backup gagal diproses backend.');
    } finally {
      setIsSaving(false);
    }
  }

  async function submitSelectedBackupImport() {
    if (!backupImportFile) {
      setToastMessage('Pilih file backup dulu.');
      return;
    }

    setIsSaving(true);

    try {
      const result = await importBackupFile(backupImportFile);

      setBackupImportResult(result.data ?? null);
      setToastMessage(
        result.ok
          ? 'Import backup berhasil diproses.'
          : (result.data?.message ?? 'Import backup gagal.')
      );
    } catch (_error) {
      setToastMessage('Import backup gagal diproses backend.');
    } finally {
      setIsSaving(false);
    }
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
            onBackupNow={isSaving ? undefined : backupNow}
            onDownload={downloadBackup}
          />
        ) : null}

        {activeTab === 'import' ? (
          <ImportBackupDataPanel
            theme={theme}
            isBusy={isSaving}
            dataFile={dataImportFile}
            backupFile={backupImportFile}
            dataPreview={dataImportPreview}
            backupPreview={backupImportPreview}
            dataResult={dataImportResult}
            backupResult={backupImportResult}
            onDataFileChange={handleDataImportFileChange}
            onBackupFileChange={handleBackupImportFileChange}
            onPreviewData={previewSelectedDataImport}
            onImportData={submitSelectedDataImport}
            onPreviewBackup={previewSelectedBackupImport}
            onImportBackup={submitSelectedBackupImport}
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
            onSelectSingleRombel={selectSingleRombel}
            onUseBatchMode={useBatchModeSelection}
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
            onUpdateSlotName={updateSlotName}
            onBulkDurationChange={setBulkDuration}
            onApplyBulkDuration={applyBulkDuration}
            onSaveSchedule={saveRombelSchedule}
          />
        ) : null}

        {activeTab === 'keterlambatan' ? (
          <LateRulePanel
            theme={theme}
            rule={lateRule}
            onChange={setLateRule}
            onSave={isSaving ? undefined : saveLateRule}
          />
        ) : null}
      </main>
    </div>
  );
}
