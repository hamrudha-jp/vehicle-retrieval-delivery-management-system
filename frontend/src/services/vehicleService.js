import api from './api';

export const vehicleService = {
  addVehicle: async (vehicleData) => {
    return await api.post('/vehicles', vehicleData);
  },
  getMyVehicles: async () => {
    return await api.get('/vehicles');
  },
  getVehicleById: async (id) => {
    return await api.get(`/vehicles/${id}`);
  },
  deleteVehicle: async (id) => {
    return await api.delete(`/vehicles/${id}`);
  }
};
