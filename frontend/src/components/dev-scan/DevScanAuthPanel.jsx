import { Field } from './Field.jsx';

export function DevScanAuthPanel({
  username,
  setUsername,
  password,
  setPassword,
  token,
  setToken,
  isLoadingRombel,
  onLogin,
  onRefreshRombel,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">1. Login Demo</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Username">
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            value={username}
            onInput={(event) => setUsername(event.currentTarget.value)}
          />
        </Field>

        <Field label="Password">
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            type="password"
            value={password}
            onInput={(event) => setPassword(event.currentTarget.value)}
          />
        </Field>
      </div>

      <button
        className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
        type="button"
        onClick={onLogin}
      >
        Login dan Muat Rombel
      </button>

      <button
        className="mt-3 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 font-semibold text-blue-700 disabled:opacity-50"
        type="button"
        disabled={!token || isLoadingRombel}
        onClick={onRefreshRombel}
      >
        {isLoadingRombel ? 'Memuat Rombel...' : 'Refresh Daftar Rombel'}
      </button>

      <Field label="Token">
        <textarea
          className="mt-2 min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
          value={token}
          onInput={(event) => setToken(event.currentTarget.value)}
          placeholder="Token akan terisi setelah login"
        />
      </Field>
    </div>
  );
}
