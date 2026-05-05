#!/usr/bin/env bash
set -euo pipefail

mkdir -p frontend/src
cp frontend/src/app.jsx frontend/src/app.jsx.bak.$(date +%Y%m%d%H%M%S) 2>/dev/null || true
cp frontend/src/app.css frontend/src/app.css.bak.$(date +%Y%m%d%H%M%S) 2>/dev/null || true
cp frontend/src/index.css frontend/src/index.css.bak.$(date +%Y%m%d%H%M%S) 2>/dev/null || true
cp frontend/src/main.jsx frontend/src/main.jsx.bak.$(date +%Y%m%d%H%M%S) 2>/dev/null || true

cat > frontend/src/app.jsx <<'EOF_APP_JSX'
import { useEffect, useMemo, useState } from 'preact/hooks'
import './app.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const AUTH_USER_KEY = 'rajasa-auth-user'
const THEME_KEY = 'rajasa-presensi-theme'
const STUDENTS_KEY = 'rajasa-data-siswa'
const LIST_ROUTE = '/dashboard/admin/manajemen/data-siswa'
const ADD_ROUTE = `${LIST_ROUTE}/tambah`

const JURUSAN_OPTIONS = ['TKJ', 'RPL', 'MM', 'DKV', 'TKR']
const KELAS_OPTIONS = ['X-1', 'X-2', 'XI-1', 'XI-2', 'XII-1', 'XII-2']
const STATUS_OPTIONS = ['Aktif', 'Lulus', 'Keluar', 'Mutasi']
const GENDER_OPTIONS = ['L', 'P']
const PAGE_SIZE = 10

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/'
  return pathname.replace(/\/$/, '') || '/'
}

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function createSeedStudents() {
  return Array.from({ length: 24 }, (_, index) => ({
    id: `seed-${index + 1}`,
    nisn: '0068234587',
    nis: `24${String(index + 1).padStart(4, '0')}`,
    namaLengkap: 'RACHMAD HIDAYAT',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2008-03-12',
    jurusan: index % 5 === 0 ? 'RPL' : 'TKJ',
    kelas: index % 3 === 0 ? 'XI-1' : 'X-1',
    gender: index % 4 === 0 ? 'P' : 'L',
    status: 'Aktif',
    catatan: '',
  }))
}

function loadStudents() {
  const stored = readJson(STUDENTS_KEY, null)
  if (Array.isArray(stored)) return stored
  return createSeedStudents()
}

function iconPath(name) {
  return `/icon/${name}`
}

function Icon({ name, className = '' }) {
  return <img className={`icon ${className}`} src={iconPath(name)} alt="" aria-hidden="true" />
}

function useClientRoute() {
  const [route, setRoute] = useState(() => {
    if (typeof window === 'undefined') return '/'
    return normalizePath(window.location.pathname)
  })

  useEffect(() => {
    const onPopState = () => setRoute(normalizePath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function navigate(path) {
    const nextPath = normalizePath(path)
    window.history.pushState(null, '', nextPath)
    setRoute(nextPath)
  }

  return [route, navigate]
}

function ThemeButton({ theme, onToggle }) {
  return (
    <button className="theme-chip" type="button" onClick={onToggle} aria-label="Ganti tema">
      <Icon name="circle-half-stroke-solid-full.svg" />
    </button>
  )
}

function LoginPage({ theme, onToggleTheme, onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password, remember }),
      })

      const data = await response.json()
      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Login gagal.')
      }

      onLogin(data.user)
    } catch (err) {
      setError(err.message || 'Tidak bisa menghubungi server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <ThemeButton theme={theme} onToggle={onToggleTheme} />

        <div className="login-brand-panel">
          <div className="login-brand-content">
            <div className="login-logo-mark">
              <Icon name="microscope-solid-full.svg" />
            </div>
            <h1>Sistem Presensi Lab</h1>
            <p>SMK Rajasa Surabaya</p>
            <div className="login-feature-list">
              <span><Icon name="wifi-solid-full.svg" /> IoT Based</span>
              <span><Icon name="shield-halved-solid-full.svg" /> Secure</span>
              <span><Icon name="clock-solid-full.svg" /> Real-Time</span>
            </div>
          </div>
        </div>

        <div className="login-form-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-heading">
              <h2>Selamat Datang</h2>
              <p>Silahkan masuk untuk mengakses sistem</p>
            </div>

            <label className="login-field">
              <span><Icon name="user-solid-full.svg" /> Username</span>
              <input
                type="text"
                value={username}
                onInput={(event) => setUsername(event.currentTarget.value)}
                placeholder="Masukkan username"
                autocomplete="username"
                required
              />
            </label>

            <label className="login-field">
              <span><Icon name="lock-solid-full.svg" /> Password</span>
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onInput={(event) => setPassword(event.currentTarget.value)}
                  placeholder="Masukkan password"
                  autocomplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-eye"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label="Tampilkan password"
                >
                  <Icon name="eye-solid-full.svg" />
                </button>
              </div>
            </label>

            <div className="login-row">
              <label>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.currentTarget.checked)}
                />
                Ingat Saya
              </label>
              <a href="#forgot">Lupa Password?</a>
            </div>

            {error && <p className="login-alert">{error}</p>}

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Memproses...' : 'Login'}
            </button>

            <footer className="login-footer">
              <p>2026 SMKS Rajasa Surabaya</p>
              <p>Tim Magang TKJ</p>
            </footer>
          </form>
        </div>
      </section>
    </main>
  )
}

