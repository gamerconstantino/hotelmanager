
const API_URL = 'http://localhost:5000';

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('hotelmanager_token');

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const resposta = await fetch(url, {
    ...options,
    headers
  });

  return resposta;
}

export default apiFetch;
