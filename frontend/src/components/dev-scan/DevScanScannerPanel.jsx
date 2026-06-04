import { Field } from './Field.jsx';
import { StatusBox } from './StatusBox.jsx';

export function DevScanScannerPanel({
  scannerError,
  isScanning,
  startScanner,
  stopScanner,
  payloadRaw,
  setPayloadRaw,
  onSubmitScan,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">3. Scan QR</h2>

      <div
        id="qr-reader"
        className="qr-reader-enhanced mt-4 min-h-115 overflow-hidden rounded-2xl border border-slate-300 bg-slate-950"
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
        onClick={() => onSubmitScan()}
      >
        Kirim Scan Manual
      </button>
    </section>
  );
}
