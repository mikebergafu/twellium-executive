const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://app.twellium-api.com/api';

let refreshPromise = null;

function isTokenExpiringSoon(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 - Date.now() < 60000; // less than 60s left
    } catch {
        return true;
    }
}

async function refreshAccessToken() {
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });
        if (!res.ok) throw new Error('Refresh failed');
        const json = await res.json();
        const access = (json?.data || json).access;
        localStorage.setItem('access_token', access);
        return access;
    })().finally(() => { refreshPromise = null; });
    return refreshPromise;
}

async function request(url, options = {}) {
    let token = localStorage.getItem('access_token');

    // Proactively refresh if token is expiring soon
    if (token && isTokenExpiringSoon(token)) {
        try { token = await refreshAccessToken(); } catch { /* will fail on 401 below */ }
    }

    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;

    let response = await fetch(`${BASE_URL}${url}`, { ...options, headers });

    // Reactive refresh on 401
    if (response.status === 401 && !options._retry) {
        try {
            token = await refreshAccessToken();
            headers.Authorization = `Bearer ${token}`;
            response = await fetch(`${BASE_URL}${url}`, { ...options, headers, _retry: true });
        } catch {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error('Session expired');
        }
    }

    if (!response.ok) {
        const error = new Error(`Request failed: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    if (data && typeof data === 'object' && 'status_code' in data && 'data' in data) {
        return { data: data.data };
    }
    return { data };
}

const api = {
    get: (url, { params } = {}) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request(`${url}${query}`);
    },
    post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
    put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (url, body) => request(url, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (url) => request(url, { method: 'DELETE' }),
};

export default api;
