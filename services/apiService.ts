import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080',
    withCredentials: false
});

api.interceptors.request.use((cfg) => {
    // Use the existing app's auth storage
    const userJson = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            if (user && user.id) {
                // Using a user property as a stand-in for a real token.
                // In a real app, this would be a JWT.
                cfg.headers = { ...cfg.headers, Authorization: `Bearer ${user.id}` };
            }
        } catch (e) {
            console.error("Failed to parse user from storage for API request", e);
        }
    }
    return cfg;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || err.message || 'Bilinmeyen hata';
        return Promise.reject({ status, message: msg });
    }
);
