import api from './api';

export const ratingService = {
  createRating: async (storeId, rating) => {
    return await api.post('/ratings', { store_id: storeId, rating });
  },

  updateRating: async (ratingId, rating) => {
    return await api.put(`/ratings/${ratingId}`, { rating });
  },
};
