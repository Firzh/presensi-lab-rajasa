import { useState } from 'preact/hooks';
import { loginDev, uploadImportFile } from '../../api/importApi.js';
import {
  DevImportHeader,
  ImportDropzone,
  ImportResultPanel,
} from '../../components/dev-import/index.js';

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

    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.currentTarget.files?.[0] || null;

    setFile(selectedFile);

    if (selectedFile) {
      setStatus(`File dipilih: ${selectedFile.name}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-4">
        <DevImportHeader status={status} onLogin={handleLogin} />

        <ImportDropzone
          file={file}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
        />

        <ImportResultPanel responseJson={responseJson} />
      </div>
    </main>
  );
}