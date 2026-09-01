import api from './api';

export const storeService = {
  getStores: async (params = {}) => {
    return await api.get('/stores', { params });
  },

  getStoreById: async (id) => {
    return await api.get(`/stores/${id}`);
  },

  getMyRating: async (storeId) => {
    return await api.get(`/stores/${storeId}/rating`);
  },
};
