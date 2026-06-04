import { useCallback } from 'preact/hooks';
import { submitQrScan } from '../api/presensiScanApi.js';
import { getQrFingerprint } from '../lib/devScanUtils.js';

export function useDevScanSubmit({
  token,
  presensiSesiId,
  payloadRaw,
  setPayloadRaw,
  setResponseJson,
  setStatusType,
  setStatusMessage,
  showResponse,
  processedPayloadsRef,
  processedStudentIdsRef,
  isSubmittingRef,
}) {
  const handleDuplicateUi = ({ siswa, payload }) => {
    const nama = siswa?.nama_lengkap || siswa?.nama || 'Siswa ini';
    const nisn = siswa?.nisn ? ` (${siswa.nisn})` : '';

    setPayloadRaw(payload);
    setResponseJson({
      success: true,
      message: 'Scan diabaikan oleh frontend.',
      data: {
        status_scan: 'duplicate_frontend',
        siswa,
      },
    });
    setStatusType('warning');
    setStatusMessage(`${nama}${nisn} sudah diproses di sesi ini. Scan ulang diabaikan.`);
  };

  const handleSubmitScan = useCallback(
    async (scannedPayload = '') => {
      if (isSubmittingRef.current) {
        return;
      }

      const cleanPayload = String(scannedPayload || payloadRaw || '').trim();

      if (!token) {
        setStatusType('error');
        setStatusMessage('Login dulu sebelum scan.');
        return;
      }

      if (!presensiSesiId) {
        setStatusType('error');
        setStatusMessage('Presensi Sesi ID wajib diisi.');
        return;
      }

      if (!cleanPayload) {
        setStatusType('error');
        setStatusMessage('Payload QR kosong.');
        return;
      }

      const fingerprint = getQrFingerprint(cleanPayload);

      if (processedPayloadsRef.current.has(fingerprint)) {
        handleDuplicateUi({
          payload: cleanPayload,
          siswa: null,
        });
        return;
      }

      isSubmittingRef.current = true;

      setPayloadRaw(cleanPayload);
      setStatusType('info');
      setStatusMessage('Mengirim hasil scan...');

      const result = await submitQrScan({
        token,
        presensiSesiId,
        payloadRaw: cleanPayload,
      });

      isSubmittingRef.current = false;

      if (!showResponse(result)) {
        return;
      }

      const scan = result.data.data;
      const siswa = scan.siswa || null;
      const siswaId = siswa?.siswa_id ? String(siswa.siswa_id) : '';

      if (siswaId && processedStudentIdsRef.current.has(siswaId)) {
        handleDuplicateUi({
          payload: cleanPayload,
          siswa,
        });
        return;
      }

      if (siswaId && ['berhasil', 'warning'].includes(scan.status_scan)) {
        processedStudentIdsRef.current.add(siswaId);
        processedPayloadsRef.current.add(fingerprint);
      }

      if (scan.status_scan === 'berhasil') {
        setStatusType('success');
        setStatusMessage(
          `${siswa?.nama_lengkap || 'Siswa'} berhasil presensi: ${scan.attendance_status}.` +
            ` Affected rows: ${scan.affected_rows}.`
        );
        return;
      }

      if (scan.status_scan === 'warning') {
        setStatusType('warning');
        setStatusMessage(
          `${siswa?.nama_lengkap || 'Siswa'} perlu perhatian: ${scan.message}` +
            ` Reason: ${scan.warning_reason}.`
        );
        return;
      }

      if (scan.status_scan === 'ditolak') {
        processedPayloadsRef.current.add(fingerprint);

        if (siswaId) {
          processedStudentIdsRef.current.add(siswaId);
        }

        setStatusType('warning');
        setStatusMessage(
          `${siswa?.nama_lengkap || 'Siswa'} sudah presensi pada jam ini.` +
            ' Ini bukan error, scan duplikat ditolak sistem.'
        );
        return;
      }

      if (scan.status_scan === 'invalid') {
        setStatusType('error');
        setStatusMessage('QR tidak dikenal. Data tidak masuk presensi.');
        return;
      }

      setStatusType('info');
      setStatusMessage(`Scan selesai dengan status: ${scan.status_scan}.`);
    },
    [payloadRaw, presensiSesiId, token]
  );

  return { handleSubmitScan };
}
