import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthRoute from './AuthRoute';
import ProtectedRoute from './ProtectedRoute';

// Lazy loaded route components for optimal initial bundle performance
const LoginPage = lazy(() => import('../pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ChangePasswordPage = lazy(() => import('../pages/ChangePasswordPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProductPage = lazy(() => import('../pages/ProductPage'));
const AddProductPage = lazy(() => import('../pages/AddProductPage'));
const CategoryPage = lazy(() => import('../pages/CategoryPage'));
const OccasionPage = lazy(() => import('../pages/OccasionPage'));
const GiftsForEveryonePage = lazy(() => import('../pages/GiftsForEveryonePage'));
const BrandPage = lazy(() => import('../pages/BrandPage'));
const TagPage = lazy(() => import('../pages/TagPage'));
const AttributePage = lazy(() => import('../pages/AttributePage'));
const VendorPage = lazy(() => import('../pages/VendorPage'));
const ShareSlugPage = lazy(() => import('../pages/ShareSlugPage'));
const BannerPage = lazy(() => import('../pages/BannerPage'));
const NewsletterPage = lazy(() => import('../pages/NewsletterPage'));
const WebsiteUniquePage = lazy(() => import('../pages/WebsiteUniquePage'));
const EnquiryPage = lazy(() => import('../pages/EnquiryPage'));
const EnquiryReportPage = lazy(() => import('../pages/EnquiryReportPage'));
const CatalogManagementPage = lazy(() => import('../pages/CatalogManagementPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin"></div>
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Loading...</span>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/products/add" element={<AddProductPage />} />
          <Route path="/products/edit/:id" element={<AddProductPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/occasions" element={<OccasionPage />} />
          <Route path="/gifts-for-everyone" element={<GiftsForEveryonePage />} />
          <Route path="/brands" element={<BrandPage />} />
          <Route path="/tags" element={<TagPage />} />
          <Route path="/attributes" element={<AttributePage />} />
          <Route path="/banners" element={<BannerPage />} />
          <Route path="/banner" element={<BannerPage />} />
          <Route path="/newsletter" element={<NewsletterPage />} />
          <Route path="/share-slugs" element={<ShareSlugPage />} />
          <Route path="/share-slug" element={<ShareSlugPage />} />
          <Route path="/website-unique" element={<WebsiteUniquePage />} />
          <Route path="/website-uniques" element={<WebsiteUniquePage />} />
          <Route path="/vendors" element={<VendorPage />} />
          <Route path="/enquiries" element={<EnquiryPage />} />
          <Route path="/reports/enquiry" element={<EnquiryReportPage />} />
          <Route path="/reports" element={<Navigate to="/reports/enquiry" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
