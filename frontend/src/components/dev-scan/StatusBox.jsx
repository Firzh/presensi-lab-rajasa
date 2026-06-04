export function StatusBox({ message, type = 'info' }) {
  if (!message) {
    return null;
  }

  return <div className={`status-box status-box--${type}`}>{message}</div>;
}
