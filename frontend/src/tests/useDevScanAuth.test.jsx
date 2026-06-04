import { h } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/preact';

import { useDevScanAuth } from '../hooks/useDevScanAuth.js';
import { loginDev } from '../api/presensiScanApi.js';

vi.mock('../api/presensiScanApi.js', () => ({
  loginDev: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function AuthHookHarness({ setStatusType, setStatusMessage, showResponse, onLoginSuccess }) {
  const auth = useDevScanAuth({
    setStatusType,
    setStatusMessage,
    showResponse,
  });

  return (
    <div>
      <p data-testid="username">{auth.username}</p>
      <p data-testid="password">{auth.password}</p>
      <p data-testid="token">{auth.token}</p>

      <button type="button" onClick={() => auth.setUsername('operator.demo')}>
        Set Username
      </button>

      <button type="button" onClick={() => auth.setPassword('PasswordBaru')}>
        Set Password
      </button>

      <button type="button" onClick={() => auth.setToken('manual-token')}>
        Set Token
      </button>

      <button type="button" onClick={() => auth.handleLogin({ onLoginSuccess })}>
        Login
      </button>
    </div>
  );
}

describe('useDevScanAuth', () => {
  it('provides default auth state and setters', async () => {
    render(
      <AuthHookHarness
        setStatusType={vi.fn()}
        setStatusMessage={vi.fn()}
        showResponse={vi.fn()}
      />
    );

    expect(screen.getByTestId('username').textContent).toBe('admin.demo');
    expect(screen.getByTestId('password').textContent).toBe('Rajasa@123');
    expect(screen.getByTestId('token').textContent).toBe('');

    await act(async () => {
      screen.getByText('Set Username').click();
      screen.getByText('Set Password').click();
      screen.getByText('Set Token').click();
    });

    expect(screen.getByTestId('username').textContent).toBe('operator.demo');
    expect(screen.getByTestId('password').textContent).toBe('PasswordBaru');
    expect(screen.getByTestId('token').textContent).toBe('manual-token');
  });

  it('logs in, stores token, and calls success callback', async () => {
    const setStatusType = vi.fn();
    const setStatusMessage = vi.fn();
    const showResponse = vi.fn(() => true);
    const onLoginSuccess = vi.fn();

    loginDev.mockResolvedValue({
      ok: true,
      data: {
        success: true,
        data: {
          token: 'token-login',
        },
      },
    });

    render(
      <AuthHookHarness
        setStatusType={setStatusType}
        setStatusMessage={setStatusMessage}
        showResponse={showResponse}
        onLoginSuccess={onLoginSuccess}
      />
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(loginDev).toHaveBeenCalledWith({
      username: 'admin.demo',
      password: 'Rajasa@123',
    });
    expect(showResponse).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('token').textContent).toBe('token-login');
    expect(setStatusType).toHaveBeenCalledWith('success');
    expect(setStatusMessage).toHaveBeenCalledWith('Login berhasil. Token tersimpan.');
    expect(onLoginSuccess).toHaveBeenCalledWith('token-login');
  });

  it('does not store token when showResponse returns false', async () => {
    const showResponse = vi.fn(() => false);
    const onLoginSuccess = vi.fn();

    loginDev.mockResolvedValue({
      ok: false,
      data: {
        success: false,
        message: 'Login gagal.',
      },
    });

    render(
      <AuthHookHarness
        setStatusType={vi.fn()}
        setStatusMessage={vi.fn()}
        showResponse={showResponse}
        onLoginSuccess={onLoginSuccess}
      />
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('token').textContent).toBe('');
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });
});