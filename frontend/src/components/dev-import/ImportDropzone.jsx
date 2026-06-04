export function ImportDropzone({ file, onDrop, onFileChange, onUpload }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div
        className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        <p className="font-semibold">Drag & drop file di sini</p>
        <p className="mt-1 text-sm text-slate-500">Format: CSV atau XLSX</p>

        <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
          Pilih File
          <input
            className="hidden"
            type="file"
            accept=".csv,.txt,.xlsx"
            onChange={onFileChange}
          />
        </label>

        <p className="mt-3 text-sm font-medium text-slate-700">
          {file ? file.name : 'Belum ada file dipilih'}
        </p>
      </div>

      {file && (
        <div className="mt-4 rounded-xl border px-4 py-3 text-sm">
          File dipilih: <strong>{file.name}</strong>
        </div>
      )}

      <button
        type="button"
        className="mt-4 w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-emerald-600"
        disabled={!file}
        onClick={onUpload}
      >
        Upload Import
      </button>
    </section>
  );
}