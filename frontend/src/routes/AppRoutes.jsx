import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

import { OwnerDashboard } from '../pages/owner/OwnerDashboard';
import { VehicleManagement } from '../pages/owner/VehicleManagement';
import { CreateRequestPage } from '../pages/owner/CreateRequestPage';

import { DriverDashboard } from '../pages/driver/DriverDashboard';
import { DriverProfileSetup } from '../pages/driver/DriverProfileSetup';
import { AvailableRequestsPage } from '../pages/driver/AvailableRequestsPage';

import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { DriverVerificationsPage } from '../pages/admin/DriverVerificationsPage';

import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  const getRootRedirect = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'OWNER') return '/owner/dashboard';
    if (user?.role === 'DRIVER') return '/driver/dashboard';
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    return '/login';
  };

  return (
    <Routes>
      {/* Root redirect based on role */}
      <Route path="/" element={<Navigate to={getRootRedirect()} replace />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* OWNER Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/vehicles" element={<VehicleManagement />} />
        <Route path="/owner/create-request" element={<CreateRequestPage />} />
      </Route>

      {/* DRIVER Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver/profile-setup" element={<DriverProfileSetup />} />
        <Route path="/driver/available-requests" element={<AvailableRequestsPage />} />
      </Route>

      {/* ADMIN Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/verifications" element={<DriverVerificationsPage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
