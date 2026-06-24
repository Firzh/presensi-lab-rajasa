function normalizeRole(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

export function isGuruSession(session = {}) {
  const userType = normalizeRole(session?.user?.user_type);
  const roles = Array.isArray(session?.roles) ? session.roles.map(normalizeRole) : [];

  return userType === 'guru' || roles.includes('guru');
}
