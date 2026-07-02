import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTERS } from "../../../../utils/route";
import logo from "../../../../assets/images/toiyeupc2.png";

import iconHome from "../../../../assets/icons/icons8-dashboard-48.png";
import iconUser from "../../../../assets/icons/icons8-user-management-53.png";
import iconProduct from "../../../../assets/icons/icons8-box-128.png";
import iconVoucher from "../../../../assets/icons/icons8-voucher-48.png";
import iconStore from "../../../../assets/icons/icons8-online-store-50.png";
import iconStaff from "../../../../assets/icons/icons8-employee-50.png";
import iconWarehouse from "../../../../assets/icons/icons8-warehouse-50.png";
import iconStats from "../../../../assets/icons/icons8-circle-chart-50.png";
import iconMonitor from "../../../../assets/icons/icons8-mobile-order-50.png";

const navItems = [
  { label: "BẢNG ĐIỀU KHIỂN",    path: ROUTERS.ADMIN.HOME, icon: iconHome },
  { label: "Quản lý Người Dùng",       path: ROUTERS.ADMIN.USERS, icon: iconUser },
  { label: "Quản lý danh mục&sp",      path: ROUTERS.ADMIN.PRODUCTS, icon: iconProduct },
  { label: "Quản lý Voucher",          path: ROUTERS.ADMIN.VOUCHER, icon: iconVoucher },
  { label: "Quản lý chuỗi cửa hàng",   path: ROUTERS.ADMIN.STORES, icon: iconStore },
  { label: "Quản lý nhân sự",     path: ROUTERS.ADMIN.STAFF, icon: iconStaff },
  { label: "Quản lý kho tổng",    path: ROUTERS.ADMIN.WAREHOUSE, icon: iconWarehouse },
  { label: "Quản lý thống kê",    path: ROUTERS.ADMIN.STATISTICS, icon: iconStats },
  { label: "Quản lý giám sát đơn hàng", path: ROUTERS.ADMIN.ORDERS, icon: iconMonitor },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <Link to={ROUTERS.CLIENT.HOME} className="admin-sidebar__logo-link">
          <img src={logo} alt="ToiYeuPC" className="admin-sidebar__logo-img" />
        </Link>
      </div>

      <nav className="admin-sidebar__nav">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={i}
              to={item.path}
              className={`admin-sidebar__item${isActive ? " admin-sidebar__item--active" : ""}`}
            >
              <span className={`admin-sidebar__icon-wrap${isActive ? " admin-sidebar__icon-wrap--active" : ""}`}>
                <img src={item.icon} alt={item.label} style={{ width: 18, height: 18, objectFit: 'contain' }} />
              </span>
              <span className="admin-sidebar__label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
