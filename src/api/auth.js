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
