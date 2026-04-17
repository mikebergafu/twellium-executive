import axios from 'axios';

const DEBUG = process.env.REACT_APP_DEBUG === 'true';
const BASE_URL = DEBUG ? process.env.REACT_APP_BASE_URL : process.env.REACT_APP_BASE_URL_PROD;


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
    (response) => response,
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

                    localStorage.setItem('access_token', data.data.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${data.data.access}`;

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
