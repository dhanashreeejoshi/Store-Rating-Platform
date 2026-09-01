import api from './api';

export const ownerService = {
  getDashboard: async () => {
    return await api.get('/owner/dashboard');
  },

  getRatings: async (storeId = null) => {
    const params = storeId ? { store_id: storeId } : {};
    return await api.get('/owner/ratings', { params });
  },

  changePassword: async (oldPassword, newPassword) => {
    return await api.put('/owner/password', { oldPassword, newPassword });
  },
};
