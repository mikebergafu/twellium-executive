const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://app.twellium-api.com/api';

async function request(url, options = {}) {
    const token = localStorage.getItem('access_token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;

    let response = await fetch(`${BASE_URL}${url}`, { ...options, headers });

    // 401 → attempt token refresh
    if (response.status === 401 && !options._retry) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            try {
                const refreshRes = await fetch(`${BASE_URL}/auth/token/refresh/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh: refreshToken }),
                });
                if (!refreshRes.ok) throw new Error('Refresh failed');
                const refreshData = await refreshRes.json();
                const tokenData = refreshData?.data || refreshData;
                localStorage.setItem('access_token', tokenData.access);
                headers.Authorization = `Bearer ${tokenData.access}`;
                response = await fetch(`${BASE_URL}${url}`, { ...options, headers, _retry: true });
            } catch {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                throw new Error('Session expired');
            }
        }
    }

    if (!response.ok) {
        const error = new Error(`Request failed: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    // Unwrap API envelope { status_code, message, data } and wrap in { data } to match axios shape
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
