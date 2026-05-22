import { useState } from 'preact/hooks';
import { loginDev, uploadImportFile } from '../../features/import/services/importApi.js';

export function DevImportPage() {
  const [token, setToken] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('Siap upload import.');
  const [responseJson, setResponseJson] = useState(null);

  const handleLogin = async () => {
    setStatus('Login demo...');
    const result = await loginDev({ username: 'admin.demo', password: 'Rajasa@123' });

    if (!result.ok || !result.data?.success) {
      setStatus(result.data?.message || 'Login gagal.');
      return;
    }

    setToken(result.data.data.token);
    setStatus('Login berhasil.');
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        setStatus('Pilih file dulu.');
        return;
      }

      let activeToken = token;

      if (!activeToken) {
        setStatus('Login otomatis...');
        const login = await loginDev({ username: 'admin.demo', password: 'Rajasa@123' });

        if (!login.ok || !login.data?.success) {
          setStatus(login.data?.message || 'Login gagal.');
          return;
        }

        activeToken = login.data.data.token;
        setToken(activeToken);
      }

      setStatus(`Upload import diproses: ${file.name}`);
      const result = await uploadImportFile({ token: activeToken, file });

      setResponseJson(result.data);
      setStatus(result.data?.message || 'Import selesai.');
    } catch (error) {
      setStatus(error?.message || 'Upload import gagal.');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer?.files?.[0] || null;
    if (droppedFile) setFile(droppedFile);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-4">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase text-blue-700">Tahap 10.1</p>
          <h1 className="text-2xl font-bold">Demo Advanced Import</h1>
          <p className="mt-2 text-sm text-slate-600">
            Upload CSV/XLSX lewat one-gate import. HP bisa pakai tombol pilih file.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <a className="rounded-xl border px-4 py-2 font-semibold" href="/dev/scan">
              Kembali ke Scanner
            </a>
            <button className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white" onClick={handleLogin}>
              Login Demo
            </button>
          </div>

          <div className="mt-4 rounded-xl border bg-slate-50 px-4 py-3 text-sm">{status}</div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div
            className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <p className="font-semibold">Drag & drop file di sini</p>
            <p className="mt-1 text-sm text-slate-500">Format: CSV atau XLSX</p>
            <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              Pilih File
              <input
                className="hidden"
                type="file"
                accept=".csv,.txt,.xlsx"
                onChange={(event) => {
                  const selectedFile = event.currentTarget.files?.[0] || null;
                  setFile(selectedFile);

                  if (selectedFile) {
                    setStatus(`File dipilih: ${selectedFile.name}`);
                  }
                }}
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
            onClick={handleUpload}
          >
            Upload Import
          </button>
        </section>

        {responseJson && (
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Response Import</h2>
            <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
              {JSON.stringify(responseJson, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </main>
  );
}