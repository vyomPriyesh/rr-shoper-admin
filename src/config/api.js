import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL, // backend URL
    withCredentials: true
});

// Add token automatically
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;