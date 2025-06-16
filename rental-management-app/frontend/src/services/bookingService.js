import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const bookingService = {
    getAllBookings: async () => {
        try {
            console.log('Fetching all bookings...');
            const response = await api.get('/bookings');
            console.log('Received bookings:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Error fetching bookings');
        }
    },

    getBookingById: async (id) => {
        try {
            console.log('Fetching booking by ID:', id);
            const response = await api.get(`/bookings/${id}`);
            console.log('Received booking:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching booking:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Error fetching booking details');
        }
    },

    createBooking: async (bookingData) => {
        try {
            console.log('Creating new booking:', bookingData);
            const response = await api.post('/bookings', bookingData);
            console.log('Created booking:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating booking:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Error creating booking');
        }
    },

    updateBookingStatus: async (id, status) => {
        try {
            console.log('Updating booking status:', { id, status });
            const response = await api.patch(`/bookings/${id}/status`, { status });
            console.log('Updated booking:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating booking status:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Error updating booking status');
        }
    }
}; 