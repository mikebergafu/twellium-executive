import api from './axios';

export const login = async (credentials) => {
    const response = await api.post('/auth/token/', credentials);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export const forgotPassword = async (email) => {
    const response = await api.post('/core/auth/forgot-password/', { email });
    return response.data;
};

export const resetPassword = async (data) => {
    const response = await api.post('/core/auth/reset-password/', data);
    return response.data;
};
