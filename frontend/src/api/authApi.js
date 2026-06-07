const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({
    success: false,
    message: 'Response bukan JSON valid.',
    errors: {},
  }));

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

function withAuthHeaders(token) {
  return {
    ...JSON_HEADERS,
    Authorization: `Bearer ${token}`,
  };
}

export async function login({ username, password }) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ username, password }),
  });

  return parseJsonResponse(response);
}

export async function logout({ token }) {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: withAuthHeaders(token),
  });

  return parseJsonResponse(response);
}

export async function getMe({ token }) {
  const response = await fetch('/api/me', {
    method: 'GET',
    headers: withAuthHeaders(token),
  });

  return parseJsonResponse(response);
}