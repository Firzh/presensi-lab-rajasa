import { AppIcon } from '../ui/AppIcon.jsx';

export function LoginFeatureCard({ icon, label }) {
  return (
    <div className="login-feature-card">
      <div className="login-feature-icon">
        <AppIcon name={icon} />
      </div>
      <p>{label}</p>
    </div>
  );
}