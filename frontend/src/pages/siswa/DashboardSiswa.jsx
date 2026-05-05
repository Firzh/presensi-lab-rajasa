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
        <div className="page-header">
          <h1 className="page-title">Dashboard Siswa</h1>
          <p className="page-subtitle">Selamat datang di sistem presensi lab SMK Rajasa</p>
        </div>

        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="welcome-content">
            <h2>Selamat Datang! 👋</h2>
            <p>Pantau presensi dan nilai akademik Anda secara real-time</p>
          </div>
        </div>

        {/* Quick Stats - Placeholder for now */}
        <div className="quick-stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <p className="stat-label">Total Presensi</p>
              <h3 className="stat-value">50 Hari</h3>
            </div>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <p className="stat-label">Kehadiran</p>
              <h3 className="stat-value">90%</h3>
            </div>
          </div>

          <div className="stat-card stat-card-warning">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <p className="stat-label">Rata-rata Nilai</p>
              <h3 className="stat-value">85.5</h3>
            </div>
          </div>

          <div className="stat-card stat-card-info">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <p className="stat-label">Semester</p>
              <h3 className="stat-value">Genap 2026</h3>
            </div>
          </div>
        </div>

        {/* Information Notice */}
        <div className="info-notice">
          <div className="notice-icon">ℹ️</div>
          <div className="notice-content">
            <h4>Informasi</h4>
            <p>Gunakan menu sidebar untuk mengakses fitur Presensi, Nilai, dan Kalender Akademik.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
