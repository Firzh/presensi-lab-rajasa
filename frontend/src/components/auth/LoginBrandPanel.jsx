import { AppIcon } from '../ui/AppIcon.jsx';
import { LoginFeatureCard } from './LoginFeatureCard.jsx';

const FEATURES = Object.freeze([
  { icon: 'wifi', label: 'IoT Based' },
  { icon: 'shieldHalved', label: 'Secure' },
  { icon: 'clock', label: 'Real-Time' },
]);

export function LoginBrandPanel() {
  return (
    <section className="login-brand-panel" aria-label="Informasi sistem">
      <div className="login-brand-content">
        <div className="login-main-logo" aria-hidden="true">
          <AppIcon name="idCard" />
        </div>

        <div className="login-brand-heading">
          <h1>Sistem Presensi Lab</h1>
          <p>SMK Rajasa Surabaya</p>
        </div>

        <div className="login-feature-list" aria-label="Keunggulan sistem">
          {FEATURES.map((feature) => (
            <LoginFeatureCard key={feature.label} icon={feature.icon} label={feature.label} />
          ))}
        </div>
      </div>
    </section>
  );
}