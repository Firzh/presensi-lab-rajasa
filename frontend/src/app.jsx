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

