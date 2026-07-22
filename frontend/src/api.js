const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'officerToken';

export function getOfficerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setOfficerToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearOfficerToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const { auth, ...fetchOptions } = options;
  const headers = { 'Content-Type': 'application/json', ...fetchOptions.headers };
  if (auth) {
    const token = getOfficerToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });
  const data = res.status === 204 ? null : await res.json();

  if (!res.ok) {
    if (res.status === 401 && auth) clearOfficerToken();
    const error = new Error(data?.error || 'Something went wrong.');
    error.status = res.status;
    throw error;
  }
  return data;
}

export function getConfig() {
  return request('/registrations/config');
}

export function getAvailability(lockerNumber) {
  return request(`/registrations/availability?locker=${lockerNumber}`);
}

export function getRegistrations() {
  return request('/registrations', { auth: true });
}

export function createRegistration(payload) {
  return request('/registrations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteRegistration(id) {
  return request(`/registrations/${id}`, { method: 'DELETE', auth: true });
}

export function officerLogin(password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}
