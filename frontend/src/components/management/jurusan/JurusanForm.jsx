import { useState } from 'preact/hooks';
import clsx from 'clsx';

import { AppSelect } from '../../ui/AppSelect.jsx';

const emptyForm = Object.freeze({
  kode_jurusan: '',
  nama_jurusan: '',
  ketua_jurusan: '',
  deskripsi_jurusan: '',
  status: 'aktif',
});

export function JurusanForm({ initialData, theme = 'light', onCancel, onSubmit, onDisable }) {
  const [form, setForm] = useState(initialData ?? emptyForm);
  const isDark = theme === 'dark';

  const inputClass = clsx(
    'h-12 w-full rounded-xl border px-4 text-sm font-medium outline-none transition',
    isDark
      ? 'border-[#64717d] bg-[#56616d] text-[#F0EDE4] placeholder:text-[#F0EDE4]/70 focus:border-[#F0EDE4] focus:ring-2 focus:ring-[#F0EDE4]/20'
      : 'border-[#d5dde8] bg-white text-[#43505a] placeholder:text-[#8b9298] focus:border-[#7ea4d4] focus:ring-2 focus:ring-[#7ea4d4]/20',
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
    <section className={clsx('mt-8 rounded-xl px-4 py-6 sm:px-8 sm:py-8 xl:px-12 xl:py-10', isDark ? 'bg-[#313b45]' : 'bg-white')}>
      <h2 className={clsx('mb-8 text-2xl font-extrabold', isDark ? 'text-[#f4f1ec]' : 'text-[#43505a]')}>
        {initialData ? 'Edit Data Jurusan' : 'Tambah Data Jurusan'}
      </h2>

      <form className="grid gap-5 sm:gap-7" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7">
          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Kode Jurusan
            <input
              className={inputClass}
              placeholder="Contoh: TKJ"
              value={form.kode_jurusan}
              onInput={(event) => updateForm('kode_jurusan', event.currentTarget.value)}
            />
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Nama Jurusan
            <input
              className={inputClass}
              placeholder="Contoh: Teknik Komputer dan Jaringan"
              value={form.nama_jurusan}
              onInput={(event) => updateForm('nama_jurusan', event.currentTarget.value)}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7">
          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Ketua Jurusan
            <input
              className={inputClass}
              placeholder="Nama ketua jurusan..."
              value={form.ketua_jurusan ?? ''}
              onInput={(event) => updateForm('ketua_jurusan', event.currentTarget.value)}
            />
          </label>

          <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
            Status
            <AppSelect
              theme={theme}
              value={form.status}
              onInput={(event) => updateForm('status', event.currentTarget.value)}
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </AppSelect>
          </label>
        </div>

        <label className="grid gap-3 text-sm font-bold text-[#8b9298]">
          Deskripsi Jurusan
          <textarea
            className={clsx(inputClass, 'min-h-28 resize-none py-4')}
            placeholder="Deskripsi singkat jurusan..."
            value={form.deskripsi_jurusan ?? ''}
            onInput={(event) => updateForm('deskripsi_jurusan', event.currentTarget.value)}
          />
        </label>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-5">
          {initialData ? (
            <button
              type="button"
              className="h-12 w-full rounded-md bg-[#ff6568] font-bold text-white transition hover:bg-[#ef4444] sm:w-44"
              onClick={() => onDisable?.(initialData)}
            >
              Nonaktifkan
            </button>
          ) : null}

          <button
            type="button"
            className={clsx(
              'h-12 w-full rounded-md font-bold transition sm:w-44',
              isDark ? 'bg-[#56616d] text-[#F0EDE4] hover:bg-[#64717d]' : 'bg-[#e9e9e9] text-[#43505a] hover:bg-[#d8dee5]',
            )}
            onClick={onCancel}
          >
            Batal
          </button>

          <button
            type="submit"
            className="h-12 w-full rounded-md bg-[#a9c9f4] font-bold text-[#4f6b8b] transition hover:bg-[#8ab7ef] sm:w-44"
          >
            Simpan
          </button>
        </div>
      </form>
    </section>
  );
}