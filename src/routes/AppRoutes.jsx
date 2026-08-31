import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthRoute from './AuthRoute';
import ProtectedRoute from './ProtectedRoute';

import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import ProfilePage from '../pages/ProfilePage';
import DashboardPage from '../pages/DashboardPage';
import ProductPage from '../pages/ProductPage';
import AddProductPage from '../pages/AddProductPage';
import CategoryPage from '../pages/CategoryPage';
import OccasionPage from '../pages/OccasionPage';
import GiftsForEveryonePage from '../pages/GiftsForEveryonePage';
import EnquiryPage from '../pages/EnquiryPage';
import EnquiryReportPage from '../pages/EnquiryReportPage';
import CatalogManagementPage from '../pages/CatalogManagementPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/products/add" element={<AddProductPage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/occasions" element={<OccasionPage />} />
        <Route path="/gifts-for-everyone" element={<GiftsForEveryonePage />} />
        <Route path="/brands" element={<CatalogManagementPage type="brands" />} />
        <Route path="/tags" element={<CatalogManagementPage type="tags" />} />
        <Route path="/vendors" element={<CatalogManagementPage type="vendors" />} />
        <Route path="/enquiries" element={<EnquiryPage />} />
        <Route path="/reports/enquiry" element={<EnquiryReportPage />} />
        <Route path="/reports" element={<Navigate to="/reports/enquiry" replace />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
