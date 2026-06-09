import { AppIcon } from '../ui/AppIcon.jsx';

export function PasswordField({
  id = 'password',
  label = 'Password',
  value,
  showPassword,
  disabled = false,
  onInput,
  onTogglePassword,
}) {
  return (
    <div className="login-field-group">
      <label htmlFor={id} className="login-field-label">
        <span className="login-label-icon">
          <AppIcon name="lock" />
        </span>
        {label}
      </label>

      <div className="login-input-wrap">
        <input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          placeholder="Masukkan Password"
          value={value}
          disabled={disabled}
          autoComplete="current-password"
          onInput={onInput}
        />

        <button
          type="button"
          className="login-password-toggle"
          onClick={onTogglePassword}
          disabled={disabled}
          aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
        >
          <AppIcon name={showPassword ? 'eyeSlash' : 'eye'} />
        </button>
      </div>
    </div>
  );
}