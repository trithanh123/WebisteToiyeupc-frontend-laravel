import React, { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTERS } from "./utils/route";

// Client pages
import HomePage    from "./pages/clients/homePage";
import ProductPage from "./pages/clients/productPage";
import ProductDetailPage from "./pages/clients/productDetailPage";
import CartPage from "./pages/clients/cart";
import CheckoutPage from "./pages/clients/checkout";

// Profile pages
import AccountInfo      from "./pages/clients/profilePage/AccountInfo";
import OrderManagement  from "./pages/clients/profilePage/OrderManagement";
import Wishlist         from "./pages/clients/profilePage/Wishlist";
import AddressBook      from "./pages/clients/profilePage/AddressBook";
import Notifications    from "./pages/clients/profilePage/Notifications";
// Admin pages
import AdminDashboard   from "./pages/admin/dashboard";
import UserManagement  from "./pages/admin/users";
import CategoryManagement from "./pages/admin/categories";
import ProductManagement from "./pages/admin/products";
import VoucherManagement from "./pages/admin/vouchers";
import BranchManagement from "./pages/admin/branches";
import PersonnelManagement from "./pages/admin/personnel";
import WarehouseManagement from "./pages/admin/warehouse";
import OrderSupervise from "./pages/admin/orders";

// Staff pages
import StaffDashboard from "./pages/staff/dashboard";
import StaffOrders from "./pages/staff/orders";

// Global Components
import AddToCartModal from "./components/AddToCartModal";
import { CartContext } from "./context/CartContext";

const GlobalModalWrapper = () => {
  const { isModalOpen, currentProduct, closeModal } = useContext(CartContext);
  return (
    <AddToCartModal 
      isOpen={isModalOpen} 
      onClose={closeModal} 
      product={currentProduct}
      quantity={currentProduct?.quantity}
      vouchers={currentProduct?.selectedVoucher ? [currentProduct.selectedVoucher] : []}
    />
  );
};

const RouterCustom = () => {
  return (
    <BrowserRouter>
      <GlobalModalWrapper />
      <Routes>
        {/* ── Client ── */}
        <Route path={ROUTERS.CLIENT.HOME}     element={<HomePage />} />
        <Route path={ROUTERS.CLIENT.PRODUCTS}  element={<ProductPage />} />
        <Route path={ROUTERS.CLIENT.PRODUCT_DETAIL} element={<ProductDetailPage />} />
        <Route path={ROUTERS.CLIENT.CART} element={<CartPage />} />
        <Route path={ROUTERS.CLIENT.CHECKOUT} element={<CheckoutPage />} />

        {/* ── Profile ── */}
        <Route path={ROUTERS.CLIENT.PROFILE}        element={<AccountInfo />} />
        <Route path={ROUTERS.CLIENT.PROFILE_ORDERS} element={<OrderManagement />} />
        <Route path={ROUTERS.CLIENT.PROFILE_WISH}   element={<Wishlist />} />
        <Route path={ROUTERS.CLIENT.PROFILE_ADDR}   element={<AddressBook />} />
        <Route path={ROUTERS.CLIENT.PROFILE_NOTIF}  element={<Notifications />} />
        
        {/* ── Admin ── */}
        <Route path={ROUTERS.ADMIN.HOME}       element={<AdminDashboard />} />
        <Route path={ROUTERS.ADMIN.USERS}      element={<UserManagement />} />
        <Route path={ROUTERS.ADMIN.CATEGORIES} element={<CategoryManagement />} />
        <Route path={ROUTERS.ADMIN.PRODUCTS}   element={<ProductManagement />} />
        <Route path={ROUTERS.ADMIN.VOUCHER}    element={<VoucherManagement />} />
        <Route path={ROUTERS.ADMIN.STORES}     element={<BranchManagement />} />
        <Route path={ROUTERS.ADMIN.STAFF}      element={<PersonnelManagement />} />
        <Route path={ROUTERS.ADMIN.WAREHOUSE}  element={<WarehouseManagement />} />
        <Route path={ROUTERS.ADMIN.STATISTICS} element={<AdminDashboard />} />
        <Route path={ROUTERS.ADMIN.MONITOR}    element={<AdminDashboard />} />
        <Route path={ROUTERS.ADMIN.ORDERS}     element={<OrderSupervise />} />

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
