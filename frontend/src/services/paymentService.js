import api from './api';

export const paymentService = {
  processPayment: async (requestId, paymentMethod) => {
    const response = await api.post('/payments/process', { requestId, paymentMethod });
    return response.data;
  },

  getPaymentByRequestId: async (requestId) => {
    const response = await api.get(`/payments/request/${requestId}`);
    return response.data;
  },

  getAllPayments: async () => {
    const response = await api.get('/payments/admin/all');
    return response.data;
  }
};
