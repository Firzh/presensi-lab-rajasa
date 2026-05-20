import { useCallback, useMemo, useState } from 'preact/hooks';
import {
  createPresensiSession,
  loginDev,
  submitQrScan,
} from '../../features/presensi-scan/services/presensiScanApi.js';
import { useQrScanner } from '../../features/presensi-scan/hooks/useQrScanner.js';

const DEFAULT_PAYLOAD =
  'https://docs.google.com/forms/d/e/1FAIpQLSdld41u92r5hCQUzp_HeGNnPN7StSC9LcAlixa9Ymzg4ixkRw/formResponse?usp=pp_url&entry.1743651050=RENDY+PRAWIRA&entry.178375719=0099662619';

function parseJamIds(value) {
  return value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function StatusBox({ message, type = 'info' }) {
  const className =
    type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : type === 'error'
        ? 'border-red-200 bg-red-50 text-red-800'
        : 'border-blue-200 bg-blue-50 text-blue-800';

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${className}`}>
      {message}
    </div>
  );
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
  const [username, setUsername] = useState('admin.demo');
  const [password, setPassword] = useState('Rajasa@123');
  const [token, setToken] = useState('');

  const [modePresensi, setModePresensi] = useState('rombel');
  const [rombelId, setRombelId] = useState('1');
  const [jamIdsText, setJamIdsText] = useState('1');
  const [ruangPilihan, setRuangPilihan] = useState('kelas');
  const [presensiSesiId, setPresensiSesiId] = useState('');

  const [payloadRaw, setPayloadRaw] = useState(DEFAULT_PAYLOAD);
  const [statusMessage, setStatusMessage] = useState('Siap digunakan.');
  const [statusType, setStatusType] = useState('info');
  const [responseJson, setResponseJson] = useState({
    status: 'ready',
    page: 'DevScanPage',
  });

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
        'Bukan secure context. Jika kamera HP gagal dibuka, pakai HTTPS via ngrok atau cloudflared.',
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

    const sessionId = result.data.data.session.presensi_sesi_id;

    setPresensiSesiId(String(sessionId));
    setStatusType('success');
    setStatusMessage(`Sesi berhasil dibuat. ID: ${sessionId}`);
  };

  const handleSubmitScan = useCallback(
    async (payload = payloadRaw) => {
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

      if (!payload.trim()) {
        setStatusType('error');
        setStatusMessage('Payload QR kosong.');
        return;
      }

      setPayloadRaw(payload);
      setStatusType('info');
      setStatusMessage('Mengirim hasil scan...');

      const result = await submitQrScan({
        token,
        presensiSesiId,
        payloadRaw: payload,
      });

      if (!showResponse(result)) {
        return;
      }

      const scan = result.data.data;

      setStatusType(scan.status_scan === 'berhasil' ? 'success' : 'info');
      setStatusMessage(
        `Scan: ${scan.status_scan}`
          + (scan.attendance_status ? ` | presensi: ${scan.attendance_status}` : '')
          + ` | affected_rows: ${scan.affected_rows}`,
      );
    },
    [payloadRaw, presensiSesiId, token],
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
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Tahap 8.1
          </p>
          <h1 className="mt-1 text-2xl font-bold">Dev Scan QR Presensi</h1>
          <p className="mt-2 text-sm text-slate-600">
            Halaman ini untuk demo scan via HP. Ini belum frontend final.
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

              <Field label="Rombel ID">
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                  disabled={modePresensi === 'piket'}
                  type="number"
                  value={rombelId}
                  onInput={(event) => setRombelId(event.currentTarget.value)}
                />
              </Field>

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
                message={`Kamera gagal dibuka: ${scannerError}. Coba HTTPS ngrok atau paste payload manual.`}
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
