import api from './api';

export const requestService = {
  createRequest: async (requestData) => {
    return await api.post('/requests', requestData);
  },
  getMyRequests: async () => {
    return await api.get('/requests/my-requests');
  },
  getAvailableRequests: async () => {
    return await api.get('/requests/available');
  },
  getAllRequests: async () => {
    return await api.get('/requests/all');
  },
  getRequestById: async (id) => {
    return await api.get(`/requests/${id}`);
  },
  acceptRequest: async (id) => {
    return await api.post(`/requests/${id}/accept`);
  },
  updateStatus: async (id, status) => {
    return await api.put(`/requests/${id}/status`, { status });
  },
  estimateCost: async (estimateData) => {
    return await api.post('/requests/estimate-cost', estimateData);
  }
};
