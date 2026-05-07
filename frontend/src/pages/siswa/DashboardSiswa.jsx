/**
 * Dashboard Siswa Main Page
 * 
 * Main dashboard page for students showing overview statistics
 * and quick access to key features.
 * 
 * @module pages/siswa/DashboardSiswa
 * @author SMK Rajasa Development Team
 */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import DashboardLayout from '../../components/siswa/DashboardLayout';
import './DashboardSiswa.css';

/**
 * DashboardSiswa Page Component
 * 
 * @returns {import('preact').VNode} Dashboard page
 */
export default function DashboardSiswa() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Simulate loading dashboard stats
    // TODO: Replace with actual API call
    setTimeout(() => {
      setStats({
        presensi: {
          tepatWaktu: 45,
          terlambat: 3,
          sakit: 1,
          izin: 0,
          alpha: 1
        },
        nilai: {
          rataRata: 85.5,
          tertinggi: 95,
          terendah: 75
        }
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <DashboardLayout activePage="dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Memuat data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePage="dashboard">
      <div className="dashboard-siswa-page">
        {/* Page Header */}
        <div className="page-header-v2">
          <h1 className="page-title-v2">Dashboard Siswa</h1>
          <p className="page-subtitle-v2">
            Selamat datang di Sistem Presensi Lab SMK Rajasa Surabaya
          </p>
        </div>

        {/* Info Message */}
        <div className="info-message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="info-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <p>
            Gunakan menu <strong>Dashboard</strong> di sidebar untuk melihat ringkasan presensi, nilai, dan kalender akademik Anda.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="quick-access-section">
          <h2 className="section-title">Akses Cepat</h2>
          
          <div className="quick-access-grid">
            <div className="quick-access-card">
              <div className="card-icon card-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
                </svg>
              </div>
              <div className="card-content">
                <h3>Presensi Hari Ini</h3>
                <p className="card-value">Belum Absen</p>
                <p className="card-description">Scan kartu untuk absen masuk</p>
              </div>
            </div>

            <div className="quick-access-card">
              <div className="card-icon card-icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="card-content">
                <h3>Tingkat Kehadiran</h3>
                <p className="card-value">90%</p>
                <p className="card-description">45 dari 50 hari hadir</p>
              </div>
            </div>

            <div className="quick-access-card">
              <div className="card-icon card-icon-yellow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </div>
              <div className="card-content">
                <h3>Rata-rata Nilai</h3>
                <p className="card-value">85.5</p>
                <p className="card-description">Semester Genap 2025/2026</p>
              </div>
            </div>

            <div className="quick-access-card">
              <div className="card-icon card-icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <div className="card-content">
                <h3>Jadwal Hari Ini</h3>
                <p className="card-value">3 Sesi</p>
                <p className="card-description">Lab Komputer, Lab Jaringan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
