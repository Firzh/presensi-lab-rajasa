import { useState } from 'preact/hooks';
import { loginDev } from '../api/presensiScanApi.js';

export function useDevScanAuth({ setStatusType, setStatusMessage, showResponse }) {
  const [username, setUsername] = useState('admin.demo');
  const [password, setPassword] = useState('Rajasa@123');
  const [token, setToken] = useState('');

  const handleLogin = async ({ onLoginSuccess } = {}) => {
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

    if (onLoginSuccess) {
      await onLoginSuccess(nextToken);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    token,
    setToken,
    handleLogin,
  };
}