import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/layouts/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdReviewQueue from '../components/admin/AdReviewQueue';
import UserManagement from '../components/admin/UserManagement';
import KioskManagement from '../components/admin/KioskManagement';
import CouponManager from '../components/admin/CouponManager';
import SystemSettings from '../components/admin/SystemSettings';

export default function AdminPortal() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/review" element={<AdReviewQueue />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/kiosks" element={<KioskManagement />} />
        <Route path="/coupons" element={<CouponManager />} />
        <Route path="/settings" element={<SystemSettings />} />
      </Routes>
    </AdminLayout>
  );
}