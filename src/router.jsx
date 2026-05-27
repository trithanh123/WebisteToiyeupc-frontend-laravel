import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTERS } from "./utils/route";

// Client pages
import HomePage from "./pages/clients/homePage";

// Admin pages
import AdminDashboard from "./pages/admin/dashboard";

// Staff pages
import StaffDashboard from "./pages/staff/dashboard";
import StaffOrders from "./pages/staff/orders";

const RouterCustom = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Client ── */}
        <Route path={ROUTERS.CLIENT.HOME} element={<HomePage />} />

        {/* ── Admin ── */}
        <Route path={ROUTERS.ADMIN.HOME}       element={<AdminDashboard />} />
        <Route path={ROUTERS.ADMIN.USERS}      element={<AdminDashboard />} />
        <Route path={ROUTERS.ADMIN.PRODUCTS}   element={<AdminDashboard />} />
        <Route path={ROUTERS.ADMIN.VOUCHER}    element={<AdminDashboard />} />
        <Route path={ROUTERS.ADMIN.STORES}     element={<AdminDashboard />} />
        <Route path={ROUTERS.ADMIN.STAFF}      element={<AdminDashboard />} />
        <Route path={ROUTERS.ADMIN.WAREHOUSE}  element={<AdminDashboard />} />
        <Route path={ROUTERS.ADMIN.STATISTICS} element={<AdminDashboard />} />
        <Route path={ROUTERS.ADMIN.MONITOR}    element={<AdminDashboard />} />
        <Route path={ROUTERS.ADMIN.ORDERS}     element={<AdminDashboard />} />

        {/* ── Staff ── */}
        <Route path={ROUTERS.STAFF.HOME}       element={<StaffDashboard />} />
        <Route path={ROUTERS.STAFF.ORDERS}     element={<StaffOrders />} />
        <Route path={ROUTERS.STAFF.WAREHOUSE}  element={<StaffDashboard />} />
        <Route path={ROUTERS.STAFF.TRANSFER}   element={<StaffDashboard />} />
        <Route path={ROUTERS.STAFF.WARRANTY}   element={<StaffDashboard />} />
        <Route path={ROUTERS.STAFF.STATISTICS} element={<StaffDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RouterCustom;
