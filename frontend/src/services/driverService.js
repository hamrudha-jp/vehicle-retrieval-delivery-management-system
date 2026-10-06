import api from './api';

export const driverService = {
  submitProfile: async (profileData) => {
    return await api.post('/drivers/profile', profileData);
  },
  getMyProfile: async () => {
    return await api.get('/drivers/profile/me');
  },
  getPendingVerifications: async () => {
    return await api.get('/admin/drivers/pending');
  },
  verifyDriver: async (profileId, verificationData) => {
    return await api.put(`/admin/drivers/${profileId}/verify`, verificationData);
  }
};
