import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  createPresensiSession,
  checkPresensiSessionWarning,
  fetchRombelOptions,
  loginDev,
  submitQrScan,
  finishPresensiSession,
  heartbeatPresensiSession,
} from '../../api/presensiScanApi.js';
import {
  DevScanAuthPanel,
  DevScanSessionPanel,
  DevScanScannerPanel,
  DevScanResultPanel,
  Field,
  StatusBox,
} from '../../components/dev-scan/index.js';
import { useQrScanner } from '../../hooks/useQrScanner.js';

import { DEFAULT_PAYLOAD } from '../../constants/devScan.js';
import { getQrFingerprint, getRombelLabel, sortJamIds } from '../../lib/devScanUtils.js';

export function DevScanPage() {
  const processedPayloadsRef = useRef(new Set());
  const processedStudentIdsRef = useRef(new Set());
  const isSubmittingRef = useRef(false);

  const [username, setUsername] = useState('admin.demo');
  const [password, setPassword] = useState('Rajasa@123');
  const [token, setToken] = useState('');

  const [modePresensi, setModePresensi] = useState('rombel');
  const [rombelOptions, setRombelOptions] = useState([]);
  const [selectedRombelId, setSelectedRombelId] = useState('');
  const [isLoadingRombel, setIsLoadingRombel] = useState(false);
  const [selectedJamIds, setSelectedJamIds] = useState([1]);
  const [isJamDropdownOpen, setIsJamDropdownOpen] = useState(false);
  const [ruangPilihan, setRuangPilihan] = useState('kelas');
  const [presensiSesiId, setPresensiSesiId] = useState('');
  const [sessionLabel, setSessionLabel] = useState('');

  const [payloadRaw, setPayloadRaw] = useState(DEFAULT_PAYLOAD);
  const [statusMessage, setStatusMessage] = useState('Siap digunakan.');
  const [statusType, setStatusType] = useState('info');
  const [responseJson, setResponseJson] = useState({
    status: 'ready',
    page: 'DevScanPage',
    tahap: '8.3c',
  });

  const selectedRombel = useMemo(() => {
    return (
      rombelOptions.find((item) => String(item.rombel_id) === String(selectedRombelId)) || null
    );
  }, [rombelOptions, selectedRombelId]);

  const rombelId = useMemo(() => {
    if (modePresensi === 'piket') {
      return '';
    }

    return selectedRombelId;
  }, [modePresensi, selectedRombelId]);

  const rombelLabel = useMemo(() => {
    if (modePresensi === 'piket') {
      return 'Piket';
    }

    return getRombelLabel(selectedRombel);
  }, [modePresensi, selectedRombel]);

  const secureContextMessage = useMemo(() => {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (window.isSecureContext || isLocalhost) {
      return {
        type: 'success',
        message: 'Secure context terdeteksi. Kamera seharusnya bisa meminta izin.',
      };
    }

    return {
      type: 'error',
      message:
        'Bukan secure context. Jika kamera HP gagal dibuka, pakai HTTPS via Cloudflare Tunnel.',
    };
  }, []);

  const showResponse = (result) => {
    setResponseJson(result.data);

    if (!result.ok || !result.data?.success) {
      setStatusType('error');
      setStatusMessage(result.data?.message || 'Request gagal.');
      return false;
    }

    return true;
  };

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

    if (!showResponse(result)) {
      return false;
    }

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

  const handleLogin = async () => {
    setStatusType('info');
    setStatusMessage('Login diproses...');

    const result = await loginDev({ username, password });

    if (!showResponse(result)) {
      return;
    }

    const nextToken = result.data.data.token || '';

    setToken(nextToken);
    setStatusType('success');
    setStatusMessage('Login berhasil. Token tersimpan.');

    await handleLoadRombelOptions(nextToken);
  };

  const handleToggleJam = (jamId) => {
    setSelectedJamIds((current) => {
      if (current.includes(jamId)) {
        return current.filter((id) => id !== jamId);
      }

      return sortJamIds([...current, jamId]);
    });
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

    if (!showResponse(warning)) {
      return;
    }

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

    if (!showResponse(result)) {
      return;
    }

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

  const handleDuplicateUi = ({ siswa, payload }) => {
    const nama = siswa?.nama_lengkap || siswa?.nama || 'Siswa ini';
    const nisn = siswa?.nisn ? ` (${siswa.nisn})` : '';

    setPayloadRaw(payload);
    setResponseJson({
      success: true,
      message: 'Scan diabaikan oleh frontend.',
      data: {
        status_scan: 'diabaikan_frontend',
        reason: 'qr_sudah_dibaca_di_sesi_ini',
        siswa,
      },
    });
    setStatusType('warning');
    setStatusMessage(`${nama}${nisn} sudah discan pada sesi ini. Scan ulang diabaikan.`);
  };

  const handleSubmitScan = useCallback(
    async (payload = payloadRaw) => {
      const cleanPayload = payload.trim();

      if (isSubmittingRef.current) {
        setStatusType('warning');
        setStatusMessage('Scan sebelumnya masih diproses. Tunggu sebentar.');
        return;
      }

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

  const { isScanning, scannerError, startScanner, stopScanner } = useQrScanner({
    elementId: 'qr-reader',
    onScanSuccess: handleSubmitScan,
  });

  const handleModeChange = (value) => {
    setModePresensi(value);

    if (value === 'piket') {
      setRuangPilihan('piket');
      setSelectedJamIds([1, 2]);
      return;
    }

    setRuangPilihan('kelas');
    setSelectedJamIds([1]);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-4">
        <DevScanResultPanel
          statusMessage={statusMessage}
          statusType={statusType}
          responseJson={responseJson}
        />

        <section className="grid gap-4 lg:grid-cols-2">
          <DevScanAuthPanel
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            token={token}
            setToken={setToken}
            isLoadingRombel={isLoadingRombel}
            onLogin={handleLogin}
            onRefreshRombel={() => handleLoadRombelOptions()}
          />

          <DevScanSessionPanel
            modePresensi={modePresensi}
            onModeChange={handleModeChange}
            rombelOptions={rombelOptions}
            selectedRombelId={selectedRombelId}
            setSelectedRombelId={setSelectedRombelId}
            selectedRombel={selectedRombel}
            isLoadingRombel={isLoadingRombel}
            selectedJamIds={selectedJamIds}
            isJamDropdownOpen={isJamDropdownOpen}
            setIsJamDropdownOpen={setIsJamDropdownOpen}
            onToggleJam={handleToggleJam}
            ruangPilihan={ruangPilihan}
            setRuangPilihan={setRuangPilihan}
            rombelLabel={rombelLabel}
            presensiSesiId={presensiSesiId}
            setPresensiSesiId={setPresensiSesiId}
            sessionLabel={sessionLabel}
            onCreateSession={handleCreateSession}
            onFinishSession={handleFinishSession}
          />
        </section>

        <DevScanScannerPanel
          scannerError={scannerError}
          isScanning={isScanning}
          startScanner={startScanner}
          stopScanner={stopScanner}
          payloadRaw={payloadRaw}
          setPayloadRaw={setPayloadRaw}
          onSubmitScan={handleSubmitScan}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Status</h2>
          <div className="mt-3">
            <StatusBox message={statusMessage} type={statusType} />
          </div>

          <h2 className="mt-5 text-lg font-bold">Response JSON</h2>
          <pre className="mt-3 max-h-96 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
            {JSON.stringify(responseJson, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}
