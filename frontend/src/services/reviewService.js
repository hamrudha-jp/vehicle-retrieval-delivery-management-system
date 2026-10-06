import api from './api';

export const reviewService = {
  submitReview: async (requestId, rating, comment) => {
    const response = await api.post('/reviews', { requestId, rating, comment });
    return response.data;
  },

  getReviewByRequestId: async (requestId) => {
    const response = await api.get(`/reviews/request/${requestId}`);
    return response.data;
  },

  getDriverReviews: async (driverId) => {
    const response = await api.get(`/reviews/driver/${driverId}`);
    return response.data;
  },

  getAllReviews: async () => {
    const response = await api.get('/reviews/admin/all');
    return response.data;
  }
};
