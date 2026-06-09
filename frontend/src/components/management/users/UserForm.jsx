import { useState } from 'preact/hooks';
import clsx from 'clsx';

import {
  formatDateFromInput,
  normalizeDateForInput,
  USER_JURUSAN_OPTIONS,
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  USER_TYPE_OPTIONS,
} from '../../../lib/adminUsersUtils.js';
import { AppSelect } from '../../ui/AppSelect.jsx';

const emptyForm = Object.freeze({
  username: '',
  nama_lengkap: '',
  password: '',
  role: 'Siswa',
  tipe_user: 'Siswa',
  jurusan: 'TKJ',
  status: 'Aktif',
  valid_hingga: '',
  catatan: '',
});

export function UserForm({ initialData, theme = 'light', onCancel, onSubmit }) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(initialData ?? {}),
    valid_hingga: normalizeDateForInput(initialData?.valid_hingga) || emptyForm.valid_hingga,
  }));
  const isDark = theme === 'dark';

  const inputClass = clsx(
    'h-12 w-full rounded-lg border-0 px-4 text-sm font-medium outline-none transition focus:ring-2',
    isDark
      ? 'bg-[#56616d] text-[#f4f1ec] placeholder:text-[#f4f1ec]/60 hover:bg-[#64717d] focus:ring-[#f4f1ec]/20'
      : 'bg-[#e9e9e9] text-[#43505a] placeholder:text-[#8b9298] hover:bg-[#dfe4ea] focus:ring-[#7ea4d4]/25'
  );

  function updateForm(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.({
      ...form,
      valid_hingga: formatDateFromInput(form.valid_hingga),
      login_terakhir: initialData?.login_terakhir ?? '-',
      id: initialData?.id ?? Date.now(),
    });
  }

  return (
    <section
      className={clsx(
        'mt-6 rounded-xl px-4 py-6 sm:px-8 sm:py-8 xl:px-12 xl:py-10',
        isDark ? 'bg-[#313b45]' : 'bg-white'
      )}
    >
      <h2 className={clsx('mb-8 text-2xl font-extrabold', isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]')}>
        {initialData ? 'Edit Data Users' : 'Tambah Data Users'}
      </h2>

      <form className="grid gap-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 xl:gap-7">
          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Username*
            <input
              required
              className={inputClass}
              placeholder="Username..."
              value={form.username}
              onInput={(event) => updateForm('username', event.currentTarget.value)}
            />
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Nama Lengkap*
            <input
              required
              className={inputClass}
              placeholder="Nama..."
              value={form.nama_lengkap}
              onInput={(event) => updateForm('nama_lengkap', event.currentTarget.value)}
            />
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Password{initialData ? '' : '*'}
            <input
              required={!initialData}
              type="password"
              className={inputClass}
              placeholder={initialData ? 'Kosongkan jika tidak diganti' : 'Password...'}
              value={form.password}
              onInput={(event) => updateForm('password', event.currentTarget.value)}
            />
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Valid Hingga
            <input
              type="date"
              className={inputClass}
              value={form.valid_hingga}
              onInput={(event) => updateForm('valid_hingga', event.currentTarget.value)}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 xl:gap-7">
          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Role*
            <AppSelect
              theme={theme}
              icon="userShield"
              value={form.role}
              onInput={(event) => updateForm('role', event.currentTarget.value)}
            >
              {USER_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AppSelect>
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Tipe User*
            <AppSelect
              theme={theme}
              icon="usersGear"
              value={form.tipe_user}
              onInput={(event) => updateForm('tipe_user', event.currentTarget.value)}
            >
              {USER_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AppSelect>
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Jurusan*
            <AppSelect
              theme={theme}
              icon="building"
              value={form.jurusan}
              onInput={(event) => updateForm('jurusan', event.currentTarget.value)}
            >
              {USER_JURUSAN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AppSelect>
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Status
            <AppSelect
              theme={theme}
              icon="circleCheck"
              value={form.status}
              onInput={(event) => updateForm('status', event.currentTarget.value)}
            >
              {USER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AppSelect>
          </label>
        </div>

        <label className="grid gap-3 text-sm font-bold text-[#8b9298] md:max-w-2xl">
          Catatan
          <input
            className={inputClass}
            placeholder="Catatan..."
            value={form.catatan ?? ''}
            onInput={(event) => updateForm('catatan', event.currentTarget.value)}
          />
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end sm:gap-5">
          <button
            type="submit"
            className="h-12 w-full rounded-md bg-[#a9c9f4] font-bold text-[#4f6b8b] transition hover:-translate-y-0.5 hover:bg-[#8ab7ef] sm:w-44"
          >
            Simpan
          </button>

          <button
            type="button"
            className="h-12 w-full rounded-md bg-[#ff6568] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#ef4444] sm:w-44"
            onClick={onCancel}
          >
            Batal
          </button>
        </div>
      </form>
    </section>
  );
}
