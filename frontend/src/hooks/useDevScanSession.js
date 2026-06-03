import { useEffect } from 'preact/hooks';
import {
  checkPresensiSessionWarning,
  createPresensiSession,
  fetchRombelOptions,
  finishPresensiSession,
  heartbeatPresensiSession,
} from '../api/presensiScanApi.js';
import { sortJamIds } from '../lib/devScanUtils.js';

export function useDevScanSession({
  token,
  presensiSesiId,
  setPresensiSesiId,
  setSessionLabel,
  setStatusType,
  setStatusMessage,
  showResponse,
  modePresensi,
  rombelId,
  selectedJamIds,
  ruangPilihan,
  rombelLabel,
  selectedRombelId,
  setSelectedRombelId,
  setRombelOptions,
  setIsLoadingRombel,
  processedPayloadsRef,
  processedStudentIdsRef,
}) {
  useEffect(() => {
    if (!token || !presensiSesiId) return;

    const sendHeartbeat = () => {
      heartbeatPresensiSession({ token, presensiSesiId }).catch(() => {});
    };

    sendHeartbeat();
    const timer = window.setInterval(sendHeartbeat, 60_000);

    return () => window.clearInterval(timer);
  }, [token, presensiSesiId]);

  const handleLoadRombelOptions = async (activeToken = token) => {
    if (!activeToken) {
      setStatusType('error');
      setStatusMessage('Login dulu sebelum memuat daftar rombel.');
      return false;
    }

    setIsLoadingRombel(true);
    setStatusType('info');
    setStatusMessage('Memuat daftar rombel dari database...');

    const result = await fetchRombelOptions({ token: activeToken });

    setIsLoadingRombel(false);

    if (!showResponse(result)) return false;

    const items = result.data?.data?.rombel || [];
    setRombelOptions(items);

    if (items.length === 0) {
      setSelectedRombelId('');
      setStatusType('warning');
      setStatusMessage('Daftar rombel aktif kosong.');
      return true;
    }

    const selectedStillExists = items.some(
      (item) => String(item.rombel_id) === String(selectedRombelId)
    );

    if (!selectedRombelId || !selectedStillExists) {
      setSelectedRombelId(String(items[0].rombel_id));
    }

    setStatusType('success');
    setStatusMessage(`Daftar rombel berhasil dimuat. Total: ${items.length} rombel aktif.`);
    return true;
  };

  const handleCreateSession = async () => {
    if (!token) {
      setStatusType('error');
      setStatusMessage('Login dulu sebelum membuat sesi.');
      return;
    }

    const jamIds = sortJamIds(selectedJamIds);

    if (jamIds.length === 0) {
      setStatusType('error');
      setStatusMessage('Pilih minimal satu jam presensi.');
      return;
    }

    if (modePresensi === 'rombel' && !rombelId) {
      setStatusType('error');
      setStatusMessage('Pilih rombel dari dropdown terlebih dahulu.');
      return;
    }

    const warning = await checkPresensiSessionWarning({
      token,
      modePresensi,
      rombelId,
      jamIds,
      ruangPilihan,
    });

    if (!showResponse(warning)) return;

    if (warning.data?.data?.has_warning) {
      const conflicts = warning.data.data.conflicts || [];
      const detail = conflicts
        .map((item) => `Jam ${item.jam_id} | ${item.ruang_label_snapshot || '-'} | ${item.status}`)
        .join('\n');

      const lanjut = window.confirm(
        `Jam pelajaran ini sudah pernah dipakai hari ini.\n\n${detail}\n\nTetap buat sesi baru?`
      );

      if (!lanjut) {
        setStatusType('warning');
        setStatusMessage('Pembuatan sesi dibatalkan.');
        return;
      }
    }

    setStatusType('info');
    setStatusMessage('Membuat sesi presensi...');

    const result = await createPresensiSession({
      token,
      modePresensi,
      rombelId,
      jamIds,
      ruangPilihan,
    });

    if (!showResponse(result)) return;

    const session = result.data.data.session;
    const sessionId = session.presensi_sesi_id;
    const label = session.ruang_label_snapshot || rombelLabel;

    processedPayloadsRef.current.clear();
    processedStudentIdsRef.current.clear();

    setPresensiSesiId(String(sessionId));
    setSessionLabel(`${label} | Jam ${jamIds.join(', ')} | Ruang ${ruangPilihan}`);
    setStatusType('success');
    setStatusMessage(`Sesi berhasil dibuat: ${label}. ID sesi: ${sessionId}`);
  };

  const handleFinishSession = async () => {
    if (!token || !presensiSesiId) {
      setStatusType('error');
      setStatusMessage('Belum ada sesi yang bisa diakhiri.');
      return;
    }

    const result = await finishPresensiSession({ token, presensiSesiId });

    if (!showResponse(result)) return;

    setPresensiSesiId('');
    setSessionLabel('');
    setStatusType('success');
    setStatusMessage('Sesi berhasil diakhiri.');
  };

  return {
    handleLoadRombelOptions,
    handleCreateSession,
    handleFinishSession,
  };
}
