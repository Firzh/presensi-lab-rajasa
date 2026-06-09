import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';

import { LoginBrandPanel } from '../components/auth/LoginBrandPanel.jsx';
import { LoginForm } from '../components/auth/LoginForm.jsx';
import { PasswordField } from '../components/auth/PasswordField.jsx';
import { login } from '../api/authApi.js';
import { clearAuthSession } from '../lib/authSession.js';

vi.mock('../api/authApi.js', () => ({
  login: vi.fn(),
}));

afterEach(() => {
  cleanup();
  clearAuthSession();
  vi.clearAllMocks();
});

describe('login components', () => {
  it('renders brand panel content', () => {
    render(<LoginBrandPanel />);

    expect(screen.getByText('Sistem Presensi Lab')).toBeTruthy();
    expect(screen.getByText('SMK Rajasa Surabaya')).toBeTruthy();
    expect(screen.getByText('IoT Based')).toBeTruthy();
    expect(screen.getByText('Secure')).toBeTruthy();
    expect(screen.getByText('Real-Time')).toBeTruthy();
  });

  it('renders password field and toggle button', () => {
    const onTogglePassword = vi.fn();

    render(
      <PasswordField
        value="secret"
        showPassword={false}
        onInput={vi.fn()}
        onTogglePassword={onTogglePassword}
      />,
    );

    expect(screen.getByLabelText('Password').type).toBe('password');

    fireEvent.click(screen.getByLabelText('Tampilkan password'));

    expect(onTogglePassword).toHaveBeenCalledTimes(1);
  });

  it('shows validation message when username and password are empty', async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Username dan password wajib diisi.')).toBeTruthy();
  });

  it('submits login and saves auth session', async () => {
    login.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        success: true,
        message: 'Login berhasil.',
        data: {
          token: 'token-demo',
          user: { id: 1, username: 'admin.demo' },
          roles: ['admin'],
          permissions: ['presensi.scan'],
        },
      },
    });

    const onSuccess = vi.fn();

    render(<LoginForm onSuccess={onSuccess} />);

    fireEvent.input(screen.getByLabelText('Username'), {
      target: { value: 'admin.demo' },
    });

    fireEvent.input(screen.getByLabelText('Password'), {
      target: { value: 'secret' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        username: 'admin.demo',
        password: 'secret',
      });
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith({
        token: 'token-demo',
        user: { id: 1, username: 'admin.demo' },
        roles: ['admin'],
        permissions: ['presensi.scan'],
    });
    expect(screen.getByText('Login berhasil.')).toBeTruthy();
  });
});