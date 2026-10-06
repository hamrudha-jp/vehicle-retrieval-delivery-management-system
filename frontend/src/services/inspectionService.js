import api from './api';

export const inspectionService = {
  submitInspection: async (requestId, inspectionData) => {
    return await api.post(`/requests/${requestId}/inspection`, inspectionData);
  },
  getInspections: async (requestId) => {
    return await api.get(`/requests/${requestId}/inspections`);
  }
};