function Topbar({ user, theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <Icon name="magnifying-glass-solid-full.svg" />
        <input type="search" placeholder="Cari..." aria-label="Cari global" />
      </div>

      <div className="topbar-actions">
        <ThemeButton theme={theme} onToggle={onToggleTheme} />
        <button className="topbar-icon-button" type="button" aria-label="Notifikasi">
          <Icon name="bell-solid-full.svg" />
        </button>
        <div className="profile-chip">
          <div className="profile-avatar">A</div>
          <div>
            <strong>{user?.nama_lengkap || 'Administrator Utama'}</strong>
            <span>{user?.primary_role_name || 'Admin Operator'}</span>
          </div>
          <Icon name="angle-down-solid-full.svg" />
        </div>
      </div>
    </header>
  )
}

function Sidebar({ route, navigate, onLogout }) {
  const dataSiswaActive = route.includes('/manajemen/data-siswa') || route === '/dashboard/admin'

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo"><Icon name="microscope-solid-full.svg" /></div>
        <div>
          <h1>Presensi Lab</h1>
          <p>SMK RAJASA SURABAYA</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Menu utama">
        <button type="button" className="nav-item" onClick={() => navigate('/dashboard/admin')}>
          <Icon name="house-solid-full.svg" /> Dashboard
        </button>

        <div className="nav-group">
          <button type="button" className="nav-group-title">
            <Icon name="users-gear-solid-full.svg" /> Manajemen <Icon name="angle-down-solid-full.svg" />
          </button>
          <button
            type="button"
            className={`nav-item nav-child ${dataSiswaActive ? 'active' : ''}`}
            onClick={() => navigate(LIST_ROUTE)}
          >
            <Icon name="user-graduate-solid-full.svg" /> Data Siswa
          </button>
          <button type="button" className="nav-item nav-child" onClick={() => navigate('/dashboard/admin/manajemen/data-jurusan')}>
            <Icon name="building-solid-full.svg" /> Data Jurusan
          </button>
          <button type="button" className="nav-item nav-child" onClick={() => navigate('/dashboard/admin/manajemen/data-ruangan')}>
            <Icon name="door-open-solid-full.svg" /> Data Ruangan
          </button>
          <button type="button" className="nav-item nav-child" onClick={() => navigate('/dashboard/admin/laporan')}>
            <Icon name="list-solid-full.svg" /> Laporan
          </button>
        </div>

        <div className="nav-group admin-group">
          <button type="button" className="nav-group-title">
            <Icon name="user-shield-solid-full.svg" /> Admin <Icon name="angle-down-solid-full.svg" />
          </button>
          <button type="button" className="nav-item nav-child" onClick={() => navigate('/dashboard/admin/users')}>
            <Icon name="users-solid-full.svg" /> Kelola Users
          </button>
          <button type="button" className="nav-item nav-child" onClick={() => navigate('/dashboard/admin/log-users')}>
            <Icon name="triangle-exclamation-solid-full.svg" /> Log Users
          </button>
          <button type="button" className="nav-item nav-child" onClick={() => navigate('/dashboard/admin/pengaturan')}>
            <Icon name="gear-solid-full.svg" /> Pengaturan
          </button>
        </div>
      </nav>

      <button className="logout-side" type="button" onClick={onLogout}>
        <Icon name="arrow-right-to-bracket-solid-full.svg" /> Keluar
      </button>
    </aside>
  )
}

function AppLayout({ user, route, navigate, onLogout, theme, onToggleTheme, children }) {
  return (
    <div className="admin-shell">
      <Sidebar route={route} navigate={navigate} onLogout={onLogout} />
      <div className="admin-main">
        <Topbar user={user} theme={theme} onToggleTheme={onToggleTheme} />
        <main className="content-area">{children}</main>
      </div>
    </div>
  )
}

function PageHeading({ action }) {
  return (
    <section className="page-heading">
      <div>
        <h2>Data Siswa</h2>
        <p>Kelola data siswa SMK Rajasa Surabaya</p>
      </div>
      {action}
    </section>
  )
}

function FilterControl({ icon, children }) {
  return (
    <div className="filter-control">
      <Icon name={icon} />
      {children}
    </div>
  )
}

