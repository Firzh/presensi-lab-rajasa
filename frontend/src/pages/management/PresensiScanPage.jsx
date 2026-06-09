import { useEffect, useRef, useState } from 'preact/hooks';
import clsx from 'clsx';

import {
  finishPresensiSession,
  heartbeatPresensiSession,
  pausePresensiSession,
  submitPresensiQrScan,
} from '../../api/presensiApi.js';
import { DashboardSidebar, DashboardTopbar } from '../../components/dashboard/index.js';
import { PresensiModal } from '../../components/management/presensi/index.js';
import { ROUTES } from '../../constants/routes.js';
import { STORAGE_KEYS } from '../../constants/storageKeys.js';
import { appStorage } from '../../lib/storage.js';
import { getAppTodayDate } from '../../lib/dateUtils.js';
import {
  clearActivePresensiSession,
  getActivePresensiSession,
  updateActivePresensiSession,
} from '../../lib/presensiSessionStore.js';
import { useQrScanner } from '../../hooks/useQrScanner.js';
import { AppIcon } from '../../components/ui/AppIcon.jsx';

function getInitialTheme() {
  const savedTheme = appStorage.getRaw(STORAGE_KEYS.THEME, 'light');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

function goToPresensi() {
  window.history.pushState({}, '', ROUTES.PRESENSI);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function getInitialActivePresensiSession() {
  const activeSession = getActivePresensiSession();

  if (!activeSession?.presensi_sesi_id) {
    return null;
  }

  if (activeSession.tanggal !== getAppTodayDate()) {
    clearActivePresensiSession();
    return null;
  }

  return activeSession;
}

export function PresensiScanPage() {
  const processedPayloadsRef = useRef(new Set());
  const isSubmittingRef = useRef(false);

  const [theme, setTheme] = useState(getInitialTheme);
  const [activeSession, setActiveSession] = useState(getInitialActivePresensiSession);
  const [statusMessage, setStatusMessage] = useState('Siap membuka kamera.');
  const [statusType, setStatusType] = useState('info');
  const [modal, setModal] = useState(null);

  const isDark = theme === 'dark';

  const { isScanning, scannerError, startScanner, stopScanner } = useQrScanner({
    elementId: 'presensi-qr-reader',
    onScanSuccess: handleSubmitScan,
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    appStorage.setRaw(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    if (!activeSession?.presensi_sesi_id) return undefined;

    const timer = window.setInterval(() => {
      heartbeatPresensiSession(activeSession.presensi_sesi_id).catch(() => {});
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [activeSession?.presensi_sesi_id]);

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }

  async function handlePauseScanner() {
    if (!activeSession?.presensi_sesi_id) return;

    await stopScanner();
    await pausePresensiSession(activeSession.presensi_sesi_id).catch(() => {});

    updateActivePresensiSession({ paused: true });
    goToPresensi();
  }

  async function handleFinishSession() {
    if (!activeSession?.presensi_sesi_id) return;

    await stopScanner();

    const result = await finishPresensiSession(activeSession.presensi_sesi_id);

    if (!result.ok || result.data?.success === false) {
      setStatusType('error');
      setStatusMessage(result.data?.message || 'Gagal menyelesaikan sesi.');
      return;
    }

    clearActivePresensiSession();
    setActiveSession(null);
    goToPresensi();
  }

  async function handleSubmitScan(scannedPayload = '') {
    if (isSubmittingRef.current) return;

    const cleanPayload = String(scannedPayload || '').trim();

    if (!activeSession?.presensi_sesi_id) {
      setStatusType('error');
      setStatusMessage('Sesi presensi tidak ditemukan.');
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
    setStatusType('info');
    setStatusMessage('Mengirim hasil scan...');

    const result = await submitPresensiQrScan({
      presensiSesiId: activeSession.presensi_sesi_id,
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

      return;
    }

    if (scan.status_scan === 'berhasil') {
      setStatusType('success');
      setStatusMessage(`${scan.siswa?.nama_lengkap || 'Siswa'} berhasil presensi.`);
      return;
    }

    if (scan.status_scan === 'ditolak') {
      setStatusType('warning');
      setStatusMessage(`${scan.siswa?.nama_lengkap || 'Siswa'} sudah presensi pada jam ini.`);
      return;
    }

    if (scan.status_scan === 'invalid') {
      setStatusType('error');
      setStatusMessage('QR tidak dikenal. Data tidak masuk presensi.');
      return;
    }

    setStatusType('info');
    setStatusMessage(`Scan selesai dengan status: ${scan.status_scan}.`);
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
        <header className="mb-7 flex flex-col items-stretch justify-between gap-4 sm:mb-9 sm:flex-row sm:items-start">
          <div>
            <h1
              className={clsx(
                'm-0 text-[1.75rem] font-extrabold leading-none tracking-wide sm:text-[2rem]',
                isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
              )}
            >
              Scan QR Presensi
            </h1>
            <p className="m-0 mt-4 text-base font-bold text-[#8b9298]">
              Scan kartu siswa untuk sesi aktif.
            </p>
          </div>

          <button
            type="button"
            className="h-12 w-full rounded-xl bg-[#56616d] px-5 font-bold text-[#F0EDE4] transition hover:bg-[#64717d] sm:w-auto"
            onClick={handlePauseScanner}
          >
            Pause Scan
          </button>
        </header>

        {!activeSession ? (
          <section
            className={clsx(
              'grid min-h-75 place-items-center rounded-xl p-5 text-center sm:min-h-105 sm:p-8',
              isDark ? 'bg-[#313b45]' : 'bg-white'
            )}
          >
            <div>
              <AppIcon name="circleQuestion" className="text-[3rem] text-[#8b9298]" />
              <p className="mt-4 font-bold text-[#8b9298]">Tidak ada sesi presensi aktif.</p>
              <button
                type="button"
                className="mt-5 h-11 rounded-xl bg-[#a9c9f4] px-5 font-bold text-[#4f6b8b]"
                onClick={goToPresensi}
              >
                Kembali ke Presensi
              </button>
            </div>
          </section>
        ) : (
          <section className={clsx('rounded-xl p-4 sm:p-6', isDark ? 'bg-[#313b45]' : 'bg-white')}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2
                  className={clsx(
                    'm-0 text-xl font-extrabold',
                    isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
                  )}
                >
                  {activeSession.rombel_label} | {activeSession.jam_label}
                </h2>
                <p className="m-0 mt-2 text-sm font-semibold text-[#8b9298]">
                  Ruang: {activeSession.ruang_label}
                </p>
              </div>

              <span
                className={clsx(
                  'rounded-md px-3 py-1 text-xs font-extrabold',
                  isScanning ? 'bg-green-500/20 text-green-400' : 'bg-slate-400/20 text-[#8b9298]'
                )}
              >
                {isScanning ? 'Scanning' : 'Standby'}
              </span>
            </div>

            <div
              id="presensi-qr-reader"
              className={clsx(
                'grid min-h-80 place-items-center overflow-hidden rounded-2xl border sm:min-h-105',
                isDark ? 'border-[#64717d] bg-[#1d262e]' : 'border-[#d5dde8] bg-[#f3f3f3]'
              )}
            >
              {!isScanning ? (
                <div className="grid justify-items-center gap-3 text-center text-[#8b9298]">
                  <AppIcon name="idCard" className="text-[3rem]" />
                  <p className="m-0 font-bold">Kamera belum aktif</p>
                </div>
              ) : null}
            </div>

            {scannerError ? (
              <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">
                Kamera gagal dibuka: {scannerError}
              </p>
            ) : null}

            {statusMessage ? (
              <p
                className={clsx(
                  'mt-4 rounded-xl px-4 py-3 text-sm font-bold',
                  statusType === 'success' && 'bg-green-500/10 text-green-400',
                  statusType === 'warning' && 'bg-yellow-500/10 text-yellow-400',
                  statusType === 'error' && 'bg-red-500/10 text-red-400',
                  statusType === 'info' && 'bg-blue-500/10 text-blue-400'
                )}
              >
                {statusMessage}
              </p>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
              <button
                type="button"
                className="h-12 rounded-xl bg-[#a9c9f4] font-extrabold text-[#4f6b8b] transition hover:bg-[#8ab7ef] disabled:opacity-50"
                disabled={isScanning}
                onClick={startScanner}
              >
                Buka Kamera
              </button>

              <button
                type="button"
                className="h-12 rounded-xl bg-[#ffb65c] font-extrabold text-white transition hover:bg-[#f59e0b]"
                onClick={handlePauseScanner}
              >
                Pause Scan
              </button>

              <button
                type="button"
                className="h-12 rounded-xl bg-[#ff6568] font-extrabold text-white transition hover:bg-[#ef4444]"
                onClick={handleFinishSession}
              >
                Akhiri Presensi
              </button>
            </div>
          </section>
        )}
      </main>

      {modal ? (
        <PresensiModal
          title={modal.title}
          message={modal.message}
          actionLabel={modal.actionLabel}
          danger={modal.danger}
          onAction={modal.onAction}
          onClose={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}
