const API_BASE = '/api';

export const login = async (username, password) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Ошибка входа');
  }
  return res.json();
};

export const fetchOrganizations = async () => {
  const res = await fetch(`${API_BASE}/organizations`);
  if (!res.ok) throw new Error('Ошибка загрузки организаций');
  return res.json();
};

export const fetchDrivers = async (orgId) => {
  const res = await fetch(`${API_BASE}/organizations/${orgId}/drivers`);
  if (!res.ok) throw new Error('Ошибка загрузки водителей');
  return res.json();
};

export const fetchCheckups = async (orgId, from, to) => {
  const url = `${API_BASE}/organizations/${orgId}/checkups?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ошибка загрузки осмотров');
  return res.json();
};
