import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import clsx from 'clsx';

import {
  checkPresensiSessionWarning,
  createPresensiSession,
  fetchPresensiToday,
  fetchRombelOptions,
  finishPresensiSession,
  heartbeatPresensiSession,
  pausePresensiSession,
  resumePresensiSession,
  submitPresensiQrScan,
} from '../../api/presensiApi.js';
import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import {
  PresensiModal,
  PresensiScanPanel,
  PresensiSetupPanel,
  PresensiTodayTable,
} from '../../components/management/presensi/index.js';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import { getAuthToken } from '../../lib/authSession.js';
import {
  getRombelLabel,
  getSelectedJamLabel,
  sortJamIds,
  toggleConsecutiveJam,
} from '../../lib/presensiUtils.js';
import { appStorage } from '../../lib/storage.js';
import { useQrScanner } from '../../hooks/useQrScanner.js';

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function PresensiPage() {
  const processedPayloadsRef = useRef(new Set());
  const isSubmittingRef = useRef(false);

  const [theme, setTheme] = useState(getInitialTheme);
  const [modePresensi, setModePresensi] = useState('rombel');
  const [rombelOptions, setRombelOptions] = useState([]);
  const [selectedRombelId, setSelectedRombelId] = useState('');
  const [selectedJamIds, setSelectedJamIds] = useState([1]);
  const [isJamDropdownOpen, setIsJamDropdownOpen] = useState(false);
  const [ruangPilihan, setRuangPilihan] = useState('kelas');

  const [presensiSesiId, setPresensiSesiId] = useState('');
  const [sessionLabel, setSessionLabel] = useState('');
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [warningRows, setWarningRows] = useState([]);

  const [payloadRaw, setPayloadRaw] = useState('');
  const [statusMessage, setStatusMessage] = useState('Siap membuat sesi presensi.');
  const [statusType, setStatusType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const token = getAuthToken();
  const isDark = theme === 'dark';
  const isSessionActive = Boolean(presensiSesiId);

  const selectedRombel = useMemo(() => {
    return rombelOptions.find((item) => String(item.rombel_id) === String(selectedRombelId)) || null;
  }, [rombelOptions, selectedRombelId]);

  const { isScanning, scannerError, startScanner, stopScanner } = useQrScanner({
    elementId: 'presensi-qr-reader',
    onScanSuccess: handleSubmitScan,
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    loadRombelOptions();
    loadAttendanceRows();
  }, []);

  useEffect(() => {
    loadAttendanceRows();
  }, [selectedRombelId, selectedJamIds, modePresensi]);

  useEffect(() => {
    if (!presensiSesiId) return undefined;

    const timer = window.setInterval(() => {
      heartbeatPresensiSession(presensiSesiId).catch(() => {});
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [presensiSesiId]);

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
      tanggal: getToday(),
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

    setAttendanceRows(rows.filter((row) => selectedSet.has(Number(row.jam?.jam_id))));
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
        const lanjut = window.confirm('Jam ini sudah pernah dipakai hari ini. Tetap buat sesi baru?');

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

      processedPayloadsRef.current.clear();
      setWarningRows([]);
      setPresensiSesiId(String(sessionId));

      const label = modePresensi === 'piket' ? 'Piket' : getRombelLabel(selectedRombel);
      setSessionLabel(`${label} | ${getSelectedJamLabel(jamIds)} | ${session?.ruang_label_snapshot || ruangPilihan}`);
      setStatusType('success');
      setStatusMessage('Sesi presensi berhasil dibuat.');
      await loadAttendanceRows();
    } catch (error) {
      setStatusType('error');
      setStatusMessage(error.message || 'Gagal membuat sesi.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePauseScanner() {
    await stopScanner();

    if (presensiSesiId) {
      await pausePresensiSession(presensiSesiId).catch(() => {});
    }

    setModal({
      title: 'Scan Dijeda',
      message: 'Scan QR sedang dijeda. Tekan tombol lanjut untuk membuka kamera kembali.',
      actionLabel: 'Lanjutkan Scan',
      onAction: async () => {
        setModal(null);
        if (presensiSesiId) {
          await resumePresensiSession(presensiSesiId).catch(() => {});
        }
        await startScanner();
      },
    });
  }

  async function handleFinishSession() {
    await stopScanner();

    if (!presensiSesiId) return;

    const result = await finishPresensiSession(presensiSesiId);

    if (!result.ok || result.data?.success === false) {
      setStatusType('error');
      setStatusMessage(result.data?.message || 'Gagal menyelesaikan sesi.');
      return;
    }

    setPresensiSesiId('');
    setSessionLabel('');
    setStatusType('success');
    setStatusMessage('Sesi presensi selesai.');
    await loadAttendanceRows();
  }

  async function handleSubmitScan(scannedPayload = '') {
    if (isSubmittingRef.current) return;

    const cleanPayload = String(scannedPayload || payloadRaw || '').trim();

    if (!presensiSesiId) {
      setStatusType('error');
      setStatusMessage('Buat sesi presensi terlebih dahulu.');
      return;
    }

    if (!cleanPayload) {
      setStatusType('error');
      setStatusMessage('Payload QR kosong.');
      return;
    }

    if (processedPayloadsRef.current.has(cleanPayload)) {
      setStatusType('warning');
      setStatusMessage('QR ini sudah diproses di sesi ini.');
      return;
    }

    isSubmittingRef.current = true;
    setPayloadRaw(cleanPayload);
    setStatusType('info');
    setStatusMessage('Mengirim hasil scan...');

    const result = await submitPresensiQrScan({
      presensiSesiId,
      payloadRaw: cleanPayload,
    });

    isSubmittingRef.current = false;

    if (!result.ok || result.data?.success === false) {
      setStatusType('error');
      setStatusMessage(result.data?.message || 'Scan gagal.');
      return;
    }

    const scan = result.data?.data || {};
    processedPayloadsRef.current.add(cleanPayload);

    if (scan.status_scan === 'warning') {
      await stopScanner();

      const siswa = scan.siswa || {};
      const warningRow = {
        scan_log_id: scan.scan_log_id || Date.now(),
        nama_lengkap: siswa.nama_lengkap,
        nisn: siswa.nisn,
        kelas_aktif: siswa.kelas_aktif,
        warning_reason: scan.warning_reason,
        message: scan.message || 'Siswa tidak sesuai rombel.',
      };

      setWarningRows((current) => [warningRow, ...current]);
      setStatusType('warning');
      setStatusMessage(`${siswa.nama_lengkap || 'Siswa'} perlu perhatian.`);

      setModal({
        title: 'Warning Kartu Tidak Sesuai',
        message:
          `${siswa.nama_lengkap || 'Siswa'} terdeteksi tidak sesuai rombel.\n\n` +
          `NISN: ${siswa.nisn || '-'}\n` +
          `Kelas aktif: ${siswa.kelas_aktif || '-'}\n\n` +
          'Catat manual nama siswa pembawa kartu sebelum melanjutkan scan.',
        actionLabel: 'Saya Mengerti',
        danger: true,
        onAction: () => setModal(null),
      });

      await loadAttendanceRows();
      return;
    }

    if (scan.status_scan === 'berhasil') {
      setStatusType('success');
      setStatusMessage(`${scan.siswa?.nama_lengkap || 'Siswa'} berhasil presensi.`);
      await loadAttendanceRows();
      return;
    }

    if (scan.status_scan === 'ditolak') {
      setStatusType('warning');
      setStatusMessage(`${scan.siswa?.nama_lengkap || 'Siswa'} sudah presensi pada jam ini.`);
      await loadAttendanceRows();
      return;
    }

    if (scan.status_scan === 'invalid') {
      setStatusType('error');
      setStatusMessage('QR tidak dikenal. Data tidak masuk presensi.');
      return;
    }

    setStatusType('info');
    setStatusMessage(`Scan selesai dengan status: ${scan.status_scan}.`);
    await loadAttendanceRows();
  }

  return (
    <div className={isDark ? 'min-h-screen bg-[#1d262e] text-[#f4f1ec]' : 'min-h-screen bg-[#f3f3f3] text-[#444b51]'}>
      <DashboardSidebar theme={theme} activeKey="presensi" />
      <DashboardTopbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="ml-[260px] min-h-screen px-10 pb-8 pt-[118px]">
        <header className="mb-9">
          <h1 className={clsx('m-0 text-[2rem] font-extrabold leading-none tracking-wide', isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]')}>
            Presensi
          </h1>
          <p className="m-0 mt-4 text-base font-bold text-[#8b9298]">
            Buat sesi, scan QR, dan pantau presensi siswa hari ini.
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <div className="grid content-start gap-6">
            <PresensiSetupPanel
              theme={theme}
              modePresensi={modePresensi}
              rombelOptions={rombelOptions}
              selectedRombelId={selectedRombelId}
              selectedJamIds={selectedJamIds}
              ruangPilihan={ruangPilihan}
              isJamDropdownOpen={isJamDropdownOpen}
              isSessionActive={isSessionActive}
              isLoading={isLoading}
              sessionLabel={sessionLabel}
              onModeChange={handleModeChange}
              onRombelChange={setSelectedRombelId}
              onJamDropdownToggle={() => setIsJamDropdownOpen((current) => !current)}
              onToggleJam={handleToggleJam}
              onRuangChange={setRuangPilihan}
              onCreateSession={handleCreateSession}
            />

            <PresensiTodayTable rows={attendanceRows} warningRows={warningRows} theme={theme} />
          </div>

          <PresensiScanPanel
            theme={theme}
            isSessionActive={isSessionActive}
            isScanning={isScanning}
            scannerError={scannerError}
            payloadRaw={payloadRaw}
            statusMessage={statusMessage}
            statusType={statusType}
            onStartScanner={startScanner}
            onPauseScanner={handlePauseScanner}
            onFinishSession={handleFinishSession}
            onPayloadChange={setPayloadRaw}
            onSubmitManual={() => handleSubmitScan()}
          />
        </section>
      </main>

      {modal ? (
        <PresensiModal
          title={modal.title}
          message={modal.message}
          actionLabel={modal.actionLabel}
          danger={modal.danger}
          onAction={modal.onAction}
          onClose={modal.onClose}
        />
      ) : null}
    </div>
  );
}