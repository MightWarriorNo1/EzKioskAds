import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HostLayout from '../components/layouts/HostLayout';
import HostDashboard from '../components/host/HostDashboard';
import KioskManager from '../components/host/KioskManager';
import AdAssignment from '../components/host/AdAssignment';
import AdUpload from '../components/host/AdUpload';
import RevenueTracker from '../components/host/RevenueTracker';
import PayoutHistory from '../components/host/PayoutHistory';

export default function HostPortal() {
  return (
    <HostLayout>
      <Routes>
        <Route path="/" element={<HostDashboard />} />
        <Route path="/kiosks" element={<KioskManager />} />
        <Route path="/ads" element={<AdAssignment />} />
        <Route path="/ads/upload" element={<AdUpload />} />
        <Route path="/revenue" element={<RevenueTracker />} />
        <Route path="/payouts" element={<PayoutHistory />} />
      </Routes>
    </HostLayout>
  );
}