import { useState } from 'preact/hooks';

const ICONS = {
  clock: '/icon/clock-solid.svg',
  eye: '/icon/eye-solid.svg',
  eyeSlash: '/icon/eye-slash-solid.svg',
  idCard: '/icon/id-card-solid.svg',
  lock: '/icon/lock-solid.svg',
  shield: '/icon/shield-halved-solid.svg',
  theme: '/icon/circle-half-stroke-solid-full.svg',
  user: '/icon/user-solid.svg',
  wifi: '/icon/wifi-solid.svg',
};

const FEATURE_BADGES = [
  { label: 'IoT Based', icon: ICONS.wifi },
  { label: 'Secure', icon: ICONS.shield },
  { label: 'Real-Time', icon: ICONS.clock },
];

const maskBase =
  'inline-block shrink-0 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]';

function AssetMask({ className = '', src }) {
  return (
    <span
      aria-hidden="true"
      className={`${maskBase} ${className}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
      }}
    />
  );
}

function FeatureCard({ icon, label }) {
  return (
    <div className="flex h-[82px] w-[84px] flex-col items-center justify-center rounded-2xl bg-white/75 px-2.5 py-3 text-[#496f9d] shadow-[0_14px_30px_rgb(15_23_42_/_0.10)] dark:bg-[#202b33]/85 dark:text-[#eef2f5] sm:h-[92px] sm:w-24 sm:rounded-[18px]">
      <AssetMask className="mb-1.5 h-8 w-8 sm:h-9 sm:w-9" src={icon} />
      <p className="m-0 whitespace-nowrap text-xs font-extrabold leading-none tracking-[-0.02em] sm:text-[13px]">
        {label}
      </p>
    </div>
  );
}

function FormField({
  autoComplete,
  children,
  icon,
  id,
  label,
  onInput,
  placeholder,
  type = 'text',
  value,
}) {
  return (
    <div className="mb-6">
      <label
        className="mb-2 ml-1.5 inline-flex items-center gap-2.5 text-[15px] font-extrabold leading-none text-[#4d75a8] dark:text-[#eef2f5]"
        htmlFor={id}
      >
        <AssetMask className="h-[18px] w-[18px]" src={icon} />
        {label}
      </label>

      <div className="relative">
        <input
          autoComplete={autoComplete}
          className="h-[50px] w-full rounded-[10px] border-[3px] border-[#8b8d8f] bg-transparent px-3.5 pr-11 text-base font-medium text-[#2b3440] outline-none transition placeholder:text-[#8d949d] focus:border-[#6f97c1] focus:shadow-[0_0_0_4px_rgb(111_151_193_/_0.18)] dark:border-[#7a7f84] dark:text-[#eef2f5] dark:placeholder:text-[#8e969d] dark:focus:border-[#7fa9d3] dark:focus:shadow-[0_0_0_4px_rgb(127_169_211_/_0.16)]"
          id={id}
          name={id}
          onInput={onInput}
          placeholder={placeholder}
          type={type}
          value={value}
        />
        {children}
      </div>
    </div>
  );
}

export function LoginPage({ isSubmitting, loginError, onSubmit, onToggleTheme, theme }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      password,
      remember,
      username,
    });
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_50%_120%,rgb(255_255_255_/_0.32)_0%,transparent_26%),linear-gradient(180deg,#6f90b8_0%,#6687ae_56%,#2d4b70_100%)] px-4 py-4 dark:bg-[radial-gradient(circle_at_50%_120%,rgb(255_255_255_/_0.08)_0%,transparent_26%),linear-gradient(180deg,#6f8794_0%,#455c66_56%,#202d34_100%)] sm:px-6 sm:py-7">
      <section
        aria-label="Halaman login sistem presensi lab"
        className="relative grid min-h-[auto] w-full max-w-[1180px] overflow-hidden rounded-[18px] bg-[#f8f8f7] shadow-rajasa dark:bg-[#151c24] lg:min-h-[760px] lg:grid-cols-[46%_54%] lg:rounded-3xl xl:max-w-[1240px]"
      >
        <button
          aria-label={theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-transparent text-[#29323a] dark:text-[#eef2f5] sm:right-5 sm:top-5"
          onClick={onToggleTheme}
          type="button"
        >
          <AssetMask className="h-7 w-7" src={ICONS.theme} />
        </button>

        <section className="grid min-h-[320px] place-items-center bg-[linear-gradient(180deg,rgb(135_169_207_/_0.88)_0%,rgb(97_130_166_/_0.86)_48%,rgb(47_79_118_/_0.94)_100%)] px-6 py-10 text-white dark:bg-[linear-gradient(180deg,rgb(45_63_72_/_0.84)_0%,rgb(93_116_128_/_0.82)_48%,rgb(147_172_184_/_0.86)_100%)] sm:min-h-[360px] sm:px-8 lg:min-h-0">
          <div className="flex w-full flex-col items-center">
            <div className="mb-5 grid h-[88px] w-[88px] place-items-center rounded-full bg-white text-[#5478a6] shadow-[0_18px_42px_rgb(15_23_42_/_0.15)] dark:bg-[#26333d] dark:text-[#eef2f5] sm:h-[108px] sm:w-[108px]">
              <AssetMask className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px]" src={ICONS.idCard} />
            </div>

            <div className="text-center">
              <h1 className="m-0 text-[28px] font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-[34px] lg:text-[38px]">
                Sistem Presensi Lab
              </h1>
              <p className="m-0 mt-2.5 text-base font-extrabold leading-tight sm:text-xl lg:text-[22px]">
                SMK Rajasa Surabaya
              </p>
            </div>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:mt-[38px] lg:mt-[58px] lg:gap-7">
              {FEATURE_BADGES.map((feature) => (
                <FeatureCard icon={feature.icon} key={feature.label} label={feature.label} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid min-h-[620px] grid-rows-[1fr_auto] bg-[#f8f8f7] px-0 pb-[30px] pt-[60px] text-[#2c3440] dark:bg-[#151c24] dark:text-[#eef2f5] sm:pt-[72px] lg:min-h-0 lg:pb-[34px] lg:pt-[88px]">
          <div className="grid place-items-center">
            <div className="w-[88%] sm:w-[min(480px,84%)] lg:w-[min(450px,76%)]">
              <header className="mb-[42px] text-center lg:mb-[54px]">
                <h2 className="m-0 text-[34px] font-[850] leading-[1.05] tracking-[-0.045em] text-[#242b36] dark:text-[#eef2f5] sm:text-5xl">
                  Selamat Datang
                </h2>
                <p className="m-0 mt-2.5 text-[15px] font-medium tracking-[-0.01em] text-[#747b84] dark:text-[#8e969d] sm:text-base">
                  Silahkan masuk untuk mengakses sistem
                </p>
              </header>

              <form className="w-full" onSubmit={handleSubmit}>
                <FormField
                  autoComplete="username"
                  icon={ICONS.user}
                  id="username"
                  label="Username"
                  onInput={(event) => setUsername(event.currentTarget.value)}
                  placeholder="Masukkan Username"
                  value={username}
                />

                <FormField
                  autoComplete="current-password"
                  icon={ICONS.lock}
                  id="password"
                  label="Password"
                  onInput={(event) => setPassword(event.currentTarget.value)}
                  placeholder="Masukkan Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                >
                  <button
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute right-3 top-1/2 grid h-[30px] w-[30px] -translate-y-1/2 place-items-center rounded-full bg-transparent text-[#40484f] dark:text-[#eef2f5]"
                    onClick={() => setShowPassword((currentValue) => !currentValue)}
                    type="button"
                  >
                    <AssetMask
                      className="h-[22px] w-[22px]"
                      src={showPassword ? ICONS.eyeSlash : ICONS.eye}
                    />
                  </button>
                </FormField>

                <div className="-mt-1 mx-1 flex flex-wrap items-start justify-between gap-4 text-sm">
                  <label className="inline-flex cursor-pointer items-center gap-2.5 font-medium text-[#747b84] dark:text-[#8e969d]">
                    <input
                      checked={remember}
                      className="h-[15px] w-[15px] accent-[#7fa9d3]"
                      onChange={(event) => setRemember(event.currentTarget.checked)}
                      type="checkbox"
                    />
                    <span>Ingat Saya</span>
                  </label>

                  <a
                    className="font-extrabold leading-none text-[#3f679a] underline underline-offset-2 dark:text-[#eef2f5]"
                    href="#"
                  >
                    Lupa Password?
                  </a>
                </div>

                {loginError ? (
                  <p className="mx-1 mt-[18px] rounded-[10px] bg-red-500/10 px-3.5 py-3 text-sm font-bold text-red-600">
                    {loginError}
                  </p>
                ) : null}

                <button
                  className="mt-[38px] h-[58px] w-full rounded-lg bg-[#7fa9d3] text-lg font-[850] text-[#1f2a34] transition hover:-translate-y-px hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 dark:text-[#eef2f5] sm:mt-12"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? 'Memproses...' : 'Login'}
                </button>
              </form>
            </div>
          </div>

          <footer className="mt-7 text-center text-sm font-bold leading-[1.18] tracking-[0.03em] text-[#8a8a8a] dark:text-[#8e969d] lg:mt-5">
            <p className="m-0">2026 SMKS Rajasa Surabaya</p>
            <p className="m-0">Tim Magang TKJ</p>
          </footer>
        </section>
      </section>
    </main>
  );
}
