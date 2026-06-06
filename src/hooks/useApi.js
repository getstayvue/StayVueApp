import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const BASE = '/api';

// Auth context
const AuthContext = createContext({ user: null, token: null, login: () => {}, logout: () => {} });
export const AuthProvider = AuthContext.Provider;
export function useAuth() { return useContext(AuthContext); }

// Property context
const PropertyContext = createContext({ propertyId: 0, properties: [], setPropertyId: () => {} });
export const PropertyProvider = PropertyContext.Provider;
export function useProperty() { return useContext(PropertyContext); }

function getToken() {
  return localStorage.getItem('auth_token');
}

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 401) {
    // Session expired — clear token and reload to show login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.reload();
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const ct = res.headers.get('content-type');
  if (ct && ct.includes('text/csv')) return res.text();
  return res.json();
}

export function useApi(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    setLoading(true);
    apiFetch(path)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

export async function apiPost(path, body) { return apiFetch(path, { method: 'POST', body }); }
export async function apiPut(path, body) { return apiFetch(path, { method: 'PUT', body }); }
export async function apiDelete(path) { return apiFetch(path, { method: 'DELETE' }); }
export async function apiGet(path) { return apiFetch(path); }

// Auth-specific calls
export async function authPost(path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/auth${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function authGet(path) {
  const token = getToken();
  const res = await fetch(`${BASE}/auth${path}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

export function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}
