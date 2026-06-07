import { useState } from 'preact/hooks';
import clsx from 'clsx';

import { AppIcon } from '../../ui/AppIcon.jsx';

const emptyForm = Object.freeze({
  nisn: '',
  nama: '',
  tempatLahir: '',
  tanggalLahir: '',
  jurusan: '',
  kelas: '',
  gender: 'L',
  status: 'Aktif',
  catatan: '',
});

export function SiswaForm({ initialData, theme = 'light', onCancel, onSubmit }) {
  const [form, setForm] = useState(initialData ?? emptyForm);

  const inputClass = clsx(
    'h-12 w-full rounded-md border-0 px-4 text-sm font-medium outline-none',
    theme === 'dark'
      ? 'bg-[#56616d] text-[#f4f1ec] placeholder:text-[#d6dce2]'
      : 'bg-[#e9e9e9] text-[#43505a] placeholder:text-[#8b9298]'
  );

  function updateForm(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.(form);
  }

  return (
    <section
      className={clsx(
        'mt-10 rounded-xl px-16 py-12',
        theme === 'dark' ? 'bg-[#313b45]' : 'bg-white'
      )}
    >
      <h2
        className={clsx(
          'mb-9 text-2xl font-extrabold',
          theme === 'dark' ? 'text-[#f4f1ec]' : 'text-[#43505a]'
        )}
      >
        {initialData ? 'Edit Data Siswa' : 'Tambah Data Siswa'}
      </h2>

      <form className="grid gap-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-[1.4fr_1.4fr_1fr_1fr] gap-9">
          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            NISN / NIS*
            <input
              required
              className={inputClass}
              placeholder="NISN..."
              value={form.nisn}
              onInput={(event) => updateForm('nisn', event.currentTarget.value)}
            />
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Nama Lengkap*
            <input
              required
              className={inputClass}
              placeholder="Nama..."
              value={form.nama}
              onInput={(event) => updateForm('nama', event.currentTarget.value)}
            />
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Tempat Lahir
            <input
              className={inputClass}
              placeholder="Tempat lahir..."
              value={form.tempatLahir}
              onInput={(event) => updateForm('tempatLahir', event.currentTarget.value)}
            />
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Tanggal Lahir
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6f7c86]">
                <AppIcon name="calendar" />
              </span>
              <input
                className={clsx(inputClass, 'pl-12')}
                type="date"
                value={form.tanggalLahir}
                onInput={(event) => updateForm('tanggalLahir', event.currentTarget.value)}
              />
            </div>
          </label>
        </div>

        <div className="grid grid-cols-[1.4fr_1.4fr_1.4fr] gap-9">
          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Jurusan*
            <select
              required
              className={inputClass}
              value={form.jurusan}
              onInput={(event) => updateForm('jurusan', event.currentTarget.value)}
            >
              <option value="">Pilih Jurusan</option>
              <option value="TKJ">TKJ</option>
              <option value="RPL">RPL</option>
            </select>
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Kelas*
            <select
              required
              className={inputClass}
              value={form.kelas}
              onInput={(event) => updateForm('kelas', event.currentTarget.value)}
            >
              <option value="">Pilih Kelas</option>
              <option value="X-1">X-1</option>
              <option value="X-2">X-2</option>
              <option value="XI-1">XI-1</option>
            </select>
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Catatan
            <input
              className={inputClass}
              placeholder="Catatan..."
              value={form.catatan}
              onInput={(event) => updateForm('catatan', event.currentTarget.value)}
            />
          </label>
        </div>

        <div className="grid grid-cols-[120px_180px_1fr] gap-9">
          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Gender*
            <select
              required
              className={inputClass}
              value={form.gender}
              onInput={(event) => updateForm('gender', event.currentTarget.value)}
            >
              <option value="L">L / P</option>
              <option value="L">L</option>
              <option value="P">P</option>
            </select>
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Status
            <select
              className={inputClass}
              value={form.status}
              onInput={(event) => updateForm('status', event.currentTarget.value)}
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </label>

          <div className="flex items-end justify-end gap-9">
            <button
              type="submit"
              className="h-12 w-44 rounded-md bg-[#a9c9f4] font-bold text-[#4f6b8b] transition hover:bg-[#8ab7ef]"
            >
              Simpan
            </button>

            <button
              type="button"
              className="h-12 w-44 rounded-md bg-[#ff6568] font-bold text-white transition hover:bg-[#ef4444]"
              onClick={onCancel}
            >
              Batal
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
