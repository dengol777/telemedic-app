const API_BASE = '/api';

// Вспомогательная функция для добавления заголовка
const authFetch = (url, token, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const fetchOrganizations = async (token) => {
  const res = await authFetch(`${API_BASE}/organizations`, token);
  if (!res.ok) throw new Error('Ошибка загрузки организаций');
  return res.json();
};

export const fetchDrivers = async (orgId, token) => {
  const res = await authFetch(`${API_BASE}/organizations/${orgId}/drivers`, token);
  if (!res.ok) throw new Error('Ошибка загрузки водителей');
  return res.json();
};

export const fetchCheckups = async (orgId, from, to, token) => {
  const url = `${API_BASE}/organizations/${orgId}/checkups?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const res = await authFetch(url, token);
  if (!res.ok) throw new Error('Ошибка загрузки осмотров');
  return res.json();
};
