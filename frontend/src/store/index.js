import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'https://beauty-palor-sites-4.onrender.com/api', withCredentials: true });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('kiran_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await api.post('/auth/register', data);
                    localStorage.setItem('kiran_token', res.data.token);
                    set({ user: res.data.user, token: res.data.token, isLoading: false });
                    return { success: true };
                } catch (err) {
                    set({ error: err.response?.data?.message || 'Registration failed', isLoading: false });
                    return { success: false, error: err.response?.data?.message };
                }
            },

            login: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await api.post('/auth/login', data);
                    localStorage.setItem('kiran_token', res.data.token);
                    set({ user: res.data.user, token: res.data.token, isLoading: false });
                    return { success: true };
                } catch (err) {
                    set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
                    return { success: false, error: err.response?.data?.message };
                }
            },

            logout: async () => {
                try {
                    await api.get('/auth/logout');
                } catch (_) { }
                localStorage.removeItem('kiran_token');
                set({ user: null, token: null });
            },

            getMe: async () => {
                try {
                    const res = await api.get('/auth/me');
                    set({ user: res.data.user });
                } catch (_) {
                    set({ user: null, token: null });
                    localStorage.removeItem('kiran_token');
                }
            },

            updateProfile: async (data) => {
                set({ isLoading: true });
                try {
                    const res = await api.put('/auth/updateprofile', data);
                    set({ user: res.data.user, isLoading: false });
                    return { success: true };
                } catch (err) {
                    set({ isLoading: false });
                    return { success: false, error: err.response?.data?.message };
                }
            },

            clearError: () => set({ error: null }),
        }),
        { name: 'kiran_auth', partialize: (state) => ({ user: state.user, token: state.token }) }
    )
);

export const useServiceStore = create((set) => ({
    services: [],
    service: null,
    categories: [],
    isLoading: false,
    error: null,
    pagination: {},
    filters: { category: 'All', sort: '', search: '', minPrice: '', maxPrice: '', page: 1 },

    fetchServices: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const queryParams = new URLSearchParams(params).toString();
            const res = await api.get(`/services?${queryParams}`);
            set({
                services: res.data.data,
                pagination: {
                    total: res.data.total,
                    totalPages: res.data.totalPages,
                    currentPage: res.data.currentPage,
                },
                isLoading: false,
            });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to fetch services', isLoading: false });
        }
    },

    fetchService: async (id) => {
        set({ isLoading: true, error: null, service: null });
        try {
            const res = await api.get(`/services/${id}`);
            set({ service: res.data.data, isLoading: false });
        } catch (err) {
            set({ error: err.response?.data?.message, isLoading: false });
        }
    },

    fetchCategories: async () => {
        try {
            const res = await api.get('/services/categories');
            set({ categories: res.data.data });
        } catch (_) { }
    },

    setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
}));

export const useAppointmentStore = create((set) => ({
    appointments: [],
    appointment: null,
    availableSlots: [],
    isLoading: false,
    error: null,
    pagination: {},

    bookAppointment: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/appointments', data);
            set({ isLoading: false });
            return { success: true, data: res.data.data };
        } catch (err) {
            set({ error: err.response?.data?.message, isLoading: false });
            return { success: false, error: err.response?.data?.message };
        }
    },

    fetchMyAppointments: async (params = {}) => {
        set({ isLoading: true });
        try {
            const queryParams = new URLSearchParams(params).toString();
            const res = await api.get(`/appointments/my?${queryParams}`);
            set({
                appointments: res.data.data,
                pagination: { total: res.data.total, totalPages: res.data.totalPages },
                isLoading: false,
            });
        } catch (err) {
            set({ error: err.response?.data?.message, isLoading: false });
        }
    },

    fetchAvailableSlots: async (date, serviceId) => {
        try {
            const res = await api.get(`/appointments/slots?date=${date}&serviceId=${serviceId}`);
            set({ availableSlots: res.data.data });
        } catch (_) {
            set({ availableSlots: [] });
        }
    },

    cancelAppointment: async (id, reason) => {
        set({ isLoading: true });
        try {
            await api.put(`/appointments/${id}/cancel`, { reason });
            set((state) => ({
                appointments: state.appointments.map((a) =>
                    a._id === id ? { ...a, status: 'cancelled' } : a
                ),
                isLoading: false,
            }));
            return { success: true };
        } catch (err) {
            set({ isLoading: false });
            return { success: false, error: err.response?.data?.message };
        }
    },
}));

export { api };
