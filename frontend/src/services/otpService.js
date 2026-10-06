import api from './api';

export const otpService = {
  generateOtp: async (requestId, type) => {
    return await api.post(`/requests/${requestId}/otp/generate?type=${type}`);
  },
  getOwnerOtp: async (requestId, type) => {
    return await api.get(`/requests/${requestId}/otp/owner?type=${type}`);
  },
  verifyOtp: async (requestId, otpData) => {
    return await api.post(`/requests/${requestId}/otp/verify`, otpData);
  }
};
