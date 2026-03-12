import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('kiran_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Session expired or unauthorized access detected.');
            localStorage.removeItem('kiran_token');
            // If we are in a component, we would use navigate('/login')
            // but here we just clear the state if needed by the individual catch blocks
        }
        return Promise.reject(error);
    }
);

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

    createService: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/services', data);
            set((state) => ({ services: [res.data.data, ...state.services], isLoading: false }));
            return { success: true, data: res.data.data };
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to create service', isLoading: false });
            return { success: false, error: err.response?.data?.message };
        }
    },

    updateService: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.put(`/services/${id}`, data);
            set((state) => ({
                services: state.services.map((s) => (s._id === id ? res.data.data : s)),
                service: res.data.data,
                isLoading: false,
            }));
            return { success: true, data: res.data.data };
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to update service', isLoading: false });
            return { success: false, error: err.response?.data?.message };
        }
    },

    deleteService: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/services/${id}`);
            set((state) => ({
                services: state.services.filter((s) => s._id !== id),
                isLoading: false,
            }));
            return { success: true };
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to delete service', isLoading: false });
            return { success: false, error: err.response?.data?.message };
        }
    },
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

export const useContactStore = create((set) => ({
    isLoading: false,
    error: null,
    emails: [],
    emailDetails: null,
    attachments: [],

    sendBatchEmails: async (emails) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/contact/batch', { emails });
            set({ isLoading: false });
            return { success: true, data: res.data.data };
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to send batch emails', isLoading: false });
            return { success: false, error: err.response?.data?.message };
        }
    },

    listEmails: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get('/contact/list');
            set({ emails: res.data.data.data || [], isLoading: false }); // resend list payload
            return { success: true, data: res.data.data };
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to list emails', isLoading: false });
            return { success: false, error: err.response?.data?.message };
        }
    },

    retrieveEmail: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get(`/contact/${id}`);
            set({ emailDetails: res.data.data, isLoading: false });
            return { success: true, data: res.data.data };
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to retrieve email', isLoading: false });
            return { success: false, error: err.response?.data?.message };
        }
    },

    updateEmail: async (id, scheduledAt) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.put(`/contact/${id}`, { scheduledAt });
            set({ isLoading: false });
            return { success: true, data: res.data.data };
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to update email', isLoading: false });
            return { success: false, error: err.response?.data?.message };
        }
    },

    cancelEmail: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.delete(`/contact/${id}`);
            set({ isLoading: false });
            return { success: true, data: res.data.data };
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to cancel email', isLoading: false });
            return { success: false, error: err.response?.data?.message };
        }
    },

    listAttachments: async (emailId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get(`/contact/${emailId}/attachments`);
            set({ attachments: res.data.data.data || [], isLoading: false });
            return { success: true, data: res.data.data };
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to list attachments', isLoading: false });
            return { success: false, error: err.response?.data?.message };
        }
    },

    retrieveAttachment: async (emailId, id) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get(`/contact/${emailId}/attachments/${id}`);
            set({ isLoading: false });
            return { success: true, data: res.data.data };
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to retrieve attachment', isLoading: false });
            return { success: false, error: err.response?.data?.message };
        }
    }
}));

export { api };
