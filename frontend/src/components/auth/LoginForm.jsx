import { useState } from 'preact/hooks';

import { login as loginRequest } from '../../api/authApi.js';
import { saveAuthSession } from '../../lib/authSession.js';
import { AppIcon } from '../ui/AppIcon.jsx';
import { PasswordField } from './PasswordField.jsx';

function getLoginErrorMessage(result) {
  return (
    result?.data?.message ||
    result?.data?.errors?.username?.[0] ||
    result?.data?.errors?.password?.[0] ||
    'Login gagal.'
  );
}

export function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [formStatus, setFormStatus] = useState('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password) {
      setFormStatus('error');
      setFormMessage('Username dan password wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setFormStatus('idle');
    setFormMessage('');

    try {
      const result = await loginRequest({
        username: normalizedUsername,
        password,
      });

      if (!result.ok || result.data?.success === false) {
        throw new Error(getLoginErrorMessage(result));
      }

      const sessionData = result.data?.data;

      if (!sessionData?.token || !sessionData?.user) {
        throw new Error('Response login tidak valid.');
      }

      const session = saveAuthSession(sessionData);

      setFormStatus('success');
      setFormMessage('Login berhasil.');
      onSuccess?.(session);
    } catch (error) {
      setFormStatus('error');
      setFormMessage(error.message || 'Tidak bisa menghubungi server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-field-group">
        <label htmlFor="username" className="login-field-label">
          <span className="login-label-icon">
            <AppIcon name="user" />
          </span>
          Username
        </label>

        <div className="login-input-wrap">
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Masukkan Username"
            value={username}
            disabled={isSubmitting}
            autoComplete="username"
            onInput={(event) => setUsername(event.currentTarget.value)}
          />
        </div>
      </div>

      <PasswordField
        value={password}
        showPassword={showPassword}
        disabled={isSubmitting}
        onInput={(event) => setPassword(event.currentTarget.value)}
        onTogglePassword={() => setShowPassword((current) => !current)}
      />

      <div className="login-form-row">
        <label className="login-remember-box">
          <input
            type="checkbox"
            checked={remember}
            disabled={isSubmitting}
            onChange={(event) => setRemember(event.currentTarget.checked)}
          />
          <span>Ingat Saya</span>
        </label>

        <a href="#forgot-password" className="login-forgot-link">
          Lupa Password?
        </a>
      </div>

      {formMessage ? (
        <p className={`login-alert login-alert--${formStatus}`}>{formMessage}</p>
      ) : null}

      <button type="submit" className="login-button" disabled={isSubmitting}>
        <span>{isSubmitting ? 'Memproses...' : 'Login'}</span>
        <AppIcon name="arrowRightToBracket" />
      </button>
    </form>
  );
}