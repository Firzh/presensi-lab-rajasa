import clsx from 'clsx';

import { AppIcon } from '../../ui/AppIcon.jsx';

export function PresensiScanPanel({
  theme = 'light',
  isSessionActive,
  isScanning,
  scannerError,
  payloadRaw,
  statusMessage,
  statusType,
  onStartScanner,
  onPauseScanner,
  onFinishSession,
  onPayloadChange,
  onSubmitManual,
}) {
  const isDark = theme === 'dark';

  return (
    <section className={clsx('rounded-xl p-5', isDark ? 'bg-[#313b45]' : 'bg-white')}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2
            className={clsx(
              'm-0 text-xl font-extrabold',
              isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]'
            )}
          >
            Scan QR
          </h2>
          <p className="m-0 mt-2 text-sm font-semibold text-[#8b9298]">
            Gunakan kamera HP guru atau paste payload manual untuk pengujian.
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
          'grid min-h-90 place-items-center overflow-hidden rounded-2xl border',
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

      <div className="mt-5 grid grid-cols-2 gap-4">
        <button
          type="button"
          className="h-12 rounded-xl bg-[#a9c9f4] font-extrabold text-[#4f6b8b] transition hover:bg-[#8ab7ef] disabled:opacity-50"
          disabled={!isSessionActive || isScanning}
          onClick={onStartScanner}
        >
          Buka Kamera
        </button>

        <button
          type="button"
          className="h-12 rounded-xl bg-[#ffb65c] font-extrabold text-white transition hover:bg-[#f59e0b] disabled:opacity-50"
          disabled={!isSessionActive || !isScanning}
          onClick={onPauseScanner}
        >
          Pause Scan
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <textarea
          className={clsx(
            'min-h-24 rounded-xl border px-4 py-3 text-xs font-medium outline-none',
            isDark
              ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4]'
              : 'border-[#d5dde8] bg-white text-[#43505a]'
          )}
          value={payloadRaw}
          placeholder="Payload QR manual..."
          onInput={(event) => onPayloadChange(event.currentTarget.value)}
        />

        <div className="grid gap-4">
          <button
            type="button"
            className="h-12 rounded-xl bg-[#56616d] font-extrabold text-[#F0EDE4] transition hover:bg-[#64717d] disabled:opacity-50"
            disabled={!isSessionActive}
            onClick={onSubmitManual}
          >
            Kirim Manual
          </button>

          <button
            type="button"
            className="h-12 rounded-xl bg-[#ff6568] font-extrabold text-white transition hover:bg-[#ef4444] disabled:opacity-50"
            disabled={!isSessionActive}
            onClick={onFinishSession}
          >
            Selesai Scan
          </button>
        </div>
      </div>
    </section>
  );
}
