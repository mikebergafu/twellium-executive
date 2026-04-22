import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;


const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        console.log(process.env.REACT_APP_DEBUG)
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


api.interceptors.response.use(
    (response) => {
        // Unwrap the API envelope { status_code, message, data } so that
        // response.data points directly at the inner payload.
        if (response.data && typeof response.data === 'object' && 'status_code' in response.data && 'data' in response.data) {
            response.data = response.data.data;
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;


        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    // Direct axios call doesn't use our interceptor, so unwrap manually
                    const tokenData = data?.data || data;
                    localStorage.setItem('access_token', tokenData.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${tokenData.access}`;

                    return api(originalRequest);
                } catch (refreshError) {

                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
