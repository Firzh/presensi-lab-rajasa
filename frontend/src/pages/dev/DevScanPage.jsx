import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import { useDevScanSession } from '../../hooks/useDevScanSession.js';
import { useDevScanAuth } from '../../hooks/useDevScanAuth.js';
import { useDevScanSubmit } from '../../hooks/useDevScanSubmit.js';
import { useQrScanner } from '../../hooks/useQrScanner.js';
import {
  DevScanAuthPanel,
  DevScanHeader,
  DevScanResultPanel,
  DevScanScannerPanel,
  DevScanSessionPanel,
} from '../../components/dev-scan/index.js';

import { DEFAULT_PAYLOAD } from '../../constants/devScan.js';
import { getRombelLabel, sortJamIds } from '../../lib/devScanUtils.js';

export function DevScanPage() {
  const processedPayloadsRef = useRef(new Set());
  const processedStudentIdsRef = useRef(new Set());
  const isSubmittingRef = useRef(false);

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

  const { username, setUsername, password, setPassword, token, setToken, handleLogin } =
  useDevScanAuth({
    setStatusType,
    setStatusMessage,
    showResponse,
  });

  const handleToggleJam = (jamId) => {
    setSelectedJamIds((current) => {
      if (current.includes(jamId)) {
        return current.filter((id) => id !== jamId);
      }

      return sortJamIds([...current, jamId]);
    });
  };

  const { handleLoadRombelOptions, handleCreateSession, handleFinishSession } = useDevScanSession({
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
  });

  const { handleSubmitScan } = useDevScanSubmit({
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
  });

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
        <DevScanHeader secureContextMessage={secureContextMessage} />

        <section className="grid gap-4 lg:grid-cols-2">
          <DevScanAuthPanel
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            token={token}
            setToken={setToken}
            isLoadingRombel={isLoadingRombel}
            onLogin={() => handleLogin({ onLoginSuccess: handleLoadRombelOptions })}
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

        <DevScanResultPanel
          statusMessage={statusMessage}
          statusType={statusType}
          responseJson={responseJson}
        />
      </div>
    </main>
  );
}
