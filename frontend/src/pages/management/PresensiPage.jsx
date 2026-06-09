import { useEffect, useMemo, useState } from 'preact/hooks';
import clsx from 'clsx';

import {
  checkPresensiSessionWarning,
  createPresensiSession,
  fetchPresensiToday,
  fetchRombelOptions,
  finishPresensiSession,
  resumePresensiSession,
} from '../../api/presensiApi.js';
import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import {
  PresensiModal,
  PresensiSetupPanel,
  PresensiTodayTable,
} from '../../components/management/presensi/index.js';
import { ROUTES } from '../../constants/routes.js';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import { getAuthToken } from '../../lib/authSession.js';
import { getAppTodayDate } from '../../lib/dateUtils.js';
import {
  getRombelLabel,
  getSelectedJamLabel,
  sortJamIds,
  toggleConsecutiveJam,
} from '../../lib/presensiUtils.js';
import {
  clearActivePresensiSession,
  getActivePresensiSession,
  saveActivePresensiSession,
  updateActivePresensiSession,
} from '../../lib/presensiSessionStore.js';
import { appStorage } from '../../lib/storage.js';

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

function goToPresensiScan() {
  window.history.pushState({}, '', ROUTES.PRESENSI_SCAN);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function PresensiPage() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [modePresensi, setModePresensi] = useState('rombel');
  const [rombelOptions, setRombelOptions] = useState([]);
  const [selectedRombelId, setSelectedRombelId] = useState('');
  const [selectedJamIds, setSelectedJamIds] = useState([1]);
  const [isJamDropdownOpen, setIsJamDropdownOpen] = useState(false);
  const [ruangPilihan, setRuangPilihan] = useState('kelas');

  const [attendanceRows, setAttendanceRows] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Siap membuat sesi presensi.');
  const [statusType, setStatusType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const token = getAuthToken();
  const isDark = theme === 'dark';

  const selectedRombel = useMemo(() => {
    return (
      rombelOptions.find((item) => String(item.rombel_id) === String(selectedRombelId)) || null
    );
  }, [rombelOptions, selectedRombelId]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    loadRombelOptions();
    loadAttendanceRows();
    showPausedSessionModalIfNeeded();
  }, []);

  useEffect(() => {
    loadAttendanceRows();
  }, [selectedRombelId, selectedJamIds, modePresensi]);

  async function loadRombelOptions() {
    if (!token) {
      setStatusType('error');
      setStatusMessage('Token tidak tersedia. Silakan login ulang.');
      return;
    }

    const result = await fetchRombelOptions();

    if (!result.ok || result.data?.success === false) {
      setStatusType('error');
      setStatusMessage(result.data?.message || 'Gagal memuat rombel.');
      return;
    }

    const items = result.data?.data?.rombel || [];
    setRombelOptions(items);

    if (!selectedRombelId && items.length > 0) {
      setSelectedRombelId(String(items[0].rombel_id));
    }
  }

  async function loadAttendanceRows() {
    const params = {
      tanggal: getAppTodayDate(),
    };

    if (modePresensi === 'rombel' && selectedRombelId) {
      params.rombel_id = selectedRombelId;
    }

    const result = await fetchPresensiToday(params);

    if (!result.ok || result.data?.success === false) {
      return;
    }

    const selectedSet = new Set(selectedJamIds.map(Number));
    const rows = result.data?.data?.items || [];

    setAttendanceRows(rows.filter((row) => selectedSet.has(Number(row.jam?.jam_id ?? row.jam_id))));
  }

  function showPausedSessionModalIfNeeded() {
    const activeSession = getActivePresensiSession();

    if (!activeSession?.presensi_sesi_id) {
      return;
    }

    if (activeSession.tanggal !== getAppTodayDate()) {
      clearActivePresensiSession();
      return;
    }

    if (!activeSession.paused) {
      return;
    }

    setModal({
      title: 'Presensi Dijeda',
      message:
        'Sesi presensi sedang dijeda. Pilih lanjutkan untuk kembali scan, atau akhiri untuk menutup sesi.',
      actionLabel: 'Lanjutkan Presensi',
      secondaryLabel: 'Akhiri Presensi',
      onAction: async () => {
        setModal(null);
        await resumePresensiSession(activeSession.presensi_sesi_id).catch(() => {});
        updateActivePresensiSession({ paused: false });
        goToPresensiScan();
      },
      onSecondary: async () => {
        setModal(null);
        await finishPresensiSession(activeSession.presensi_sesi_id).catch(() => {});
        clearActivePresensiSession();
        setStatusType('success');
        setStatusMessage('Sesi presensi selesai.');
        await loadAttendanceRows();
      },
    });
  }

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }

  function handleModeChange(value) {
    setModePresensi(value);

    if (value === 'piket') {
      setRuangPilihan('piket');
      setSelectedRombelId('');
      setSelectedJamIds([1]);
      return;
    }

    setRuangPilihan('kelas');
    setSelectedJamIds([1]);
  }

  function handleToggleJam(jamId) {
    const result = toggleConsecutiveJam(selectedJamIds, jamId);

    setSelectedJamIds(result.selectedIds);

    if (result.error) {
      setStatusType('warning');
      setStatusMessage(result.error);
    }
  }

  async function handleCreateSession() {
    if (!token) {
      setStatusType('error');
      setStatusMessage('Token tidak tersedia. Silakan login ulang.');
      return;
    }

    const jamIds = sortJamIds(selectedJamIds);

    if (modePresensi === 'rombel' && !selectedRombelId) {
      setStatusType('error');
      setStatusMessage('Pilih rombel terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setStatusType('info');
    setStatusMessage('Mengecek sesi presensi...');

    try {
      const warning = await checkPresensiSessionWarning({
        modePresensi,
        rombelId: selectedRombelId,
        jamIds,
        ruangPilihan,
      });

      if (!warning.ok || warning.data?.success === false) {
        throw new Error(warning.data?.message || 'Gagal mengecek sesi.');
      }

      if (warning.data?.data?.has_warning) {
        const lanjut = window.confirm(
          'Jam ini sudah pernah dipakai hari ini. Tetap buat sesi baru?'
        );

        if (!lanjut) {
          setStatusType('warning');
          setStatusMessage('Pembuatan sesi dibatalkan.');
          return;
        }
      }

      const result = await createPresensiSession({
        modePresensi,
        rombelId: selectedRombelId,
        jamIds,
        ruangPilihan,
      });

      if (!result.ok || result.data?.success === false) {
        throw new Error(result.data?.message || 'Gagal membuat sesi.');
      }

      const session = result.data?.data?.session;
      const sessionId = session?.presensi_sesi_id;

      if (!sessionId) {
        throw new Error('Response sesi presensi tidak memiliki ID sesi.');
      }

      const label = modePresensi === 'piket' ? 'Piket' : getRombelLabel(selectedRombel);

      saveActivePresensiSession({
        presensi_sesi_id: String(sessionId),
        tanggal: getAppTodayDate(),
        mode_presensi: modePresensi,
        rombel_id: selectedRombelId,
        rombel_label: label,
        jam_ids: jamIds,
        jam_label: getSelectedJamLabel(jamIds),
        ruang_pilihan: ruangPilihan,
        ruang_label: session?.ruang_label_snapshot || ruangPilihan,
        paused: false,
      });

      setStatusType('success');
      setStatusMessage('Sesi presensi berhasil dibuat. Mengarahkan ke halaman scan...');
      goToPresensiScan();
    } catch (error) {
      setStatusType('error');
      setStatusMessage(error.message || 'Gagal membuat sesi.');
    } finally {
      setIsLoading(false);
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
      <DashboardSidebar theme={theme} activeKey="presensi" />
      <DashboardTopbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="min-h-screen px-4 pb-8 pt-36 sm:px-6 lg:ml-65 lg:px-10 lg:pb-8 lg:pt-29.5">
        <header className="mb-9">
          <h1
            className={clsx(
              'm-0 text-[1.75rem] font-extrabold leading-none tracking-wide sm:text-[2rem]',
              isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
            )}
          >
            Presensi
          </h1>
          <p className="m-0 mt-4 text-base font-bold text-[#8b9298]">
            Buat sesi, lalu pantau presensi siswa hari ini.
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <PresensiSetupPanel
            theme={theme}
            modePresensi={modePresensi}
            rombelOptions={rombelOptions}
            selectedRombelId={selectedRombelId}
            selectedJamIds={selectedJamIds}
            ruangPilihan={ruangPilihan}
            isJamDropdownOpen={isJamDropdownOpen}
            isSessionActive={false}
            isLoading={isLoading}
            sessionLabel=""
            onModeChange={handleModeChange}
            onRombelChange={setSelectedRombelId}
            onJamDropdownToggle={() => setIsJamDropdownOpen((current) => !current)}
            onToggleJam={handleToggleJam}
            onRuangChange={setRuangPilihan}
            onCreateSession={handleCreateSession}
          />

          {statusMessage ? (
            <p
              className={clsx(
                'rounded-xl px-4 py-3 text-sm font-bold',
                statusType === 'success' && 'bg-green-500/10 text-green-400',
                statusType === 'warning' && 'bg-yellow-500/10 text-yellow-400',
                statusType === 'error' && 'bg-red-500/10 text-red-400',
                statusType === 'info' && 'bg-blue-500/10 text-blue-400'
              )}
            >
              {statusMessage}
            </p>
          ) : null}

          <PresensiTodayTable rows={attendanceRows} warningRows={[]} theme={theme} />
        </section>
      </main>

      {modal ? (
        <PresensiModal
          title={modal.title}
          message={modal.message}
          actionLabel={modal.actionLabel}
          secondaryLabel={modal.secondaryLabel}
          onAction={modal.onAction}
          onSecondary={modal.onSecondary}
          onClose={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}
