import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 50000,
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('accessToken'); // 기존 토큰 삭제
            window.location.href = '/login'; // 로그인 페이지로 이동
        }
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response && error.response.status === 401) {
            try {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
            } catch (error) {
                console.error('Failed to logout:', error);
            }
        }
        return Promise.reject(error);
    }
);