function EmptyState() {
  return (
    <tr>
      <td colSpan="8">
        <div className="empty-state">
          <Icon name="inbox-solid-full.svg" />
          <p>Tidak ada data siswa</p>
        </div>
      </td>
    </tr>
  )
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const visible = Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 3)

  return (
    <div className="pagination">
      <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} aria-label="Halaman sebelumnya">
        ‹
      </button>
      {visible.map((item) => (
        <button
          key={item}
          type="button"
          className={item === page ? 'active' : ''}
          onClick={() => onPageChange(item)}
        >
          {item}
        </button>
      ))}
      {totalPages > 3 && <span>...</span>}
      <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} aria-label="Halaman berikutnya">
        ›
      </button>
    </div>
  )
}

function DataSiswaListPage({ students, navigate }) {
  const [search, setSearch] = useState('')
  const [jurusan, setJurusan] = useState('')
  const [kelas, setKelas] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return students.filter((student) => {
      const matchKeyword = !keyword || [student.nisn, student.nis, student.namaLengkap]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

      const matchJurusan = !jurusan || student.jurusan === jurusan
      const matchKelas = !kelas || student.kelas === kelas
      const matchStatus = !status || student.status === status

      return matchKeyword && matchJurusan && matchKelas && matchStatus
    })
  }, [students, search, jurusan, kelas, status])

  useEffect(() => setPage(1), [search, jurusan, kelas, status])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))
  const currentStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <PageHeading
        action={
          <button className="primary-action" type="button" onClick={() => navigate(ADD_ROUTE)}>
            <Icon name="plus-solid-full.svg" /> Tambah Siswa
          </button>
        }
      />

      <section className="filter-card" aria-label="Filter data siswa">
        <FilterControl icon="magnifying-glass-solid-full.svg">
          <input
            type="search"
            value={search}
            onInput={(event) => setSearch(event.currentTarget.value)}
            placeholder="Cari NISN, NIS, atau nama..."
          />
        </FilterControl>
        <FilterControl icon="building-solid-full.svg">
          <select value={jurusan} onInput={(event) => setJurusan(event.currentTarget.value)}>
            <option value="">Semua Jurusan</option>
            {JURUSAN_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </FilterControl>
        <FilterControl icon="graduation-cap-solid-full.svg">
          <select value={kelas} onInput={(event) => setKelas(event.currentTarget.value)}>
            <option value="">Semua Kelas</option>
            {KELAS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </FilterControl>
        <FilterControl icon="toggle-on-solid-full.svg">
          <select value={status} onInput={(event) => setStatus(event.currentTarget.value)}>
            <option value="">Semua Status</option>
            {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </FilterControl>
      </section>

      <section className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>NO</th>
                <th>NISN/NIS</th>
                <th>NAMA LENGKAP</th>
                <th>JURUSAN</th>
                <th>KELAS</th>
                <th>GENDER</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length === 0 ? <EmptyState /> : currentStudents.map((student, index) => (
                <tr key={student.id}>
                  <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td>{student.nisn || student.nis}</td>
                  <td>{student.namaLengkap}</td>
                  <td>{student.jurusan}</td>
                  <td>{student.kelas}</td>
                  <td>{student.gender}</td>
                  <td>{student.status}</td>
                  <td>
                    <button
                      className="edit-button"
                      type="button"
                      onClick={() => navigate(`${LIST_ROUTE}/${student.id}/edit`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </section>
    </>
  )
}

function FormField({ label, required, children }) {
  return (
    <label className="form-field">
      <span>{label}{required ? '*' : ''}</span>
      {children}
    </label>
  )
}

function FormInput({ icon, ...props }) {
  return (
    <div className="field-with-icon">
      {icon && <Icon name={icon} />}
      <input {...props} />
    </div>
  )
}

function FormSelect({ icon, children, ...props }) {
  return (
    <div className="field-with-icon select-wrap">
      {icon && <Icon name={icon} />}
      <select {...props}>{children}</select>
    </div>
  )
}

function createBlankStudent() {
  return {
    nisn: '',
    nis: '',
    namaLengkap: '',
    tempatLahir: '',
    tanggalLahir: '',
    jurusan: '',
    kelas: '',
    gender: '',
    status: 'Aktif',
    catatan: '',
  }
}

function DataSiswaFormPage({ students, route, onSave, navigate }) {
  const editMatch = route.match(/\/manajemen\/data-siswa\/([^/]+)\/edit$/)
  const editId = editMatch?.[1] || null
  const editedStudent = editId ? students.find((student) => student.id === editId) : null
  const [form, setForm] = useState(() => editedStudent || createBlankStudent())

  useEffect(() => {
    setForm(editedStudent || createBlankStudent())
  }, [editId])

  function setValue(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSave(form, editId)
    navigate(LIST_ROUTE)
  }

  return (
    <>
      <PageHeading />

      <section className="student-form-card">
        <h3>{editId ? 'Edit Data Siswa' : 'Tambah Data Siswa'}</h3>

        <form className="student-form" onSubmit={handleSubmit}>
          <div className="student-form-grid">
            <FormField label="NISN / NIS" required>
              <FormInput
                icon="hashtag-solid-full.svg"
                type="text"
                value={form.nisn}
                onInput={(event) => setValue('nisn', event.currentTarget.value)}
                placeholder="NISN..."
                required
              />
            </FormField>

            <FormField label="Nama Lengkap" required>
              <FormInput
                type="text"
                value={form.namaLengkap}
                onInput={(event) => setValue('namaLengkap', event.currentTarget.value)}
                placeholder="Nama..."
                required
              />
            </FormField>

            <FormField label="Tempat Lahir">
              <FormInput
                type="text"
                value={form.tempatLahir}
                onInput={(event) => setValue('tempatLahir', event.currentTarget.value)}
                placeholder="Tempat lahir...."
              />
            </FormField>

            <FormField label="Tanggal Lahir">
              <FormInput
                icon="calendar-days-solid-full.svg"
                type="text"
                value={form.tanggalLahir}
                onInput={(event) => setValue('tanggalLahir', event.currentTarget.value)}
                placeholder="dd/mm/yyyy"
              />
            </FormField>

            <FormField label="Jurusan" required>
              <FormSelect
                icon="building-solid-full.svg"
                value={form.jurusan}
                onInput={(event) => setValue('jurusan', event.currentTarget.value)}
                required
              >
                <option value="">Pilih Jurusan</option>
                {JURUSAN_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </FormSelect>
            </FormField>

            <FormField label="Kelas" required>
              <FormSelect
                icon="graduation-cap-solid-full.svg"
                value={form.kelas}
                onInput={(event) => setValue('kelas', event.currentTarget.value)}
                required
              >
                <option value="">Pilih Kelas</option>
                {KELAS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </FormSelect>
            </FormField>

            <FormField label="Catatan">
              <FormInput
                type="text"
                value={form.catatan}
                onInput={(event) => setValue('catatan', event.currentTarget.value)}
                placeholder="Catatan..."
              />
            </FormField>

            <div className="form-spacer" />

            <FormField label="Gender" required>
              <FormSelect
                value={form.gender}
                onInput={(event) => setValue('gender', event.currentTarget.value)}
                required
              >
                <option value="">L / P</option>
                {GENDER_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </FormSelect>
            </FormField>

            <FormField label="Status">
              <FormSelect
                value={form.status}
                onInput={(event) => setValue('status', event.currentTarget.value)}
              >
                {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </FormSelect>
            </FormField>
          </div>

          <div className="form-actions">
            <button className="save-button" type="submit">Simpan</button>
            <button className="cancel-button" type="button" onClick={() => navigate(LIST_ROUTE)}>Batal</button>
          </div>
        </form>
      </section>
    </>
  )
}

function PlaceholderPage({ title, navigate }) {
  return (
    <>
      <section className="page-heading">
        <div>
          <h2>{title}</h2>
          <p>Halaman ini belum menjadi fokus implementasi branch manajemen data siswa.</p>
        </div>
      </section>
      <section className="placeholder-card">
        <p>Gunakan menu Data Siswa untuk mengecek routing, daftar, filter, tambah, dan edit siswa.</p>
        <button type="button" className="primary-action" onClick={() => navigate(LIST_ROUTE)}>Ke Data Siswa</button>
      </section>
    </>
  )
}

export function App() {
  const [route, navigate] = useClientRoute()
  const [theme, setTheme] = useState(() => readJson(THEME_KEY, 'light'))
  const [authUser, setAuthUser] = useState(() => readJson(AUTH_USER_KEY, null))
  const [students, setStudents] = useState(loadStudents)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    writeJson(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    writeJson(STUDENTS_KEY, students)
  }, [students])

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  function handleLogin(user) {
    writeJson(AUTH_USER_KEY, user)
    setAuthUser(user)
    navigate(LIST_ROUTE)
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE_URL}/logout`, { method: 'POST', credentials: 'include' })
    } catch {
      // Session lokal tetap dibersihkan walau request logout gagal.
    }
    localStorage.removeItem(AUTH_USER_KEY)
    setAuthUser(null)
    navigate('/')
  }

  function saveStudent(payload, editId) {
    const cleanPayload = {
      ...payload,
      nisn: payload.nisn.trim(),
      namaLengkap: payload.namaLengkap.trim().toUpperCase(),
      tempatLahir: payload.tempatLahir.trim(),
      catatan: payload.catatan.trim(),
    }

    setStudents((current) => {
      if (editId) {
        return current.map((student) => student.id === editId ? { ...student, ...cleanPayload } : student)
      }
      return [
        { ...cleanPayload, id: `siswa-${Date.now()}` },
        ...current,
      ]
    })
  }

  if (!authUser) {
    return <LoginPage theme={theme} onToggleTheme={toggleTheme} onLogin={handleLogin} />
  }

  const routeForRender = route === '/' || route === '/dashboard/admin' ? LIST_ROUTE : route
  const isDataSiswaList = routeForRender === LIST_ROUTE || routeForRender === '/manajemen/data-siswa'
  const isDataSiswaAdd = routeForRender === ADD_ROUTE || routeForRender === '/manajemen/data-siswa/tambah'
  const isDataSiswaEdit = /\/manajemen\/data-siswa\/[^/]+\/edit$/.test(routeForRender)

  let page
  if (isDataSiswaList) {
    page = <DataSiswaListPage students={students} navigate={navigate} />
  } else if (isDataSiswaAdd || isDataSiswaEdit) {
    page = <DataSiswaFormPage students={students} route={routeForRender} onSave={saveStudent} navigate={navigate} />
  } else {
    page = <PlaceholderPage title="Dashboard" navigate={navigate} />
  }

  return (
    <AppLayout
      user={authUser}
      route={routeForRender}
      navigate={navigate}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={toggleTheme}
    >
      {page}
    </AppLayout>
  )
}

EOF_APP_JSX

cat > frontend/src/app.css <<'EOF_APP_CSS'
.login-page {
  width: 100%;
  min-height: 100vh;
  padding: 28px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 120%, var(--page-warm-glow) 0%, transparent 26%), linear-gradient(180deg, var(--page-bg-start) 0%, var(--page-bg-mid) 56%, var(--page-bg-end) 100%);
}

.icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  object-fit: contain;
  filter: var(--app-icon-filter);
}

.login-shell {
  position: relative;
  width: min(1240px, 86vw);
  min-height: min(760px, 88vh);
  display: grid;
  grid-template-columns: 46% 54%;
  overflow: hidden;
  border-radius: 24px;
  background: var(--panel-right-bg);
  box-shadow: var(--shell-shadow);
}

.theme-chip {
  width: 36px;
  height: 36px;
  padding: 0;
  display: inline-grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--admin-text);
  cursor: pointer;
}

.login-shell > .theme-chip {
  position: absolute;
  top: 22px;
  right: 22px;
  z-index: 2;
}

.login-brand-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, var(--brand-overlay-start) 0%, var(--brand-overlay-mid) 48%, var(--brand-overlay-end) 100%);
}

.login-brand-content {
  width: 100%;
  padding: 36px 48px;
  text-align: center;
  color: var(--brand-text);
}

.login-logo-mark {
  width: 108px;
  height: 108px;
  margin: 0 auto 22px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--main-logo-bg);
}

.login-logo-mark .icon {
  width: 62px;
  height: 62px;
}

.login-brand-content h1 {
  margin: 0 0 10px;
  font-size: clamp(28px, 2.1vw, 38px);
  line-height: 1.08;
  letter-spacing: -0.04em;
  font-weight: 800;
}

.login-brand-content p {
  margin: 0;
  font-size: clamp(16px, 1.15vw, 22px);
  line-height: 1.2;
  font-weight: 800;
}

.login-feature-list {
  margin-top: 58px;
  display: flex;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
}

.login-feature-list span {
  width: 108px;
  min-height: 92px;
  padding: 14px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 18px;
  background: var(--feature-bg);
  color: var(--feature-color);
  font-size: 13px;
  font-weight: 800;
}

.login-feature-list .icon {
  width: 34px;
  height: 34px;
}

.login-form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--panel-right-bg);
  color: var(--text-primary);
  padding: 72px 0 34px;
}

.login-form {
  width: min(450px, 76%);
}

.login-heading {
  margin-bottom: 48px;
  text-align: center;
}

.login-heading h2 {
  margin: 0 0 10px;
  color: var(--heading-color);
  font-size: clamp(34px, 2.8vw, 48px);
  line-height: 1.05;
  letter-spacing: -0.045em;
  font-weight: 850;
}

.login-heading p {
  margin: 0;
  color: var(--text-muted);
  font-size: 16px;
  font-weight: 500;
}

.login-field {
  display: block;
  margin-bottom: 24px;
}

.login-field > span {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px 6px;
  color: var(--label-color);
  font-size: 15px;
  font-weight: 800;
}

.login-field input,
.password-wrap input {
  width: 100%;
  height: 50px;
  padding: 0 44px 0 14px;
  border: 3px solid var(--input-border);
  border-radius: 10px;
  outline: none;
  background: var(--input-bg);
  color: var(--input-text);
  font-size: 16px;
  font-weight: 500;
}

.password-wrap {
  position: relative;
}

.password-eye {
  position: absolute;
  top: 50%;
  right: 12px;
  width: 30px;
  height: 30px;
  padding: 0;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
}

.login-row {
  margin: -4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
}

.login-row label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.login-row a {
  color: var(--link-color);
  font-weight: 800;
  text-decoration: underline;
}

.login-alert {
  margin: 18px 4px 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(220, 53, 69, 0.12);
  color: #dc3545;
  font-size: 14px;
  font-weight: 700;
}

.login-submit {
  width: 100%;
  height: 58px;
  margin-top: 48px;
  border: 0;
  border-radius: 8px;
  background: var(--button-bg);
  color: var(--button-text);
  font-size: 18px;
  font-weight: 850;
  cursor: pointer;
}

.login-submit:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.login-footer {
  margin-top: 22px;
  text-align: center;
  color: var(--footer-color);
  font-size: 14px;
  line-height: 1.18;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.login-footer p {
  margin: 0;
}

.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 294px minmax(0, 1fr);
  background: var(--admin-bg);
  color: var(--admin-text);
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 72px;
}

.brand-logo {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
}

.brand-logo .icon {
  width: 48px;
  height: 48px;
}

.sidebar-brand h1 {
  margin: 0 0 4px;
  color: var(--admin-text-strong);
  font-size: 24px;
  line-height: 1;
  font-weight: 850;
  letter-spacing: -0.04em;
}

.sidebar-brand p {
  margin: 0;
  color: var(--admin-muted);
  font-size: 14px;
  line-height: 1;
  font-weight: 600;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-group {
  margin-top: 24px;
}

.nav-item,
.nav-group-title,
.logout-side {
  width: 100%;
  height: 40px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--admin-text);
  text-align: left;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}

.nav-group-title {
  justify-content: flex-start;
}

.nav-group-title .icon:last-child {
  margin-left: auto;
  width: 12px;
  height: 12px;
}

.nav-child {
  width: calc(100% - 18px);
  margin-left: 18px;
}

.nav-item.active {
  background: var(--nav-active-bg);
  color: var(--nav-active-text);
}

.logout-side {
  margin-top: auto;
  background: var(--logout-bg);
}

.admin-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 98px;
  padding: 0 48px 0 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--topbar-bg);
  border-bottom: 1px solid var(--topbar-border);
}

.topbar-search {
  width: 470px;
  height: 40px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 9px;
  background: var(--search-bg);
}

.topbar-search input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--admin-text);
  font-size: 16px;
  font-weight: 600;
}

.topbar-search input::placeholder {
  color: var(--admin-muted);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}

.topbar-icon-button {
  width: 28px;
  height: 28px;
  padding: 0;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.profile-chip {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  width: 45px;
  height: 45px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--avatar-bg);
  color: var(--avatar-text);
  font-size: 16px;
  font-weight: 900;
}

.profile-chip strong,
.profile-chip span {
  display: block;
}

.profile-chip strong {
  color: var(--admin-text-strong);
  font-size: 17px;
  font-weight: 700;
}

.profile-chip span {
  margin-top: 2px;
  color: var(--profile-role);
  font-size: 14px;
  font-weight: 600;
}

.profile-chip > .icon {
  width: 12px;
  height: 12px;
}

.content-area {
  flex: 1;
  padding: 62px 50px 48px;
}

.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 72px;
}

.page-heading h2 {
  margin: 0 0 8px;
  color: var(--admin-text-strong);
  font-size: 30px;
  line-height: 1;
  letter-spacing: -0.04em;
  font-weight: 850;
}

.page-heading p {
  margin: 0;
  color: var(--admin-muted);
  font-size: 16px;
  font-weight: 700;
}

.primary-action {
  min-width: 190px;
  height: 54px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 0;
  border-radius: 7px;
  background: var(--button-soft-bg);
  color: var(--button-soft-text);
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}

.primary-action .icon {
  width: 18px;
  height: 18px;
}

.filter-card {
  width: 100%;
  min-height: 88px;
  margin-bottom: 26px;
  padding: 20px 28px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 28px;
  border-radius: 14px;
  background: var(--card-bg);
}

.filter-control {
  height: 48px;
  display: flex;
  align-items: center;
  background: var(--control-bg);
  border-radius: 6px;
  overflow: hidden;
}

.filter-control > .icon {
  width: 66px;
  height: 100%;
  padding: 14px 21px;
  border-right: 2px solid var(--control-divider);
}

.filter-control input,
.filter-control select {
  width: 100%;
  height: 100%;
  padding: 0 18px;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--control-text);
  font-size: 16px;
  font-weight: 700;
}

.filter-control input::placeholder {
  color: var(--control-placeholder);
}

.filter-control select {
  appearance: none;
  cursor: pointer;
}

.table-card {
  width: 100%;
  min-height: 610px;
  padding: 18px 28px 20px;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  background: var(--card-bg);
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  color: var(--table-text);
}

thead th {
  padding: 0 12px 13px;
  border-bottom: 1px solid var(--table-line);
  color: var(--table-head);
  font-size: 16px;
  font-weight: 900;
  text-align: left;
  white-space: nowrap;
}

thead th:first-child,
tbody td:first-child {
  width: 56px;
  text-align: center;
}

thead th:nth-child(4),
thead th:nth-child(5),
thead th:nth-child(6),
thead th:nth-child(7),
thead th:nth-child(8),
tbody td:nth-child(4),
tbody td:nth-child(5),
tbody td:nth-child(6),
tbody td:nth-child(7),
tbody td:nth-child(8) {
  text-align: center;
}

tbody td {
  padding: 10px 12px;
  color: var(--table-text);
  font-size: 16px;
  font-weight: 850;
  letter-spacing: -0.01em;
}

.edit-button {
  min-width: 88px;
  height: 40px;
  border: 0;
  border-radius: 8px;
  background: var(--edit-bg);
  color: var(--edit-text);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.empty-state {
  min-height: 430px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 18px;
  color: var(--empty-text);
}

.empty-state .icon {
  width: 52px;
  height: 52px;
  opacity: 0.95;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
  font-weight: 850;
}

.pagination {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--pagination-text);
}

.pagination button {
  width: 24px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: inherit;
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;
}

.pagination button.active {
  background: var(--pagination-active-bg);
  color: var(--pagination-active-text);
}

.pagination button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.student-form-card {
  max-width: 1490px;
  min-height: 494px;
  margin: 0 auto;
  padding: 48px 66px;
  border-radius: 14px;
  background: var(--card-bg);
}

.student-form-card h3 {
  margin: 0 0 36px;
  color: var(--admin-text-strong);
  font-size: 28px;
  line-height: 1;
  font-weight: 850;
  letter-spacing: -0.04em;
}

.student-form {
  position: relative;
}

.student-form-grid {
  display: grid;
  grid-template-columns: 1.35fr 1.35fr 0.95fr 0.95fr;
  gap: 30px 40px;
  align-items: end;
}

.form-field {
  display: block;
}

.form-field > span {
  display: block;
  margin-bottom: 14px;
  color: var(--form-label);
  font-size: 15px;
  font-weight: 850;
}

.field-with-icon {
  position: relative;
  height: 48px;
  border-radius: 6px;
  background: var(--control-bg);
}

.field-with-icon .icon {
  position: absolute;
  left: 22px;
  top: 50%;
  width: 18px;
  height: 18px;
  transform: translateY(-50%);
  opacity: 0.9;
}

.field-with-icon input,
.field-with-icon select {
  width: 100%;
  height: 100%;
  padding: 0 18px;
  border: 0;
  outline: none;
  border-radius: inherit;
  background: transparent;
  color: var(--control-text);
  font-size: 16px;
  font-weight: 700;
}

.field-with-icon .icon + input,
.field-with-icon .icon + select {
  padding-left: 68px;
}

.field-with-icon input::placeholder {
  color: var(--control-placeholder);
}

.select-wrap select {
  appearance: none;
  cursor: pointer;
}

.form-actions {
  margin-top: -48px;
  display: flex;
  justify-content: flex-end;
  gap: 40px;
}

.save-button,
.cancel-button {
  width: 196px;
  height: 54px;
  border: 0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}

.save-button {
  background: var(--save-bg);
  color: var(--save-text);
}

.cancel-button {
  background: var(--cancel-bg);
  color: var(--cancel-text);
}

.placeholder-card {
  padding: 34px;
  border-radius: 14px;
  background: var(--card-bg);
  color: var(--admin-text);
}

.placeholder-card p {
  margin: 0 0 20px;
  color: var(--admin-muted);
  font-weight: 700;
}

@media (max-width: 1280px) {
  .admin-shell {
    grid-template-columns: 250px minmax(0, 1fr);
  }

  .filter-card,
  .student-form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-actions {
    margin-top: 30px;
  }
}

@media (max-width: 900px) {
  .login-shell,
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: relative;
    height: auto;
  }

  .sidebar-brand {
    margin-bottom: 28px;
  }

  .topbar {
    padding: 20px;
    height: auto;
    flex-wrap: wrap;
    gap: 16px;
  }

  .topbar-search {
    width: 100%;
  }

  .content-area {
    padding: 32px 18px;
  }

  .page-heading {
    margin-bottom: 34px;
    flex-direction: column;
  }

  .filter-card,
  .student-form-grid {
    grid-template-columns: 1fr;
  }

  .student-form-card {
    padding: 30px 20px;
  }

  .form-actions {
    flex-direction: column;
    gap: 14px;
  }

  .save-button,
  .cancel-button {
    width: 100%;
  }
}

EOF_APP_CSS

cat > frontend/src/index.css <<'EOF_INDEX_CSS'
:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  color-scheme: light;
  --page-bg-start: #355d92;
  --page-bg-mid: #8da9c6;
  --page-bg-end: #eef1ec;
  --page-warm-glow: rgba(245, 229, 204, 0.82);
  --panel-right-bg: #f7f7f5;
  --brand-overlay-start: #9dc1ed;
  --brand-overlay-mid: #6d8bb1;
  --brand-overlay-end: #263f66;
  --shell-shadow: 0 26px 70px rgba(27, 47, 77, 0.26);
  --main-logo-bg: #f8f8f8;
  --brand-text: #ffffff;
  --feature-bg: rgba(235, 242, 249, 0.82);
  --feature-color: #4c72af;
  --heading-color: #242c38;
  --text-primary: #242c38;
  --text-muted: #8b8b8b;
  --label-color: #4e76b5;
  --input-bg: #ffffff;
  --input-border: #8f8f8f;
  --input-text: #222b35;
  --placeholder: #9b9b9b;
  --link-color: #3568ae;
  --button-bg: #76a3d1;
  --button-text: #273143;
  --footer-color: #8d8d8d;

  --admin-bg: #f0f1f4;
  --admin-text: #43505d;
  --admin-text-strong: #37424d;
  --admin-muted: #7f8a95;
  --sidebar-bg: #ffffff;
  --sidebar-border: #ebedf1;
  --topbar-bg: #ffffff;
  --topbar-border: #eef0f3;
  --search-bg: #f1f2f5;
  --card-bg: #ffffff;
  --control-bg: #f1f2f5;
  --control-divider: #8d9aa8;
  --control-text: #52606d;
  --control-placeholder: #9099a4;
  --table-head: #6688be;
  --table-text: #89a6d0;
  --table-line: #b6c9e8;
  --edit-bg: #dce5ef;
  --edit-text: #52606d;
  --empty-text: #c0d0ea;
  --button-soft-bg: #ffffff;
  --button-soft-text: #3f6eb7;
  --save-bg: #a8cdfc;
  --save-text: #4770a8;
  --cancel-bg: #ff696d;
  --cancel-text: #ffffff;
  --nav-active-bg: #aab5c2;
  --nav-active-text: #3e4a56;
  --logout-bg: #f0f1f4;
  --avatar-bg: #d4e3f7;
  --avatar-text: #536273;
  --profile-role: #6586be;
  --pagination-text: #344352;
  --pagination-active-bg: #d1d6dd;
  --pagination-active-text: #3f4b56;
  --form-label: #8a96a4;
  --app-icon-filter: brightness(0) saturate(100%) invert(28%) sepia(14%) saturate(869%) hue-rotate(169deg) brightness(93%) contrast(86%);

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:root[data-theme='dark'] {
  color-scheme: dark;
  --page-bg-start: #657d8b;
  --page-bg-mid: #26323a;
  --page-bg-end: #10171c;
  --page-warm-glow: rgba(41, 54, 61, 0.35);
  --panel-right-bg: #1d242b;
  --brand-overlay-start: #202a31;
  --brand-overlay-mid: #536b7a;
  --brand-overlay-end: #99bad0;
  --shell-shadow: 0 26px 56px rgba(0, 0, 0, 0.3);
  --main-logo-bg: #354351;
  --brand-text: #f4f5f6;
  --feature-bg: #354350;
  --feature-color: #ffffff;
  --heading-color: #f3f4f5;
  --text-primary: #f1f2f3;
  --text-muted: #9b9da1;
  --label-color: #f2f2f2;
  --input-bg: #1d242b;
  --input-border: #85878a;
  --input-text: #f1f2f3;
  --placeholder: #9a9da1;
  --link-color: #f4f4f4;
  --button-bg: #7cacdc;
  --button-text: #f8f8f8;
  --footer-color: #9b9da1;

  --admin-bg: #242c34;
  --admin-text: #f1f2f4;
  --admin-text-strong: #ffffff;
  --admin-muted: #b9bec5;
  --sidebar-bg: #1d242b;
  --sidebar-border: #232d36;
  --topbar-bg: #1d242b;
  --topbar-border: #222c35;
  --search-bg: #394653;
  --card-bg: #35414d;
  --control-bg: #5f6b79;
  --control-divider: #b7c0cb;
  --control-text: #f0f2f4;
  --control-placeholder: #d2d6da;
  --table-head: #f0f2f4;
  --table-text: #f1f2f4;
  --table-line: #1f2830;
  --edit-bg: #4d5968;
  --edit-text: #f5f7f9;
  --empty-text: #a9aeb5;
  --button-soft-bg: #35414d;
  --button-soft-text: #f5f7f9;
  --save-bg: #9fc5f8;
  --save-text: #456b9d;
  --cancel-bg: #b15156;
  --cancel-text: #ffffff;
  --nav-active-bg: #315381;
  --nav-active-text: #ffffff;
  --logout-bg: #2b3440;
  --avatar-bg: #9fbbe4;
  --avatar-text: #ffffff;
  --profile-role: #8da9d6;
  --pagination-text: #ffffff;
  --pagination-active-bg: #8d97a3;
  --pagination-active-text: #ffffff;
  --form-label: #b8c0cb;
  --app-icon-filter: brightness(0) invert(1);
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  min-width: 320px;
  min-height: 100%;
}

body {
  margin: 0;
  background: var(--admin-bg);
}

button,
input,
select,
textarea {
  font: inherit;
}

EOF_INDEX_CSS

cat > frontend/src/main.jsx <<'EOF_MAIN_JSX'
import { render } from 'preact'
import './index.css'
import { App } from './app.jsx'

render(<App />, document.getElementById('app'))

EOF_MAIN_JSX

echo 'Frontend manajemen data siswa berhasil diterapkan.'
echo 'Jalankan: docker compose restart frontend || npm --prefix frontend run dev'
