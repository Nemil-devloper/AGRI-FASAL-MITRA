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

const equipmentService = {
    // Get all equipment with optional filters
    getAllEquipment: async (filters = {}) => {
        try {
            console.log('Fetching equipment with filters:', filters); // Debug log
            const response = await api.get('/equipment', { params: filters });
            console.log('Received equipment data:', response.data); // Debug log
            return response.data;
        } catch (error) {
            console.error('Error in getAllEquipment:', error.response?.data || error); // Enhanced error logging
            throw new Error(error.response?.data?.message || 'Error fetching equipment');
        }
    },

    // Get equipment by ID
    getEquipmentById: async (id) => {
        try {
            const response = await api.get(`/equipment/${id}`);
            console.log('Received equipment data:', response.data); // Debug log
            return response.data;
        } catch (error) {
            console.error('Error in getEquipmentById:', error.response?.data || error); // Enhanced error logging
            throw new Error(error.response?.data?.message || 'Error fetching equipment details');
        }
    },

    // Create new equipment
    createEquipment: async (formData) => {
        try {
            const response = await api.post('/equipment', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error creating equipment');
        }
    },

    // Update equipment
    updateEquipment: async (id, formData) => {
        try {
            const response = await api.put(`/equipment/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error updating equipment');
        }
    },

    // Delete equipment
    deleteEquipment: async (id) => {
        try {
            const response = await api.delete(`/equipment/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting equipment:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Error deleting equipment');
        }
    },

    // Add to favorites
    addToFavorites: async (equipmentId) => {
        try {
            const response = await api.post(`/equipment/${equipmentId}/favorite`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error adding to favorites');
        }
    },

    // Remove from favorites
    removeFromFavorites: async (equipmentId) => {
        try {
            const response = await api.delete(`/equipment/${equipmentId}/favorite`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error removing from favorites');
        }
    },

    // Get favorites
    getFavorites: async () => {
        try {
            const response = await api.get('/equipment/favorites');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching favorites');
        }
    },

    // Get equipment by owner
    getMyEquipment: async () => {
        try {
            console.log('Fetching my equipment...'); // Debug log
            const response = await api.get('/equipment/my-equipment');
            console.log('Received my equipment data:', response.data); // Debug log
            if (!response.data) {
                console.warn('No equipment data received from API');
                return [];
            }
            return response.data;
        } catch (error) {
            console.error('Error in getMyEquipment:', error.response?.data || error); // Enhanced error logging
            throw new Error(error.response?.data?.message || 'Error fetching my equipment');
        }
    }
};

export default equipmentService;