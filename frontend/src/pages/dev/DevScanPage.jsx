import { useCallback, useMemo, useRef, useState } from 'preact/hooks';
import {
  createPresensiSession,
  loginDev,
  submitQrScan,
} from '../../features/presensi-scan/services/presensiScanApi.js';
import { useQrScanner } from '../../features/presensi-scan/hooks/useQrScanner.js';

const DEFAULT_PAYLOAD =
  'https://docs.google.com/forms/d/e/1FAIpQLSdld41u92r5hCQUzp_HeGNnPN7StSC9LcAlixa9Ymzg4ixkRw/formResponse?usp=pp_url&entry.1743651050=RENDY+PRAWIRA&entry.178375719=0099662619';

const DEMO_ROMBEL_OPTIONS = [
  {
    id: '1',
    label: '10 TKJ 1',
    hint: 'Demo Rendy Prawira',
  },
  {
    id: '18',
    label: '12 TKRO 1',
    hint: 'Demo Muhammad Sobri',
  },
  {
    id: 'custom',
    label: 'Custom rombel ID',
    hint: 'Isi manual jika rombel belum ada di opsi demo',
  },
];

function parseJamIds(value) {
  return value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function getQrFingerprint(payload) {
  return payload.trim().toLowerCase();
}

function StatusBox({ message, type = 'info' }) {
  const className =
    type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : type === 'error'
        ? 'border-red-200 bg-red-50 text-red-800'
        : type === 'warning'
          ? 'border-amber-200 bg-amber-50 text-amber-800'
          : 'border-blue-200 bg-blue-50 text-blue-800';

  return <div className={`rounded-xl border px-4 py-3 text-sm ${className}`}>{message}</div>;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export function DevScanPage() {
  const processedPayloadsRef = useRef(new Set());
  const processedStudentIdsRef = useRef(new Set());
  const isSubmittingRef = useRef(false);

  const [username, setUsername] = useState('admin.demo');
  const [password, setPassword] = useState('Rajasa@123');
  const [token, setToken] = useState('');

  const [modePresensi, setModePresensi] = useState('rombel');
  const [selectedRombelOption, setSelectedRombelOption] = useState('1');
  const [customRombelId, setCustomRombelId] = useState('');
  const [jamIdsText, setJamIdsText] = useState('1');
  const [ruangPilihan, setRuangPilihan] = useState('kelas');
  const [presensiSesiId, setPresensiSesiId] = useState('');
  const [sessionLabel, setSessionLabel] = useState('');

  const [payloadRaw, setPayloadRaw] = useState(DEFAULT_PAYLOAD);
  const [statusMessage, setStatusMessage] = useState('Siap digunakan.');
  const [statusType, setStatusType] = useState('info');
  const [responseJson, setResponseJson] = useState({
    status: 'ready',
    page: 'DevScanPage',
  });

  const selectedRombel = useMemo(() => {
    return (
      DEMO_ROMBEL_OPTIONS.find((item) => item.id === selectedRombelOption) || DEMO_ROMBEL_OPTIONS[0]
    );
  }, [selectedRombelOption]);

  const rombelId = useMemo(() => {
    if (modePresensi === 'piket') {
      return '';
    }

    if (selectedRombelOption === 'custom') {
      return customRombelId;
    }

    return selectedRombelOption;
  }, [customRombelId, modePresensi, selectedRombelOption]);

  const rombelLabel = useMemo(() => {
    if (modePresensi === 'piket') {
      return 'Piket';
    }

    if (selectedRombelOption === 'custom') {
      return customRombelId ? `Custom rombel ID ${customRombelId}` : 'Custom rombel';
    }

    return selectedRombel.label;
  }, [customRombelId, modePresensi, selectedRombel, selectedRombelOption]);

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

  const handleLogin = async () => {
    setStatusType('info');
    setStatusMessage('Login diproses...');

    const result = await loginDev({ username, password });

    if (!showResponse(result)) {
      return;
    }

    setToken(result.data.data.token || '');
    setStatusType('success');
    setStatusMessage('Login berhasil. Token tersimpan.');
  };

  const handleCreateSession = async () => {
    if (!token) {
      setStatusType('error');
      setStatusMessage('Login dulu sebelum membuat sesi.');
      return;
    }

    const jamIds = parseJamIds(jamIdsText);

    if (jamIds.length === 0) {
      setStatusType('error');
      setStatusMessage('Jam IDs wajib diisi, contoh: 1 atau 1,2.');
      return;
    }

    if (modePresensi === 'rombel' && !rombelId) {
      setStatusType('error');
      setStatusMessage('Pilih rombel atau isi custom rombel ID.');
      return;
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
      return;
    }

    setRuangPilihan('kelas');
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Tahap 8.2</p>
          <h1 className="mt-1 text-2xl font-bold">Demo Scan QR Presensi</h1>
          <p className="mt-2 text-sm text-slate-600">
            Halaman ini untuk demo alur presensi via HP. Ini belum frontend final.
          </p>
          <div className="mt-4">
            <StatusBox message={secureContextMessage.message} type={secureContextMessage.type} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">1. Login Demo</h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Username">
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={username}
                  onInput={(event) => setUsername(event.currentTarget.value)}
                />
              </Field>

              <Field label="Password">
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  type="password"
                  value={password}
                  onInput={(event) => setPassword(event.currentTarget.value)}
                />
              </Field>
            </div>

            <button
              className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
              type="button"
              onClick={handleLogin}
            >
              Login
            </button>

            <Field label="Token">
              <textarea
                className="mt-2 min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                value={token}
                onInput={(event) => setToken(event.currentTarget.value)}
                placeholder="Token akan terisi setelah login"
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">2. Buat Sesi</h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Mode">
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={modePresensi}
                  onInput={(event) => handleModeChange(event.currentTarget.value)}
                >
                  <option value="rombel">rombel</option>
                  <option value="piket">piket</option>
                </select>
              </Field>

              <Field label="Rombel">
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                  disabled={modePresensi === 'piket'}
                  value={selectedRombelOption}
                  onInput={(event) => setSelectedRombelOption(event.currentTarget.value)}
                >
                  {DEMO_ROMBEL_OPTIONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>

              {selectedRombelOption === 'custom' && modePresensi === 'rombel' && (
                <Field label="Custom rombel ID">
                  <input
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    type="number"
                    value={customRombelId}
                    onInput={(event) => setCustomRombelId(event.currentTarget.value)}
                    placeholder="Contoh: 18"
                  />
                </Field>
              )}

              <Field label="Jam IDs">
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={jamIdsText}
                  onInput={(event) => setJamIdsText(event.currentTarget.value)}
                  placeholder="Contoh: 1 atau 1,2"
                />
              </Field>

              <Field label="Ruang">
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={ruangPilihan}
                  onInput={(event) => setRuangPilihan(event.currentTarget.value)}
                >
                  <option value="kelas">kelas</option>
                  <option value="lab-tkj-1">lab-tkj-1</option>
                  <option value="lab-tkj-2">lab-tkj-2</option>
                  <option value="lab-tkj-3">lab-tkj-3</option>
                  <option value="lab-tkj-4">lab-tkj-4</option>
                  <option value="piket">piket</option>
                </select>
              </Field>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="font-semibold">Sesi akan dibuat untuk:</p>
              <p>{rombelLabel}</p>
              {selectedRombel.hint && selectedRombelOption !== 'custom' && (
                <p className="text-slate-500">{selectedRombel.hint}</p>
              )}
            </div>

            <button
              className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white"
              type="button"
              onClick={handleCreateSession}
            >
              Buat Sesi
            </button>

            <Field label="Presensi Sesi ID">
              <input
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"
                type="number"
                value={presensiSesiId}
                onInput={(event) => setPresensiSesiId(event.currentTarget.value)}
              />
            </Field>

            {sessionLabel && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Sesi aktif: {sessionLabel}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">3. Scan QR</h2>

          <div
            id="qr-reader"
            className="mt-4 min-h-72 overflow-hidden rounded-2xl border border-slate-300 bg-slate-950"
          />

          {scannerError && (
            <div className="mt-3">
              <StatusBox
                type="error"
                message={`Kamera gagal dibuka: ${scannerError}. Coba HTTPS Cloudflare atau paste payload manual.`}
              />
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              type="button"
              disabled={isScanning}
              onClick={startScanner}
            >
              Buka Kamera
            </button>

            <button
              className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              type="button"
              disabled={!isScanning}
              onClick={stopScanner}
            >
              Tutup Kamera
            </button>
          </div>

          <Field label="Payload hasil scan / paste manual">
            <textarea
              className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              value={payloadRaw}
              onInput={(event) => setPayloadRaw(event.currentTarget.value)}
            />
          </Field>

          <button
            className="mt-4 w-full rounded-xl bg-slate-800 px-4 py-2 font-semibold text-white"
            type="button"
            onClick={() => handleSubmitScan()}
          >
            Kirim Scan Manual
          </button>
        </section>

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
