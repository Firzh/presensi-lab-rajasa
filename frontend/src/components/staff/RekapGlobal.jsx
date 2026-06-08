/**
 * RekapGlobal.jsx
 *
 * Global attendance recap for staff.
 * Shown on: Sesi → Rekap Global (Level 4).
 *
 * Features (Level 5 per HTA):
 *   - File Rekap: tabel data presensi
 *   - Filter: by Tanggal, by Status
 *   - Export PDF / Download PDF
 *
 * Differences from Guru's RekapPresensi:
 *   - No filter by Rombel (global view all)
 *   - Filter by Status (hadir/terlambat/alpha/sakit/izin)
 *
 * API: GET /api/presensi/jam-siswa?tanggal=&status=
 *
 * @author fashich/dashboard-staff-page
 */

import { useState, useEffect, useCallback, useRef } from 'preact/hooks'
import { appStorage } from '../../lib/storage'
import { STORAGE_KEYS } from '../../constants/storageKeys'

function getAuthHeaders() {
  const token = appStorage.getRaw(STORAGE_KEYS.AUTH_TOKEN)
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

function todayDate() { return new Date().toISOString().split('T')[0] }

const STATUS_OPTIONS = [
  { value: '',          label: 'Semua Status' },
  { value: 'hadir',     label: 'Hadir'        },
  { value: 'terlambat', label: 'Terlambat'    },
  { value: 'alpha',     label: 'Alpha'        },
  { value: 'sakit',     label: 'Sakit'        },
  { value: 'izin',      label: 'Izin'         },
]

const STATUS_STYLE = {
  hadir:     { bg:'#dcfce7', color:'#15803d' },
  terlambat: { bg:'#fef3c7', color:'#b45309' },
  alpha:     { bg:'#fee2e2', color:'#b91c1c' },
  sakit:     { bg:'#e0f2fe', color:'#0369a1' },
  izin:      { bg:'#ede9fe', color:'#6d28d9' },
}

const STATUS_LABELS = { hadir:'Hadir', terlambat:'Terlambat', alpha:'Alpha', sakit:'Sakit', izin:'Izin' }

function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] ?? { bg:'#f1f5f9', color:'#64748b' }
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', padding:'0.22rem 0.6rem', borderRadius:99, fontSize:'0.72rem', fontWeight:600, background:style.bg, color:style.color, whiteSpace:'nowrap' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor' }} />
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function SummaryCards({ rows }) {
  const counts = rows.reduce((acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc }, {})
  const items = [
    { key:'hadir', label:'Hadir', color:'#10b981' },
    { key:'terlambat', label:'Terlambat', color:'#f59e0b' },
    { key:'alpha', label:'Alpha', color:'#ef4444' },
    { key:'sakit', label:'Sakit', color:'#0284c7' },
    { key:'izin', label:'Izin', color:'#8b5cf6' },
  ]
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'0.75rem' }}>
      {items.map((item) => (
        <div key={item.key} style={{ display:'flex', flexDirection:'column', gap:'0.25rem', padding:'0.9rem 1rem', background:'var(--staff-white,#fff)', border:`1px solid var(--staff-border,#e2e8f0)`, borderRadius:12, borderTop:`3px solid ${item.color}` }}>
          <span style={{ fontSize:'1.6rem', fontWeight:700, color:'var(--staff-text-base,#1e293b)', lineHeight:1 }}>{counts[item.key] ?? 0}</span>
          <span style={{ fontSize:'0.75rem', fontWeight:500, color:'var(--staff-text-muted,#64748b)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function RekapGlobal() {
  const [tanggal,    setTanggal]    = useState(todayDate())
  const [statusFilter, setStatusFilter] = useState('')
  const appliedFilter = useRef({ tanggal: todayDate(), status: '' })

  const [rows,       setRows]       = useState([])
  const [isLoading,  setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [hasFetched, setHasFetched] = useState(false)

  const fetchRekap = useCallback(async () => {
    setLoading(true); setError(null)
    const { tanggal: t, status: st } = appliedFilter.current
    try {
      const params = new URLSearchParams({ tanggal: t })
      if (st) params.set('status', st)
      const res = await fetch(`/api/presensi/jam-siswa?${params}`, { headers: getAuthHeaders() })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal memuat rekap.')
      setRows(data.data?.attendance ?? data.data ?? [])
      setHasFetched(true)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRekap() }, [fetchRekap])

  const handleApply = useCallback(() => {
    appliedFilter.current = { tanggal, status: statusFilter }
    fetchRekap()
  }, [tanggal, statusFilter, fetchRekap])

  const handleExportPDF = useCallback(() => {
    const { tanggal: t, status: st } = appliedFilter.current
    const token = appStorage.getRaw(STORAGE_KEYS.AUTH_TOKEN)
    const params = new URLSearchParams({ tanggal: t, format: 'pdf' })
    if (st) params.set('status', st)
    if (token) params.set('token', token)
    window.open(`/api/presensi/jam-siswa/export?${params}`, '_blank')
  }, [])

  const inputStyle = { padding:'0.55rem 0.875rem', border:'1.5px solid var(--staff-border,#e2e8f0)', borderRadius:8, fontFamily:'Poppins,sans-serif', fontSize:'0.85rem', color:'var(--staff-text-base,#1e293b)', background:'var(--staff-white,#fff)', outline:'none' }
  const selectStyle = { ...inputStyle, appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%2364748b' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 0.75rem center', backgroundSize:'18px', paddingRight:'2.25rem', cursor:'pointer' }

  return (
    <section style={{ display:'flex', flexDirection:'column', gap:'1.5rem', fontFamily:'Poppins,sans-serif' }} aria-label="Rekap Global Presensi">
      <header>
        <h2 style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--staff-text-base,#1e293b)', margin:0 }}>Rekap Global</h2>
        <p style={{ fontSize:'0.8rem', color:'var(--staff-text-muted,#64748b)', margin:'0.2rem 0 0' }}>
          Rekap kehadiran seluruh siswa — filter by tanggal dan status.
        </p>
      </header>

      {/* Filter bar (Level 5: by Tanggal, by Status) */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', gap:'0.75rem', padding:'1rem 1.25rem', background:'var(--staff-white,#fff)', border:'1px solid var(--staff-border,#e2e8f0)', borderRadius:12 }}>
        {/* By Tanggal */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem', flex:1, minWidth:160 }}>
          <label htmlFor="rekap-tanggal" style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--staff-text-muted,#64748b)', textTransform:'uppercase', letterSpacing:'0.4px' }}>Tanggal</label>
          <input id="rekap-tanggal" type="date" style={inputStyle} value={tanggal} max={todayDate()} onChange={(e) => setTanggal(e.currentTarget.value)} />
        </div>

        {/* By Status (Level 5) */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem', flex:1, minWidth:160 }}>
          <label htmlFor="rekap-status" style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--staff-text-muted,#64748b)', textTransform:'uppercase', letterSpacing:'0.4px' }}>Status</label>
          <select id="rekap-status" style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.currentTarget.value)}>
            {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'flex-end' }}>
          <button type="button" onClick={handleApply} disabled={isLoading} style={{ padding:'0.55rem 1.1rem', border:'none', borderRadius:8, background:'#0284c7', color:'#fff', fontFamily:'Poppins,sans-serif', fontSize:'0.85rem', fontWeight:600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, whiteSpace:'nowrap' }}>
            {isLoading ? 'Memuat...' : 'Tampilkan'}
          </button>

          {/* Download PDF (Level 5) */}
          <button type="button" onClick={handleExportPDF} disabled={!hasFetched || rows.length === 0} style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1.1rem', border:'1.5px solid var(--staff-border,#e2e8f0)', borderRadius:8, background:'var(--staff-white,#fff)', color:'var(--staff-text-muted,#64748b)', fontFamily:'Poppins,sans-serif', fontSize:'0.85rem', fontWeight:600, cursor: !hasFetched || rows.length === 0 ? 'not-allowed' : 'pointer', opacity: !hasFetched || rows.length === 0 ? 0.5 : 1, whiteSpace:'nowrap' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5v-2z"/></svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Summary counters */}
      {!isLoading && !error && hasFetched && rows.length > 0 && <SummaryCards rows={rows} />}

      {/* File Rekap — Table (Level 5) */}
      <div style={{ background:'var(--staff-white,#fff)', border:'1px solid var(--staff-border,#e2e8f0)', borderRadius:12, overflow:'hidden' }}>
        <div style={{ width:'100%', overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.855rem', fontFamily:'Poppins,sans-serif' }}>
            <thead style={{ background:'#f8fafc', borderBottom:'1px solid var(--staff-border,#e2e8f0)' }}>
              <tr>
                {['No','NISN','Nama Siswa','Kelas','Jam','Status','Mode','Waktu Scan'].map((h) => (
                  <th key={h} style={{ padding:'0.7rem 1rem', textAlign:'left', fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', color:'#64748b', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={8} style={{ padding:'3rem', textAlign:'center', color:'#64748b', fontSize:'0.85rem' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem' }}>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    <div style={{ width:28, height:28, border:'3px solid #e2e8f0', borderTopColor:'#0284c7', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
                    Memuat data...
                  </div>
                </td></tr>
              )}

              {!isLoading && error && (
                <tr><td colSpan={8} style={{ padding:'3rem', textAlign:'center' }}>
                  <p style={{ margin:0, fontWeight:600, color:'#475569' }}>Gagal Memuat Data</p>
                  <p style={{ margin:0, fontSize:'0.82rem', color:'#94a3b8' }}>{error}</p>
                </td></tr>
              )}

              {!isLoading && !error && hasFetched && rows.length === 0 && (
                <tr><td colSpan={8} style={{ padding:'3rem', textAlign:'center' }}>
                  <p style={{ margin:0, fontWeight:600, color:'#475569' }}>Tidak Ada Data</p>
                  <p style={{ margin:0, fontSize:'0.82rem', color:'#94a3b8' }}>Tidak ada data presensi untuk filter yang dipilih.</p>
                </td></tr>
              )}

              {!isLoading && !error && rows.map((row, idx) => (
                <tr key={row.presensi_id ?? idx} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'0.7rem 1rem', color:'#94a3b8', fontSize:'0.78rem' }}>{idx + 1}</td>
                  <td style={{ padding:'0.7rem 1rem', color:'#334155' }}>{row.nisn ?? '—'}</td>
                  <td style={{ padding:'0.7rem 1rem', color:'#334155', fontWeight:500 }}>{row.nama_lengkap ?? '—'}</td>
                  <td style={{ padding:'0.7rem 1rem', color:'#334155' }}>{row.kelas_aktif ?? '—'}</td>
                  <td style={{ padding:'0.7rem 1rem', color:'#334155' }}>Jam {row.jam_id ?? '—'}</td>
                  <td style={{ padding:'0.7rem 1rem' }}><StatusBadge status={row.status} /></td>
                  <td style={{ padding:'0.7rem 1rem', color:'#334155', textTransform:'capitalize' }}>{row.mode_presensi ?? '—'}</td>
                  <td style={{ padding:'0.7rem 1rem', color:'#334155' }}>
                    {row.scanned_at ? new Date(row.scanned_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
